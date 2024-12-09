<template>
  <BaseInputContainer
    :direction="direction"
    :hideLabel="hideLegend"
    :id="id"
    :inputPosition="inputPosition"
    :label="legend"
    :labelPosition="legendPosition"
    :labelTag="'legend'"
    :name="name"
    :reverse="reverse"
    :tag="'fieldset'"
  >
    <template #label="data"><slot name="legend" v-bind="data"></slot></template>
    <template #input="{ id, name }">
      <BaseCheckboxGroup
        :color="color"
        :dependencies="dependencies"
        :depsdebounceTime="depsdebounceTime"
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
      </BaseCheckboxGroup>
    </template>
  </BaseInputContainer>
</template>

<script setup>
import BaseCheckboxGroup from './BaseCheckboxGroup.vue'
import BaseInputContainer from './BaseInputContainer.vue'

defineProps({
  color: {
    type: String
  },
  dependencies: {
    type: Array
  },
  depsdebounceTime: {
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
  hideLegend: {
    type: Boolean
  },
  hideLabel: {
    type: Boolean
  },
  id: {
    type: String
  },
  items: {
    type: [Array, Function]
  },
  itemText: {
    type: [String, Array, Function, null]
  },
  itemValue: {
    type: [String, Array, Function, null]
  },
  inputDirection: {
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
  inputPosition: {
    type: String
  },
  legend: {
    type: String
  },
  legendPosition: {
    type: String
  },
  reverse: {
    type: Boolean
  }
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
