<template>
  <v-app v-infinite-scroll="requestMoreMessages" infinite-scroll-disabled="isScrollingDisabled" infinite-scroll-distance="30" infinite-scroll-immediate-check="false">

  <!-- Toolbar when no meta informations exists -->
  <v-toolbar dark dense fixed class="mb-1 blue darken-3" v-if="! hasMeta">
      <v-toolbar-title class="subheading pl-4">
        Analyzing your log files ...
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toobar-items>

      <!-- Settings -->
      <v-menu offset-y full-width :close-on-content-click="false">

        <v-btn flat slot="activator">
          <v-icon class="ml-1">menu</v-icon>
        </v-btn>

        <v-list>
          <v-list-tile>
            <v-list-tile-action>
              <v-btn flat @click="resetFilter()"><v-icon class="mr-2">cancel</v-icon>Reset Filter</v-btn>
            </v-list-tile-action>
          </v-list-tile>
      </v-list>
    </v-menu>

      </v-toobar-items>
    </v-toolbar>

  <!-- Toolbar when meta informations exists -->
  <v-toolbar dark dense fixed class="mb-1 blue darken-3" v-if="hasMeta">
      <v-toolbar-title>
        <v-menu offset-y full-width>
          <v-btn flat slot="activator">
            {{ meta.logfile_name }} ({{ formatFilesize(meta.logfile_size) }} | {{ meta.total }} messages | {{ formatDays(meta.days) }})
            <v-icon class="ml-1">keyboard_arrow_down</v-icon>
          </v-btn>
          <v-list>

          <v-list-tile v-for="file in logfiles.files" :key="file.name" @click="changeFile(file.name)">
            <v-list-tile-title>{{ logfiles.path }}/{{ file.name }} ({{ formatFilesize(file.size) }})</v-list-tile-title>
          </v-list-tile>

        </v-list>
      </v-menu>
      </v-toolbar-title>

      <v-text-field flat solo-inverted prepend-icon="search" label="Search in messages ..." v-model="filter.searchterm" @input="updateSearchterm"></v-text-field>

      <v-toolbar-items>

        <!-- Channels -->
        <v-menu offset-y full-width :close-on-content-click="false">
          <v-btn flat slot="activator">
            Channels ({{ filter.channels.length }}/{{ meta.channels.length }})
            <v-icon class="ml-1">keyboard_arrow_down</v-icon>
          </v-btn>
          <v-list>
          <v-list-tile v-for="channel in meta.channels" :key="channel">
            <v-list-tile-action>
              <v-checkbox v-model="filter.channels" :value="channel" @change="reloadMessages"></v-checkbox>
            </v-list-tile-action>
            <v-list-tile-title>{{ channel }}</v-list-tile-title>
          </v-list-tile>

          <v-divider></v-divider>

          <v-list-tile class="mt-1">
              <!-- Select all channels -->
              <v-btn
                v-if="filter.channels.length < meta.channels.length"
                @click="selectAllChannels"
                block
                small
                color="blue-grey lighten-4">
                  Select all
              </v-btn>

            <!-- Unselect all channels -->
              <v-btn
                v-if="filter.channels.length === meta.channels.length"
                @click="unselectAllChannels"
                block
                small
                color="blue-grey lighten-4">
                  Unselect all
              </v-btn>

          </v-list-tile>

        </v-list>
      </v-menu>

      <!-- Loglevels -->
      <v-menu offset-y full-width :close-on-content-click="false">
        <v-btn flat slot="activator">
          Log Levels ({{ filter.levels.length }}/{{ meta.levels.length }})
          <v-icon class="ml-1">keyboard_arrow_down</v-icon>
        </v-btn>
        <v-list>
        <v-list-tile v-for="loglevel in meta.levels" :key="loglevel">
          <v-list-tile-action>
            <v-checkbox v-model="filter.levels" :value="loglevel" @change="reloadMessages"></v-checkbox>
          </v-list-tile-action>
          <v-list-tile-title>{{ loglevel }}</v-list-tile-title>
        </v-list-tile>

        <v-divider></v-divider>

          <v-list-tile class="mt-1">
              <!-- Select all loglevels -->
              <v-btn
                v-if="filter.levels.length < meta.levels.length"
                @click="selectAllLoglevels"
                block
                small
                color="blue-grey lighten-4">
                  Select all
              </v-btn>

            <!-- Unselect all loglevels -->
              <v-btn
                v-if="filter.levels.length === meta.levels.length"
                @click="unselectAllLoglevels"
                block
                small
                color="blue-grey lighten-4">
                  Unselect all
              </v-btn>

          </v-list-tile>

      </v-list>
    </v-menu>

      <!-- Settings -->
      <v-menu offset-y full-width :close-on-content-click="false">

        <v-btn flat slot="activator">
          <v-icon class="ml-1">menu</v-icon>
        </v-btn>

        <v-list>

          <v-list-tile>
            <v-list-tile-action>
              <v-btn flat @click="resetFilter()"><v-icon class="mr-2">cancel</v-icon>Reset Filter</v-btn>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile v-if="pauseLoadingNewMessages == false">
            <v-list-tile-action>
              <v-btn flat @click="pauseLoadingNewMessages = true"><v-icon class="mr-2">sync_disabled</v-icon>Pause loading new Messages</v-btn>
            </v-list-tile-action>
          </v-list-tile>

        <v-list-tile v-if="pauseLoadingNewMessages == true">
          <v-list-tile-action>
            <v-btn flat @click="pauseLoadingNewMessages = false"><v-icon class="mr-2">sync</v-icon>Resume loading new Messages</v-btn>
          </v-list-tile-action>
        </v-list-tile>

<!--           <v-list-tile v-if="showCharts == false">
            <v-list-tile-action>
              <v-btn flat @click="showCharts = true"><v-icon class="mr-2">timeline</v-icon>Show Charts</v-btn>
            </v-list-tile-action>
          </v-list-tile>

        <v-list-tile v-if="showCharts == true">
          <v-list-tile-action>
            <v-btn flat @click="showCharts = false"><v-icon class="mr-2">timeline</v-icon>Hide Charts</v-btn>
          </v-list-tile-action>
        </v-list-tile> -->

      </v-list>
    </v-menu>

      </v-toolbar-items>
    </v-toolbar>

    <v-container v-if="backendError === true" fluid fill-height>
      <v-layout flex align-center justify-center>
        <v-flex xs4 class="text-xs-center">
          <p class="headline mb-5 mt-4">
            Uuups. Could not talk to the API.
          </p>

          <v-btn @click="requestLogfiles()">
            <v-icon small class="mr-2">sync</v-icon>
            Try again
          </v-btn>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container v-if="showLoadingMessage" fluid fill-height>
      <v-layout flex align-center justify-center>
        <v-flex xs4 class="text-xs-center">
          <v-progress-circular indeterminate color="grey" :width="3"></v-progress-circular>
          <p class="headline mb-5 mt-4 grey--text darken-3">
            Loading log messages
          </p>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container fluid fill-height class="mt-5" v-if="hasMessages">
      <v-layout row>
        <v-flex xs12>
          <table class="messages">
            <tr v-for="(message, index) in messages" v-bind:key="index" class="pa-3" :class="messageColor(message)" :data-message-idx="index">
              <td class="pa-2 message--level">{{ message.level }}</td>
              <td class="pa-2 message--channel">{{ message.channel }}</td>
              <td class="pa-2 text-xs-center message--date">{{ message.date }}</td>
              <td class="pa-2 message--text">{{ message.text }}</td>
            </tr>
          </table>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container v-if="isLogfileEmpty" fluid fill-height>
      <v-layout flex align-center justify-center>
        <v-flex xs4 class="text-xs-center">
          <p class="headline mb-5 mt-4 grey--text darken-3">
            The log seems to be empty!
          </p>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container v-if="isFilterTooRestrictive" fluid fill-height>
      <v-layout flex align-center justify-center>
        <v-flex xs4 class="text-xs-center">
          <p class="headline mb-5 mt-4 grey--text darken-3">
            Your selected filter is too restrict to show any log messages
          </p>
        </v-flex>
      </v-layout>
    </v-container>

    <v-container v-if="filesLoaded && ! hasFiles" fluid fill-height>
      <v-layout flex align-center justify-center>
        <v-flex xs4 class="text-xs-center">
          <p class="headline mb-5 mt-4 grey--text darken-3">
            Could not find any logfiles in {{ logfiles.path }}
          </p>
        </v-flex>
      </v-layout>
    </v-container>

  </v-app>
</template>

<script>

import _debounce from 'lodash.debounce'

export default {
  data () {
    return {
      filter: {
        file: '',
        start: 0,
        limit: 100,
        searchterm: '',
        channels: [],
        levels: []
      },

      // Variables for local use
      isLoading: true,
      backendError: false,
      pauseLoadingNewMessages: false,
      showCharts: true,

      // Holds a list of aviable logfiles
      logfiles: [],

      // Holds meta informations about the current logfile
      meta: [],

      // Holds the messages retrieved form the api
      messages: [],

      loglevelColors: {
        DEBUG: 'blue-grey lighten-5',
        INFO: 'grey lighten-1',
        NOTICE: 'amber lighten-4',
        WARNING: 'amber lighten-3',
        ERROR: 'amber lighten-1',
        ALERT: 'orange darken-4',
        EMERGENCY: 'red darken-4 white--text',
        UNKNOWN: 'blue-grey lighten-5'
      }
    }
  },

  sockets: {
    connect: function () {
      this.restoreFilter()
      this.requestLogfiles()
    },
    error: function () {
      this.backendError = true
    },
    connect_error: function () {
      this.backendError = true
    },
    logfiles: function (logfiles) {
      this.backendError = false
      this.logfiles = logfiles
      this.filter.file = this.logfiles.files[0].name
      this.requestMetaAndResetFilter()
    },
    metaResetFilter: function (meta) {
      this.meta = meta
      this.ensureDefaultFilter()
      this.reloadMessages()
    },
    metaPreserveFilter: function (meta) {
      this.meta = meta
      this.reloadMessages()
    },
    reloadedMessages: function (messages) {
      this.messages = messages
      this.isLoading = false
    },
    requestedMessages: function (messages) {
      console.log(messages[0].date)
      this.messages = this.messages.concat(messages)
    },
    fileChanged: _debounce(function () {
      if (this.pauseLoadingNewMessages === false) {
        console.log('reloading file changes')
        this.requestMetaAndPreserveFilter()
      }
    }, 300)
  },

  watch: {
    // Watch for changes to the filter
    filter: {
      deep: true,
      handler: function () { this.rememberFilter() }
    }
  },

  computed: {
    hasMeta () {
      return Object.keys(this.meta).length > 0
    },

    filesLoaded () {
      return this.logfiles.length > 0
    },

    hasFiles () {
      return this.filesLoaded && this.logfiles.files.length > 0
    },

    hasMessages () {
      return this.messages.length > 0
    },

    isLogfileEmpty () {
      return this.isLoading === false && this.meta.total === 0
    },

    isFilterTooRestrictive () {
      return this.isLoading === false && this.meta.total > 0 && this.messages.length === 0
    },

    isScrollingDisabled () {
      return this.messages.length === 0
    },

    showLoadingMessage () {
      return this.hasMessages && this.isLoading === true && this.backendError === false
    }
  },

  methods: {
    requestLogfiles () {
      this.isLoading = true
      this.$socket.emit('request-logfiles')
    },

    requestMetaAndResetFilter () {
      this.isLoading = true
      this.$socket.emit('request-meta-reset-filter', this.filter)
    },

    requestMetaAndPreserveFilter () {
      this.isLoading = true
      this.$socket.emit('request-meta-preserve-filter', this.filter)
    },

    reloadMessages () {
      this.isLoading = true
      this.$socket.emit('reload-messages', this.filter)
    },

    requestMoreMessages () {
      this.filter.start += 100
      this.$socket.emit('request-messages', this.filter)
    },

    ensureDefaultFilter () {
      if (this.filter.file.length === 0) {
        this.filter.file = this.logfiles.files[0].name
      }

      this.filter.channels = this.meta.channels
      this.filter.levels = this.meta.levels
    },

    changeFile (filename) {
      this.filter.file = filename
      this.requestMetaAndResetFilter()
    },

    rememberFilter () {
      localStorage.setItem('filter', JSON.stringify(this.filter))
    },

    restoreFilter () {
      if (localStorage.getItem('filter')) {
        this.filter = JSON.parse(localStorage.getItem('filter'))

        // We don't want to use the stored value for "start"
        this.filter.start = 0
      }
    },

    resetFilter () {
      this.filter.start = 0
      this.filter.searchterm = ''
      this.filter.channels = this.meta.channels
      this.filter.levels = this.meta.levels
      this.reloadMessages()
    },

    formatDays (days) {
      if (days > 1) {
        return days + ' days'
      }

      return '1 day'
    },

    formatFilesize (filesize) {
      if (filesize < 1000) {
        return filesize.toFixed(2) + ' Bytes'
      }

      if (filesize < (1000 * 1000)) {
        return (filesize / 1000).toFixed(2) + ' KB'
      }

      return (filesize / 1000000).toFixed(2) + ' MB'
    },

    selectAllChannels () {
      this.filter.channels = this.meta.channels
      this.reloadMessages()
    },

    unselectAllChannels () {
      this.filter.channels = []
      this.reloadMessages()
    },

    selectAllLoglevels () {
      this.filter.levels = this.meta.levels
      this.reloadMessages()
    },

    unselectAllLoglevels () {
      this.filter.levels = []
      this.reloadMessages()
    },

    updateSearchterm: _debounce(function () {
      this.reloadMessages()
    }, 500),

    messageColor (message) {
      let color = this.loglevelColors[message.level]

      if (color.length === 0) {
        color = this.loglevelColors['UNKNOWN']
      }

      return color
    }
  }
}
</script>

<style scoped>
  .messages {
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    width: 100%;
    table-layout: fixed;
  }

  .message--level {
    width: 100px;
  }

  .message--channel {
    width: 120px;
  }

  .message--date {
    width: 200px;
  }

  .message--text {
    word-wrap:break-word;
  }

  .list__tile__action {
    min-width: 30px;
  }
</style>