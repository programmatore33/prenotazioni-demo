/* eslint-disable no-undef */
import { configure } from 'vee-validate'
import { localize, setLocale } from '@vee-validate/i18n'
import it from '@vee-validate/i18n/dist/locale/it.json'
import { defineRule } from 'vee-validate'
import {
  required,
  email,
  min,
  max_value,
  min_value,
  max,
  numeric,
  is_not,
  length,
  alpha_num,
  integer
} from '@vee-validate/rules'
import { isEmpty, isNil, overSome } from 'lodash'

defineRule('required', required)
defineRule('email', email)
// For length
defineRule('min', min)
defineRule('max', max)
defineRule('length', length)
defineRule('is_not', is_not)

// For numbers
defineRule('max_value', max_value)
defineRule('min_value', min_value)
defineRule('numeric', numeric)
defineRule('integer', integer)

defineRule('alpha_num', alpha_num)

const customRules = {
  userConfirmPassword: (value, [target], ctx) => {
    if (value === ctx.form[target]) {
      return true
    }
    return 'Passwords non coincidenti'
  },
  confirmed: (value, { target }, { field }) => {
    if (!overSome([isNil, isEmpty])(value)) {
      const x = value === target ? true : `Il campo ${field} non corrisponde`
      return x
    }
    return true
  },
  phoneNumber: string => {
    const match = /^3\d{8,9}$/.test(string)
    return match ? true : 'Deve essere un numero di telefono valido senza prefisso internazionale.'
  },
  codiceFiscale: string => {
    const match = /^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$/.test(string)
    return match ? true : 'Il codice fiscale non è valido.'
  },
  dateBefore: (date, { target, formatString }) => {
    if (date && target) {
      let currentDate = date
      let otherDate = target
      if (formatString) {
        if (date) currentDate = parse(date, formatString, new Date())
        if (target) otherDate = parse(target, formatString, new Date())
      } else if (typeof date === 'string') {
        if (date) currentDate = parseISO(date)
        if (target) otherDate = parseISO(target)
      }
      if (currentDate > otherDate) return `La data non può essere maggiore del suo corrispondente`
    }
    return true
  },
  dateAfter: (date, { target, formatString }) => {
    if (date && target) {
      let currentDate = date
      let otherDate = target
      if (formatString) {
        if (date) currentDate = parse(date, formatString, new Date())
        if (target) otherDate = parse(target, formatString, new Date())
      } else if (typeof date === 'string') {
        if (date) currentDate = parseISO(date)
        if (target) otherDate = parseISO(target)
      }
      if (currentDate < otherDate) return `La data non può essere minore del suo corrispondente`
    }
    return true
  },
  lt: (value, { target }) => {
    if (!isNil(value) && !isNil(target)) {
      if (+value >= +target) return `Il valore deve essere inferiore a ${target}`
    }
    return true
  },
  lte: (value, { target }) => {
    if (!isNil(value) && !isNil(target)) {
      if (+value > +target) return `Il valore deve essere inferiore o uguale a ${target}`
    }
    return true
  },
  gt: (value, { target }) => {
    if (!isNil(value) && !isNil(target)) {
      if (+value <= +target) return `Il valore deve essere maggiore a ${target}`
    }
    return true
  },
  gte: (value, { target }) => {
    if (!isNil(value) && !isNil(target)) {
      if (+value < +target) return `Il valore deve essere maggiore o uguale a ${target}`
    }
    return true
  }
}

Object.entries(customRules).forEach(([name, rule]) => defineRule(name, rule))

configure({
  generateMessage: localize({
    it
  })
})

setLocale('it')
