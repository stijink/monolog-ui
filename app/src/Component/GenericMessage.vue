<template>

    <v-container fluid fill-height>
      <v-layout flex align-center justify-center>
        <v-flex xs4 class="text-xs-center">
          <p class="headline mb-5 mt-4 grey--text darken-3">
            {{ message }}
          </p>
        </v-flex>
      </v-layout>
    </v-container>

</template>

<script>
export default {
  props: ['message']
}
</script>
