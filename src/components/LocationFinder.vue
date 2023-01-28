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
        return null
      }
      return this.coords.speed.toFixed(1);
    },
    mph() {
      if (!this.coords.speed) {
        return null
      }
      return (this.coords.speed * 2.237).toFixed(1)
    },
    accuracy() {
      if (!this.coords.accuracy) {
        return
      }
      return this.coords.accuracy.toFixed(2)
    },
    altitudeAccuracy() {
      if (!this.coords.altitudeAccuracy) {
        return
      }
      return this.coords.altitudeAccuracy.toFixed(2);
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

<template>
  <div class="m-5">
    <div v-if="locating" class="grid justify-center content-center h-screen text-3xl font-bold">
      Locating&hellip;
    </div>
    <div v-else-if="position" class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <div v-if="latitude" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Latitude</span> <span class="text-3xl">{{ latitude }}</span></div>
      <div v-if="longitude" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Longitude</span> <span class="text-3xl">{{ longitude }}</span></div>
      <div v-if="altitude" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Altitude</span> <span class="text-3xl">{{ altitude }} metres</span></div>
      <div v-if="heading" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Heading</span> <span class="text-3xl">{{ heading }}</span></div>
      <div v-if="speed" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Speed</span> <span class="text-3xl">{{ speed }} metres per second</span></div>
      <div v-if="mph" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Speed (mph)</span> <span class="text-3xl">{{ mph }} mph</span></div>
      <div v-if="accuracy" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Accuracy</span> <span class="text-3xl">+- {{ accuracy }} metres</span></div>
      <div v-if="altitudeAccuracy" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Altitude Accuracy</span> <span class="text-3xl">+- {{ altitudeAccuracy }} metres</span></div>
      <div v-if="timestamp" class="flex flex-col text-center p-5 border m-5 justify-center"><span class="text-xl mb-3">Last updated</span> <span class="text-3xl">{{ timestamp }}</span></div>
      <div class="flex flex-col text-center p-5 border m-5 justify-center">
        <a class="p-4 bg-blue-500 text-zinc-50 my-3 text-xl font-semibold" v-bind:href="`https://www.google.co.uk/maps/@${latitude},${longitude},17z`" target="_blank">Google Maps</a>
        <a class="p-4 bg-blue-500 text-zinc-50 my-3 text-xl font-semibold" v-bind:href="`https://www.openstreetmap.org/#map=17/${latitude}/${longitude}`" target="_blank">OpenStreetMap</a>
        <a class="p-4 bg-blue-500 text-zinc-50 my-3 text-xl font-semibold" v-bind:href="`https://www.bing.com/maps?lvl=17&cp=${latitude}~${longitude}`" target="_blank">Bing</a>
      </div>
    </div>
    <div v-else-if="errorMessage">{{ errorMessage }}</div>
    <div v-else class="grid justify-center content-center h-screen">
      <button v-on:click="startTracking" class="bg-blue-500 text-zinc-50 p-4 font-semibold text-2xl">Use my location</button>
    </div>
  </div>
</template>
