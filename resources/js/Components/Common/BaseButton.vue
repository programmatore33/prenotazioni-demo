<template>
  <component :class="classes" :is="tag" v-bind="attributes">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { Link, InertiaLinkProps } from '@inertiajs/vue3'
import type { RouteLocationRaw } from 'vue-router'

type VoidHTMLElements =
  | 'area'
  | 'base'
  | 'br'
  | 'col'
  | 'command'
  | 'embed'
  | 'hr'
  | 'img'
  | 'input'
  | 'keygen'
  | 'link'
  | 'meta'
  | 'param'
  | 'source'
  | 'track'
  | 'wbr'

interface Props {
  // Either to="/home" or to="{name: 'Home', params: {...}}"
  block?: boolean
  data?: InertiaLinkProps['data']
  disabled?: boolean
  headers?: InertiaLinkProps['headers']
  href?: string | InertiaLinkProps['href']
  method?: InertiaLinkProps['method']
  onBefore?: InertiaLinkProps['onBefore']
  onCancel?: InertiaLinkProps['onCancel']
  onCancelToken?: InertiaLinkProps['onCancelToken']
  onFinish?: InertiaLinkProps['onFinish']
  only?: InertiaLinkProps['only']
  onProgress?: InertiaLinkProps['onProgress']
  onStart?: InertiaLinkProps['onStart']
  onSuccess?: InertiaLinkProps['onSuccess']
  preserveScroll?: InertiaLinkProps['preserveScroll']
  preserveState?: InertiaLinkProps['preserveState']
  queryStringArrayFormat?: InertiaLinkProps['queryStringArrayFormat']
  replace?: InertiaLinkProps['replace']
  tag?: keyof Omit<HTMLElementTagNameMap, VoidHTMLElements> | ''
  to?: RouteLocationRaw
  type?: 'button' | 'submit' | 'reset'
}
const props = withDefaults(defineProps<Props>(), {
  tag: 'button',
  type: 'button'
})

const isInertia = !!getCurrentInstance().proxy.$inertia

const tag = computed(() => {
  // For disabled links always render a
  if (props.href || (props.to && props.disabled)) {
    if (isInertia && !props.disabled) return Link
    return 'a'
  }
  if (props.to) return 'router-link'
  return props.tag
})

const classes = computed(() => ({
  'base-btn': true,
  'base-btn--block': props.block,
  'base-btn--disabled': props.disabled
}))

const attributes = computed(() => {
  type PossibleAttributes = {
    'aria-disabled': boolean
    disabled: boolean
    href: string
    role: string
    type: string
    style: { [rule: string]: string }
    to: Props['to']
    data: Props['data']
    headers: Props['headers']
    method: Props['method']
    onBefore: Props['onBefore']
    onCancel: Props['onCancel']
    onCancelToken: Props['onCancelToken']
    onFinish: Props['onFinish']
    only: Props['only']
    onProgress: Props['onProgress']
    onStart: Props['onStart']
    onSuccess: Props['onSuccess']
    preserveScroll: Props['preserveScroll']
    preserveState: Props['preserveState']
    queryStringArrayFormat: Props['queryStringArrayFormat']
    replace: Props['replace']
  }
  const initial: Partial<PossibleAttributes> = {}

  if (tag.value === 'button') {
    initial.disabled = props.disabled
    initial.type = props.type
  } else if (
    tag.value === 'a' ||
    (isInertia && typeof tag.value !== 'string' && tag.value.name === 'Link')
  ) {
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

    if (isInertia) {
      initial.data = props.data
      initial.headers = props.headers
      initial.method = props.method
      initial.onBefore = props.onBefore
      initial.onCancel = props.onCancel
      initial.onCancelToken = props.onCancelToken
      initial.onFinish = props.onFinish
      initial.only = props.only
      initial.onProgress = props.onProgress
      initial.onStart = props.onStart
      initial.onSuccess = props.onSuccess
      initial.preserveScroll = props.preserveScroll
      initial.preserveState = props.preserveState
      initial.queryStringArrayFormat = props.queryStringArrayFormat
      initial.replace = props.replace
    }
  } else if (tag.value === 'router-link') {
    initial.to = props.to
  }

  switch (tag.value) {
    case 'button':
      initial.disabled = props.disabled
      initial.type = props.type
      break
    case 'a':
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
    case 'router-link':
      initial.to = props.to
      break
    default:
      break
  }
  return initial
})
</script>
<style lang="postcss">
.base-btn {
  @apply transition-colors
    focus:outline-none focus:ring text-center;

  &--block {
    display: block;
    width: 100%;
  }
  &--disabled {
  }
}
</style>
