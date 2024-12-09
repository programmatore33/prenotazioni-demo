<template>
  <BaseInputContainer
    :direction="direction"
    :errors="errors"
    :has-errors="hasErrors"
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
  >
    <template #label="data"><slot name="label" v-bind="data"></slot></template>
    <template #input="{ id, name, hasErrors, validate }">
      <BaseSelect
        :addOptions="addOptions"
        :allowWriting="allowWriting"
        :chips="chips"
        :comma="comma"
        :debounceTime="debounceTime"
        :dependencies="dependencies"
        :depsDebounceTime="depsDebounceTime"
        :disabled="disabled"
        :enforceCoherence="enforceCoherence"
        :filterBy="filterBy"
        :hasErrors="hasErrors"
        :id="id"
        :items="items"
        :itemText="itemText"
        :itemValue="itemValue"
        :loadingText="loadingText"
        :modelValue="modelValue"
        :modelValueDebounceTime="modelValueDebounceTime"
        :multiple="multiple"
        :name="name"
        :noDataText="noDataText"
        :placeholder="placeholder"
        :prefill="prefill"
        :stash="stash"
        :readonly="readonly"
        :resetQueryOnOptionSelected="resetQueryOnOptionSelected"
        :transitionDuration="transitionDuration"
        @inactive="validate"
        v-bind="eventListeners"
      >
        <template v-for="(index, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </BaseSelect>
    </template>
  </BaseInputContainer>
</template>

<script setup>
import BaseInputContainer from './BaseInputContainer.vue'
import BaseSelect from './BaseSelect.vue'

defineProps({
  addOptions: {
    type: Boolean
  },
  allowWriting: {
    type: Boolean,
    default: true
  },
  chips: {
    type: Boolean
  },
  comma: {
    type: Boolean
  },
  debounceTime: {
    type: Number
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
  errors: {
    type: Array,
    default: () => []
  },
  enforceCoherence: {
    type: Boolean
  },
  filterBy: {
    type: [String, Array, Function, null]
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
  items: {
    type: [Array, Function]
  },
  itemText: {},
  itemValue: {},
  label: {
    type: String
  },
  labelPosition: {
    type: String
  },
  loadingText: {
    type: String
  },
  modelValue: {},
  modelValueDebounceTime: {
    type: Number
  },
  multiple: {
    type: Boolean
  },
  name: {
    type: String
  },
  noDataText: {
    type: String
  },
  placeholder: {
    type: String
  },
  prefill: {
    type: [Boolean, String],
    default: 'focus'
  },
  readonly: {
    type: Boolean
  },
  resetQueryOnOptionSelected: {
    type: Boolean
  },
  reverse: {
    type: Boolean
  },
  stash: {
    type: Boolean
  },
  rules: {
    type: [String, Object]
  },
  transitionDuration: {
    type: Number
  },
  validateOn: {}
})

const emit = defineEmits(['blur', 'change', 'click', 'focus', 'input', 'update:modelValue'])

const eventListeners = {
  onBlur: event => emit('blur', event),
  onChange: event => emit('change', event),
  onClick: event => emit('click', event),
  onFocus: event => emit('focus', event),
  onInput: event => emit('input', event),
  'onUpdate:modelValue': value => emit('update:modelValue', value)
}
</script>
