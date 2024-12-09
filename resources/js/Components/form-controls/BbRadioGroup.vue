<template>
  <BaseInputContainer
    :direction="direction"
    :hideLabel="hideLegend"
    :id="id"
    :inputPosition="inputPosition"
    :label="legend"
    :labelPosition="legendPosition"
    :labelTag="'legend'"
    :modelValue="modelValue"
    :name="name"
    :reverse="reverse"
    :rules="rules"
    :validateOn="validateOn"
    :tag="'fieldset'"
  >
    <template #label="data"><slot name="legend" v-bind="data"></slot></template>
    <template #input="{ id, name }">
      <BaseRadioGroup
        :color="color"
        :dependencies="dependencies"
        :depsDebounceTime="depsDebounceTime"
        :direction="inputDirection"
        :disabled="disabled"
        :enforceCoherence="enforceCoherence"
        :hasErrors="hasErrors"
        :hideLabel="hideLabel"
        :id="id"
        :items="items"
        :itemText="itemText"
        :itemValue="itemValue"
        :loadingText="loadingText"
        :modelValue="modelValue"
        :modelValueDebounceTime="modelValueDebounceTime"
        :name="name"
        :noDataText="noDataText"
        :readonly="readonly"
        v-bind="eventListeners"
      >
        <template v-for="(index, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </BaseRadioGroup>
    </template>
  </BaseInputContainer>
</template>

<script setup>
import BaseInputContainer from './BaseInputContainer.vue'
import BaseRadioGroup from './BaseRadioGroup.vue'

defineProps({
  color: {
    type: String
  },
  dependencies: {
    type: Array
  },
  depsDebounceTime: {
    type: Number
  },
  direction: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  enforceCoherence: {
    type: Boolean
  },
  hasErrors: {
    type: Boolean
  },
  hideLabel: {
    type: Boolean
  },
  hideLegend: {
    type: Boolean
  },
  id: {
    type: String
  },
  inputDirection: {
    type: String
  },
  inputPosition: {
    type: String
  },
  items: {
    type: [Array, Function]
  },
  itemText: {
    type: [String, Array, Function]
  },
  itemValue: {
    type: [String, Array, Function]
  },
  legendPosition: {
    type: String
  },
  legend: {
    type: String
  },
  loadingText: {
    type: String
  },
  modelValue: {},
  modelValueDebounceTime: {
    type: Number
  },
  name: {
    type: String
  },
  noDataText: {
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
