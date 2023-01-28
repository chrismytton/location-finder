<template>
  <div class="grid justify-center content-center h-screen font-mono m-5">
    <div v-if="locating">
      Locating&hellip;
    </div>
    <div v-else-if="position" class="grid grid-">
      <div>Latitude: {{ latitude }}</div>
      <div>Longitude: {{ longitude }}</div>
      <div>Altitude: <span v-if="altitude">{{ altitude }} metres</span></div>
      <div>Heading: <span v-if="heading">{{ heading }}</span></div>
      <div>Speed: <span v-if="speed">{{ speed }} metres per second</span></div>
      <div>Speed (mph): <span v-if="mph">{{ mph }} mph</span></div>
      <div>Accuracy: <span v-if="accuracy">+- {{ accuracy }} metres</span></div>
      <div>Altitude Accuracy: <span v-if="altitudeAccuracy">+- {{ altitudeAccuracy }} metres</span></div>
      <div>Last updated: {{ timestamp }}</div>
      <p>
        <a v-bind:href="`https://www.google.co.uk/maps/@${latitude},${longitude},17z`">Google Maps</a>
      </p>
      <p>
        <a
          v-bind:href="`https://www.openstreetmap.org/#map=17/${latitude}/${longitude}`"
        >OpenStreetMap</a>
      </p>
      <p>
        <a v-bind:href="`https://www.bing.com/maps?lvl=17&cp=${latitude}~${longitude}`">Bing</a>
      </p>
    </div>
    <div v-else-if="errorMessage">{{ errorMessage }}</div>
    <div v-else>
      <button v-on:click="startTracking" class="bg-blue-500 text-zinc-50 p-4 font-semibold text-2xl">Use my location</button>
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
      localStorage.setItem('gpsSuccess', false)
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
