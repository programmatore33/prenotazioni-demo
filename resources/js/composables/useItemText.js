import { get } from 'lodash'

export const useItemText = () => ({
  getItemText(item, getter) {
    if (typeof item === 'string' && !getter) return item
    else if ((typeof item === 'object' && item) || getter) {
      if (typeof getter === 'string') {
        const found = get(item, getter)
        if (typeof found !== 'string') return JSON.stringify(found)
        return found
      } else if (typeof getter === 'function') return getter(item)
    }
    return JSON.stringify(item)
  }
})
