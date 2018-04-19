<template>

    <v-container fluid fill-height>
      <v-layout flex align-center justify-center>
        <v-flex xs4 class="text-xs-center">

          <p class="headline mb-2">Uuups. Sadly an error occurred.</p>
          <p class="title mb-5 mt-4">"{{ backendErrorMessage }}"</p>

          <v-btn @click="reconnect" class="mt-4"><v-icon small class="mr-2">sync</v-icon>Try again</v-btn>

        </v-flex>
      </v-layout>
    </v-container>

</template>

<script>

import { mapGetters, mapActions } from 'vuex'

export default {

  computed: {
    ...mapGetters(['backendErrorMessage'])
  },

  methods: {
    ...mapActions(['reconnect'])
  }
}
</script>

