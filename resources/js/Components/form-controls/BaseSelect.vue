<template>
  <span
    :class="{
      'bb-base-select': true,
      'bb-base-select--active': active,
      'bb-base-select--shown': shown,
      'bb-base-select--loading': loading,
      'bb-base-select--disabled': disabled,
      'bb-base-select--errors': hasErrors,
      'bb-base-select--readonly': readonly
    }"
    @click="onOuterContainerClick"
    ref="outerContainer"
  >
    <slot name="prepend_outer"></slot>
    <span class="bb-base-select__inner-container" ref="innerContainer">
      <slot name="prepend"></slot>
      <span class="bb-base-select__input-container">
        <template v-if="chips">
          <BbChip
            v-for="(option, index) in selectedOptions"
            class="bb-base-select__chip"
            :class="{
              'bb-base-select__selected': true,
              'bb-base-select__selected--chip': true,
              'bb-base-select__selected--focused':
                index === selectedOptionsFocusedIndex
            }"
            :clearable="true"
            :key="option.id"
            @click:clear.stop="onOptionSelected(option)"
            >{{ option.text }}</BbChip
          >
        </template>
        <template v-else-if="multiple">
          <span
            v-for="(option, index) in selectedOptions"
            :class="{
              'bb-base-select__selected': true,
              'bb-base-select__selected--comma': true,
              'bb-base-select__selected--focused':
                index === selectedOptionsFocusedIndex
            }"
            :key="option.id"
            >{{ option.text
            }}{{ index < selectedOptions.length - 1 ? ',' : '' }}</span
          >
        </template>

        <input
          :placeholder="computedPlaceholder"
          :class="'bb-base-select__text-input'"
          :disabled="disabled"
          :id="id"
          :readonly="readonly || !allowWriting"
          :type="'text'"
          @blur.stop="onInputBlur"
          @focus.stop="onInputFocus"
          @change.stop="onInputChange"
          @input.stop="onInputInput"
          @keydown.stop="onInputKeyDown"
          v-model="query"
          ref="input"
        />
        <teleport to="body">
          <span
            :class="{
              'bb-base-select__options-container': true,
              'bb-base-select__options-container--shown': shown,
              'bb-base-select__options-container--showing': showing,
              'bb-base-select__options-container--hiding': hiding,
              'bb-base-select__options-container--hidden': hidden
            }"
            :role="'listbox'"
            :style="{ transitionDuration }"
            :tabindex="-1"
            ref="optionsContainer"
          >
            <span
              class="bb-base-select__loading-container"
              v-if="!filteredOptions.length && loading"
              ><slot :name="'loading'" :loading="!!loading" :query="query">{{
                loadingText
              }}</slot></span
            >
            <span
              class="bb-base-select__no-data-container"
              v-else-if="!filteredOptions.length"
              ><slot :name="'no-data'" :query="query">{{
                noDataText
              }}</slot></span
            >
            <span
              v-for="option in filteredOptions"
              :aria-selected="option.selected"
              :class="{
                'bb-base-select-option': true,
                'bb-base-select-option--selected': option.selected,
                'bb-base-select-option--focused': option.focused,
                'bb-base-select-option--disabled': option.disabled
              }"
              :id="option.id"
              :key="option.id"
              :role="'option'"
              :tabindex="0"
              @click.stop="onOptionClicked"
              ><slot
                name="option"
                :focused="option.focused"
                :index="option.index"
                :item="option.original"
                :loading="!!loading"
                :manual="option.manual"
                :selected="option.selected"
                :text="option.text"
                :value="option.value"
                ><span class="bb-base-select-option__content"
                  ><span class="bb-base-select-option__text">{{
                    option.text
                  }}</span></span
                ></slot
              ></span
            >
          </span>
        </teleport>
      </span>
      <span class="bb-base-select__chevron">
        <slot name="chevron" :loading="loading" :shown="shown">
          <BbIcon type="chevron_down" size="15" />
        </slot>
      </span>
      <slot name="append" v-if="!loading"></slot>
      <span
        v-else
        :class="{
          'bb-base-select__spinner': true,
          'bb-base-select__spinner--loading': loading
        }"
        ><slot :loading="!!loading" :name="'spinner'">
          <BbSpinner size="md" color="gray-700" /></slot
      ></span>
    </span>
    <slot name="append_outer"></slot>
    <input v-for="input in hiddenInputs" :key="input.value" v-bind="input" />
  </span>
</template>

<script setup lang="ts">
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift
} from '@floating-ui/dom'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { head } from 'lodash'
import { isNil } from '@/js/Utilities/functions/isNil'
import { last } from '@/js/Utilities/functions/last'
import { useItemText } from '@/js/composables/useItemText'
import { useItemValue } from '@/js/composables/useItemValue'
import { wait } from '@/js/Utilities/functions/wait'
import { waitFor } from '@/js/Utilities/functions/waitFor'
import { when } from '@/js/Utilities/functions/when'
import BbChip from '@/js/Components/Common/BbChip.vue'
import BbIcon from '@/js/Components/Common/BbIcon.vue'
import BbSpinner from '@/js/Components/Common/BbSpinner.vue'
import type { ComputedRef } from 'vue'

interface Props {
  addOptions?: boolean
  allowWriting?: boolean
  chips?: boolean
  comma?: boolean
  debounceTime?: number
  dependencies?: any[]
  depsDebounceTime?: number
  disabled?: boolean
  enforceCoherence?: boolean
  filterBy?: string | string[] | ((value: any, item: any) => boolean) | null
  hasErrors?: boolean
  id?: string
  items:
    | any[]
    | ((query: string, prefill: boolean, modelValue: any) => Promise<any[]>)
    | ((query: string, prefill: boolean, modelValue: any) => any[])
  itemText?: string | (() => string)
  itemValue?: string | (() => any)
  loadingText?: string
  modelValue?: any
  modelValueDebounceTime?: number
  multiple?: boolean
  name?: string
  noDataText?: string
  placeholder?: string
  prefill?: boolean | 'focus'
  readonly?: boolean
  stash?: boolean
  resetQueryOnOptionSelected?: boolean
  transitionDuration?: number
  updateOnAnimationFrame?: boolean
}

type BaseOption = {
  id: string
  jsonValue: string
  manual: boolean
  original: any
  text: string
  value: any
  disabled: boolean
}

type Option = BaseOption & {
  index: number
  selected: boolean
}

type FilteredOption = Option & {
  focused: boolean
}

const props = withDefaults(defineProps<Props>(), {
  allowWriting: true,
  debounceTime: 500,
  depsDebounceTime: 0,
  filterBy: () => [],
  loadingText: 'Caricamento...',
  modelValueDebounceTime: 0,
  noDataText: 'Nessun elemento da visualizzare',
  prefill: 'focus',
  transitionDuration: 200,
  updateOnAnimationFrame: false
})
const emit = defineEmits([
  'blur',
  'change',
  'click',
  'focus',
  'input',
  'update:modelValue'
])

if (props.multiple && !Array.isArray(props.modelValue)) {
  throw new Error('Multiple is set to "true" but modelValue is not an array.')
}

const outerContainer = ref<HTMLElement | null>(null)
const innerContainer = ref<HTMLElement | null>(null)
const optionsContainer = ref<HTMLElement | null>(null)
const input = ref<HTMLElement | null>(null)
const query = ref<string>('')
const computedPlaceholder = computed(() => {
  if (selectedOptions.value.length) return ''
  else return props.placeholder
})
/**
 * Use a number accumulator because if the fn takes 5 seconds
 * and after 2 seconds another search is run
 * When the first returns the second is still out for 2 seconds
 * and we want to track them both.
 * Debounce will not be enough.
 */
const loading = ref(0)
const transitionDuration = props.transitionDuration / 1000 + 's'
let cleanUpPositioning: () => void

onMounted(async () => {
  if (innerContainer.value && optionsContainer.value) {
    cleanUpPositioning = autoUpdate(
      innerContainer.value,
      optionsContainer.value,
      displayOptions,
      {
        ancestorResize: true,
        ancestorScroll: true,
        animationFrame: props.updateOnAnimationFrame,
        elementResize: true
      }
    )
  }
  document.addEventListener('click', onClickOutside)
})
onBeforeUnmount(() => {
  cleanUpPositioning()
  document.removeEventListener('click', onClickOutside)
})

const internalItems = ref<BaseOption[]>([])
const stash = ref<BaseOption[]>([])
const manualItems = ref<BaseOption[]>([])
const { getItemText } = useItemText()
const { getItemValue } = useItemValue()

const internalOptions = computed<BaseOption[]>(() => {
  return internalItems.value.map((item: any, index) => {
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
    return {
      id: 'option_' + jsonValue.replace(/\W/g, '_'),
      jsonValue,
      manual: false,
      original: item,
      text,
      value,
      disabled: item.disabled
    }
  })
})

const options = computed<Option[]>(() => {
  let fromOptions = internalOptions.value.reduce(
    (acc: { [key: string]: BaseOption }, curr: BaseOption) => {
      acc[curr.id] = curr
      return acc
    },
    {}
  )
  const withManual: { [key: string]: BaseOption } = manualItems.value.reduce(
    (acc, curr) => {
      if (!acc[curr.id]) acc[curr.id] = curr
      return acc
    },
    fromOptions
  )
  const withStash: { [key: string]: BaseOption } = stash.value.reduce(
    (acc, curr) => {
      if (!acc[curr.id]) acc[curr.id] = curr
      return acc
    },
    withManual
  )
  return Object.values(withStash).map<Option>((option: BaseOption, index) => {
    return {
      ...option,
      selected: !!modelValueIndexed.value.get(option.value),
      index
    }
  })
})

/**
 * Filter options to be displayed based on the current query.
 * If no query is used or when query is set from the inside (after a selection) display all possible options
 */
const filteredOptions = computed<FilteredOption[]>(() => {
  let base = []
  /** Only filter when a value is being searched not when the query is fully set on a selected option text */
  if (
    query.value &&
    !selectedOptions.value.some((option: Option) => option.text === query.value)
  ) {
    base = options.value.filter((item: Option) => {
      let matchedAnything = false
      if (!props.filterBy) return true
      else if (typeof props.filterBy === 'function')
        matchedAnything = props.filterBy(item.value, item.original)
      else if (props.filterBy.length) {
        const keys = ([] as string[]).concat(props.filterBy)
        for (let index = 0; index < keys.length; index++) {
          const propName = keys[index]
          matchedAnything =
            matchedAnything ||
            (item.original[propName] &&
              item.original[propName]
                .toLowerCase()
                .includes(query.value.toLowerCase()))
        }
      }
      return (
        matchedAnything ||
        item.text.toLowerCase().includes(query.value.toLowerCase())
      )
    })
    /** Otherwise defaul;t to the whole set of options */
  } else base = options.value
  /** This is done here so that only visible options are highlighted */
  return base.map((option: Option, index) => ({
    ...option,
    focused: normalizedFocusedIndex.value === index
  }))
})

/**
 * Indexes options by id for retrieval
 */

const optionsIndexedById = computed<{
  [key: string]: Option
}>(() =>
  options.value.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.id]: curr
    }),
    {}
  )
)

/**
 * Indexes options by their value
 * (using JSON to circumvent identical objects not being equal in JS)
 */
const optionsIndexedByValue = computed(() => {
  let indexed = options.value.reduce(
    (acc: { [key: string]: Option }, curr: Option) => {
      acc[curr.jsonValue] = curr
      return acc
    },
    {}
  )
  return {
    get: (key: any) => {
      return indexed[JSON.stringify(key)]
    }
  }
})

/**
 * Indexes modelValue to a map so when can easily know which values are selected
 * (using JSON to circumvent identical object not being equal in JS)
 */
const modelValueIndexed = computed(() => {
  let index: { [key: string]: true } = {}
  ;[]
    .concat(props.modelValue)
    .forEach((value: any) => (index[JSON.stringify(value)] = true))
  return {
    get: (value: any) => index[JSON.stringify(value)]
  }
})

/**
 * For every item in modelValue find the linked option if it exists.
 * This is used to display chips.
 */
const selectedOptions = computed(() => {
  return [].concat(props.modelValue).reduce((acc: Option[], curr: any) => {
    const linkedOption = optionsIndexedByValue.value.get(curr)
    if (linkedOption) acc.push(linkedOption)
    return acc
  }, [])
})

/**
 * When selecting an option split behavior based on single or multiple selection
 */
const onOptionSelected = (option: Option) => {
  let valueToEmit
  focusedIndex.value = option.index
  /**
   * For single selection:
   * If the option was already selected - restore the value to default, clean the stash, manual items, and query.
   * If the option was not selected - use its value, save the option in the stash and display it's text as query
   * The stash is used to remove the complexity of stashing items when searching for identifying information,
   * like searching an address would not return the option that was used to selected a previous address in another country.
   * Or when searching users by username would not return the previous ones.
   * We save it so the user hasn't to.
   */
  if (!props.multiple) {
    if (option.selected) {
      if (option.manual) {
        manualItems.value = manualItems.value.filter(
          (current: BaseOption) => current.id !== option.id
        )
      }
      valueToEmit = null
      if (props.stash) {
        stash.value = []
      }
      query.value = ''
    } else {
      valueToEmit = option.value
      if (props.stash) {
        stash.value = [option]
      }
      query.value = option.text
    }
    /**
     * For multiple selection
     * If the option was selected remove it from modelValue, if it is a mnaual iutem also remove it from there.
     * In the stash we can search for the id of the option.
     * If the option was not selected we can just add it to modelValue and the stash.
     */
  } else {
    if (option.selected) {
      if (option.manual) {
        manualItems.value = manualItems.value.filter(
          (current: BaseOption) => current.id !== option.id
        )
      }
      valueToEmit = props.modelValue.filter(
        (value: any) => JSON.stringify(value) !== option.jsonValue
      )
      if (props.stash) {
        stash.value = stash.value.filter(stashed => stashed.id !== option.id)
      }
    } else {
      valueToEmit = props.modelValue.concat(option.value)
      if (props.stash) {
        stash.value = stash.value.concat(option)
      }
    }
  }
  emit('update:modelValue', valueToEmit)
}

const getOptions = async ({ prefill = false }) => {
  let items = []
  if (Array.isArray(props.items)) {
    items = props.items
  } else {
    if (typeof props.items === 'function') {
      loading.value++
      items = await props.items(query.value, prefill, props.modelValue)
      loading.value--
    }
  }
  internalItems.value = items
}

const addOption = () => {
  const text = query.value
  const value = query.value
  const jsonValue = JSON.stringify(value)
  const option = {
    text,
    value,
    jsonValue,
    id: 'option_' + jsonValue.replace(/\W/g, '_'),
    original: value,
    manual: true,
    disabled: false
  }
  manualItems.value = manualItems.value.concat(option)
  query.value = ''
}

/**
 * It should prefill if asked, or
 * when single if modelValue is not null
 * when multiple if modelValue is not empty
 */
const shouldPrefill =
  props.prefill === true ||
  (!props.multiple && !isNil(props.modelValue)) ||
  (props.multiple && props.modelValue.length)
/**
 * When modelValue changes split behavior for single and multiple selection:
 */
let modelValueTimeout: ReturnType<typeof setTimeout>
watch(
  () => props.modelValue,
  (current, previous) => {
    if (modelValueTimeout) clearTimeout(modelValueTimeout)
    modelValueTimeout = setTimeout(async () => {
      /**
       * For single selection if the value is already in the option (most likely you are using
       * static items) just use it.
       * If the value is not in the options try searching for it (outside dependencies may fix it).
       * If at last the value cannot be found even after searching
       * reset value to the default value when coherence is enforced
       * or at least do not display the old query
       */
      if (!props.multiple) {
        let found = optionsIndexedByValue.value.get(props.modelValue)
        if ((!found && !isNil(props.modelValue)) || previous === undefined) {
          const currentQuery = query.value
          query.value = ''
          await getOptions({ prefill: true })
          query.value = currentQuery
        }
        found = optionsIndexedByValue.value.get(props.modelValue)
        if (found) {
          query.value = found.text
          if (props.stash) {
            stash.value = [found]
          }
        } else {
          if (props.enforceCoherence && !isNil(current)) {
            query.value = ''
            if (props.stash) {
              stash.value = []
            }
            emit('update:modelValue', null)
          } else {
            query.value = ''
          }
        }
        /**
         * For multiple selection if every value is already in the options (most likely you are using
         * static items) just use them.
         * If not all the values are in the current options or is prefilling try searching (outside depencencies may fix the situation).
         * If the values are still not in the available options and coherence is enforced
         * discard the ones that are invalid.
         *
         */
      } else {
        if (!Array.isArray(props.modelValue)) {
          throw new Error('props.modelValue is not an array.')
        }
        let allFound = props.modelValue.every((value: any) =>
          optionsIndexedByValue.value.get(value)
        )
        if (!allFound || previous === undefined) {
          await getOptions({ prefill: true })
          allFound = props.modelValue.every((value: any) =>
            optionsIndexedByValue.value.get(value)
          )
        }
        if (allFound) {
          if (props.stash) {
            stash.value = props.modelValue.map((value: any) =>
              optionsIndexedByValue.value.get(value)
            )
          }
        } else {
          let coherentStash: Option[] = []
          const coherent = current.filter((value: any) => {
            let found = optionsIndexedByValue.value.get(value)
            if (found) coherentStash.push(found)
            return found
          })
          if (props.stash) {
            stash.value = coherentStash
          }
          if (props.enforceCoherence) {
            emit('update:modelValue', coherent)
          }
        }
      }
    }, props.modelValueDebounceTime)
  },
  // Prefill when asked or when items are static
  { immediate: shouldPrefill, deep: true }
)

/**
 * This is triggered to refresh static items whenever the passed array changes.
 * If the parent defines an array in the template this is triggered
 * at every render so we take counter measures
 * Even if the entire array changes all the previously selected values are still in the stash.
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
      focusedIndex.value = null

      if (!props.multiple) {
        let found = optionsIndexedByValue.value.get(props.modelValue)
        if (!found && props.enforceCoherence && !isNil(props.modelValue)) {
          query.value = ''
          if (props.stash) {
            stash.value = []
          }
          emit('update:modelValue', null)
        }
      } else {
        let allFound = props.modelValue.every((value: any) =>
          optionsIndexedByValue.value.get(value)
        )
        if (!allFound && props.enforceCoherence) {
          let coherentStash: Option[] = []
          const coherent = props.modelValue.filter((value: any) => {
            let found = optionsIndexedByValue.value.get(value)
            if (found) coherentStash.push(found)
            return found
          })
          if (props.stash) {
            stash.value = coherentStash
          }
          emit('update:modelValue', coherent)
        }
      }
    }
  }
)

/**
 * When dependencies change
 * If the input has not been prefilled yet just return
 * Check dependencies are the same by value and not reference
 * Otherwise we search again for options as they might be different base on dependencies.
 * If coherence is enforced we set the state accordingly
 */
let depsTimeout: ReturnType<typeof setTimeout>
watch(
  () => props.dependencies,
  (current, previous) => {
    if (!shouldPrefill && props.prefill === 'focus' && isFirstFocus) {
      return
    }
    // Circumvent array defined in the template by the parent
    if (JSON.stringify(current) === JSON.stringify(previous)) {
      return
    }

    if (depsTimeout) clearTimeout(depsTimeout)
    depsTimeout = setTimeout(async () => {
      if (JSON.stringify(current) !== JSON.stringify(previous)) {
        // Only reset the stash if we are going to enforce coherence
        if (props.enforceCoherence) {
          if (props.stash) {
            stash.value = []
          }
        }
        // Momentarily reset query
        let currentQuery = query.value
        query.value = ''
        await getOptions({ prefill: true })
        query.value = currentQuery
        if (!props.multiple) {
          let found = optionsIndexedByValue.value.get(props.modelValue)
          if (!found && props.enforceCoherence && !isNil(props.modelValue)) {
            query.value = ''
            if (props.stash) {
              stash.value = []
            }
            emit('update:modelValue', null)
          }
        } else {
          let allFound = props.modelValue.every((value: any) =>
            optionsIndexedByValue.value.get(value)
          )
          if (!allFound && props.enforceCoherence) {
            let coherentStash: Option[] = []
            const coherent = props.modelValue.filter((value: any) => {
              let found = optionsIndexedByValue.value.get(value)
              if (found) coherentStash.push(found)
              return found
            })
            if (props.stash) {
              stash.value = coherentStash
            }
            emit('update:modelValue', coherent)
          }
        }
      }
    }, props.depsDebounceTime)
  },
  { deep: true }
)

/**
 * This is used to position the option container.
 * When the linked item (outerContainer) updates its position
 * this is rerun by floating-UI
 */
const displayOptions = () => {
  if (innerContainer.value && optionsContainer.value) {
    computePosition(innerContainer.value, optionsContainer.value, {
      placement: 'bottom',
      middleware: [offset(6), flip(), shift()]
    }).then(data => {
      if (optionsContainer.value) {
        optionsContainer.value.style.left = `${data.x}px`
        optionsContainer.value.style.top = `${data.y}px`
        optionsContainer.value.style.width = `${innerContainer.value?.offsetWidth}px`
      }
    })
  }
}
/**
 * We need the transitions because elements must be hidden and shown
 * to accessibility tools when they are fully closed or fully open,
 * while still being animated for sighted users.
 */

// Option panel is open
const shown = ref(false)
// Option panel is opening
const showing = ref(false)
// option panel is closing
const hiding = ref(false)
// Option panel il closed
const hidden = ref(true)

const open = async () => {
  hidden.value = false
  showing.value = true
  await wait(props.transitionDuration)
  showing.value = false
  shown.value = true
}

const close = async () => {
  shown.value = false
  hiding.value = true
  await wait(props.transitionDuration)
  hiding.value = false
  hidden.value = true
}

/**
 * Applies a class when the user is inside this whole component.
 * We cannot use focus within as it doesn't work for elements that are teleported.
 * Also we cannot use the <input/> if we phisically move focus to the options so
 * we track it manually.
 */
const active = ref(false)

/**
 * When the focus goes to the input we select the current text
 * so the user can replace or delete it.
 * On top of that if the prefill strategy is to prefill on first focus and options
 * weren't already retrieved by the watcher on mount, we do that
 */
let isFirstFocus = true
const onInputFocus = async (event: Event) => {
  emit('focus', event)
  active.value = true
  if (input.value instanceof HTMLInputElement) input.value.select()
  if (props.prefill === 'focus' && isFirstFocus && !shouldPrefill) {
    await getOptions({ prefill: true })
    isFirstFocus = false
  }
}

/**
 * On single selection restore the query that might be partially altered by the user.
 * Input can blur either by clicking outside or clicking on an option.
 * We do nothing if the user has selected an option. And we restore the
 * query to its text if the user has moved focus
 */
const onInputBlur = async (event: FocusEvent) => {
  emit('blur', event)
  if (!props.multiple) {
    let noop = false
    const currentModelValue = props.modelValue
    await Promise.race([
      wait(250),
      waitFor(() => {
        return currentModelValue !== props.modelValue
      }).then(() => {
        noop = true
      })
    ])
    if (!noop) {
      const found = optionsIndexedByValue.value.get(props.modelValue)
      if (found) {
        query.value = found.text
      }
    }
  }
}

const onInputChange = (event: Event) => emit('change', event)
const onInputClick = (event: Event) => emit('click', event)

/**
 * Search at every input by the user.
 * When the user deletes the query unselect the current option
 */
const onInputInput = (event: Event) => {
  emit('input', event)
  if (query.value === '') {
    if (!props.multiple) {
      emit('update:modelValue', null)
    }
  }
  if (typeof props.items === 'function') {
    searchByQuery(query.value)
  }
}

// This is the vertical index used to highlight options in the container
const focusedIndex = ref<number | null>(null)
/**
 * Normalize the index using the displayed options so we can start over when reaching the end.
 * Please watch out for the side effect it is used to avoid the
 * complexity of using modulo over negative numbers
 */
const normalizedFocusedIndex: ComputedRef<number | null> = computed(() => {
  if (Number.isInteger(focusedIndex.value) && focusedIndex.value) {
    if (focusedIndex.value === -1) {
      focusedIndex.value = filteredOptions.value.length - 1
    }
    return focusedIndex.value % filteredOptions.value.length
  }
  return focusedIndex.value
})

// This is the horizontal index used to highlight selected options
const selectedOptionsFocusedIndex = ref<number | null>(null)

/**
 * Increment the focusIndex and wait for it to be normalized.
 * If the index corresponds to an option scroll it into view
 */
const focusOnNextOption = () => {
  if (focusedIndex.value !== null) focusedIndex.value++
  else {
    focusedIndex.value = 0
  }
  nextTick().then(() => {
    if (normalizedFocusedIndex.value !== null) {
      const foundOption = optionsContainer.value?.querySelector(
        `#${options.value[normalizedFocusedIndex.value].id}`
      )
      if (foundOption instanceof HTMLElement)
        foundOption.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        })
    }
  })
}

/**
 * Decrement the focusIndex and wait for it to be normalized.
 * If the index corresponds to an option scroll it into view
 */
const focusOnPreviousOption = () => {
  if (focusedIndex.value !== null) focusedIndex.value--
  else focusedIndex.value = options.value.length - 1

  nextTick().then(() => {
    if (normalizedFocusedIndex.value !== null) {
      const foundOption = optionsContainer.value?.querySelector(
        `#${options.value[normalizedFocusedIndex.value].id}`
      )
      if (foundOption instanceof HTMLElement)
        foundOption.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        })
    }
  })
}

/**
 * This is handled separately from input because it has a lot to do with user
 * interaction and control characters than it has with the query.
 */
const onInputKeyDown = async (event: KeyboardEvent) => {
  if (props.readonly || props.disabled) {
    event.preventDefault()
    return
  }
  switch (event.key) {
    /**
     * On arrow prevent the page from scrolling.
     * Reset horizontal focus
     * When the panel is open
     * - Focus on the previous option
     * When the panel is closed
     * - focus on the first selected option
     */
    case 'ArrowUp':
      {
        event.preventDefault()
        if (loading.value) return
        selectedOptionsFocusedIndex.value = null
        if (shown.value) {
          focusOnPreviousOption()
        } else {
          if (selectedOptions.value.length) {
            focusedIndex.value = head(selectedOptions.value).index
          }
          await open()
        }
      }
      break
    /**
     * On arrow prevent the page from scrolling.
     * Reset horizontal focus
     * When the panel is open
     * - Focus on the previous option
     * When the panel is closed
     * - focus on the first selected option
     */
    case 'ArrowDown':
      {
        event.preventDefault()
        if (loading.value) return
        selectedOptionsFocusedIndex.value = null
        if (shown.value) {
          focusOnNextOption()
        } else {
          if (selectedOptions.value.length) {
            focusedIndex.value = head(selectedOptions.value).index
          }
          await open()
        }
      }
      break
    /**
     * When moving horizontally
     * Cycle from rightmost, next, or input focus.
     * If the focus lands on an option align the vertical focus as well
     */
    case 'ArrowLeft':
      {
        if (loading.value) return
        if (!query.value) {
          if (selectedOptions.value.length) {
            if (selectedOptionsFocusedIndex.value === null) {
              selectedOptionsFocusedIndex.value =
                selectedOptions.value.length - 1
            } else if (selectedOptionsFocusedIndex.value > 0) {
              selectedOptionsFocusedIndex.value--
            } else {
              selectedOptionsFocusedIndex.value = null
            }

            if (selectedOptionsFocusedIndex.value !== null) {
              let linkedOption =
                selectedOptions.value[selectedOptionsFocusedIndex.value]
              let foundOption = optionsContainer.value?.querySelector(
                `#${linkedOption.id}`
              )
              if (foundOption) {
                foundOption.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'start'
                })

                focusedIndex.value =
                  optionsIndexedById.value[
                    selectedOptions.value[selectedOptionsFocusedIndex.value].id
                  ].index
              }
            }
          }
        }
      }
      break
    /**
     * When moving horizontally
     * Cycle from leftmost, next, or input focus.
     * If the focus lands on an option align the vertical focus as well
     */
    case 'ArrowRight':
      {
        if (loading.value) return
        if (!query.value) {
          if (selectedOptions.value.length) {
            if (selectedOptionsFocusedIndex.value === null) {
              selectedOptionsFocusedIndex.value = 0
            } else if (
              selectedOptionsFocusedIndex.value <
              selectedOptions.value.length - 1
            ) {
              selectedOptionsFocusedIndex.value++
            } else {
              selectedOptionsFocusedIndex.value = null
            }

            if (selectedOptionsFocusedIndex.value !== null) {
              let linkedOption =
                selectedOptions.value[selectedOptionsFocusedIndex.value]
              let foundOption = optionsContainer.value?.querySelector(
                `#${linkedOption.id}`
              )
              if (foundOption) {
                foundOption.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'start'
                })

                focusedIndex.value =
                  optionsIndexedById.value[
                    selectedOptions.value[selectedOptionsFocusedIndex.value].id
                  ].index
              }
            }
          }
        }
      }
      break
    /**
     * If the panel is closed focus on the first selected option.
     * If the panel was already open select/deselect the currently focused option
     * and close the panel of single selection is enabled
     */
    case 'Enter':
      {
        event.preventDefault()
        if (loading.value) return
        if (!shown.value) {
          if (filteredOptions.value.length) {
            if (selectedOptions.value.length) {
              focusedIndex.value = head(selectedOptions.value).index
            }
          }
          await open()
        } else {
          if (normalizedFocusedIndex.value !== null) {
            if (!props.multiple) {
              await close()
            }
            onOptionSelected(
              filteredOptions.value[normalizedFocusedIndex.value]
            )
          } else {
            if (props.addOptions) {
              addOption()
              const added = last(manualItems.value)
              onOptionSelected(optionsIndexedById.value[added.id])
            }
          }
        }
      }
      break
    /**
     * When moving away from the component reset focus both vertically and horizontally
     */
    case 'Tab':
    case 'Escape':
      {
        if (shown.value) {
          await close()
        }
        selectedOptionsFocusedIndex.value = null
        focusedIndex.value = null
      }
      break
    // Prevent shift from opening the panel
    case 'Shift':
      {
        if (loading.value) return
      }
      break
    /**
     * Delete behavior is different when query is empty
     * If query is empty
     * If no chip is selected - select rightmost chip
     * If a chip is selected - deselect that option
     * If any option remains move focus to that or reset
     */
    case 'Backspace':
      {
        if (loading.value) return
        if (!query.value) {
          if (selectedOptions.value.length) {
            if (selectedOptionsFocusedIndex.value === null) {
              selectedOptionsFocusedIndex.value =
                selectedOptions.value.length - 1
            } else {
              onOptionSelected(
                selectedOptions.value[selectedOptionsFocusedIndex.value]
              )
              if (selectedOptions.value.length) {
                selectedOptionsFocusedIndex.value = Math.max(
                  Math.min(
                    selectedOptionsFocusedIndex.value,
                    selectedOptions.value.length - 2
                  ),
                  0
                )
              } else {
                selectedOptionsFocusedIndex.value = null
              }
            }
          }
        }
        await open()
      }
      break
    /**
     * Open the panel on writing and reset horizontal focus
     */
    default:
      {
        selectedOptionsFocusedIndex.value = null
        focusedIndex.value = null
        await open()
      }
      break
  }
}

/**
 * Triggered on input when items is a function.
 */

let timeout: ReturnType<typeof setTimeout>
const searchByQuery = (query: string) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(async () => {
    try {
      await getOptions({ prefill: false })
    } catch (error) {
      console.error(error)
    }
  }, props.debounceTime)
}

/**
 * When clicking on the outside container seamlessly move focus to the input and open the panel
 */
const onOuterContainerClick = () => {
  emit('click')
  if (props.disabled || props.readonly) return
  if (input.value instanceof HTMLElement) {
    input.value.focus()
  }
  open()
}

/**
 * When an option is clicked wait for it to bubble to the option container to avoid slot event problems.
 * Select / deselect the option and then move focus to the input.
 * If it is single selection mode close the panel
 */
const onOptionClicked = (event: Event) => {
  if (event.currentTarget instanceof HTMLElement) {
    if (event.currentTarget.classList.contains('bb-base-select-option')) {
      const option = optionsIndexedById.value[event.currentTarget.id]
      if (option.disabled) return
      onOptionSelected(option)
      if (input.value instanceof HTMLInputElement) {
        if (props.resetQueryOnOptionSelected) {
          query.value = ''
        }
        input.value.focus()
      }
      if (!props.multiple) close()
    }
  }
}

/**
 * On click outside of the container close the panel, remove active state.
 * In multiple selection clear query after a timeout
 */
const onClickOutside = (event: Event) => {
  if (event.target instanceof Node) {
    if (outerContainer.value) {
      if (!outerContainer.value.contains(event.target)) {
        close()
        active.value = false
        if (props.multiple)
          wait(500).then(() => {
            query.value = ''
          })
        return
      }
    }
  }
}

/**
 * When using this component for submission we add a bunch of hidden
 * inputs so the submitted inputs are on par with v-model
 */
/**
 * This is used to keep the value compatible to common html expected values.
 * Convert to string everything that's not but do not double encode strings
 */
const makeInputValue = when(
  (item: unknown) => typeof item !== 'string',
  JSON.stringify
)

const hiddenInputs = computed(() => {
  return [].concat(props.modelValue).map(current => {
    const value = makeInputValue(current)
    return {
      disabled: props.disabled,
      name: props.name,
      type: 'hidden',
      value: value
    }
  })
})
</script>

<style lang="postcss">
.bb-base-select {
  @apply inline-flex;
  box-sizing: border-box;

  &--active {
    .bb-base-select__text-input {
      @apply min-w-[150px] border-0 focus-within:border-0 ring-0;
    }
  }

  &--shown {
    .bb-base-select__chevron {
      @apply rotate-180;
    }
  }

  &--disabled {
    .bb-base-select__inner-container {
      @apply bg-grey-100;

      input {
        @apply outline-gray-100 bg-grey-100;
      }
    }
  }

  &--errors {
    .bb-base-select__inner-container {
      @apply ring-1 !ring-red-300 !border-red-300 drop-shadow shadow-red-300 focus-within:shadow-red-300;
    }
  }

  &__inner-container {
    @apply text-grey-700 inline-flex flex-wrap gap-1 overflow-hidden border focus-within:border-primary focus-within:ring-1 focus-within:drop-shadow focus-within:shadow-primary bg-white border-grey-300 rounded-[8px] transition-colors;
    flex: 1;
  }

  &__input-container {
    @apply inline-flex flex-wrap gap-1 p-1 overflow-hidden;
    flex: 1;
  }

  &__selected {
    @apply max-w-full;

    &--comma {
      @apply overflow-hidden text-ellipsis whitespace-nowrap;

      &.bb-base-select__selected--focused {
        @apply text-blue-400;
      }
    }

    &--chip {
      @apply !py-0;

      &.bb-base-select__chip {
        .bb-chip__content {
          @apply text-sm font-medium;
        }
      }
      &.bb-base-select__selected--focused {
        background-image: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.2),
          rgba(0, 0, 0, 0.2)
        );
      }
    }
  }

  &__text-input {
    @apply min-w-[0px] py-[6px] px-5 transition-all text-sm border-0 outline-white outline-none focus:outline-none;
    flex: 1;
  }

  &__chevron {
    @apply inline-flex items-center justify-center h-full w-10 rotate-0 transition-transform;
    max-height: 58px;
  }

  &__spinner {
    @apply inline-flex items-center justify-center h-full w-0 scale-0 transition-all duration-200;

    &--loading {
      @apply scale-100 w-10;
    }
  }

  &__options-container {
    @apply absolute top-0 left-0 bg-white border border-grey-300 max-h-[300px] z-10 flex flex-col overflow-auto;
    transition-property: max-height;
    transition-timing-function: ease-in-out;
    transition-delay: 0s;
    border-radius: 10px;

    &--hiding {
      @apply max-h-0;
    }

    &--hidden {
      @apply max-h-0 invisible;
    }

    &--disabled {
      @apply max-h-0 invisible;
    }

    > span {
      @apply block;

      > span {
        @apply block;
      }
    }
  }

  &__loading-container {
    @apply py-3 px-6;
  }

  &__no-data-container {
    @apply py-3 px-6;
  }

  &-option {
    @apply cursor-pointer hover:bg-grey-100  focus:bg-gray-200 py-[10px] px-6 transition-all;

    &--focused {
      @apply bg-primary-300 hover:bg-primary-400 text-white;

      &.bb-base-select-option--selected {
        @apply bg-primary-500;
      }
    }

    &--selected {
      @apply bg-primary-400 hover:bg-primary-500 focus:bg-primary-500 text-white;
    }
  }
}
</style>
