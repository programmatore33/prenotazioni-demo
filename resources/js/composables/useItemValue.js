import { get } from 'lodash'

export const useItemValue = () => ({
  getItemValue(item, getter) {
    if (typeof item === 'object' && item) {
      if (typeof getter === 'string') {
        return get(item, getter)
      } else if (typeof getter === 'function') return getter(item)
    }
    return item
  }
})
