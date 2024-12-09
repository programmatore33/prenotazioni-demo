<template>
  <span class="bb-base-input-outer-container">
    <component :is="tag" v-bind="containerAttributes">
      <component :is="labelTag" v-bind="labelAttributes">
        <slot name="label" v-bind="{ text: label, hasErrors }">{{ label }}</slot>
      </component>
      <span v-bind="inputAttributes">
        <slot
          name="input"
          v-bind="{ id, name, hasErrors, validate, ...validationListeners }"
        ></slot>
      </span>
    </component>
    <span class="bb-base-input-container__errors">
      <span
        class="bb-base-input-container__error"
        v-for="error in computedErrors"
        :key="error"
        >{{ error }}</span
      >
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { deburr } from "@/js/Utilities/functions/deburr";
import { getAsPercentage } from "@/js/Utilities/functions/percentage";
import { identity } from "@/js/Utilities/functions/identity";
import { nanoid } from "nanoid";
import { snakeCase } from "@/js/Utilities/functions/snakeCase";
import { useField, RuleExpression } from "vee-validate";
import { watch } from "vue";

export interface Props {
  direction?: "horizontal" | "vertical" | "auto" | string;
  errors?: string[];
  hasErrors?: boolean;
  hideLabel?: boolean;
  id?: string;
  inputPosition?: "left" | "center" | "right";
  label: string;
  labelPosition?: "left" | "center" | "right";
  labelTag?: string;
  modelValue?: any;
  name?: string;
  reverse?: boolean;
  rules?: RuleExpression<unknown>;
  tag?: string;
  validateOn?: string[];
  vid?: string;
}

const props = withDefaults(defineProps<Props>(), {
  direction: "vertical",
  inputPosition: "right",
  labelPosition: "left",
  labelTag: "label",
  reverse: false,
  tag: "span",
  validateOn: () => [
    // External changes
    "update:modelValue",
    // Internal changes
    "change",
    "input",
    "blur",
  ],
});

// Always provide an id so that inputs can be focussed by clicking oin the label
const id = props.id || nanoid();

// If no name is passed use a normalized version of the label
const name = computed(() => {
  if (props.name) return props.name;
  let noAccents = deburr(props.label);
  let snaked = snakeCase(noAccents);
  return snaked.toLowerCase();
});

const containerAttributes = computed(() => {
  const initial: { [name: string]: any } = {
    class: {
      "bb-base-input-container": true,
      "bb-base-input-container--hidden-label": props.reverse,
      "bb-base-input-container--horizontal": props.direction !== "vertical",
      "bb-base-input-container--reverse": props.reverse,
      "bb-base-input-container--vertical": props.direction === "vertical",
    },
  };
  if (props.tag === "label") initial.for = id;
  return initial;
});

const labelAttributes = computed(() => {
  let initial: { [name: string]: any } = {
    class: {
      "bb-base-input-container__label": true,
      "bb-base-input-container__label--hidden": props.hideLabel,
      [`bb-base-input-container__label--${props.labelPosition}`]: props.labelPosition,
    },
    style: {
      width: widths.value.label,
    },
  };
  if (props.labelTag === "label") initial.for = id;
  return initial;
});

const inputAttributes = computed(() => {
  let initial: { [name: string]: any } = {
    class: {
      "bb-base-input-container__input": true,
      [`bb-base-input-container__input--${props.inputPosition}`]: props.inputPosition,
    },
    style: {
      width: widths.value.input,
    },
  };
  return initial;
});

const widths = computed(() => {
  let initial: { [target: string]: string } = {
    label: "auto",
    input: "auto",
  };
  if (props.direction === "auto") {
  } else if (props.direction === "vertical") {
    initial.label = initial.input = 100 + "%";
  } else if (props.direction === "horizontal") {
    initial.label = initial.input = 50 + "%";
  } else if (/\s/g.test(props.direction)) {
    const [firstLength, secondLength] = props.direction
      .split(/\s+/)
      .map((string) => string.length);
    const first = getAsPercentage(firstLength, firstLength + secondLength) + "%";
    const second = getAsPercentage(secondLength, secondLength + firstLength) + "%";
    if (props.reverse) {
      initial.label = second;
      initial.input = first;
    } else {
      initial.label = first;
      initial.input = second;
    }
  } else {
    throw new Error("Horizontal pattern is malformed");
  }
  return initial;
});

const { errors, handleChange, validate, value } = useField<string>(
  props.vid ? toRef(props, "vid") : props.label ? toRef(props, "label") : name,
  toRef(props, "rules"),
  {
    initialValue: props.modelValue,
    validateOnValueUpdate: props.validateOn.includes("update:modelValue"),
  }
);

watch(
  () => props.modelValue,
  () => {
    value.value = props.modelValue;
  }
);

const validationListeners = computed(() => {
  // If the field is valid or have not been validated yet
  // lazy
  if (!errors.value.length) {
    return {
      onBlur: props.validateOn.includes("blur") ? handleChange : identity,
      onChange: props.validateOn.includes("change") ? handleChange : identity,
      // disable `shouldValidate` to avoid validating on input
      onInput: (e: InputEvent) =>
        props.validateOn.includes("input") ? handleChange(e, false) : identity,
    };
  }
  // Aggressive
  return {
    onBlur: props.validateOn.includes("blur") ? handleChange : identity,
    onChange: props.validateOn.includes("change") ? handleChange : identity,
    onInput: (e: InputEvent) =>
      props.validateOn.includes("input") ? handleChange(e) : identity,
  };
});

const computedErrors = computed(() => {
  const final: string[] = [];
  // Errors from vee validate
  if (errors.value.length) {
    final.push(...errors.value);
  }
  // External errors
  if (props.errors && props.errors.length) {
    final.push(...props.errors);
  }
  return final;
});
const hasErrors = computed(() => Boolean(computedErrors.value.length) || props.hasErrors);
</script>
<style lang="postcss" scoped>
.bb-base-input-outer-container {
  @apply flex flex-col w-full;
  .bb-base-input-container__label {
    @apply block float-left text-grey-700 leading-6;
  }
}
.bb-base-input-container {
  @apply inline-flex w-full;
  &--vertical {
    @apply flex-col;
    &.bb-base-input-container--reverse {
      & > *:first-child {
        order: 2;
      }
    }
  }
  &--horizontal {
    &.bb-base-input-container--reverse {
      & > *:first-child {
        order: 2;
      }
    }
  }

  &__label {
    @apply block float-left text-grey-700 font-semibold;
    line-height: 24px;

    &--left {
      @apply text-left;
    }
    &--center {
      @apply text-center;
    }
    &--right {
      @apply text-right;
    }
    &--hidden {
      @apply sr-only;
      width: 0px !important;
    }
  }
  &__input {
    @apply inline-flex flex-wrap items-center float-right;

    & > :first-child {
      @apply w-full;
    }

    &--left {
      @apply justify-start;
    }
    &--center {
      @apply justify-center;
    }
    &--right {
      @apply justify-end;
    }
  }

  &__errors {
    @apply inline-block w-full text-xs;
  }
  &__error {
    @apply inline-block w-full text-red-600;
  }
}
</style>
