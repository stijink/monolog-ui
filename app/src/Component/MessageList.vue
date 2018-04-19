<template>

    <v-container fluid fill-height class="mt-5">
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

</template>

<script>

import { mapGetters } from 'vuex'

export default {

  data () {
    return {
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

  computed: {
    ...mapGetters(['messages'])
  },

  methods: {
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
</style>
