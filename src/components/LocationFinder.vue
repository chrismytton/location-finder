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
      now: Date.now()
    };
  },
  created() {
    if (localStorage.getItem('gpsSuccess')) {
      this.startTracking()
    }
    setInterval(() => {
      this.now = Date.now()
    }, 1000)
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
    relativeTimestamp() {
      if (!this.position) {
        return;
      }
      return Math.ceil((this.now - this.timestamp.getTime()) / 1000)
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
        return 'Unknown'
      }
      const { heading } = this.coords
      if (heading > 337.5 || heading <= 22.5) {
        return 'North'
      } else if (heading > 22.5 && heading <= 67.5) {
        return 'North-East'
      } else if (heading > 67.5 && heading <= 112.5) {
        return 'East'
      } else if (heading > 112.5 && heading <= 157.5) {
        return 'South-East'
      } else if (heading > 157.5 && heading <= 202.5) {
        return 'South'
      } else if (heading > 202.5 && heading <= 247.5) {
        return 'South-West'
      } else if (heading > 247.5 && heading <= 292.5) {
        return 'West'
      } else if (heading > 292.5 && heading <= 337.5) {
        return 'North-West'
      } else {
        throw new Error('Invalid heading')
      }
    },
    speed() {
      if (!this.coords.speed) {
        return "0"
      }
      return this.coords.speed.toFixed(1);
    },
    mph() {
      if (!this.coords.speed) {
        return "0"
      }
      return (this.coords.speed * 2.237).toFixed(1)
    },
    kph() {
      if (!this.coords.speed) {
        return "0"
      }
      return (this.coords.speed * 3.6).toFixed(1)
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
    locationAccuracy() {
      if (!this.accuracy) {
        return
      }
      return `+- ${ this.accuracy } meters`
    },
    errorMessage() {
      if (!this.error.code || !this.error.message) {
        return "";
      }
      return `ERROR(${this.error.code}): ${this.error.message}`;
    },
    geoJSON() {
      if (!this.position) {
        return
      }
      return {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [this.longitude, this.latitude]
        },
        properties: {
          timestamp: this.timestamp,
          altitude: this.altitude,
          heading: this.heading,
          speed: this.speed,
          accuracy: this.accuracy,
          altitudeAccuracy: this.altitudeAccuracy,
          locationAccuracy: this.locationAccuracy,
          errorMessage: this.errorMessage
        }
      }
    },
    wkt() {
      if (!this.position) {
        return
      }
      return `POINT(${this.longitude} ${this.latitude})`
    },
    wktWithAltitude() {
      if (!this.position) {
        return
      }
      return `POINT(${this.longitude} ${this.latitude} ${this.altitude})`
    },
  }
};
</script>

<template>
  <div class="m-5">
    <div v-if="locating" class="grid justify-center content-center h-screen text-3xl font-bold">
      Locating&hellip;
    </div>
    <div v-else-if="position" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <div v-if="latitude" class="flex flex-col gap-3 text-center p-5 border justify-center">
        <span class="text-xl">Latitude</span>
        <span class="text-3xl" v-bind:title="locationAccuracy">{{ latitude }}</span>
      </div>
      <div v-if="longitude" class="flex flex-col gap-3 text-center p-5 border justify-center">
        <span class="text-xl">Longitude</span>
        <span class="text-3xl" v-bind:title="locationAccuracy">{{ longitude }}</span>
      </div>
      <div v-if="altitude" class="flex flex-col text-center p-5 border justify-center"><span class="text-xl mb-3">Altitude</span> <span class="text-3xl mb-3">{{ altitude }} meters</span><span>+-{{ altitudeAccuracy }} meters</span></div>
      <div v-if="heading" class="flex flex-col text-center p-5 border justify-center"><span class="text-xl mb-3">Heading</span> <span class="text-3xl">{{ heading }}</span></div>
      <div v-if="mph" class="flex flex-col text-center p-5 border justify-center"><span class="text-xl mb-3">Miles per hour</span> <span class="text-3xl">{{ mph }} mph</span></div>
      <div v-if="mph" class="flex flex-col text-center p-5 border justify-center"><span class="text-xl mb-3">Kilometers per hour</span> <span class="text-3xl">{{ kph }} km/h</span></div>
      <div v-if="speed" class="flex flex-col text-center p-5 border justify-center"><span class="text-xl mb-3">Meters per second</span> <span class="text-3xl">{{ speed }} m/s</span></div>
      <div v-if="timestamp" class="flex flex-col text-center p-5 border justify-center"><span class="text-xl mb-3">Last updated</span> <span class="text-3xl" v-bind:title="timestamp">{{ relativeTimestamp }} seconds ago</span></div>
      <div v-if="geoJSON" class="flex flex-col p-5 border justify-center"><span class="text-xl mb-3 text-center">GeoJSON</span> <pre class="overflow-x-scroll shadow-inner p-3">{{ geoJSON }}</pre></div>
      <div v-if="altitude" class="flex flex-col text-center p-5 border justify-center overflow-x-scroll"><span class="text-xl mb-3">WKT</span> <pre class="overflow-x-scroll shadow-inner p-3">{{ wktWithAltitude }}</pre></div>
      <div v-else class="flex flex-col text-center p-5 border justify-center overflow-x-scroll"><span class="text-xl mb-3">WKT</span> <pre class="overflow-x-scroll shadow-inner p-3">{{ wkt }}</pre></div>
      <div class="flex flex-col text-center p-5 border justify-center">
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
