import Vue from 'vue'
import Vuex from 'vuex'
import _debounce from 'lodash.debounce'

Vue.use(Vuex)

export const store = new Vuex.Store({

  strict: true,

  state: {

    isLoading: false,
    isBackendHealthy: true,
    backendErrorMessage: '',
    newMessagesPaused: false,

    filter: {
      file: '',
      start: 0,
      limit: 100,
      searchterm: '',
      channels: [],
      levels: []
    },

    logfiles: [],
    meta: [],
    messages: []
  },

  getters: {

    isLoading: state => {
      return state.isLoading
    },

    filter: state => {
      return state.filter
    },

    logfiles: state => {
      return state.logfiles
    },

    meta: state => {
      return state.meta
    },

    messages: state => {
      return state.messages
    },

    newMessagesPaused: state => {
      return state.newMessagesPaused
    },

    isBackendHealthy: state => {
      return state.isBackendHealthy
    },

    filesLoaded: state => {
      return state.logfiles.length > 0
    },

    metaLoaded: state => {
      return Object.keys(state.meta).length > 0
    },

    hasMessages: state => {
      return state.messages.length > 0
    },

    totalNumberOfMessages: state => {
      return state.meta.total
    },

    backendErrorMessage: state => {
      return state.backendErrorMessage
    },

    percentageLoaded: state => {
      let percentage = ((state.filter.start + state.filter.limit) * 100 / state.meta.total).toFixed(0)
      if (percentage > 100) { percentage = 100 }

      return percentage
    }
  },

  mutations: {

    updateFilter (state, filter) {
      state.filter = filter
    },

    ensureDefaultFilter (state) {
      if (state.filter.file.length === 0) {
        state.filter.file = state.logfiles.files[0].name
      }

      state.filter.channels = state.meta.channels
      state.filter.levels = state.meta.levels
    },

    increaseStartOffset (state) {
      state.filter.start += 100
    },

    updateLogfiles (state, logfiles) {
      state.logfiles = logfiles
    },

    changeLogfile (state, logfile) {
      state.filter.file = logfile
    },

    updateMeta (state, meta) {
      state.meta = meta
    },

    updateMessages (state, messages) {
      state.messages = messages
    },

    addMoreMessages (state, messages) {
      state.messages = state.messages.concat(messages)
    },

    setDefaultLogfile (state) {
      state.filter.file = state.logfiles.files[0].name
    },

    startLoading (state) {
      state.isLoading = true
    },

    stopLoading (state) {
      state.isLoading = false
    },

    pauseNewMessages (state) {
      state.newMessagesPaused = true
    },

    resumeNewMessages (state) {
      state.newMessagesPaused = false
    },

    markBackendAsHealthy (state) {
      state.isBackendHealthy = true
      state.backendErrorMessage = ''
    },

    markBackendAsFaulty (state, errorMessage) {
      state.isBackendHealthy = false
      state.backendErrorMessage = errorMessage
    },

    updateSearchterm (state, searchterm) {
      state.filter.searchterm = searchterm
    },

    updateLoglevels (state, levels) {
      state.filter.levels = levels
    },

    updateChannels (state, channels) {
      state.filter.channels = channels
    },

    selectAllLoglevels (state) {
      state.filter.levels = state.meta.levels
    },

    unselectAllLoglevels (state) {
      state.filter.levels = []
    },

    selectAllChannels (state) {
      state.filter.channels = state.meta.channels
    },

    unselectAllChannels (state) {
      state.filter.channels = []
    },

    resetFilter (state) {
      state.filter.start = 0
      state.filter.searchterm = ''
      state.filter.channels = state.meta.channels
      state.filter.levels = state.meta.levels
    },

    setBackendErrorMessage (state, message) {
      state.backendErrorMessage = message
    }
  },

  actions: {

    // Successful websocket connection
    socket_connect ({dispatch}) {
      console.log('socket_connect')
      dispatch('restoreFilter')
      dispatch('requestLogfiles')
    },

    socket_connectError ({commit, dispatch}) {
      dispatch('socket_error')
    },

    socket_error ({commit}) {
      commit('stopLoading')
      commit('markBackendAsFaulty', 'Could not connect to the API')
      this._vm.$socket.close()
    },

    // Retrieve logfiles from websocket
    socket_logfiles ({commit, dispatch}, logfiles) {
      console.log('socket_logfiles')
      commit('updateLogfiles', logfiles)
      commit('setDefaultLogfile')
      commit('markBackendAsHealthy')
      dispatch('requestMetaAndResetFilter')
    },

    // Retrieve meta information from websocket and reset the filter
    socket_metaResetFilter ({commit, dispatch}, meta) {
      console.log('socket_metaresetfilter')
      commit('updateMeta', meta)
      commit('ensureDefaultFilter')
      dispatch('reloadMessages')
    },

    // Retrieve meta information from websocket and do not reset the filter
    socket_metaPreserveFilter ({commit, dispatch}, meta) {
      console.log('socket_metapreservefilter')
      commit('updateMeta', meta)
      dispatch('reloadMessages')
    },

    // Retrieve reloaded messages from the websocket
    socket_reloadedMessages ({commit, dispatch}, messages) {
      console.log('socket_reloadedmessages')

      // Scroll to top of the page
      document.body.scrollTop = document.documentElement.scrollTop = 0

      commit('updateMessages', messages)
      dispatch('updatePageTitle')
      commit('stopLoading')
    },

    // Retrieve more messages from the websocket
    socket_requestedMessages ({commit, dispatch}, messages) {
      console.log('socket_requestedmessages')
      commit('addMoreMessages', messages)
      dispatch('updatePageTitle')
      commit('stopLoading')
    },

    // The log file has been changed. Load the new messages
    socket_fileChanged ({getters, dispatch}) {
      if (!getters.newMessagesPaused) {
        dispatch('requestMetaAndPreserveFilter')
      }
    },

    reconnect () {
      this._vm.$socket.open()
    },

    restoreFilter ({commit}) {
      console.log('restoreFilter')
      if (localStorage.getItem('filter')) {
        let filter = JSON.parse(localStorage.getItem('filter'))
        filter.start = 0

        commit('updateFilter', filter)
      }
    },

    requestLogfiles ({commit}) {
      console.log('requestLogfiles')
      commit('startLoading')
      this._vm.$socket.emit('request-logfiles')
    },

    requestMetaAndResetFilter ({commit, getters}) {
      console.log('requestMetaAndResetFilter')
      commit('startLoading')
      this._vm.$socket.emit('request-meta-reset-filter', getters.filter)
    },

    requestMetaAndPreserveFilter ({commit, getters}) {
      console.log('requestMetaAndPreserveFilter')
      commit('startLoading')
      this._vm.$socket.emit('request-meta-preserve-filter', getters.filter)
    },

    reloadMessages ({getters, commit}) {
      console.log('reloadMessages')
      commit('startLoading')
      localStorage.setItem('filter', JSON.stringify(getters.filter))
      this._vm.$socket.emit('reload-messages', getters.filter)
    },

    requestMoreMessages ({getters, commit}) {
      console.log('requestMoreMessages')
      commit('startLoading')
      commit('increaseStartOffset')
      this._vm.$socket.emit('request-messages', getters.filter)
    },

    updatePageTitle ({getters}) {
      document.title = 'monolog-ui [' + getters.percentageLoaded + '% - ' + getters.filter.file + ']'
    },

    updateSearchterm: _debounce(function ({commit, dispatch}) {
      // We do have a seperate method for updating the search term
      // because we only want to allow a reload every 500 ms.
      dispatch('reloadMessages')
    }, 500)
  }
})
