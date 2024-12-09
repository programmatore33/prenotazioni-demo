<template>
  <BaseInputContainer
    :direction="direction"
    :hideLabel="hideLabel"
    :id="id"
    :inputPosition="inputPosition"
    :label="label"
    :labelPosition="labelPosition"
    :labelTag="'span'"
    :name="name"
    :reverse="reverse"
    :tag="'label'"
  >
    <template #label="data"><slot name="label" v-bind="data"></slot></template>
    <template #input="{ id, name }">
      <BaseRadio
        :checked="checked"
        :color="color"
        :disabled="disabled"
        :hasErrors="hasErrors"
        :id="id"
        :modelValue="modelValue"
        :name="name"
        :readonly="readonly"
        :value="value"
        v-bind="eventListeners"
      >
        <template v-for="(index, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </BaseRadio>
    </template>
  </BaseInputContainer>
</template>

<script setup>
import BaseRadio from './BaseRadio.vue'
import BaseInputContainer from './BaseInputContainer.vue'

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
  hasErrors: {
    type: Boolean
  },
  hideLabel: {
    type: Boolean
  },
  id: {
    type: String
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
  labelTag: {
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
  tag: {
    type: String
  },
  value: {}
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
  'onUpdate:modelValue': value => emit('update:modelValue', value)
}
</script>

<style lang="scss" scoped></style>
