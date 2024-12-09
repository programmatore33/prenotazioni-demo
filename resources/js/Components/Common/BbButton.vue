<template>
  <component :class="classes" :is="tag" v-bind="attributes">
    <BbSpinner size="20"></BbSpinner>
    <slot></slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { isCssColor } from '@/js/Utilities/functions/isCssColor'
import BbSpinner from './BbSpinner.vue'

const props = defineProps({
  block: {
    type: Boolean
  },
  color: {
    type: String,
    default: 'primary'
  },
  disabled: {
    type: Boolean
  },
  href: {
    type: String,
    required: false
  },
  icon: {
    type: Boolean
  },
  loading: {
    type: Boolean
  },
  outline: {
    type: Boolean
  },
  inline: {
    type: Boolean
  },
  rounded: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'md'
  },
  tag: {
    type: String,
    default: 'button'
  },
  type: {
    type: String,
    default: 'button'
  }
})

const tag = computed(() => {
  // For disabled links always render a
  if (props.href || (props.to && props.disabled)) return 'inertia-link'
  return props.tag
})

const classes = computed(() => ({
  'bb-btn': true,
  'bb-btn--block': props.block,
  'bb-btn--disabled': props.disabled,
  'bb-btn--icon': props.icon,
  'bb-btn--loading': props.loading,
  'bb-btn--outline': props.outline,
  'bb-btn--inline': props.inline,
  'bb-btn--link': props.href,
  'bb-btn--rounded': props.rounded,
  [`bb-btn--${props.color}`]: props.color && !isCssColor(props.color),
  [`bb-btn--${props.size}`]: true
}))

const attributes = computed(() => {
  const initial = {}

  switch (tag.value) {
    case 'button':
      initial.disabled = props.disabled
      initial.type = props.type
      break
    case 'inertia-link':
      // When rendering as anchor prevent navigation if disabled
      // https://getbootstrap.com/docs/4.0/components/buttons/#disabled-state
      if (props.disabled) {
        initial['aria-disabled'] = true
        initial.role = 'link'
      } else {
        // Only attach the href to active links
        // https://www.scottohara.me/blog/2021/05/28/disabled-links.html
        initial.href = props.href
      }
      break
    default:
      break
  }

  if (props.color && isCssColor(props.color)) {
    initial.style = {}
    if (props.outline) {
      initial.style.color = props.color
      initial.style.borderColor = props.color
    } else {
      initial.style = { backgroundColor: props.color }
    }
  }
  return initial
})
</script>
