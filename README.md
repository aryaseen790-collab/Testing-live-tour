# Choose your villa · Dubai Hills

An interactive, scroll-driven 3D property tour, built with Three.js and no image or video assets. Everything (the community, palms, golf course, skyline and the furnished villa) is generated procedurally in the browser.

## The flow

1. **Drop your pin.** You start with an aerial view over the community, with the golf course and the city skyline on the horizon. Scroll, use the arrows or the dots, or hover the streets to browse the 8 streets. Click a street (or *Drop your pin*) to choose it.
2. **Drive down the street.** The camera dives from the sky to street level. Scroll to drive down the palm-lined street. Floating pins show villa numbers and their status. Click the orange pin to jump straight to your villa.
3. **Walk through the villa.** Step through the pivot door into a double-height entrance hall with a floating stair, then the living room (blue velvet sofas, zebra rug, bubble chandelier, wood-slat ceiling), the dining room, the walnut and marble kitchen, the pool terrace and the golf-course view. To move, scroll or use the *View the…* button. You can also jump between rooms with the progress rail on the right.
4. **"Is this your home?"** At the end you look back at the house. Choose *Yes* to see the *Welcome home* card. It shows a live render of the villa's front, its specs, a *Book a private viewing* form and *Start again*. *No* flies you back up to choose another street.

## Google Photorealistic 3D aerial (optional)

With a Google Maps API key, step 1 opens over the **real** Dubai Hills, streamed live with Google's Photorealistic 3D Tiles and framed towards the Burj Khalifa. Clicking a street pin dives into the map, then cross-fades into the street-level tour. *All streets*, *No* and *Start again* fly you back up into the real map.

1. In [Google Cloud Console](https://console.cloud.google.com/), create or choose a project with billing enabled. Then enable the **Map Tiles API**.
2. Create an API key. Restrict it to the **Map Tiles API** and to your site's domain (HTTP referrers), because the key is visible in the browser.
3. Paste it into `GOOGLE_MAPS_API_KEY` in `js/config.js`. To test without editing files, open `index.html?gkey=YOUR_KEY` instead.
4. Adjust `STREET_PINS` in `js/config.js` so the 8 pins sit on the streets you're selling. Adjust `AERIAL_CENTER` if you want a different framing.

Notes:
- Without a key, or with `?google=0`, the site uses the built-in procedural aerial. If the tiles fail to load (bad key, API not enabled, quota), the site falls back to it automatically and shows a short notice.
- Google requires its logo and the data credits to be visible while the map is on screen. The page shows the tiles' data credits bottom-left. Set `GOOGLE_LOGO_URL` to the official logo image from Google's attribution guidelines. Until you do, a "Google" text wordmark is shown.
- Tiles are streamed live and are not cached or saved, as Google's terms require. Usage is billed per session by Google.

## Controls

| Input | Action |
|---|---|
| Mouse wheel / trackpad / touch swipe | Browse streets (step 1) · move through the tour |
| ← → ↑ ↓ / Page Up / Page Down / Space | Same as scrolling |
| Enter | Drop your pin on the selected street |
| Esc | Back to all streets |

## Run locally

It's a static site. The page uses ES modules, so serve it over HTTP:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Three.js r170, [3d-tiles-renderer](https://github.com/NASA-AMMOS/3DTilesRendererJS) 0.5.4 and the Draco decoder are vendored in `vendor/`, so no build step or CDN is needed. The only external requests are the Inter web font and, when a key is set, Google's tiles.

## Structure

```
index.html        markup for every UI layer (picker, tour HUD, prompt, final card)
css/style.css     glassmorphism UI, stage/section driven visibility, responsive rules
js/config.js      Google key, aerial centre, landmark, real-world street pin coordinates
js/google.js      Google Photorealistic 3D Tiles aerial (loaded only when a key is set)
js/main.js        renderer, camera timeline, scroll/touch/keyboard input, street picker, pins, UI state
js/world.js       sky shader, desert, golf course, skyline, streets, instanced villas, palms, lamps
js/villa.js       the hero villa: exterior, furnished ground floor, stair, chandeliers, pool terrace
js/textures.js    procedural canvas textures (travertine, marble, walnut, zebra rug, grass, fronds…)
```

To change street names, villa numbers or specs, edit `STREETS` in `js/main.js`. To change the camera path, edit `KEYS` (positions are in villa-local metres) and `WEIGHTS` (scroll distance per segment).
