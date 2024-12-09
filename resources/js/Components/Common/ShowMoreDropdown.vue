<template>
  <VDropdown
    :triggers="triggers"
    :theme="getTheme"
    :distance="8"
    :placement="placement"
    :popperTriggers="['hover']"
  >
    <!-- This will be the popover reference (for the events and position) -->
    <div
      :style="{
        cursor: disabled ? 'default' : 'pointer'
      }"
      :class="activatorClasses"
    >
      <slot name="activator">
        <BbIcon
          v-if="type === 'help'"
          type="info_full"
          size="16"
          class="text-primary-800 !block"
        />
        <BbIcon
          v-else-if="type === 'details'"
          type="info"
          size="16"
          class="text-grey-400 !block"
        />
        <BbIcon
          v-else-if="type === 'alert'"
          type="alert_warning_triangle"
          size="16"
          class="text-[#F3DB90] !block"
        />
      </slot>
    </div>

    <!-- This will be the content of the popover -->
    <template #popper>
      <div
        class="p-2.5 text-sm"
        :class="[
          {
            'min-w-[320px] max-w-[500px] bg-white !text-primary-800':
              props.type === 'details'
          },
          {
            'w-56 !bg-primary-700 !text-white':
              props.type === 'help' || showWarning
          },
          { 'w-56 bg-[#F3DB90] text-primary-800': props.type === 'alert' },
          {
            'w-auto whitespace-nowrap bg-primary-700 py-1.5 text-white text-xs':
              props.type === 'system'
          }
        ]"
      >
        <slot />
      </div>
    </template>
  </VDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// types [alert, help, system, details]
import BbIcon from './BbIcon.vue'

const props = defineProps({
  type: {
    type: String,
    default: 'details'
  },
  showWarning: {
    type: Boolean
  },
  openOnClick: {
    type: Boolean
  },
  activatorClasses: {
    type: Array
  },
  disabled: Boolean,
  show: Boolean,
  placement: { type: String, default: 'top'}
})

const getTheme = computed(() => {
  if (props.type === 'help' || props.showWarning || props.type === 'system')
    return 'primary'
  else if (props.type === 'alert') return 'alert'
  else return 'dropdown'
})

const triggers = computed(() =>
  props.disabled
    ? []
    : props.openOnClick
    ? ['click']
    : ['hover', 'focus', 'click']
)
</script>

<style lang="postcss">
.v-popper__arrow-inner {
  border-width: 10px !important;
}

.v-popper--theme-primary {
  .v-popper__arrow-outer {
    border-color: #103765;
  }
  .v-popper__inner {
    @apply rounded-md;
    @apply border-none bg-white text-primary-800 text-sm font-normal;
    box-shadow: 0px 10px 32px rgba(0, 0, 0, 0.1);
  }
}

.v-popper--theme-alert {
  .v-popper__arrow-outer {
    border-color: #f3db90;
  }
  .v-popper__inner {
    @apply rounded-md;
    @apply border-none bg-white text-primary-800 text-sm font-normal;
    box-shadow: 0px 10px 32px rgba(0, 0, 0, 0.1);
  }
}
</style>
