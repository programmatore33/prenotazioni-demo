<template>
  <BaseInputContainer
    class="bb-switch"
    :direction="direction"
    :errors="errors"
    :hasErrors="hasErrors"
    :hideLabel="hideLabel"
    :id="id"
    :inputPosition="inputPosition"
    :label="label"
    :labelPosition="labelPosition"
    :labelTag="'span'"
    :name="name"
    :reverse="reverse"
    :tag="'label'"
    :rules="rules"
    :validateOn="validateOn"
  >
    <template #label="data"><slot name="label" v-bind="data"></slot></template>
    <template #input="{ id, name, hasErrors, onChange }">
      <BaseSwitch
        :checked="checked"
        :color="color"
        :disabled="disabled"
        :hasErrors="hasErrors"
        :id="id"
        :indeterminate="indeterminate"
        :modelValue="modelValue"
        :name="name"
        :readonly="readonly"
        :submitWhenFalse="submitWhenFalse"
        :trueValue="trueValue"
        :falseValue="falseValue"
        @update:modelValue="onChange"
        v-bind="eventListeners"
      >
        <template v-for="(index, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </BaseSwitch>
    </template>
  </BaseInputContainer>
</template>

<script setup lang="ts">
import BaseInputContainer from "./BaseInputContainer.vue";
import BaseSwitch from "./BaseSwitch.vue";
import { RuleExpression } from "vee-validate";

interface Props {
  checked?: boolean;
  color?: string;
  direction?: "horizontal" | "vertical" | "auto" | string;
  disabled?: boolean;
  errors?: string[];
  falseValue?: any;
  hasErrors?: boolean;
  hideLabel?: boolean;
  id?: string;
  indeterminate?: boolean;
  inputPosition?: "left" | "center" | "right";
  label: string;
  labelPosition?: "left" | "center" | "right";
  modelValue?: any;
  name?: string;
  readonly?: boolean;
  reverse?: boolean;
  rules?: RuleExpression<unknown>;
  submitWhenFalse?: boolean;
  trueValue?: any;
  validateOn?: string[];
}

const props = defineProps<Props>();

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

const eventListeners = {
  onBlur: (event: FocusEvent) => emit("blur", event),
  onChange: (event: Event) => emit("change", event),
  onClick: (event: MouseEvent) => emit("click", event),
  onFocus: (event: FocusEvent) => emit("focus", event),
  onInput: (event: Event) => emit("input", event),
  onKeydown: (event: KeyboardEvent) => emit("keydown", event),
  onMousedown: (event: MouseEvent) => emit("mousedown", event),
  onMouseup: (event: MouseEvent) => emit("mouseup", event),
  "onUpdate:modelValue": (value: any) => emit("update:modelValue", value),
};
</script>

<style lang="postcss">
.bb-switch {
  label {
    @apply cursor-pointer;
  }

  .bb-base-input-container .bb-base-input-container__input > :first-child {
    @apply w-auto;
  }
}
</style>
