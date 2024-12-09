<template>
  <BaseInputContainer
    :direction="direction"
    :errors="errors"
    :hasErrors="hasErrors"
    :hideLabel="hideLabel"
    :id="id"
    :inputPosition="inputPosition"
    :label="label"
    :labelPosition="labelPosition"
    :modelValue="modelValue"
    :name="name"
    :reverse="reverse"
    :rules="rules"
    :validateOn="validateOn"
    :vid="vid"
  >
    <template #label="data"><slot name="label" v-bind="data"></slot></template>
    <template
      #input="{ id, name, hasErrors, onBlur, onChange, onInput }"
    >
      <BaseTextInput
        :autocomplete="autocomplete"
        :disabled="disabled"
        :hasErrors="hasErrors"
        :id="id"
        :modelValue="modelValue"
        :name="name"
        :placeholder="placeholder"
        :readonly="readonly"
        :type="type"
        @blur="onBlur"
        @change="onChange"
        @input="onInput"
        v-bind="eventListeners"
      >
        <template v-for="(index, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </BaseTextInput>
    </template>
  </BaseInputContainer>
</template>

<script setup lang="ts">
import { RuleExpression } from "vee-validate";
import BaseInputContainer from "./BaseInputContainer.vue";
import BaseTextInput from "./BaseTextInput.vue";

interface Props {
  autocomplete?: string;
  direction?: "horizontal" | "vertical" | "auto" | string;
  disabled?: boolean;
  errors?: string[];
  hasErrors?: boolean;
  hideLabel?: boolean;
  id?: string;
  inputPosition?: "left" | "center" | "right";
  label: string;
  labelPosition?: "left" | "center" | "right";
  modelValue?: any;
  name?: string;
  placeholder?: string;
  readonly?: boolean;
  reverse?: boolean;
  rules?: RuleExpression<unknown>;
  type?: "text" | "number" | "date" | "datetime-local" | "email" | "password";
  validateOn?: string[], 
  vid?: string, 
}

const props = defineProps<Props>();


const emit = defineEmits([
  "blur",
  "change",
  "click:clear",
  "click",
  "focus",
  "input",
  "keydown",
  "mousedown",
  "mouseup",
  "update:modelValue",
]);

/**
 * These events are just propagated
 */
const eventListeners = {
  onBlur: (event: FocusEvent) => emit("blur", event),
  onChange: (event: Event) => emit("change", event),
  onClick: (event: MouseEvent) => emit("click", event),
  onFocus: (event: FocusEvent) => emit("focus", event),
  onInput: (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      emit("update:modelValue", event.target.value);
    }
    emit("input", event);
  },
  onMousedown: (event: MouseEvent) => emit("mousedown", event),
  onMouseup: (event: MouseEvent) => emit("mouseup", event),
  "onUpdate:modelValue": (value: string | null) => emit("update:modelValue", value),
};
</script>

<style lang="scss" scoped></style>
