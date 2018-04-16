import Vue from 'vue'
import Vuetify from 'vuetify'
import InfiniteScroll from 'vue-infinite-scroll'
import VueSocketio from 'vue-socket.io'
import App from '@/App.vue'

import 'vuetify/dist/vuetify.min.css'

Vue.use(VueSocketio, 'http://localhost:4000')
Vue.use(Vuetify)
Vue.use(InfiniteScroll)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
