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
          <li>
            <a href="#" @click.prevent="toggleTheme" class="theme-toggle" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <h4>
                <i v-if="isDarkMode" class="fa fa-moon-o"></i>
                <i v-else class="fa fa-sun-o"></i>
              </h4>
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
    return {
      isDarkMode: false,
    }
  },
  mounted() {
    // Initialize theme state from body class
    this.isDarkMode = document.body.classList.contains('dark-mode')
    
    // Listen for theme changes from other sources
    bacheca.subscribe('themeChanged', (theme) => {
      this.isDarkMode = theme === 'dark'
    })
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
    toggleTheme() {
      const newTheme = this.isDarkMode ? 'light' : 'dark'
      this.isDarkMode = !this.isDarkMode
      bacheca.publish('setTheme', newTheme)
    },
    setTheme(theme) {
      bacheca.publish('setTheme', theme)
    },
  },
  components: {
    ContextMenu,
  },
}
</script>
