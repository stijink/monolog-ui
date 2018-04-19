import Vue from 'vue'
import Vuetify from 'vuetify'
import InfiniteScroll from 'vue-infinite-scroll'
import socketio from 'socket.io-client'
import VueSocketio from 'vue-socket.io'

import App from '@/App.vue'
import MessageList from '@/Component/MessageList'
import LoadingMessage from '@/Component/LoadingMessage'
import GenericMessage from '@/Component/GenericMessage'
import BackendError from '@/Component/BackendError'
import Toolbar from '@/Component/Toolbar'
import ToolbarLoading from '@/Component/ToolbarLoading'

import { store } from './store'

import 'vuetify/dist/vuetify.min.css'

Vue.use(VueSocketio, socketio('http://localhost:4000'), store)
Vue.use(Vuetify)
Vue.use(InfiniteScroll)

Vue.component('app-message-list', MessageList)
Vue.component('app-loading-message', LoadingMessage)
Vue.component('app-generic-message', GenericMessage)
Vue.component('app-backend-error', BackendError)
Vue.component('app-toolbar', Toolbar)
Vue.component('app-toolbar-loading', ToolbarLoading)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
