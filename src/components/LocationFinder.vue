<template>
  <div class="location-finder">
    <div v-if="loading">Locating&hellip;</div>
    <div v-else-if="errorMessage">{{ errorMessage }}</div>
    <div v-else>
      <p>Latitude: {{ latitude }}</p>
      <p>Longitude: {{ longitude }}</p>
      <p>Altitude: {{ altitude }}</p>
      <p>Heading: {{ heading }}</p>
      <p>Speed: {{ speed }}</p>
      <p>Accuracy: {{ accuracy }}</p>
      <p>Altitude Accuracy: {{ altitudeAccuracy }}</p>
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
  </div>
</template>

<script>
export default {
  name: "LocationFinder",
  data() {
    return {
      loading: true,
      position: {},
      error: {}
    };
  },
  created() {
    navigator.geolocation.watchPosition(
      this.onPositionUpdate,
      this.onPositionError,
      { enableHighAccuracy: true }
    );
  },
  methods: {
    onPositionUpdate(position) {
      this.position = position;
      this.loading = false;
    },
    onPositionError(err) {
      this.error = err;
      this.loading = false;
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
      return this.position.coords.altitude;
    },
    heading() {
      return this.position.coords.heading;
    },
    speed() {
      return this.position.coords.speed;
    },
    accuracy() {
      return this.position.coords.accuracy;
    },
    altitudeAccuracy() {
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
</style>
