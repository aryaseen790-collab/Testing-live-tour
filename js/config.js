// Site configuration.
//
// GOOGLE MAPS KEY
// Paste a Google Maps Platform API key with the "Map Tiles API" enabled to replace the
// procedural aerial view with Google's Photorealistic 3D Tiles. Leave it empty to use the
// built-in procedural community.
//   • Restrict the key to your site's domain (HTTP referrer restriction) in Google Cloud
//     Console — it ships to the browser, so anyone can read it.
//   • For quick testing you can also pass it in the URL instead:  index.html?gkey=YOUR_KEY
//   • Force the procedural aerial with:  index.html?google=0
export const GOOGLE_MAPS_API_KEY = '';

// Optional: URL of the official Google logo image (see Google Maps Platform attribution
// guidelines). If empty, a "Google" text wordmark is shown alongside the data credits.
export const GOOGLE_LOGO_URL = '';

// Where the aerial view is centred (degrees). Ground height is metres above the WGS84
// ellipsoid (≈ terrain elevation + geoid offset; ~15 m works for Dubai Hills).
export const AERIAL_CENTER = { lat: 25.1085, lon: 55.2540, groundHeight: 15 };

// Landmark the camera frames on the horizon.
export const LANDMARK = { lat: 25.19724, lon: 55.27437, name: 'Burj Khalifa' };

// Real-world pin positions for the 8 streets on the Google aerial (degrees), in the same
// order as STREETS in main.js. Fine-tune these to sit exactly on the streets you sell.
export const STREET_PINS = [
  { lat: 25.1018, lon: 55.2478 },
  { lat: 25.1031, lon: 55.2512 },
  { lat: 25.1046, lon: 55.2548 },
  { lat: 25.1060, lon: 55.2584 },
  { lat: 25.1072, lon: 55.2620 },
  { lat: 25.1003, lon: 55.2531 },
  { lat: 25.1016, lon: 55.2567 },
  { lat: 25.1029, lon: 55.2603 },
];
