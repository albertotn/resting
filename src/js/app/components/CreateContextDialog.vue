<template>
  <r-dialog
    title="Create context"
    :show-footer="true"
    @dismiss-dialog="$emit('dismiss-dialog')">
    Name:
    <input
      type="text"
      class="form-control"
      v-model.trim="contextName"
      @keyup.enter="createContext" />
    <template v-slot:footer>
      <button
        class="btn btn-default"
        @click="createContext"
        :disabled="contextName.length === 0">
        Save
      </button>
      <button class="btn btn-default" @click="dismissCreateContextDialog">
        Cancel
      </button>
    </template>
  </r-dialog>
</template>
<script>
import RDialog from 'Components/RDialog.vue'
import bacheca from 'Services/bacheca'

export default {
  data() {
    return {
      contextName: '',
    }
  },
  methods: {
    createContext() {
      bacheca.publish('createContext', this.contextName)
      this.dismissCreateContextDialog()
    },
    dismissCreateContextDialog() {
      this.contextName = ''
      this.$emit('dismiss-dialog')
    },
  },
  components: {
    RDialog,
  },
}
</script>
