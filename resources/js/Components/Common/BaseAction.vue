<template>
  <component class="base-action" :is="tag" v-bind="attributes">
    <span class="base-action__label">{{ label }}</span>
    <BbIcon :type="icon" :size="size"></BbIcon>
  </component>
</template>

<script setup>
import { computed } from 'vue'
import BbIcon from './BbIcon.vue'
import { Link } from '@inertiajs/vue3'

const props = defineProps({
  disabled: {
    type: Boolean
  },
  href: {
    type: String
  },
  icon: {
    type: String
  },
  label: {
    type: String
  },
  size: {
    type: [String, Number],
    default: 14
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
  if (!props.href) return 'button'
  if (!props.disabled) return Link
  return 'a'
})

const attributes = computed(() => {
  const initial = {}

  if (!props.href) {
    initial.disabled = props.disabled
    initial.type = props.type
  } else {
    if (props.disabled) {
      initial['aria-disabled'] = true
      initial.role = 'link'
    } else {
      initial.href = props.href
    }
  }

  return initial
})
</script>
