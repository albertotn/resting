<template>
  <li class="dropdown">
    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
      <h4>
        Settings
        <b class="caret"></b>
      </h4>
    </a>
    <ul class="dropdown-menu">
      <li class="dropdown dropdown-submenu">
        <a href="#" class="dropdown-toggle" data-toggle="dropdown">Contexts</a>
        <ul class="dropdown-menu">
          <li>
            <a href="#" @click="showContextDialog(defaultCtxName)">
              {{ defaultCtxName }}
            </a>
          </li>
          <li role="separator" class="divider"></li>
          <li v-for="ctx in contexts" :key="ctx">
            <a
              href="#"
              v-if="ctx !== 'default'"
              @click="showContextDialog(ctx)">
              {{ ctx }}
            </a>
          </li>
          <li role="separator" class="divider"></li>
          <li>
            <a href="#" @click="showCreateContextDialog">
              Create
              <span class="pull-right">
                <button class="btn btn-xs btn-primary">
                  <span
                    class="glyphicon glyphicon-plus"
                    aria-hidden="true"></span>
                </button>
              </span>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </li>
</template>

<script>
import bacheca from 'Services/bacheca'
import storage from 'Services/storage'

export default {
  name: 'ContextMenu',
  mounted() {
    // load contexts
    const loadedCtxs = []
    storage.loadContexts(
      (ctx) => {
        loadedCtxs.push(ctx.name)
      },
      () => {
        let defaultCtxIdx = loadedCtxs.findIndex((ctx) => ctx === 'default')
        if (defaultCtxIdx < 0) {
          defaultCtxIdx = 0
          this.contexts.push('default')
        }
        loadedCtxs.forEach((ctx) => this.contexts.push(ctx))
        this.contexts.sort(this.sortCriteriaCtx)
      }
    )
    bacheca.subscribe('createContext', this.newContext)
    bacheca.subscribe('importContext', this.importContext)
  },
  data() {
    return {
      contexts: [],
      defaultCtxName: 'default',
    }
  },
  methods: {
    sortCriteriaCtx(e1, e2) {
      if (e1.toUpperCase() < e2.toUpperCase()) {
        return -1
      }
      if (e1.toUpperCase() > e2.toUpperCase()) {
        return 1
      }
      return 0
    },
    newContext(contextName) {
      this.contexts.push(contextName)
      this.contexts.sort(this.sortCriteriaCtx)
    },
    // loadContexts() {
    //   // load contexts
    //   const loadedCtxs = []
    //   storage.loadContexts(
    //     (ctx) => {
    //       loadedCtxs.push(new ContextVm(ctx.name, ctx.variables))
    //     },
    //     () => {
    //       defaultCtxIdx = loadedCtxs.findIndex(
    //         (ctx) => ctx.name() === 'default'
    //       )
    //       if (defaultCtxIdx < 0) {
    //         defaultCtxIdx = 0
    //         contexts.push(new ContextVm())
    //       }
    //       loadedCtxs.forEach((ctx) => contexts.push(ctx))
    //       contexts.sort(sortCriteriaCtx)
    //     }
    //   )
    // },
    importContext(contextName) {
      let ctxIdx = this.contexts.findIndex((ctx) => ctx === contextName)
      if (ctxIdx < 0) {
        this.contexts.push(contextName)
        this.contexts.sort(this.sortCriteriaCtx)
      }
    },
    showCreateContextDialog() {
      bacheca.publish('showCreateContextDialog')
    },
    showContextDialog(ctxName) {
      bacheca.publish('showContextDialog', ctxName)
    },
  },
}
</script>
