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
    setInterval(() => {
      this.now = Date.now()
    }, 1000)
  },
  methods: {

    onPositionUpdate(position) {
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
    },
    copy(value) {
      if (!navigator.clipboard) {
        this.displayMessage('Copy not supported', { background: 'bg-red-500' })
        return
      }
      if (value === undefined || value === null || value === '' || value === '&nbsp;') {
        this.displayMessage('Nothing to copy', { background: 'bg-red-500' })
        return
      }
      navigator.clipboard.writeText(value)
      this.displayMessage()
    },
    displayMessage(message, { background = 'bg-green-500', duration = 2000 } = {}) {
      const el = document.createElement('div')
      el.classList.add(
        background,
        'fixed',
        'top-0',
        'left-0',
        'right-0',
        'mx-auto',
        'w-1/2',
        'text-white',
        'text-center',
        'rounded',
        'p-2',
        'z-50',
        'mt-3'
      )
      el.innerText = message || 'Copied to clipboard'
      document.body.appendChild(el)
      setTimeout(() => {
        document.body.removeChild(el)
      }, duration)
    },
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
      const seconds = Math.ceil((this.now - this.timestamp.getTime()) / 1000)
      if (seconds < 10) {
        return 'Just now'
      } else if (seconds < 60) {
        return `${seconds} seconds ago`
      } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} minutes ago`
      } else if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)} hours ago`
      } else {
        return `${Math.floor(seconds / 86400)} days ago`
      }
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
      const { heading } = this.coords
      if (!heading) {
        return '&nbsp;'
      }

      // Santiy check
      if (heading < 0 || heading > 360) {
        throw new Error('Invalid heading')
      }

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
    <div v-if="position" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 min-w-0">
      <div @click="copy(latitude)" class="flex flex-col gap-3 rounded-xl text-center p-5 border justify-center">
        <span class="text-xl">Latitude</span>
        <span class="text-3xl" v-bind:title="locationAccuracy">{{ latitude }}</span>
      </div>
      <div @click="copy(longitude)" v-if="longitude" class="flex flex-col gap-3 rounded-xl text-center p-5 border justify-center">
        <span class="text-xl">Longitude</span>
        <span class="text-3xl" v-bind:title="locationAccuracy">{{ longitude }}</span>
      </div>
      <div @click="copy(altitude)" v-if="altitude" class="flex flex-col gap-3 text-center rounded-xl p-5 border justify-center">
        <span class="text-xl">Altitude</span>
        <span class="text-3xl">{{ altitude }} meters</span>
        <span>+-{{ altitudeAccuracy }} meters</span>
      </div>
      <div @click="copy(heading)" class="flex flex-col gap-3 text-center rounded-xl p-5 border justify-center">
        <span class="text-xl">Heading</span>
        <span class="text-3xl" v-html="heading"></span>
      </div>
      <div @click="copy(mph)" v-if="mph" class="flex flex-col gap-3 text-center rounded-xl p-5 border justify-center">
        <span class="text-xl">Miles per hour</span>
        <span class="text-3xl">{{ mph }} mph</span>
      </div>
      <div @click="copy(kph)" v-if="kph" class="flex flex-col gap-3 text-center rounded-xl p-5 border justify-center">
        <span class="text-xl">Kilometers per hour</span>
        <span class="text-3xl">{{ kph }} km/h</span>
      </div>
      <div @click="copy(speed)" v-if="speed" class="flex flex-col gap-3 text-center rounded-xl p-5 border justify-center">
        <span class="text-xl">Meters per second</span>
        <span class="text-3xl">{{ speed }} m/s</span>
      </div>
      <div @click="copy(JSON.stringify(geoJSON, null, 2))" v-if="geoJSON" class="flex flex-col gap-3 p-5 rounded-xl border justify-center">
        <span class="text-xl text-center">GeoJSON</span>
        <pre class="overflow-x-scroll shadow-inner p-3">{{ geoJSON }}</pre>
      </div>
      <div v-if="altitude" @click="copy(wktWithAltitude)" class="flex flex-col text-center rounded-xl p-5 border justify-center">
        <span class="text-xl mb-3">WKT</span>
        <pre class="overflow-x-scroll shadow-inner p-3">{{ wktWithAltitude }}</pre>
      </div>
      <div v-else @click="copy(wkt)" class="flex flex-col text-center rounded-xl p-5 border justify-center">
        <span class="text-xl mb-3">WKT</span>
        <pre class="overflow-x-scroll shadow-inner p-3">{{ wkt }}</pre>
      </div>
      <div class="flex flex-col text-center rounded-xl p-5 border justify-center">
        <span class="text-xl mb-3">Maps</span>
        <a class="p-4 bg-blue-500 text-zinc-50 my-3 text-xl font-semibold" v-bind:href="`https://www.google.co.uk/maps/@${latitude},${longitude},17z`" target="_blank">Google Maps</a>
        <a class="p-4 bg-blue-500 text-zinc-50 my-3 text-xl font-semibold" v-bind:href="`https://www.openstreetmap.org/#map=17/${latitude}/${longitude}`" target="_blank">OpenStreetMap</a>
        <a class="p-4 bg-blue-500 text-zinc-50 my-3 text-xl font-semibold" v-bind:href="`https://www.bing.com/maps?lvl=17&cp=${latitude}~${longitude}`" target="_blank">Bing</a>
      </div>
      <div @click="copy(timestamp)" v-if="timestamp" class="flex flex-col text-center rounded-xl p-5 border justify-center">
        <span class="text-xl mb-3">Last updated</span>
        <span class="text-3xl" v-bind:title="timestamp">{{ relativeTimestamp }}</span>
      </div>
    </div>
    <div v-else-if="locating" class="grid justify-center content-center h-screen text-3xl font-bold">
      Locating&hellip;
    </div>
    <div v-else-if="errorMessage">{{ errorMessage }}</div>
    <div v-else class="grid justify-center content-center h-screen">
      <button v-on:click="startTracking" class="bg-blue-500 text-zinc-50 p-4 font-semibold text-2xl">Use my location</button>
    </div>
  </div>
</template>
