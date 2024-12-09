<template>
  <component
    :is="containerTag"
    :class="{
      'bb-base-table': true,
      [`bb-base-table--align-${align}`]: true,
      'bb-base-table--compact': compact,
      'bb-base-table--fixed': fixed,
      'bb-base-table--loading': loading,
      'bb-base-table--empty': !internalItems.length
    }"
  >
    <fieldset>
      <legend v-if="selectable">{{ legend }}</legend>
      <table>
        <caption
          v-if="caption"
          :class="{
            'bb-base-table-caption': true,
            'bb-base-table-caption--hidden': !displayCaption
          }"
        >
          {{
            caption
          }}
        </caption>
        <thead>
          <slot name="thead">
            <tr class="bb-base-table-header-row">
              <th
                v-if="selectable"
                class="bb-base-table-header bb-base-table-header--select"
                :class="thClass"
                scope="col"
              >
                <slot
                  :multiple="multiple"
                  :name="'header_select'"
                  :selectAll="selectAll"
                >
                  <span class="bb-base-table-header__content">
                    <label
                      v-if="allowSelectAll && multiple"
                      class="bb-base-table-check__label"
                    >
                      <BaseCheckbox
                        class="bb-base-table-check"
                        :disabled="disabled"
                        :indeterminate="indeterminate"
                        :readonly="readonly"
                        :name="`select_all_${name || ''}`"
                        :model-value="allSelected"
                        @update:model-value="onChangeSelectAll"
                      />
                      <span class="bb-base-table-check__label-text"
                        >{{ selectAllText }}
                      </span>
                    </label>
                    <span
                      v-else-if="!multiple"
                      class="bb-base-table-radio__label-text"
                      >{{ selectText }}</span
                    >
                  </span>
                </slot>
              </th>
              <th
                v-for="header in mappedHeaders"
                :key="header.key"
                :class="header.classes"
                scope="col"
              >
                <slot
                  :class="header.classes"
                  :items="internalItems"
                  :label="header.label"
                  :name="header.slotName"
                  ><span class="bb-base-table-header__content">{{
                    header.label
                  }}</span></slot
                >
              </th>
              <th
                v-if="actions"
                class="bb-base-table-header bb-base-table-header--actions"
                :class="thClass"
                scope="col"
              >
                <slot name="header_actions">
                  <span class="bb-base-table-header__content">
                    {{ actionsText }}
                  </span>
                </slot>
              </th>
            </tr>
          </slot>
        </thead>
        <tbody>
          <slot
            v-if="loading"
            :align="align"
            :classes="tdClass"
            :items="internalItems"
            :name="'loading'"
          >
            <tr class="bb-base-table-loading__row">
              <td
                class="bb-base-table-loading__cell"
                :colspan="replacementContentSpan"
              >
                <span class="bb-base-table-loading__text">{{
                  loadingText
                }}</span>

                <div class="bb-base-table-skeleton__container" role="status">
                  <div
                    class="bb-base-table-skeleton-item"
                    v-for="item in skeletonLength"
                    :key="item"
                  >
                    <div class="bb-base-table-skeleton-item__avatar-container">
                      <div class="bb-base-table-skeleton-item__avatar"></div>
                    </div>
                    <div class="bb-base-table-skeleton-item__text">
                      <div class="bb-base-table-skeleton-item__line"></div>
                      <div class="bb-base-table-skeleton-item__line"></div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </slot>
          <slot
            v-else-if="!internalItems.length"
            :align="align"
            :classes="tdClass"
            :name="'no-data'"
          >
            <tr class="bb-base-table-no-data__row">
              <td
                class="bb-base-table-no-data__cell"
                :colspan="replacementContentSpan"
              >
                <span class="bb-base-table-no-data__text">{{
                  noDataText
                }}</span>
              </td>
            </tr>
          </slot>
          <slot name="tbody" v-else>
            <tr
              v-for="item in mappedItems"
              class="bb-base-table-data__row"
              :key="itemKey ? item[itemKey] : item.jsonValue"
              @click="item.onRowClick"
              @contextmenu="item.onRowContextMenu"
              @dblclick="item.onRowDblClick"
            >
              <td
                v-if="selectable"
                class="bb-base-table-data__cell bb-base-table-data__cell--select"
                :class="tdClass"
              >
                <slot
                  :align="align"
                  :classes="tdClass"
                  :item="item.original"
                  :name="'select'"
                  :value="item.value"
                >
                  <!-- We use temp names for these inputs because we don't submit them -->
                  <label v-if="multiple" class="bb-base-table-check__label">
                    <BaseCheckbox
                      class="bb-base-table-check"
                      :checked="item.selected"
                      :disabled="!item.selectable"
                      :name="randomName"
                      :readonly="readonly"
                      @change="() => onInputChange(item)"
                    />
                    <span class="bb-base-table-check__label-text">{{
                      item.accessibleLabel
                    }}</span>
                  </label>
                  <label v-else class="bb-base-table-radio__label">
                    <BaseRadio
                      class="bb-base-table-radio"
                      :checked="item.selected"
                      :disabled="!item.selectable"
                      :name="randomName"
                      :readonly="readonly"
                      :value="item.value"
                      @change="() => onInputChange(item)"
                    />
                    <span class="bb-base-table-radio__label-text">{{
                      item.accessibleLabel
                    }}</span>
                  </label>
                </slot>
              </td>
              <td
                v-for="col in item.cols"
                :key="col.key"
                class="bb-base-table-data__cell"
                :class="col.classes"
              >
                <slot
                  :align="col.align"
                  :classes="col.classes"
                  :content="col.content"
                  :item="item.original"
                  :name="col.slotName"
                  :value="item.value"
                  >{{ col.content }}</slot
                >
              </td>
              <td
                v-if="actions"
                class="bb-base-table__cell bb-base-table__cell--actions"
                :class="tdClass"
              >
                <slot
                  :align="align"
                  :classes="tdClass"
                  :item="item.original"
                  :name="'actions'"
                  :value="item.value"
                ></slot>
              </td>
            </tr>
          </slot>
        </tbody>
        <tfoot>
          <slot name="tfoot"></slot>
        </tfoot>
      </table>
    </fieldset>
    <input v-for="input in hiddenInputs" :key="input.value" v-bind="input" />
  </component>
</template>

<script setup lang="ts">
import { clamp, isNil } from 'lodash'
import { computed, onMounted, ref, watch } from 'vue'
import { nanoid } from 'nanoid'
import { useI18n } from 'vue-i18n'
import { useItemValue } from '@/js/composables/useItemValue'
import { when } from '@/js/Utilities/functions/when'
import BaseCheckbox from '@/js/Components/form-controls/BaseCheckbox.vue'
import BaseRadio from '@/js/Components/form-controls/BaseRadio.vue'
const { getItemValue } = useItemValue()

const { t } = useI18n()

/**
 * We do not allow the use of the checkbox or radio themselves as
 * they would not be submitted if the user has changed
 * page in the meantime, rather we provide a temporary
 * name so radio still work but we later add hidden inputs for submission
 */
const randomName = nanoid()

// Classes type as accepted by Vue
type Classes =
  | string
  | Record<string, boolean>
  | (string | Record<string, boolean>)[]

/**
 * We allow table data classes to be a function so it can depend on the item
 */
type ColumnClasses =
  | Classes
  | (<T>(content: any, key: string, item: T) => Classes)

/**
 * Column as defined from outside
 */
interface Column {
  align?: 'left' | 'right' | 'center'
  formatOnNull?: boolean
  formatter?: <T>(content: any, key: string, item: T) => any
  key: string
  label: string
  placeholder?: string
  tdClass?: ColumnClasses
  thClass?: Classes
}

/**
 * Projection that represents a row of cells with flags
 * linked to the state of the item
 */
type MappedItem = {
  accessibleLabel: string
  cols: MappedCell[]
  jsonValue: string
  original: any
  selectable: boolean
  selected: boolean
  selectedIndex: number
  value: string
  onRowClick: (event: MouseEvent) => void
  onRowContextMenu: (event: MouseEvent) => void
  onRowDblClick: (event: MouseEvent) => void
}

/**
 * Projection that represnets a header
 */
type MappedHeader = {
  align: string
  classes?: Classes[]
  key: string
  slotName: string
  label: string
}

/**
 * Projection that represents a cell of data.
 */
type MappedCell = {
  align: string
  classes: ColumnClasses[]
  content: string
  key: string
  label: string
  slotName: string
}

interface Props {
  accessibleLabel?: (columns: MappedCell[], item: any) => string
  actions?: boolean
  actionsText?: string
  align?: 'left' | 'center' | 'right'
  allowSelectAll?: boolean
  caption?: string
  columns?: Column[]
  compact?: boolean
  dependencies?: any[]
  depsDebounceTime?: number
  disabled?: boolean
  displayCaption?: boolean
  fixed?: boolean
  items: any[] | (() => Promise<any[]>)
  itemValue?: string | (() => any)
  itemKey?: string
  legend?: string
  loading?: boolean
  loadingText?: string
  modelValue?: any
  multiple?: boolean
  name?: string
  noDataText?: string
  readonly?: boolean
  selectable?: boolean | ((item: any) => boolean)
  selectAll?: boolean
  selectAllText?: string
  selectText?: string
  tdClass?: Classes | ColumnClasses
  thClass?: Classes
}

const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  actionsText: 'Azioni',
  allowSelectAll: true,
  columns: () => [],
  dependencies: () => [],
  depsDebounceTime: 0,
  items: () => [],
  loadingText: 'Caricamento',
  multiple: true,
  noDataText: 'Non ci sono elementi da visualizzare',
  selectAllText: 'Seleziona tutti gli elementi di questa pagina',
  selectText: 'Seleziona un elemento'
})

const emit = defineEmits([
  'click:row',
  'contextmenu:row',
  'dblclick:row',
  'item-selected',
  'update:modelValue',
  'update:selectAll'
])

const accessibleLabel =
  props.accessibleLabel ||
  ((columns, item) =>
    [t(`components.common.BaseTable.select`)]
      .concat(columns.map(col => col.content))
      .join(' '))
const loadingText =
  props.loadingText || t(`components.common.BaseTable.loadingText`)
const noDataText =
  props.noDataText || t(`components.common.BaseTable.noDataText`)
const selectAllText =
  props.selectAllText || t(`components.common.BaseTable.selectAllText`)
const selectText =
  props.selectText || t(`components.common.BaseTable.selectText`)

// We render the table in a fieldset to group checkbox / radios if the table is selectable
const containerTag = computed(() => (props.selectable ? 'fieldset' : 'div'))
const internalLoading = ref(false)
const loading = computed(() => props.loading || internalLoading.value)

const replacementContentSpan = computed(() => {
  return [!!props.selectable, !!props.actions].reduce(
    (acc, current) => acc + Number(!!current),
    props.columns.length
  )
})

/**
 * Indexes modelValue to a map so when can easily know which values are selected
 * (using JSON to circumvent identical object not being equal in JS)
 */
const modelValueIndexed = computed(() => {
  const map: { [key: string]: number } = {}
  ;[]
    .concat(props.modelValue)
    .forEach((value, index) => (map[JSON.stringify(value)] = index))
  return {
    get: (value: any) => map[JSON.stringify(value)]
  }
})

/**
 * Map column identifiers to slot names
 */
const slotNames = computed(() =>
  props.columns.reduce((acc: { [key: string]: string }, curr: Column) => {
    const mapped = curr.key.split(/\W+/g).join('_')
    acc[curr.key] = mapped
    return acc
  }, {})
)

/**
 * Items as loaded from the function or from the outside
 */
const internalItems = ref<any[]>([])

const getItems = async () => {
  let items = []
  if (Array.isArray(props.items)) {
    items = props.items
  } else {
    if (typeof props.items === 'function') {
      internalLoading.value = true
      items = await props.items()
      internalLoading.value = false
    }
  }
  internalItems.value = items
}

onMounted(getItems)

/**
 * When item changes update internal items and
 * deselect everything
 */
watch(
  () => props.items,
  async (curr, previous) => {
    await getItems()
    if (props.multiple) {
      emit('update:modelValue', [])
    } else {
      emit('update:modelValue', null)
    }
  }
)
/* Prevent vue from sharing this function across instances */
let timeout: NodeJS.Timeout
const onDependencyChange = async (curr: any[], previous?: any[]) => {
  if (JSON.stringify(curr) !== JSON.stringify(previous)) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(async () => {
      await getItems()
      if (props.multiple) {
        emit('update:modelValue', [])
      } else {
        emit('update:modelValue', null)
      }
    }, props.depsDebounceTime)
  }
}
watch(() => props.dependencies, onDependencyChange)

/**
 * Take the columns and generate a simplified array for headers display
 */
const mappedHeaders = computed(() =>
  props.columns.map(column => {
    const align = column.align || 'left'
    const { label, key } = column
    const slotName = `header_${slotNames.value[column.key]}`
    // Create a single merged array of all the passed classes
    let classes: Classes = []
    if (props.thClass) {
      classes = classes.concat(props.thClass)
    }
    if (column.thClass) {
      classes = classes.concat(column.thClass)
    }
    return {
      align,
      key,
      label,
      slotName,
      classes
    }
  })
)

/**
 * Map items to an an array that represents the entire row.
 * Track every logic here so we don't have inline callbacks in the template.
 */
const mappedItems = computed(() => {
  return internalItems.value.map(item => {
    // By default the value if the item is the item.
    const value = getItemValue(item, props.itemValue)
    const jsonValue = JSON.stringify(value)

    /**
     * Item is selectable only if the table allows or item
     * passes iteratee and the selection is not disabled
     */
    let selectable = !!props.selectable
    if (typeof props.selectable === 'function') {
      selectable = !!props.selectable(item)
    }
    selectable = selectable && !props.disabled

    //Track the index at which the item has been selected for easy of removal
    const selectedIndex = modelValueIndexed.value.get(value)
    const selected = !isNil(selectedIndex)

    //Create appropriate names for the checkbox and radio
    const radioName = randomName

    // Create a projection of the columns and run all formatter logic so
    // we just display content in the template
    const cols = props.columns.map(column => {
      // Slot identifier
      const slotName = slotNames.value[column.key]
      const align = column.align || 'left'
      const { label, key } = column
      // The content
      let content = getItemValue(item, column.key)
      if (
        column.formatter &&
        // By default the formatter runs anyway
        (!isNil(content) || column.formatOnNull !== false)
      ) {
        content = column.formatter(content, column.key, item)
      }
      if (column.placeholder && isNil(content)) {
        content = column.placeholder
      }

      // Merge global and specific classes
      let classes: Classes = []
      if (props.tdClass) {
        if (typeof props.tdClass === 'function') {
          const temp = props.tdClass(content, column.key, item)
          if (temp) {
            classes = classes.concat(temp)
          }
        } else classes = classes.concat(props.tdClass)
      }
      if (column.tdClass) {
        if (typeof column.tdClass === 'function') {
          const temp = column.tdClass(content, column.key, item)
          if (temp) {
            classes = classes.concat(temp)
          }
        } else classes = classes.concat(column.tdClass)
      }
      return {
        align,
        classes,
        content,
        key,
        label,
        slotName
      }
    })

    const accessibleLabelText = accessibleLabel(cols, item)

    return {
      accessibleLabel: accessibleLabelText,
      cols,
      jsonValue,
      original: item,
      selectable,
      selected,
      selectedIndex,
      value,
      onRowClick: (event: MouseEvent) =>
        emit('click:row', event, item, { selected, item }),
      onRowContextMenu: (event: MouseEvent) =>
        emit('contextmenu:row', event, item, { selected, item }),
      onRowDblClick: (event: MouseEvent) =>
        emit('dblclick:row', event, item, { selected, item })
    }
  })
})

/**
 * Same behavior as GMail.
 * If anything is selected remove it.
 * Then when empty you select all items of this page
 */
const onChangeSelectAll = (value: boolean) => {
  const selectAllValue = value
  let modelValue: any[] = []

  if (selectAllValue) {
    modelValue = mappedItems.value.reduce((acc: any[], curr) => {
      if (curr.selectable) acc.push(curr.value)
      return acc
    }, [])
  }
  emit('update:modelValue', modelValue)
  emit('update:selectAll', value)
}

const allSelected = computed(
  () =>
    mappedItems.value.length &&
    !mappedItems.value.some(item => item.selectable && !item.selected)
)
const indeterminate = computed(
  () =>
    mappedItems.value.some(item => !item.selected) && !!props.modelValue.length
)
/**
 * Whenever an input changes update modelValue if any
 */
const onInputChange = (item: MappedItem) => {
  let valueToEmit
  if (props.multiple) {
    if (item.selected) {
      valueToEmit = props.modelValue
        .slice(0, item.selectedIndex)
        .concat(props.modelValue.slice([item.selectedIndex + 1]))
    } else {
      valueToEmit = props.modelValue.concat(item.value)
    }
  } else {
    valueToEmit = item.value
  }
  emit('item-selected', item)
  emit('update:modelValue', valueToEmit)
}

/**
 * When using this component for submission we add a bunch of hidden inputs
 * so the submitted inputs is on par with v-model
 */

/**
 * This is used to keep the value compatible to common html expected values.
 * Convert to string everything that's not but do not double encode strings
 */
const makeInputValue = when(item => typeof item !== 'string', JSON.stringify)
const hiddenInputs = computed(() => {
  return [].concat(props.modelValue).map(current => {
    const value = makeInputValue(current)
    return {
      disabled: props.disabled,
      name: props.name,
      type: 'hidden',
      value: value
    }
  })
})

const skeletonLength = computed(() => {
  return clamp(internalItems.value.length, 4, 10)
})
</script>
