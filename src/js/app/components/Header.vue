<template>
  <nav class="navbar navbar-default">
    <div class="container-fluid">
      <div class="navbar-header">
        <img style="padding: 5px" src="icons/letter-r_64.png" />
      </div>
      <div class="collapse navbar-collapse">
        <ul class="nav navbar-nav">
          <context-menu></context-menu>
          <li>
            <a href="#" @click="showAboutDialog"><h4>About</h4></a>
          </li>
          <li>
            <a href="#" @click="showCreditsDialog">
              <h4>Credits</h4>
            </a>
          </li>
        </ul>
        <ul class="nav navbar-nav navbar-right">
          <li>
            <a href="#" @click="showDonateDialog">
              <h4>❤️&nbsp;Support the project</h4>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<script>
import bacheca from 'Services/bacheca'
import ContextMenu from 'Components/ContextMenu.vue'

export default {
  name: 'RHeader',
  data() {
    return {}
  },
  methods: {
    showDonateDialog() {
      bacheca.publish('showDonateDialog')
    },
    showCreditsDialog() {
      bacheca.publish('showCreditsDialog')
    },
    showAboutDialog() {
      bacheca.publish('showAboutDialog')
    },
  },
  components: {
    ContextMenu,
  },
}
</script>
