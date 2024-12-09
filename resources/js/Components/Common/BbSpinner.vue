<template>
  <span class="bb-spinner">
    <slot>
      <BbIcon class="animate-spin" :size="size" :color="color" type="spinner" />
    </slot>
  </span>
</template>

<script setup>
import BbIcon from './BbIcon.vue'

defineProps({
  color: {
    type: String
  },
  size: {
    type: [String, Number],
    default: 'md'
  }
})
</script>
