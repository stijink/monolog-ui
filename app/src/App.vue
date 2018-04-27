<template>
  <v-app v-infinite-scroll="requestMoreMessages" infinite-scroll-disabled="isScrollingDisabled" infinite-scroll-distance="30" infinite-scroll-immediate-check="false">

    <!-- Toolbar when no meta informations exists -->
    <app-toolbar-loading v-if="! metaLoaded"></app-toolbar-loading>

    <!-- Toolbar when meta informations exists -->
    <app-toolbar v-if="metaLoaded"></app-toolbar>

    <!-- An error has happend in the backend -->
    <app-backend-error v-if="isBackendHealthy === false"></app-backend-error>

    <!-- Messages are loading -->
    <app-loading-message v-if="showLoadingMessage"></app-loading-message>

    <!-- List messages -->
    <app-message-list v-if="hasMessages && isBackendHealthy"></app-message-list>

    <!-- Generic messages -->
    <app-generic-message
      v-if="isLogfileEmpty"
      message="The log seems to be empty!">
    </app-generic-message>

    <app-generic-message
      v-if="isFilterTooRestrictive"
      message="Your selected filter is too restrict to show any log messages">
    </app-generic-message>

  </v-app>
</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {

  computed: {
    ...mapGetters([
      'isBackendHealthy',
      'isLoading',
      'metaLoaded',
      'hasMessages',
      'totalNumberOfMessages'
    ]),

    isLogfileEmpty () {
      return !this.isLoading && this.totalNumberOfMessages === 0
    },

    isFilterTooRestrictive () {
      return !this.isLoading && this.totalNumberOfMessages > 0 && !this.hasMessages
    },

    showLoadingMessage () {
      return !this.metaLoaded && this.isLoading && this.isBackendHealthy
    },

    isScrollingDisabled () {
      return this.isLoading || !this.hasMessages
    }
  },

  methods: {
    ...mapActions(['requestMoreMessages'])
  }
}
</script>