<template>
  <span
    class="bb-base-checkbox-group"
    :class="{
      'bb-base-checkbox-group--horizontal': direction === 'horizontal',
      'bb-base-checkbox-group--vertical': direction === 'vertical'
    }"
  >
    <span class="bb-base-checkbox-group__container">
      <slot name="prepend"></slot>
      <span
        class="bb-base-checkbox-group__loading-container"
        v-if="!options.length && loading"
      >
        <slot :name="'loading'" :loading="!!loading">{{ loadingText }}</slot>
      </span>
      <span
        class="bb-base-select__no-data-container"
        v-else-if="!options.length"
      >
        <slot :name="'no-data'">{{ noDataText }}</slot>
      </span>
      <template v-for="(option, index) in options" :key="option?.id || index">
        <slot name="option:prepend" :item="option.original"></slot>
        <label
          class="bb-base-checkbox-group-option"
          :class="{
            'bb-base-checkbox-group-option__selected': option.selected
          }"
        >
          <BaseCheckbox
            :checked="option.selected"
            :color="option.color"
            :disabled="option.disabled"
            :has-errors="option.hasErrors"
            :id="option.id"
            :name="option.name"
            :readonly="option.readonly"
            :onChange="event => onChange(event, option)"
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
          </BaseCheckbox>
          <span
            :class="{
              'bb-base-checkbox-group-option__text': true,
              'bb-base-checkbox-group-option__text--hidden': hideLabel
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
import { useItemValue } from '@/js//composables/useItemValue'
import BaseCheckbox from './BaseCheckbox.vue'

const props = defineProps({
  color: {
    type: String
  },
  dependencies: {
    default: () => [],
    type: Array
  },
  depsdebounceTime: {
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
    default: () => [],
    type: [Array, Function]
  },
  itemText: {
    default: null,
    type: [String, Array, Function, null]
  },
  itemValue: {
    default: null,
    type: [String, Array, Function, null]
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
    modelValue = props.modelValue
    const selectedIndex = modelValueIndexed.value.get(value)
    const selected = !isNil(selectedIndex) ? true : false

    return {
      index,
      jsonValue,
      modelValue,
      name,
      original,
      selected,
      selectedIndex,
      text,
      value,
      index,
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

/**
 * Indexes modelValue to a map so when can easily know which values are selected
 * (using JSON to circumvent identical object not being equal in JS)
 */
const modelValueIndexed = computed(() => {
  const map = {}
  ;[].concat(props.modelValue).forEach((value, index) => {
    map[JSON.stringify(value)] = index
  })
  return {
    get: value => map[JSON.stringify(value)]
  }
})

/**
 * When selecting an option split behavior based on single or multiple selection
 */
const onOptionSelected = option => {
  let valueToEmit
  if (option.selected) {
    valueToEmit = props.modelValue
      .slice(0, option.selectedIndex)
      .concat(props.modelValue.slice(option.selectedIndex + 1))
  } else {
    valueToEmit = props.modelValue.concat(option.value)
  }
  emit('update:modelValue', valueToEmit)
}

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
      if (!Array.isArray(props.modelValue)) {
        throw new Error('props.modelValue is not an array.')
      }
      let allFound = props.modelValue.every(value =>
        optionsIndexedByValue.value.get(value)
      )
      if (!allFound || previous === undefined || !options.value.length) {
        await getOptions({ prefill: true })
        allFound = props.modelValue.every(value =>
          optionsIndexedByValue.value.get(value)
        )
      }
      if (allFound) {
      } else {
        const coherent = current.filter(value => {
          const found = optionsIndexedByValue.value.get(value)

          return found
        })
        if (props.enforceCoherence) {
          emit('update:modelValue', coherent)
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
      await getOptions({ prefill: true })
      const allFound = props.modelValue.every(value =>
        optionsIndexedByValue.value.get(value)
      )

      if (!allFound) {
        if (props.enforceCoherence) {
          const coherent = props.modelValue.filter(value => {
            const found = optionsIndexedByValue.value.get(value)
            return found
          })
          emit('update:modelValue', coherent)
        }
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
        const allFound = props.modelValue.every(value =>
          optionsIndexedByValue.value.get(value)
        )
        if (!allFound && props.enforceCoherence) {
          const coherent = props.modelValue.filter(value => {
            const found = optionsIndexedByValue.value.get(value)
            return found
          })
          emit('update:modelValue', coherent)
        }
      }
    }, props.depsDebounceTime)
  },
  { deep: true }
)

const onChange = (event, option) => {
  emit('change', event)
  onOptionSelected(option)
}

const eventListeners = {
  onBlur: event => emit('blur', event),
  onClick: event => emit('click', event),
  onFocus: event => emit('focus', event),
  onKeydown: event => emit('keydown', event),
  onMousedown: event => emit('mousedown', event),
  onMouseup: event => emit('mouseup', event)
}
</script>

<style lang="postcss">
.bb-base-checkbox-group {
  display: inline-block;

  &--horizontal {
    .bb-base-checkbox-group-option {
      @apply inline-flex items-center mr-3;
    }
  }
  &--vertical {
    .bb-base-checkbox-group-option {
      @apply w-full inline-flex;
    }
  }

  &__container {
    @apply inline-flex flex-wrap gap-2 items-center;
  }
  &-option {
    @apply inline-flex items-center cursor-pointer;

    > .bb-base-checkbox {
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
