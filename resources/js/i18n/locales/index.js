// import { instance } from "@/api";
import { flow, initial, last, mapKeys } from 'lodash'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'

export const SUPPORT_LOCALES = ['it', 'en']

export function setupI18n() {
  const options = { locale: 'it', legacy: false }
  const i18n = createI18n(options)
  setI18nLanguage(i18n, options.locale)
  return i18n
}

export function setI18nLanguage(i18n, locale) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = locale
  } else {
    i18n.global.locale.value = locale
  }

  //   instance.defaults.headers.common["Accept-Language"] = locale;
  document.querySelector('html').setAttribute('lang', locale)
}

export async function loadLocaleMessages(i18n, locale) {
  const modules = import.meta.glob('./*.json')
  // Takes a path and returns a capitalized module name
  const getModuleName = flow([(value, key) => key.split(/[/.]+/g), initial, last])

  // Makes a map of all the locales in the application
  const messages = mapKeys(modules, getModuleName)
  const loaded = await messages[locale]()

  // set locale and locale message
  i18n.global.setLocaleMessage(locale, loaded.default)

  return nextTick()
}

export const i18n = setupI18n()
