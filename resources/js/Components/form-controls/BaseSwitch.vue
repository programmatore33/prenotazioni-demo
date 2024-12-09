<template>
  <span :class="classes">
    <input v-if="!checked && submitWhenFalse" v-bind="hiddenInputAttributes" />
    <input v-bind="inputAttributes" />
    <span class="bb-base-switch-container">
      <slot name="icon" v-bind="slotAttributes">
        <span v-bind="iconAttributes">
          <span class="bb-base-switch-container__icon-thumb"></span>
        </span>
      </slot>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { isCssColor } from "@/js/Utilities/functions/isCssColor";
import { when } from "@/js/Utilities/functions/when";
import { onMounted, ref } from "vue";

export interface Props {
  checked?: boolean;
  color?: string;
  disabled?: boolean;
  hasErrors?: boolean;
  id?: string;
  modelValue?: any;
  name?: string;
  readonly?: boolean;
  submitWhenFalse?: boolean;
  trueValue?: any;
  falseValue?: any;
}

const props = withDefaults(defineProps<Props>(), {
  trueValue: true,
  falseValue: false,
});

const emit = defineEmits([
  "blur",
  "change",
  "click",
  "focus",
  "input",
  "keydown",
  "mousedown",
  "mouseup",
  "update:modelValue",
]);
const checked = computed(() => {
  if (props.checked) return true;
  return JSON.stringify(props.trueValue) === JSON.stringify(props.modelValue);
});

const hasFocus = ref(false);
const classes = computed(() => {
  return {
    "bb-base-switch": true,
    "bb-base-switch--disabled": props.disabled,
    "bb-base-switch--errors": props.hasErrors,
    "bb-base-switch--readonly": props.readonly,
    [`bb-base-switch--${props.color}`]: props.color && !isCssColor(props.color),
  };
});

/**
 * This is used to keep the value compatible to common html expected values.
 * Convert to string everything that's not but do not double encode strings
 */
const makeInputValue = when((item: unknown) => typeof item !== "string", JSON.stringify);

const hiddenInputAttributes = computed(() => {
  const value = makeInputValue(props.falseValue);
  return {
    disabled: props.disabled || props.readonly,
    name: props.name,
    type: "hidden",
    value: value,
  };
});

const inputAttributes = computed(() => {
  const value = makeInputValue(props.trueValue);

  const onBlur = (event: FocusEvent): void => {
    hasFocus.value = false;
    emit("blur", event);
  };

  const onChange = (event: Event): void => {
    if (event.target instanceof HTMLInputElement) {
      let value = event.target.checked ? props.trueValue : props.falseValue;

      emit("change", event);
      emit("update:modelValue", value);
    }
  };

  const onFocus = (event: FocusEvent): void => {
    hasFocus.value = true;
    emit("focus", event);
  };

  const eventListeners = {
    onBlur,
    onChange,
    onClick: (event: MouseEvent) => emit("click", event),
    onFocus,
    onKeydown: (event: KeyboardEvent) => emit("keydown", event),
    onMousedown: (event: MouseEvent) => emit("mousedown", event),
    onMouseup: (event: MouseEvent) => emit("mouseup", event),
    onInput: (event: Event) => emit("input", event),
  };

  return {
    checked: checked.value,
    // There is no such thing as readonly checkbox so we disable and style it with css
    disabled: props.disabled || props.readonly,
    id: props.id,
    name: props.name,
    tabindex: props.disabled ? -1 : undefined,
    type: "checkbox",
    role: "switch",
    value: value,
    ...eventListeners,
  };
});

const slotAttributes = computed(() => ({
  checked: checked.value,
  disabled: props.disabled,
  falseValue: props.falseValue,
  focused: hasFocus.value,
  hasErrors: props.hasErrors,
  id: props.id,
  name: props.name,
  parsedValue: inputAttributes.value.value,
  readonly: props.readonly,
  trueValue: props.trueValue,
  value: checked.value ? props.trueValue : props.falseValue,
}));

const iconAttributes = computed(() => {
  let style: { [key: string]: string } = {};
  if (props.color && isCssColor(props.color)) {
    style.color = props.color;
  }
  return {
    class: "bb-base-switch-container__icon",
    style,
  };
});
</script>
<style lang="postcss">
/* base switch */
.bb-base-switch {
  @apply inline-block cursor-pointer;

  &:focus-within {
    .bb-base-switch-container {
      &__icon {
        @apply ring;
      }
    }
  }

  input[type="checkbox"] {
    @apply sr-only;

    &:checked + .bb-base-switch-container .bb-base-switch-container__icon {
      @apply bg-primary-600;

      &-thumb {
        @apply -translate-x-full;
        left: calc(100% - 2px);
      }
    }
  }

  &--disabled {
  }
  &--errors {
  }
  &--readonly {
  }

  .bb-base-switch-container {
    @apply inline-block select-none;
    &__icon {
      @apply relative w-[42px] h-[24px] inline-block bg-gray-300  transition-colors rounded-r-2xl rounded-l-2xl;

      &--primary {
        @apply text-primary;
      }

      &-thumb {
        @apply inline-block rounded-full absolute top-1/2 -translate-y-1/2 translate-x-0 bg-white transition-all;
        height: calc(24px - 2px * 2);
        width: calc(24px - 2px * 2);
        left: 2px;
      }
    }
  }
}
</style>
