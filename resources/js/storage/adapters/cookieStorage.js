/**
 * Retrieves a cookie
 * @param {string} key The key of the cookie
 */
export const get = key => {
  const cookies = document.cookie.split('; ')

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const separatorIndex = cookie.indexOf('=')
    const name = cookie.substring(0, separatorIndex)
    const value = cookie.substring(separatorIndex + 1)
    if (name === key) return decodeURIComponent(value)
  }

  return null
}

/**
 * Saves a cookie.
 */
export const set = (key, value, expirationHours = null) => {
  let expirationTime = null
  if (expirationHours) {
    expirationTime = new Date(Date.now() + 60 * 60 * 1000 * expirationHours).toUTCString()
  } else {
    expirationTime = new Date(Date.now() + 60 * 60 * 1000).toUTCString()
  }
  document.cookie = `${key}=${value}; expires=${expirationTime}; path=/;`
}

/**
 * Removes the cookie of passed key
 */
export const removeKey = key => {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}
