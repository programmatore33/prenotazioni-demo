<template>
  <span
    class="bb-base-radio-group"
    :class="{
      'bb-base-radio-group--horizontal': direction === 'horizontal',
      'bb-base-radio-group--vertical': direction === 'vertical'
    }"
  >
    <span class="bb-base-radio-group__container">
      <slot name="prepend"></slot>
      <span
        class="bb-base-radio-group__loading-container"
        v-if="!options.length && loading"
        ><slot :name="'loading'" :loading="!!loading">{{
          loadingText
        }}</slot></span
      >
      <span
        class="bb-base-select__no-data-container"
        v-else-if="!options.length"
        ><slot :name="'no-data'">{{ noDataText }}</slot></span
      >
      <template v-for="(option, index) in options" :key="option?.id || index">
        <slot name="option:prepend" :item="option.original"></slot>
        <label
          class="bb-base-radio-group-option"
          :class="{ 'bb-base-radio-selected': option.selected }"
        >
          <BaseRadio
            :checked="option.selected"
            :color="option.color"
            :disabled="option.disabled"
            :has-errors="option.hasErrors"
            :id="option.id"
            :model-value="props.modelValue"
            :name="option.name"
            :readonly="option.readonly"
            :value="option.value"
            v-bind="eventListeners"
          >
            <template v-for="(index, name) in childSlots" v-slot:[name]="data">
              <slot
                :item="option.original"
                :name="name"
                :selected="option.selected"
                :text="option.text"
                v-bind="data"
              />
            </template>
          </BaseRadio>
          <span
            :class="{
              'bb-base-radio-group-option__text': true,
              'bb-base-radio-group-option__text--hidden': hideLabel
            }"
            ><slot name="label" :text="option.text" :item="option.original">{{
              option.text
            }}</slot></span
          >
        </label>
        <slot name="option:append" :item="option.original"></slot>
      </template>
      <slot name="append"></slot>
    </span>
  </span>
</template>

<script setup>
import { computed, ref, useSlots, watch } from 'vue'
import { identity, isNil, omit } from 'lodash'
import { useItemText } from '@/js/composables/useItemText'
import { useItemValue } from '@/js/composables/useItemValue'
import BaseRadio from './BaseRadio.vue'

const props = defineProps({
  color: {
    type: String
  },
  dependencies: {
    default: () => [],
    type: Array
  },
  depsDebounceTime: {
    default: 0,
    type: Number
  },
  direction: {
    default: 'horizontal',
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
  id: {
    type: String
  },
  items: {
    type: [Array, Function],
    default: () => []
  },
  itemText: {
    type: [String, Array, Function]
  },
  itemValue: {
    type: [String, Array, Function]
  },
  loadingText: {
    default: 'Caricamento...',
    type: String
  },
  modelValue: {},
  modelValueDebounceTime: {
    default: 0,
    type: Number
  },
  name: {
    type: String
  },
  noDataText: {
    default: 'Nessun elemento da visualizzare',
    type: String
  },
  readonly: {
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
/**
 * Loading is a counter so it can be accumulated
 */
const loading = ref(0)
/**
 * Items as retrieved from outside
 */
const internalItems = ref([])

/**
 * Extract slots that are used at this level and do not pass them down
 */
const slots = useSlots()
const childSlots = omit(slots, ['loading', 'no-data'])

const getOptions = async ({ prefill = false }) => {
  let items = []
  if (Array.isArray(props.items)) {
    items = props.items
  } else {
    if (typeof props.items === 'function') {
      loading.value++
      items = await props.items(prefill, props.modelValue)
      loading.value--
    }
  }
  internalItems.value = items
}

/**
 * Map the items returned from outside to a set of useful information.
 * If a value cen't be obtained throw an error
 */
const { getItemText } = useItemText()
const { getItemValue } = useItemValue()
const options = computed(() => {
  const parsedModelValue = JSON.stringify(props.modelValue)

  return internalItems.value.map((item, index) => {
    const name = props.name
    const text = getItemText(item, props.itemText)
    const value = getItemValue(item, props.itemValue)

    // Undefined is not JSONable
    if (value === undefined)
      throw new Error(
        'The result of extracting "value" from option was undefined. Affected item is ' +
          JSON.stringify(item) +
          ' please check itemValue property is correct.'
      )

    const jsonValue = JSON.stringify(value)
    const original = item

    // These keys can be defined generally as props or specifically as option props
    const keys = ['color', 'disabled', 'hasErrors', 'hideLabel', 'readonly']
    // Get the config for each key
    const result = keys.reduce((acc, curr) => {
      if (typeof props[curr] !== 'undefined') {
        acc[curr] = props[curr]
      }
      if (typeof item[curr] !== 'undefined') {
        acc[curr] = item[curr]
      }
      return acc
    }, {})

    let id, modelValue

    // Props that are handled externally
    if (props.id || item.id) {
      id = [props.id, item.id || index].filter(identity).join('_')
    }
    if (props.modelValue) modelValue = props.modelValue

    return {
      id,
      index,
      jsonValue,
      modelValue,
      name,
      original,
      selected: jsonValue === parsedModelValue,
      text,
      value,
      ...result
    }
  })
})

/**
 * Indexes options by their value
 * (using JSON to circumvent identical objects not being equal in JS)
 */
const optionsIndexedByValue = computed(() => {
  const indexed = options.value.reduce((acc, curr) => {
    acc[curr.jsonValue] = curr
    return acc
  }, {})
  return {
    get: key => {
      return indexed[JSON.stringify(key)]
    }
  }
})
/*
const onOptionSelected = option => {
  emit('update:modelValue', option.value)
} */

/**
 * When modelValue changes see if we already have the new value in the current options.
 * If we don't try searching again in case the prefill might return the correct items
 * If not found and coherence is enforced reset modelValue
 */
let modelValueTimeout
watch(
  () => props.modelValue,
  (current, previous) => {
    if (modelValueTimeout) clearTimeout(modelValueTimeout)
    modelValueTimeout = setTimeout(async () => {
      let found = optionsIndexedByValue.value.get(props.modelValue)
      if ((!found && !isNil(props.modelValue)) || previous === undefined) {
        await getOptions({ prefill: true })
      }
      found = optionsIndexedByValue.value.get(props.modelValue)
      if (!found) {
        if (props.enforceCoherence && !isNil(current)) {
          emit('update:modelValue', null)
        }
      }
    }, props.modelValueDebounceTime)
  },
  // Prefill when asked or when items are static
  { immediate: true, deep: true }
)

/**
 * This is triggered to refresh static items whenever the passed array changes.
 * If the parent defines an array in the template this is triggered
 * at every render so we take counter measures
 */
watch(
  () => props.items,
  async (current, previous) => {
    if (
      typeof current === 'function' ||
      // Circumvent arrays defined in the template by the parent
      JSON.stringify(current) !== JSON.stringify(previous)
    ) {
      await getOptions({ prefill: false })
      const found = optionsIndexedByValue.value.get(props.modelValue)
      if (!found && props.enforceCoherence && !isNil(props.modelValue)) {
        emit('update:modelValue', null)
      }
    }
  }
)

/**
 * When dependencies change
 * Check dependencies are the same by value and not reference
 * Otherwise we search again for options as they might be different base on dependencies.
 * If coherence is enforced we set the state accordingly
 */
let depsTimeout
watch(
  () => props.dependencies,
  (current, previous) => {
    // Circumvent array defined in the template by the parent
    if (JSON.stringify(current) === JSON.stringify(previous)) {
      return
    }

    if (depsTimeout) clearTimeout(depsTimeout)
    depsTimeout = setTimeout(async () => {
      if (JSON.stringify(current) !== JSON.stringify(previous)) {
        await getOptions({ prefill: true })
        const found = optionsIndexedByValue.value.get(props.modelValue)
        if (!found && props.enforceCoherence && !isNil(props.modelValue)) {
          emit('update:modelValue', null)
        }
      }
    }, props.depsDebounceTime)
  },
  { deep: true }
)

const eventListeners = {
  onBlur: event => emit('blur', event),
  onChange: event => emit('change', event),
  onClick: event => emit('click', event),
  onFocus: event => emit('focus', event),
  onKeydown: event => emit('keydown', event),
  onMousedown: event => emit('mousedown', event),
  onMouseup: event => emit('mouseup', event),
  'onUpdate:modelValue': value => emit('update:modelValue', value)
}
</script>

<style lang="postcss">
/* base radio */
.bb-base-radio-group {
  &--horizontal {
    .bb-base-radio-group-option {
      @apply mr-3;
    }
  }
  &--vertical {
    .bb-base-radio-group-option {
      @apply w-full flex;
    }
  }

  &__container {
    @apply flex flex-wrap gap-2 items-center;
  }
  &-option {
    @apply inline-flex items-center cursor-pointer;

    > .bb-base-radio {
      @apply mr-1;
    }
    &__text {
      &--hidden {
        @apply sr-only;
      }
    }
  }
}
</style>
