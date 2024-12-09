import { reactive, ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import {
  debounce,
  pickBy,
  isNil,
  isEmpty,
  isPlainObject,
  isString
} from 'lodash'

export const useSearch = (
  filtersInit = {},
  options = {
    queryName: 'searchQuery',
    debounceTime: 250,
    immediate: false,
    only: [],
    onFinish: () => null,
    handler: null,
    replace: true
  }
) => {
  const url = new URL(location.href)

  const mergedOptions = {
    queryName: 'searchQuery',
    debounceTime: 250,
    immediate: false,
    only: [],
    onFinish: () => null,
    handler: null,
    replace: true,
    ...options
  }

  const query = url.searchParams.get(mergedOptions.queryName) ?? ''

  const searchQuery = ref(query)
  /* Reconstruct filters status from the query string */
  const f = Object.keys(filtersInit).reduce((acc, key) => {
    if (Array.isArray(filtersInit[key])) {
      const value = url.searchParams.getAll(`${key}[]`)
      acc[key] = value
    } else {
      const value = url.searchParams.get(key) ?? filtersInit[key]
      acc[key] = value
    }
    return acc
  }, {})
  const filters = reactive(f)
  const isSearching = ref(false)

  const cancelTokens = ref([])

  watch(searchQuery, startSearch)
  watch(filters, startSearch)

  function startSearch() {
    isSearching.value = true
    clearCancelTokens()
    debouncedSearch()
  }

  function clearCancelTokens() {
    if (cancelTokens.value.length) cancelTokens.value.forEach(ct => ct.cancel())
  }

  function search() {
    if (mergedOptions.handler && typeof mergedOptions.handler === 'function') {
      mergedOptions.handler(searchQuery.value, filters)
    } else {
      // Remove all filters and reapply from scratch to avoid keeping removed filters
      const url = new URL(location.href)

      for (const key in filters) {
        if (Array.isArray(filtersInit[key])) {
          url.searchParams.delete(`${key}[]`)
        } else {
          url.searchParams.delete(key)
        }
      }

      if (!searchQuery.value) {
        url.searchParams.delete(mergedOptions.queryName)
      } else {
        url.searchParams.set(mergedOptions.queryName, searchQuery.value)
      }

      url.searchParams.set('page', 1)

      router.visit(url.toString(), {
        data: {
          /* pick values that are not null or empty (0 is empty but valid so we check for numbers) */
          ...pickBy(filters, val => {
            if (isPlainObject(val)) return !isEmpty(val)
            else if (Array.isArray(val)) return !isEmpty(val)
            else if (isString(val)) return !isEmpty(val)
            else return !isNil(val)
          })
        },
        only: mergedOptions.only ?? [],
        preserveScroll: true,
        preserveState: true,
        onCancelToken: cancelToken => cancelTokens.value.push(cancelToken),
        onFinish: () => {
          isSearching.value = false
          if ('onFinish' in mergedOptions) mergedOptions.onFinish()
        },
        replace: mergedOptions.replace
      })
    }
  }

  const debouncedSearch = debounce(search, mergedOptions.debounceTime ?? 250, {
    maxWait: 5000
  })

  if (mergedOptions.immediate) startSearch()

  return {
    searchQuery,
    filters,
    isSearching
  }
}
