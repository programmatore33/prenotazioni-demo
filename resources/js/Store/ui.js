import { defineStore } from 'pinia'
import axios from 'axios'
import { cloneDeep } from 'lodash'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/it'
dayjs.locale('it')

export const useUI = defineStore('ui', {
  state: () => {
    return {
      breakpoint: null,
      verticalBreakpoint: null,
      // These breakpoints should be adapted to the current library being used
      // Brakpoints defined by their minimum boundary
      breakpoints: {
        xs: -Infinity,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      },
      verticalBreakpoints: {
        xs: -Infinity,
        sm: 375,
        md: 520,
        lg: 640,
        xl: 1080,
        '2xl': 1200
      },
      headerHeight: 0,
      topbarHeight: 0,
      dateBar: {
        amOrPm: 'AM',
        date: Date.now(),
        readOnly: false
      }
    }
  },
  actions: {
    getBreakpoint() {
      let found = null
      let verticalFound = null
      const width = window.innerWidth
      const height = window.innerHeight
      const map = this.breakpoints
      Object.entries(map).forEach(([name, size]) => {
        if (width > size) found = name
      })
      const verticalMap = this.verticalBreakpoints
      Object.entries(verticalMap).forEach(([name, size]) => {
        if (height > size) verticalFound = name
      })
      this.breakpoint = found
      this.verticalBreakpoint = verticalFound

      this.getHeaderAndTopbarHeights()

      return found
    },
    getHeaderAndTopbarHeights() {
      const header = document.querySelector('header')
      this.headerHeight = header?.offsetHeight ?? 0

      const topbar = document.querySelector('.topbar-container')
      this.topbarHeight = topbar?.offsetHeight ?? 0
    },
    async getSidebarPermissions(projectID) {
      if (projectID) {
        await axios
          .get(route('api.projects.permissions', { project: projectID }))
          .then(response => {
            this.sidebar.permissions = response.data
          })
      }
    },
    resetSidebarPermissions() {
      this.sidebar.permissions = cloneDeep(permissions)
    },
    nextDate() {
      if (this.dateBar.amOrPm == 'AM') {
        this.dateBar.amOrPm = 'PM'
      } else {
        const date = new Date(this.dateBar.date)
        date.setDate(date.getDate() + 1)
        this.dateBar.date = date
        this.dateBar.amOrPm = 'AM'
      }
    },
    addSevenDays() {
      const date = new Date(this.dateBar.date)
      date.setDate(date.getDate() + 7)
      this.dateBar.date = date
    },
    prevDate() {
      if (this.dateBar.amOrPm == 'PM') {
        this.dateBar.amOrPm = 'AM'
      } else {
        const date = new Date(this.dateBar.date)
        date.setDate(date.getDate() - 1)
        this.dateBar.date = date
        this.dateBar.amOrPm = 'PM'
      }
    },
    subSevenDays() {
      const date = new Date(this.dateBar.date)
      date.setDate(date.getDate() - 7)
      this.dateBar.date = date
    },
    goToDate(date) {
      this.dateBar.date = date
    }
  },
  getters: {
    currentBreakPointIsLowerThan: state => reference => {
      if (state.breakpoint) {
        return (
          state.breakpoints[state.breakpoint] < state.breakpoints[reference]
        )
      }
      return false
    },
    currentBreakPointIsHigherThan: state => reference => {
      if (state.breakpoint) {
        return (
          state.breakpoints[state.breakpoint] > state.breakpoints[reference]
        )
      }
      return false
    },
    currentVerticalBreakPointIsLowerThan: state => reference => {
      if (state.verticalBreakpoint) {
        return (
          state.verticalBreakpoints[state.verticalBreakpoint] <
          state.verticalBreakpoints[reference]
        )
      }
      return false
    },
    currentVerticalBreakPointIsHigherThan: state => reference => {
      if (state.verticalBreakpoint) {
        return (
          state.verticalBreakpoints[state.verticalBreakpoint] >
          state.verticalBreakpoints[reference]
        )
      }
      return false
    },
    boolToYesNo: state => bool => bool ? 'Sì' : 'No',
    getFullPageHeight: state =>
      window.innerHeight - state.headerHeight - state.topbarHeight
  }
})
