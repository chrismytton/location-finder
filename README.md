# location-finder

Get your current latitude, longitude and altitude. Uses the Geolocation API to display a readout of your current position and renders it on a minimal webpage.

## Development

Serve the `public/` directory with any static file server:

```sh
python -m http.server -d public
```

Then open http://localhost:8000.

## Deployment

The site is deployed to GitHub Pages automatically on push to `master`. No build step is needed — the contents of `public/` are uploaded directly.
