import { isNil } from 'lodash'
import { computed, reactive, ref, watch } from 'vue'

// Stash all instances of current dialogs
let subscribers = []

const value = ref(null)

watch(
  () => value.value,
  () => {
    if (typeof value.value === 'boolean') {
      // Every time a dialog is resolved resolve all dialogs
      subscribers.forEach(fn => fn())
      subscribers = []
    }
  }
)

const defaultState = {
  title: '',
  subtitle: '',
  text: '',
  description: '',
  yesText: 'OK',
  noText: 'Annulla',
  loading: false,
  open: false,
  yes: true,
  no: true,
  actions: true,
  size: 'md'
}
const defaultOption = {
  actions: true,
  yes: true,
  no: true,
  title: '',
  subtitle: '',
  text: '',
  description: '',
  yesText: 'OK',
  noText: 'Annulla',
  size: 'md'
}

export const state = reactive({
  ...defaultState
})

export const actions = computed(() => [
  {
    text: state.noText,
    handler: () => {
      value.value = false
    }
  },
  {
    text: state.yesText,
    handler: () => {
      value.value = true
    }
  }
])

export const useConfirm = () => {
  return {
    confirm: options => {
      value.value = null
      const newOptions = { ...defaultOption, ...options }
      const newState = { ...defaultState }
      newState.title = newOptions.title
      newState.subtitle = newOptions.subtitle
      newState.text = newOptions.text
      if (newOptions.description) newState.description = newOptions.description
      if (newOptions.noText) newState.noText = newOptions.noText
      if (newOptions.yesText) newState.yesText = newOptions.yesText
      if (newOptions.size) newState.size = newOptions.size
      if (!isNil(newOptions.yes)) newState.yes = newOptions.yes
      if (!isNil(newOptions.no)) newState.no = newOptions.no
      if (!isNil(newOptions.actions)) newState.actions = newOptions.actions

      state.description = newState.description
      state.noText = newState.noText
      state.text = newState.text
      state.title = newState.title
      state.subtitle = newState.subtitle
      state.yesText = newState.yesText
      state.open = true
      state.actions = newState.actions
      state.yes = newState.yes
      state.no = newState.no
      state.size = newState.size

      return new Promise(resolve => {
        subscribers.push(() => resolve(value.value))
      })
    },
    setLoading: (value = true) => {
      state.loading = value
    },
    close: async () => {
      state.description = defaultState.description
      state.loading = defaultState.loading
      state.noText = defaultState.noText
      state.open = defaultState.open
      state.text = defaultState.text
      state.title = defaultState.title
      state.subtitle = defaultState.subtitle
      state.yesText = defaultState.yesText
      value.value = false
      return Promise.resolve().then(() => {
        value.value = null
      })
    }
  }
}
