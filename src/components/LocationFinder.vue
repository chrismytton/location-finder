<template>
  <div class="location-finder">
    <div v-if="locating">
      Locating&hellip;
    </div>
    <div v-if="position">
      <table>
        <tr>
          <td>Latitude</td>
          <td>{{ latitude }}</td>
        </tr>
        <tr>
          <td>Longitude</td>
          <td>{{ longitude }}</td>
        </tr>
        <tr>
          <td>Altitude</td>
          <td>
            <span v-if="altitude">{{ altitude }} metres</span>
          </td>
        </tr>
        <tr>
          <td>Heading</td>
          <td>{{ heading }}</td>
        </tr>
        <tr>
          <td>Speed</td>
          <td>{{ speed }}</td>
        </tr>
        <tr>
          <td>Accuracy</td>
          <td>{{ accuracy }}</td>
        </tr>
        <tr>
          <td>Altitude Accuracy</td>
          <td>{{ altitudeAccuracy }}</td>
        </tr>
      </table>
      <p>
        <a v-bind:href="`https://www.google.co.uk/maps/@${latitude},${longitude},17z`">Google Maps</a>
      </p>
      <p>
        <a
          v-bind:href="`https://www.openstreetmap.org/search?query=${latitude}%2C${longitude}`"
        >OpenStreetMap</a>
      </p>
      <p>
        <a v-bind:href="`https://www.bing.com/maps?lvl=17&cp=${latitude}~${longitude}`">Bing</a>
      </p>
    </div>
    <div v-else-if="errorMessage">{{ errorMessage }}</div>
    <div v-else>
      <button v-on:click="startTracking">Use my location</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LocationFinder",
  data() {
    return {
      locating: false,
      position: null,
      error: {},
      watchID: null,
    };
  },
  methods: {
    onPositionUpdate(position) {
      this.position = position;
      this.locating = false;
    },
    onPositionError(err) {
      this.error = err;
      this.locating = false;
    },
    startTracking() {
      this.locating = true
      navigator.geolocation.clearWatch(this.watchID)
      this.watchID = navigator.geolocation.watchPosition(
        this.onPositionUpdate,
        this.onPositionError,
        { enableHighAccuracy: true }
      );
    }
  },
  computed: {
    latitude() {
      return this.position.coords.latitude.toFixed(4);
    },
    longitude() {
      return this.position.coords.longitude.toFixed(4);
    },
    altitude() {
      return this.position.coords.altitude.toFixed(4);
    },
    heading() {
      return this.position.coords.heading.toFixed(4);
    },
    speed() {
      return this.position.coords.speed.toFixed(4);
    },
    accuracy() {
      return this.position.coords.accuracy.toFixed(4);
    },
    altitudeAccuracy() {
      return this.position.coords.altitudeAccuracy.toFixed(4);
    },
    errorMessage() {
      if (!this.error.code || !this.error.message) {
        return "";
      }
      return `ERROR(${this.error.code}): ${this.error.message}`;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table {
  border: 1px solid #666;
}
td {
  border: 1px solid #666;
  padding: 1em 0.5em;
}
</style>
