<template>
  <div class="space-y-4">
    <BaseTable
      :actions="actions"
      :columns="columns"
      :modelValue="modelValue"
      :items="paginatedItems ? paginatedItems.data : items"
      :dependencies="[searchString]"
      :multiple="multiple"
      :depsDebounceTime="1000"
      thClass="whitespace-nowrap"
      :fixed="fixed"
      :actions-text="actionsText"
      :selectable="selectable"
      @update:model-value="event => emit('update:modelValue', event)"
    >
      <template v-for="(_, slot) of $slots" v-slot:[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </BaseTable>

    <div
      v-if="paginatedItems"
      class="grid items-center"
      :class="{
        'lg:grid-cols-2': $slots.paginationInfo,
        'grid-cols-1': !$slots.paginationInfo
      }"
    >
      <slot name="paginationInfo" v-if="$slots.paginationInfo" />
      <div class="flex justify-end">
        <template v-if="paginatedItems.hasOwnProperty('meta')">
          <BaseNavigation
            :links="paginatedItems.meta.links"
            :prevLink="paginatedItems.meta.prev_page_url"
            :nextLink="paginatedItems.meta.next_page_url"
            :loading="false"
            @change="changePage"
          />
        </template>
        <BaseNavigation
          v-else
          :rebuild-url="rebuildUrl"
          :links="paginatedItems.links"
          :prevLink="paginatedItems.prev_page_url"
          :nextLink="paginatedItems.next_page_url"
          :loading="false"
          @change="changePage"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseTable from '@/js/Components/Common/BaseTable.vue'
import BaseNavigation from '@/js/Components/Common/BaseNavigation.vue'
import { router } from '@inertiajs/vue3'

const props = defineProps({
  columns: Array,
  items: Array | Function,
  paginatedItems: Object,
  collectionName: String,
  searchString: String,
  fixed: Boolean,
  multiple: {
    type: Boolean,
    default: true
  },
  actionsText: String,
  actions: {
    type: Boolean,
    default: true
  },
  modelValue: [Object, Array],
  selectable: [Boolean, Function],
  rebuildUrl: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

function changePage(pageUrl) {
  const options = { preserveState: true }
  if (props.collectionName) options.only = [props.collectionName]
  emit('change', pageUrl)
  router.visit(pageUrl, options)
}
</script>
