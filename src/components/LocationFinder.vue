<template>
  <div class="location-finder">
    <div v-if="locating">
      Locating&hellip;
    </div>
    <div v-else-if="position">
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
          <td>
            <span v-if="heading">{{ heading }}</span>
          </td>
        </tr>
        <tr>
          <td>Speed</td>
          <td>
            <span v-if="speed">{{ speed }} metres per second</span>
          </td>
        </tr>
        <tr>
          <td>Accuracy</td>
          <td>
            <span v-if="accuracy">+- {{ accuracy }} metres</span>
          </td>
        </tr>
        <tr>
          <td>Altitude Accuracy</td>

          <td>
            <span v-if="altitudeAccuracy">+- {{ altitudeAccuracy }} metres</span>
          </td>
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
      coords: {},
      error: {},
      watchID: null,
    };
  },
  created() {
    if (localStorage.getItem('gpsSuccess')) {
      this.startTracking()
    }
  },
  methods: {

    onPositionUpdate(position) {
      localStorage.setItem('gpsSuccess', true)

      this.position = position;
      this.coords = position.coords
      this.locating = false;
    },
    onPositionError(err) {
      this.error = err;
      this.locating = false;
    },
    startTracking() {
      this.locating = true
      if (this.watchID) {
        navigator.geolocation.clearWatch(this.watchID)
      }
      this.watchID = navigator.geolocation.watchPosition(
        this.onPositionUpdate,
        this.onPositionError
      );
    }
  },
  computed: {
    latitude() {
      if (!this.coords.latitude) {
        return
      }
      return this.coords.latitude.toFixed(4);
    },
    longitude() {
      if (!this.coords.longitude) {
        return
      }
      return this.coords.longitude.toFixed(4);
    },
    altitude() {
      if (!this.coords.altitude) {
        return
      }
      return this.coords.altitude.toFixed(2);
    },
    heading() {
      if (!this.coords.heading) {
        return
      }
      return this.coords.heading.toFixed(0);
    },
    speed() {
      if (!this.coords.speed) {
        return
      }
      return this.position.coords.speed.toFixed(1);
    },
    accuracy() {
      if (!this.coords.accuracy) {
        return
      }
      return this.position.coords.accuracy
    },
    altitudeAccuracy() {
      if (!this.coords.altitudeAccuracy) {
        return
      }
      return this.position.coords.altitudeAccuracy;
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
