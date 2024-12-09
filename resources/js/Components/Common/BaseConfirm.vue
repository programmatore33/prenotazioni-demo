<template>
  <BaseDialog
    :panel-classes="'base-confirm'"
    :title="state.title"
    :size="state.size"
    :model-value="state.open || state.loading"
    @update:modelValue="onModelValueUpdate"
  >
    <!-- Transparently pass all slots that are not customized -->
    <template
      v-for="name in ['header', 'title', 'close', 'description']"
      #[name]="data"
    >
      <slot :name="name" v-bind="data"> </slot>
    </template>
    <div v-if="!state.loading" class="bb-base-confirm__content">
      <div v-if="state.text" class="bb-base-confirm-text">
        {{ state.text }}
      </div>
      <div v-if="state.subtitle" class="bb-base-confirm-subtitle">
        {{ state.subtitle }}
      </div>
    </div>
    <slot name="spinner" v-else>
      <div class="p-10 text-center">
        <BbSpinner size="60" />
      </div>
    </slot>
    <template #footer="data" v-if="!state.loading && state.actions">
      <slot
        name="footer"
        :loading="state.loading"
        :actions="state.actions"
        :yes="state.yes"
        :no="state.no"
        :yesAction="yesAction"
        :noAction="noAction"
        v-bind="data"
      >
        <span>
          <BbButton v-if="state.no" @click="noAction.handler" outline>
            {{ noAction.text }}
          </BbButton>
        </span>
        <span>
          <BbButton v-if="state.yes" @click="yesAction.handler">
            {{ yesAction.text }}
          </BbButton>
        </span>
      </slot>
    </template>
  </BaseDialog>
</template>

<script setup>
import { actions, state } from '@/js/composables/useConfirm'
import { computed } from 'vue'
import BaseDialog from './BaseDialog.vue'
import BbSpinner from './BbSpinner.vue'
import BbButton from './BbButton.vue'

const noAction = computed(() => actions.value[0])
const yesAction = computed(() => actions.value[1])
const onModelValueUpdate = value => {
  if (value) yesAction.value.handler()
  else noAction.value.handler()
}
</script>
