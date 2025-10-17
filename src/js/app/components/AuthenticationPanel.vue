<template>
  <div>
    <div class="row">
      <div class="form-inline">
        <div class="form-group">
          <label for="authentication-type">Type</label>
          <select
            class="form-control"
            style="margin-left: 10px"
            id="authentication-type"
            v-model="authenticationType">
            <option value="">None</option>
            <option v-for="t in authenticationTypes" :key="t">
              {{ t }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="row" style="margin-top: 10px">
      <div class="col-md-12" v-if="authenticationType === 'Basic'">
        <div class="form-group">
          <label>Name</label>
          <input type="input" class="form-control" v-model="username" />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" class="form-control" v-model="password" />
        </div>
      </div>
      <div class="col-md-12" v-if="authenticationType === 'JWT'">
        <div class="form-group">
          <label>Token</label>
          <textarea
            class="form-control"
            v-model="jwtToken"
            placeholder="Header.Payload.Signature"></textarea>
        </div>
      </div>
      <div class="col-md-12" v-if="authenticationType === 'Oauth 2.0'">
        <div class="form-group">
          <label>Access Token</label>
          <input type="text" class="form-control" v-model="oauthAccessToken" />
          <label>Add authorization data to</label>
          <select class="form-control" v-model="oauthAuthPosition">
            <option value="">Select one</option>
            <option v-for="pos in oauthPositions" :key="pos">
              {{ pos }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import bacheca from 'Services/bacheca'

export default {
  name: 'AuthenticationPanel',
  mounted() {
    bacheca.subscribe('showAuthenticationPanel', this.showPanel)
    bacheca.subscribe('hideAuthenticationPanel', () => (this.show = false))
    bacheca.subscribe('reset', this.clear)
    bacheca.subscribe('loadBookmark', this.load)
    bacheca.subscribe('update.authentication', this.populate)
  },
  computed: {
    useBasicForm() {
      return true
    },
  },
  data() {
    return {
      authenticationTypes: ['Basic', 'JWT', 'Oauth 2.0'],
      authenticationType: '',
      username: '',
      password: '',
      jwtToken: '',
      oauthAccessToken: '',
      oauthAuthPositions: ['Request URL', 'Request Header'],
      oauthAuthPosition: '',
      show: false,
    }
  },
  watch: {
    authenticationType(newVal, oldVal) {
      bacheca.publish('update.authenticationType', newVal)
    },
    username(newVal, oldVal) {
      bacheca.publish('update.username', newVal)
    },
    password(newVal, oldVal) {
      bacheca.publish('update.password', newVal)
    },
    jwtToken(newVal, oldVal) {
      bacheca.publish('update.jwtToken', newVal)
    },
    oauthAccessToken(newVal, oldVal) {
      bacheca.publish('update.oauthAccessToken', newVal)
    },
    oauthAuthPosition(newVal, oldVal) {
      bacheca.publish('update.oauthAuthPosition', newVal)
    },
  },
  methods: {
    showPanel(request) {
      this.show = true
      this.populate(request)
    },
    load(bookmark) {
      if (this.show) {
        const authData = bookmark.request.authentication
        this.populate(authData)
      }
    },
    clear() {
      this.authenticationType = ''
      this.username = ''
      this.password = ''
      this.jwtToken = ''
      this.oauthAccessToken = ''
      this.oauthAuthPosition = ''
    },
    populate(data) {
      let isString = (value) =>
        typeof value === 'string' || value instanceof String
      if (data.authenticationType != undefined) {
        this.authenticationType = isString(data.authenticationType)
          ? data.authenticationType
          : ''
      } else {
        this.authenticationType = isString(data.type) ? data.type : ''
      }
      this.username = data.username
      this.password = data.password
      this.jwtToken = data.jwtToken
      this.oauthAccessToken = data.oauthAccessToken
      this.oauthAuthPosition = data.oauthAuthPosition
    },
  },
}
</script>
