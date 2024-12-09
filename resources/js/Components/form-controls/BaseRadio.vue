<template>
  <span :class="classes">
    <input v-bind="inputAttributes" ref="input" />
    <span class="bb-base-radio-container" aria-hidden="true">
      <slot name="icon" v-bind="slotAttributes">
        <span v-bind="iconAttributes"></span>
      </slot>
    </span>
  </span>
</template>

<script setup>
import { isCssColor } from '@/js/Utilities/functions/isCssColor'
import { when } from '@/js/Utilities/functions/when'
import { computed, ref } from 'vue'

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
  modelValue: {},
  name: {
    type: String
  },
  readonly: {
    type: Boolean
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
const input = ref(null)

const checked = computed(() => {
  if (props.checked) return true
  return JSON.stringify(props.modelValue) === JSON.stringify(props.value)
})
const hasFocus = ref(false)

const classes = computed(() => {
  return {
    'bb-base-radio': true,
    'bb-base-radio--disabled': props.disabled,
    'bb-base-radio--errors': props.hasErrors,
    'bb-base-radio--readonly': props.readonly,
    [`bb-base-radio--${props.color}`]: props.color && !isCssColor(props.color)
  }
})

/**
 * This is used to keep the value compatible to common html expected values.
 * Convert to string everything that's not but do not double encode strings
 */
const makeInputValue = when(item => typeof item !== 'string', JSON.stringify)

const inputAttributes = computed(() => {
  const value = makeInputValue(props.value)

  const onBlur = event => {
    hasFocus.value = false
    emit('blur', event)
  }
  const onChange = event => {
    emit('change', event)
    emit('update:modelValue', props.value)
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
    onInput: event => emit('input', event),
    onKeydown: event => emit('keydown', event),
    onMousedown: event => emit('mousedown', event),
    onMouseup: event => emit('mouseup', event)
  }

  return {
    checked: checked.value,
    // There is no such thing as readonly radio so we disable and style it with css
    disabled: props.disabled || props.readonly,
    id: props.id,
    name: props.name,
    tabindex: props.disabled ? -1 : undefined,
    type: 'radio',
    value: value,
    ...eventListeners
  }
})

const slotAttributes = computed(() => ({
  checked: checked.value,
  disabled: props.disabled,
  focused: hasFocus.value,
  hasErrors: props.hasErrors,
  id: props.id,
  name: props.name,
  parsedValue: inputAttributes.value.value,
  readonly: props.readonly,
  value: props.value
}))

const iconAttributes = computed(() => {
  const style = {}
  if (props.color && isCssColor(props.color)) {
    style.color = props.color
  }
  return {
    class: 'bb-base-radio-container__icon',
    style
  }
})
</script>

<style lang="postcss">
/* base radio */
.bb-base-radio {
  @apply relative inline-flex items-center;

  &:focus-within {
    .bb-base-radio-container__icon {
      @apply ring;
    }
  }

  input[type='radio'] {
    @apply sr-only;

    &:checked + .bb-base-radio-container .bb-base-radio-container__icon {
      @apply after:w-3/4 after:h-3/4;
    }
  }

  &--disabled {
  }
  &--errors {
  }
  &--readonly {
  }

  .bb-base-radio-container {
    @apply inline-flex items-center select-none;
    &__icon {
      @apply inline-block w-5 h-5 cursor-pointer border-2 bg-white rounded-full transition-colors relative after:absolute after:left-1/2 after:-translate-x-1/2 after:top-1/2 after:-translate-y-1/2 after:bg-primary after:w-0 after:h-0 after:rounded-full after:transition-all;
    }
  }
}
</style>
