<template>

  <v-toolbar dark dense fixed class="mb-1 blue darken-3">
      <v-toolbar-title class="subheading pl-4">
        Analyzing your log files ...
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-toolbar-items>

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
            </v-list>
    </v-menu>

      </v-toolbar-items>
    </v-toolbar>

</template>

<script>

import { mapMutations, mapActions } from 'vuex'

export default {

  methods: {
    ...mapMutations(['resetFilter']),
    ...mapActions(['reloadMessages'])
  }
}
</script>
