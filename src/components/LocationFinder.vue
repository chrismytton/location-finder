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
          <td>Speed (mph)</td>
          <td>
            <span v-if="mph">{{ mph }} mph</span>
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
        <tr>
          <td>Last updated</td>
          <td>{{ timestamp }}</td>
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
        this.onPositionError,
        { enableHighAccuracy: true }
      );
    }
  },
  computed: {
    timestamp() {
      if (!this.position) {
        return;
      }
      return new Date(this.position.timestamp)
    },
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
      const { heading } = this.coords
      if (heading > 337.5 || heading <= 22.5) {
        return 'N'
      } else if (heading > 22.5 && heading <= 67.5) {
        return 'NE'
      } else if (heading > 67.5 && heading <= 112.5) {
        return 'E'
      } else if (heading > 112.5 && heading <= 157.5) {
        return 'SE'
      } else if (heading > 157.5 && heading <= 202.5) {
        return 'S'
      } else if (heading > 202.5 && heading <= 247.5) {
        return 'SW'
      } else if (heading > 247.5 && heading <= 292.5) {
        return 'W'
      } else if (heading > 292.5 && heading <= 337.5) {
        return 'NW'
      } else {
        return heading
      }
    },
    speed() {
      if (!this.coords.speed) {
        return "0"
      }
      return this.position.coords.speed.toFixed(1);
    },
    mph() {
      if (!this.coords.speed) {
        return "0"
      }
      return (this.coords.speed * 2.237).toFixed(1)
    },
    accuracy() {
      if (!this.coords.accuracy) {
        return
      }
      return this.position.coords.accuracy.toFixed(2)
    },
    altitudeAccuracy() {
      if (!this.coords.altitudeAccuracy) {
        return
      }
      return this.position.coords.altitudeAccuracy.toFixed(2);
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
  width: 100%;
}
td {
  border: 1px solid #666;
  padding: 1em 0.5em;
}
</style>
