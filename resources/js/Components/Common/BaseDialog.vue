<template>
  <teleport to="body">
    <div v-bind="overlayAttributes" ref="overlay">
      <div v-bind="panelAttributes" ref="panel">
        <div
          class="bb-base-dialog__content"
          ref="content"
          v-if="hasRenderedAtLeastOnce"
        >
          <div class="bb-base-dialog__header" ref="header">
            <slot name="header" :titleId="titleId">
              <span class="bb-base-dialog__title" :id="titleId">
                <slot name="title" :titleId="titleId">{{ title }}</slot>
              </span>
              <span class="bb-base-dialog-close">
                <button v-if="showClose" @click="onCloseClick" type="button">
                  <slot name="close">
                    <span class="bb-base-dialog-close__content">
                      <span class="bb-base-dialog-close__label">{{
                        closeLabel
                      }}</span>
                      <span class="bb-base-dialog-close__icon"
                        ><BbIcon
                          type="close"
                          color="primary"
                          size="12"
                        ></BbIcon>
                      </span>
                    </span>
                  </slot>
                </button>
              </span>
            </slot>
          </div>
          <div class="bb-base-dialog__body" ref="body">
            <slot
              :descriptionId="descriptionId"
              :description="description"
              name="description"
              ><div
                v-if="description"
                :id="descriptionId"
                class="bb-base-dialog__description"
              >
                {{ description }}
              </div>
            </slot>
            <slot></slot>
          </div>
          <div style="flex: 10000 10000 0%"></div>
          <div class="bb-base-dialog__footer" ref="footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { nanoid } from 'nanoid'
import { throttle } from 'lodash'
import { useI18n } from 'vue-i18n'
import { wait } from '@/js/Utilities/functions/wait'
import { waitFor } from '@/js/Utilities/functions/waitFor'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import BbIcon from './BbIcon.vue'

type Sizes = {
  sm: number
  md: number
  lg: number
  xl: number
}

interface Props {
  closeLabel?: string
  color?: string
  compact?: boolean
  description?: string
  disabled?: boolean
  eager?: boolean
  fullscreen?: boolean
  modelValue?: boolean | null
  mutationOptions?: MutationObserverInit
  overlayClasses?: Classes
  panelClasses?: Classes
  persistent?: boolean
  showClose?: boolean
  size?: keyof Sizes | string | number
  title?: string
  transition?: string
  transitionDuration?: number
}

type Classes =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[]

const props = withDefaults(defineProps<Props>(), {
  closeLabel: 'Chiudi modale',
  mutationOptions: () => ({ childList: true, subtree: true }),
  showClose: true,
  size: 'sm',
  transition: 'fade',
  transitionDuration: 350,
  panelClasses: () => [],
  overlayClasses: () => []
})

const emit = defineEmits(['shown', 'hidden', 'update:modelValue'])

const titleId = `title_${nanoid()}`
const descriptionId = `description_${nanoid()}`

const observer = ref<MutationObserver | null>(null)
const overlay = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const content = ref<HTMLElement | null>(null)
const header = ref<HTMLElement | null>(null)
const body = ref<HTMLElement | null>(null)
const footer = ref<HTMLElement | null>(null)
const height = ref<number | null>(null)

const attrs = useAttrs()
const { t } = useI18n()

const closeLabel = computed(
  () => props.closeLabel || t(`components.common.BaseDialog.closeLabel`)
)

onMounted(async () => {
  if (body.value) {
    observer.value = new MutationObserver(onContentGrow)
    observer.value.observe(body.value, props.mutationOptions)
  }
  document.addEventListener('keydown', onEsc)
  /* document.addEventListener("focus", onFocus, true); */
  window.addEventListener('resize', onContentGrow)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onEsc)
  document.removeEventListener('focus', onFocus)
  window.removeEventListener('resize', onContentGrow)
})

const open = ref(false)
const opening = ref(false)
const closed = ref(true)
const closing = ref(false)
const hasRenderedAtLeastOnce = ref(props.eager || props.modelValue)
const lastFocusedElement = ref<Element | null>(null)

const busy = computed(() => opening.value || closing.value)

/**
 * Listen to esc key and close the modal.
 * If disabled the modal can only be controlled from outside.
 * If persistent ignore escape key.
 */
const onEsc = (event: KeyboardEvent) => {
  if (busy.value) return
  if (open.value) {
    if (!props.persistent && !props.disabled) {
      if (event.key === 'Escape') {
        emit('update:modelValue', false)
      }
    }
  }
}

/**
 * Every time focus changes if the focussed element is not in the modal
 * bring the focus to the modal itself (This makes
 * the focus cycle among the content of the modal)
 */
const onFocus = (event: FocusEvent) => {
  if (busy.value) return
  if (panel.value && open.value) {
    if (event.target instanceof Node) {
      if (!panel.value.contains(event.target)) {
        event.preventDefault()
        panel.value.focus()
      }
    }
  }
}

onMounted(() => {
  if (props.modelValue) {
    alignToModelValue()
  }
})

/**
 * Every time modelValue changes align the display to it
 */
watch(
  () => props.modelValue,
  () => {
    alignToModelValue()
  }
)

/**
 * When modelValue becomes true if the component wasn't rendered render it
 * and wait for it to be on the page (or transitions would not work).
 * Stash the latest focused element so we can return it later when it closes.
 * Focus on the panel upon opening.
 * ---
 * Notice all interactions update modelValue and then this function aligns the display to it
 */
const alignToModelValue = async () => {
  if (props.modelValue) {
    if (!hasRenderedAtLeastOnce.value) {
      hasRenderedAtLeastOnce.value = true
      await waitFor(() => !!body.value)
      if (body.value) {
        observer.value = new MutationObserver(onContentGrow)
        observer.value.observe(body.value, { childList: true, subtree: true })
      }
    }
    if (document.activeElement) {
      lastFocusedElement.value = document.activeElement
    }

    closed.value = false
    closing.value = false
    opening.value = true

    // This prevents overscroll chaining (additional scrolling to the body when the modal has been completely scrolled)

    let currentlyOpenModals = Number(document.body.dataset['openModals'] ?? '0')
    currentlyOpenModals++
    document.body.dataset['openModals'] = currentlyOpenModals.toString()
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollBarWidth}px`

    await wait(props.transitionDuration)
    opening.value = false
    open.value = true
    emit('shown')
    if (panel.value) {
      panel.value.focus()
    }
  } else {
    opening.value = false
    open.value = false
    closing.value = true

    await wait(props.transitionDuration)

    let currentlyOpenModals = Number(document.body.dataset['openModals'] ?? '0')
    // This prevents overscroll chaining (additional scrolling to the body when the modal has been completely scrolled)
    currentlyOpenModals--
    document.body.dataset['openModals'] = currentlyOpenModals.toString()
    if (!currentlyOpenModals) {
      document.body.style.overflow = null
      document.body.style.paddingRight = '0px'
    }
    closing.value = false
    closed.value = true
    emit('hidden')
    if (lastFocusedElement.value instanceof HTMLElement) {
      lastFocusedElement.value.focus()
    }
  }
}

/**
 * Disable scrolling
 */
const onOverlayScroll = (event: UIEvent) => {
  if (event.target === overlay.value) {
    event.preventDefault()
  }
}

/**
 * Close the modal on overlay click if not persistent
 */
const onOverlayClick = (event: MouseEvent) => {
  if (props.disabled || busy.value) return
  if (overlay.value) {
    if (event.target === overlay.value) {
      if (!props.persistent) {
        emit('update:modelValue', false)
      }
    }
  }
}

/**
 * On click on the X button
 */
const onCloseClick = (event: MouseEvent) => {
  if (props.disabled) return
  emit('update:modelValue', false)
}

const overlayAttributes = computed(() => {
  const classes = [
    {
      'bb-base-dialog bb-base-dialog__overlay': true,
      'bb-base-dialog--fullscreen': props.fullscreen,
      'bb-base-dialog--open': open.value,
      'bb-base-dialog--opening': opening.value,
      'bb-base-dialog--closed': closed.value,
      'bb-base-dialog--closing': closing.value,
      [`bb-base-dialog--transition-${props.transition}`]: true
    },
    props.overlayClasses
  ].flat()
  const eventListeners = {
    onClick: onOverlayClick,
    onScroll: onOverlayScroll,
    onTouchmove: onOverlayScroll,
    onWheel: onOverlayScroll,
    onKeydown: onOverlayScroll
  }

  const style = {
    transitionDuration: props.transitionDuration / 1000 + 's'
  }
  return {
    class: classes,
    style,
    ...eventListeners,
    ...attrs
  }
})

const panelAttributes = computed(() => {
  const classes = [
    {
      'bb-base-dialog__panel': true,
      'bb-base-dialog__panel--compact': props.compact
    },
    props.panelClasses
  ].flat()

  const accessibilityAttrs: {
    [key: string]: string | boolean
  } = {
    role: 'dialog',
    'aria-modal': true
  }

  if (hasRenderedAtLeastOnce.value) {
    accessibilityAttrs['aria-labelledby'] = titleId
  } else {
    accessibilityAttrs['aria-hidden'] = true
  }
  if (props.description) accessibilityAttrs['aria-describedby'] = descriptionId

  let maxWidth
  const sizes: Sizes = {
    sm: 384,
    md: 652,
    lg: 896,
    xl: 1056
  }
  if (props.fullscreen) maxWidth = '100%'
  else if (typeof props.size === 'number') maxWidth = props.size + 'px'
  else if (props.size in sizes)
    maxWidth = sizes[props.size as keyof Sizes] + 'px'
  else maxWidth = props.size + 'px'

  const style = {
    maxWidth,
    transitionDuration: props.transitionDuration / 1000 + 's'
  }

  return {
    class: classes,
    style,
    ...accessibilityAttrs
  }
})

/**
 * This is called when content inside body changes.
 * Gets the total height the panel needs to be
 * It could be called numerous times so throttle every 300ms
 */
const onContentGrow = throttle(() => {
  if (props.fullscreen) {
    height.value = window.innerHeight
    return
  }
  if (header.value && body.value && footer.value) {
    const contentHeight =
      header.value.scrollHeight +
      body.value.scrollHeight +
      footer.value.scrollHeight +
      2
    /* Add two so renderless elements at the bottom are not cut off */
    if (content.value) {
      content.value.style.height = '0px'
      content.value.style.height = `${contentHeight}px`
    }
  }
}, 200)
</script>

<style lang="postcss"></style>
