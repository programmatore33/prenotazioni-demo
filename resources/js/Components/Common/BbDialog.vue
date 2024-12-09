<template>
  <BaseDialog
    :closeLabel="closeLabel"
    :color="color"
    :compact="compact"
    :description="description"
    :disabled="disabled"
    :eager="eager"
    :fullscreen="fullscreen"
    :modelValue="modelValue"
    :panelClasses="['bb-dialog'].concat(panelClasses)"
    :overlayClasses="overlayClasses"
    :persistent="persistent"
    :showClose="showClose"
    :size="size"
    :title="title"
    :transition="transition"
    :transitionDuration="transitionDuration"
    v-bind="eventListeners"
  >
    <template #header v-if="$slots.header">
      <slot name="header"> </slot>
    </template>
    <template #title v-if="$slots.title">
      <slot name="title"> </slot>
    </template>
    <div :class="{'bb-dialog-content': !contentTopNear, 'bb-dialog-content-top-near': contentTopNear}">
      <slot> </slot>
    </div>
    <template #footer v-if="$slots.footer">
      <slot name="footer"> </slot>
    </template>
  </BaseDialog>
</template>

<script setup>
import BaseDialog from './BaseDialog.vue'
defineProps({
  closeLabel: {
    type: String
  },
  color: {
    type: String
  },
  compact: {},
  description: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  eager: {
    type: Boolean
  },
  fullscreen: {
    type: Boolean
  },
  modelValue: {},
  panelClasses: {
    default: () => []
  },
  overlayClasses: {
    default: () => []
  },
  persistent: {
    type: Boolean
  },
  showClose: {
    type: Boolean,
    default: true
  },
  size: {
    type: [String, Number],
    default: 'md'
  },
  title: {
    type: String
  },
  transition: {
    type: String,
    default: 'fade'
  },
  transitionDuration: {
    type: Number,
    default: 350
  },
  contentTopNear: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['shown', 'hidden', 'update:modelValue'])

const eventListeners = {
  onShown: event => emit('shown', event),
  onHidden: event => emit('hidden', event),
  'onUpdate:modelValue': value => emit('update:modelValue', value)
}
</script>

<style>
.contentTopNear
.bb-dialog-content {
  padding: 0;
}
</style>
