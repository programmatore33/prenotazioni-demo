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
    :labelTag="'span'"
    :name="name"
    :reverse="reverse"
    :tag="'label'"
    :rules="rules"
    :validateOn="validateOn"
  >
    <template #label="data"><slot name="label" v-bind="data"></slot></template>
    <template #input="{ id, name, hasErrors, onChange }">
      <BaseCheckbox
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
      </BaseCheckbox>
    </template>
  </BaseInputContainer>
</template>

<script setup>
import BaseInputContainer from './BaseInputContainer.vue'
import BaseCheckbox from './BaseCheckbox.vue'
defineProps({
  checked: {
    type: Boolean
  },
  color: {
    type: String
  },
  direction: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  errors: {
    type: Array,
    default: () => []
  },
  hasErrors: {
    type: Boolean
  },
  falseValue: {},
  hideLabel: {
    type: Boolean
  },
  id: {
    type: String
  },
  indeterminate: {
    type: Boolean
  },
  inputPosition: {
    type: String
  },
  label: {
    type: String
  },
  labelPosition: {
    type: String
  },
  modelValue: {},
  name: {
    type: String
  },
  readonly: {
    type: Boolean
  },
  reverse: {
    type: Boolean
  },
  rules: {
    type: [String, Object]
  },
  submitWhenFalse: {
    type: Boolean
  },
  trueValue: {},
  validateOn: {}
})

const emit = defineEmits([
  'blur',
  'change',
  'click',
  'focus',
  'input',
  'keydown',
  'mousedown',
  'mouseup',
  'update:modelValue'
])

const eventListeners = {
  onBlur: event => emit('blur', event),
  onChange: event => emit('change', event),
  onClick: event => emit('click', event),
  onFocus: event => emit('focus', event),
  onInput: event => emit('input', event),
  onKeydown: event => emit('keydown', event),
  onMousedown: event => emit('mousedown', event),
  onMouseup: event => emit('mouseup', event),
  'onUpdate:modelValue': event => emit('update:modelValue', event)
}
</script>

<style lang="scss" scoped></style>
