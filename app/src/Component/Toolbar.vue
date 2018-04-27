<template>

  <v-toolbar dark dense fixed class="mb-1 blue darken-3">
      <v-toolbar-title>
        <v-menu offset-y full-width>
          <v-btn flat slot="activator">
            {{ meta.logfile_name }} ({{ formatFilesize(meta.logfile_size) }} | {{ meta.total }} messages | {{ formatDays(meta.days) }})
            <v-icon class="ml-1">keyboard_arrow_down</v-icon>
          </v-btn>
          <v-list>

          <v-list-tile v-for="file in logfiles.files" :key="file.name" @click="changeLogfile(file.name); requestMetaAndResetFilter()">
            <v-list-tile-title>{{ logfiles.path }}{{ file.name }} ({{ formatFilesize(file.size) }})</v-list-tile-title>
          </v-list-tile>

        </v-list>
      </v-menu>
      </v-toolbar-title>

      <v-text-field flat solo-inverted prepend-icon="search" label="Search in messages ..." v-model="filter_searchterm" @input="updateSearchterm()"></v-text-field>

      <v-toolbar-items>

        <!-- Channels -->
        <v-menu offset-y full-width :close-on-content-click="false" transition="scale-transition">
          <v-btn flat slot="activator">
            Channels ({{ filter_channels.length }}/{{ meta.channels.length }})
            <v-icon class="ml-1">keyboard_arrow_down</v-icon>
          </v-btn>
          <v-list>
          <v-list-tile v-for="channel in meta.channels" :key="channel">
            <v-list-tile-action>
              <v-checkbox :value="channel" v-model="filter_channels" @change="reloadMessages()"></v-checkbox>
            </v-list-tile-action>
            <v-list-tile-title>{{ channel }}</v-list-tile-title>
          </v-list-tile>

          <v-divider></v-divider>

          <v-list-tile class="mt-1">
              <!-- Select all channels -->
              <v-btn
                v-if="filter_channels.length < meta.channels.length"
                @click="selectAllChannels(); reloadMessages()"
                block
                small
                color="blue-grey lighten-4">
                  Select all
              </v-btn>

            <!-- Unselect all channels -->
              <v-btn
                v-if="filter_channels.length === meta.channels.length"
                @click="unselectAllChannels(); reloadMessages()"
                block
                small
                color="blue-grey lighten-4">
                  Unselect all
              </v-btn>

          </v-list-tile>

        </v-list>
      </v-menu>

      <!-- Loglevels -->
      <v-menu offset-y full-width :close-on-content-click="false" transition="scale-transition">
        <v-btn flat slot="activator">
          Log Levels ({{ filter_levels.length }}/{{ meta.levels.length }})
          <v-icon class="ml-1">keyboard_arrow_down</v-icon>
        </v-btn>
        <v-list>
        <v-list-tile v-for="loglevel in meta.levels" :key="loglevel">
          <v-list-tile-action>
            <v-checkbox :value="loglevel" v-model="filter_levels" @change="reloadMessages()"></v-checkbox>
          </v-list-tile-action>
          <v-list-tile-title>{{ loglevel }}</v-list-tile-title>
        </v-list-tile>

        <v-divider></v-divider>

          <v-list-tile class="mt-1">
              <!-- Select all loglevels -->
              <v-btn
                v-if="filter_levels.length < meta.levels.length"
                @click="selectAllLoglevels(); reloadMessages()"
                block
                small
                color="blue-grey lighten-4">
                  Select all
              </v-btn>

            <!-- Unselect all loglevels -->
              <v-btn
                v-if="filter_levels.length === meta.levels.length"
                @click="unselectAllLoglevels(); reloadMessages()"
                block
                small
                color="blue-grey lighten-4">
                  Unselect all
              </v-btn>

          </v-list-tile>

      </v-list>
    </v-menu>

      <!-- Settings -->
      <v-menu offset-y full-width :close-on-content-click="false" transition="scale-transition">

        <v-btn flat slot="activator">
          <v-icon class="ml-1">menu</v-icon>
        </v-btn>

        <v-list>

          <v-list-tile>
            <v-list-tile-action>
              <v-btn flat @click="resetFilter(); reloadMessages()"><v-icon class="mr-2">cancel</v-icon>Reset Filter</v-btn>
            </v-list-tile-action>
          </v-list-tile>

          <v-list-tile v-if="newMessagesPaused == false">
            <v-list-tile-action>
              <v-btn flat @click="pauseNewMessages()"><v-icon class="mr-2">sync_disabled</v-icon>Pause loading new Messages</v-btn>
            </v-list-tile-action>
          </v-list-tile>

        <v-list-tile v-if="newMessagesPaused == true">
          <v-list-tile-action>
            <v-btn flat @click="resumeNewMessages(); requestMetaAndPreserveFilter()"><v-icon class="mr-2">sync</v-icon>Resume loading new Messages</v-btn>
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

</template>


<script>

import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {

  computed: {
    ...mapGetters(['meta', 'logfiles', 'newMessagesPaused', 'percentageLoaded']),

    filter_searchterm: {
      get () {
        return this.$store.getters.filter.searchterm
      },
      set (searchterm) {
        this.$store.commit('updateSearchterm', searchterm)
      }
    },

    filter_levels: {
      get () {
        return this.$store.getters.filter.levels
      },
      set (loglevels) {
        this.$store.commit('updateLoglevels', loglevels)
      }
    },

    filter_channels: {
      get () {
        return this.$store.getters.filter.channels
      },
      set (channels) {
        this.$store.commit('updateChannels', channels)
      }
    }
  },

  methods: {
    ...mapMutations([
      'pauseNewMessages',
      'resumeNewMessages',
      'selectAllLoglevels',
      'unselectAllLoglevels',
      'selectAllChannels',
      'unselectAllChannels',
      'resetFilter',
      'changeLogfile'
    ]),

    ...mapActions([
      'reloadMessages',
      'updateSearchterm',
      'requestMetaAndResetFilter',
      'requestMetaAndPreserveFilter'
    ]),

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
    }
  }

}
</script>


<style scoped>
  .list__tile__action {
    min-width: 30px;
  }
</style>