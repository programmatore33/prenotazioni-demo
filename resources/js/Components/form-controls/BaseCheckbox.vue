<template>
  <span :class="classes">
    <input v-if="!checked && submitWhenFalse" v-bind="hiddenInputAttributes" />
    <input v-bind="inputAttributes" ref="checkboxInput" />
    <span class="bb-base-checkbox-container" aria-hidden="true">
      <slot name="icon" v-bind="slotAttributes">
        <svg viewBox="276.411 158.834 114.971 114.97" v-bind="iconAttributes">
          <path
            d="M 380.93 158.834 L 286.863 158.834 C 281.088 158.834 276.411 163.511 276.411 169.286 L 276.411 263.352 C 276.411 269.127 281.088 273.804 286.863 273.804 L 380.93 273.804 C 386.704 273.804 391.382 269.127 391.382 263.352 L 391.382 169.286 C 391.382 163.511 386.699 158.834 380.93 158.834 Z"
            style=""
          ></path>
          <path
            stroke-width="14px"
            stroke-linecap="round"
            fill="none"
            stroke="white"
            d="M 297.574 224.786 L 318.309 243.134 L 371.568 189.232"
          ></path>
        </svg>
      </slot>
    </span>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { isCssColor } from '@/js/Utilities/functions/isCssColor'
import { when } from '@/js/Utilities/functions/when'

const props = defineProps({
  checked: {
    type: Boolean
  },
  color: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  hasErrors: {
    type: Boolean
  },
  id: {
    type: String
  },
  indeterminate: {
    type: Boolean
  },
  modelValue: {},
  name: {
    type: String
  },
  readonly: {
    type: Boolean
  },
  submitWhenFalse: {
    type: Boolean
  },
  trueValue: {
    default: true
  },
  falseValue: {
    default: false
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

const checkboxInput = ref(null)

const checked = computed(() => {
  if (props.checked) return true
  return JSON.stringify(props.trueValue) === JSON.stringify(props.modelValue)
})
const hasFocus = ref(false)

const classes = computed(() => {
  return {
    'bb-base-checkbox': true,
    'bb-base-checkbox--disabled': props.disabled,
    'bb-base-checkbox--errors': props.hasErrors,
    'bb-base-checkbox--indeterminate': props.indeterminate,
    'bb-base-checkbox--readonly': props.readonly,
    [`bb-base-checkbox--${props.color}`]:
      props.color && !isCssColor(props.color)
  }
})

/**
 * This is used to keep the value compatible to common html expected values.
 * Convert to string everything that's not but do not double encode strings
 */
const makeInputValue = when(item => typeof item !== 'string', JSON.stringify)

const hiddenInputAttributes = computed(() => {
  const value = makeInputValue(props.falseValue)
  return {
    disabled: props.disabled,
    name: props.name,
    type: 'hidden',
    value: value
  }
})

const inputAttributes = computed(() => {
  const value = makeInputValue(props.trueValue)

  const onBlur = event => {
    hasFocus.value = false
    emit('blur', event)
  }

  const onChange = event => {
    if (event.target instanceof HTMLInputElement) {
      const value = event.target.checked ? props.trueValue : props.falseValue

      emit('change', event)
      emit('update:modelValue', value)
    }
  }

  const onFocus = event => {
    hasFocus.value = true
    emit('focus', event)
  }

  const eventListeners = {
    onBlur,
    onChange,
    onClick: event => emit('click', event),
    onFocus,
    onKeydown: event => emit('keydown', event),
    onMousedown: event => emit('mousedown', event),
    onMouseup: event => emit('mouseup', event),
    onInput: event => emit('input', event)
  }

  return {
    checked: checked.value,
    // There is no such thing as readonly checkbox so we disable and style it with css
    disabled: props.disabled || props.readonly,
    id: props.id,
    name: props.name,
    tabindex: props.disabled ? -1 : undefined,
    type: 'checkbox',
    value: value,
    ...eventListeners
  }
})

const slotAttributes = computed(() => ({
  checked: checked.value,
  disabled: props.disabled,
  falseValue: props.falseValue,
  focused: hasFocus.value,
  hasErrors: props.hasErrors,
  id: props.id,
  name: props.name,
  parsedValue: inputAttributes.value.value,
  readonly: props.readonly,
  trueValue: props.trueValue,
  value: checked.value ? props.trueValue : props.falseValue
}))

const iconAttributes = computed(() => {
  const style = {}

  return {
    class: 'bb-base-checkbox-container__icon',
    style
  }
})

/**
 * Indeterminate is a very volatile prop that is reset upon clicking,
 * this keeps the state and the prop aligned
 */
watch(
  () => [props.modelValue, props.checked, props.indeterminate],
  () => {
    if (checkboxInput.value) {
      checkboxInput.value.indeterminate = !!props.indeterminate
    }
  }
)
</script>

<style lang="postcss">
/* base checkbox */
.bb-base-checkbox {
  @apply inline-flex;

  &:focus-within {
    .bb-base-checkbox-container__icon {
      @apply ring transition-all duration-500;
    }
  }

  input[type='checkbox'] {
    @apply sr-only;

    &:checked + .bb-base-checkbox-container {
      & .bb-base-checkbox-container__icon {
        @apply text-primary transition-colors;

        path {
          stroke-dashoffset: 0;
        }
      }
    }

    &:indeterminate
      + .bb-base-checkbox-container
      .bb-base-checkbox-container__icon {
      @apply bg-current text-primary;
    }
  }

  &--disabled {
  }
  &--errors {
  }
  &--readonly {
  }

  .bb-base-checkbox-container {
    @apply inline-flex items-center select-none;

    &__icon {
      @apply inline-block w-5 h-5 cursor-pointer bg-white fill-current transition-colors text-transparent border border-grey-300 rounded-sm;

      path {
        stroke-dasharray: 105;
        stroke-dashoffset: 105;
        transition: stroke-dashoffset 0.3s;
      }
    }
  }
}
</style>
