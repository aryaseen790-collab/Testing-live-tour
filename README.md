# Choose your villa · Dubai Hills

An interactive, scroll-driven 3D property tour, built with Three.js and no image or video assets. Everything (the community, palms, golf course, skyline and the furnished villa) is generated procedurally in the browser.

## The flow

1. **Drop your pin.** You start with an aerial view over the community, with the golf course and the city skyline on the horizon. Scroll, use the arrows or the dots, or hover the streets to browse the 8 streets. Click a street (or *Drop your pin*) to choose it.
2. **Drive down the street.** The camera dives from the sky to street level. Scroll to drive down the palm-lined street. Floating pins show villa numbers and their status. Click the orange pin to jump straight to your villa.
3. **Walk through the villa.** Step through the pivot door into a double-height entrance hall with a floating stair, then the living room (blue velvet sofas, zebra rug, bubble chandelier, wood-slat ceiling), the dining room, the walnut and marble kitchen, the pool terrace and the golf-course view. To move, scroll or use the *View the…* button. You can also jump between rooms with the progress rail on the right.
4. **"Is this your home?"** At the end you look back at the house. Choose *Yes* to see the *Welcome home* card. It shows a live render of the villa's front, its specs, a *Book a private viewing* form and *Start again*. *No* flies you back up to choose another street.

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

Three.js r160 is vendored in `vendor/`, so the site works offline. The only external request is the Inter web font from Google Fonts.

## Structure

```
index.html        markup for every UI layer (picker, tour HUD, prompt, final card)
css/style.css     glassmorphism UI, stage/section driven visibility, responsive rules
js/main.js        renderer, camera timeline, scroll/touch/keyboard input, street picker, pins, UI state
js/world.js       sky shader, desert, golf course, skyline, streets, instanced villas, palms, lamps
js/villa.js       the hero villa: exterior, furnished ground floor, stair, chandeliers, pool terrace
js/textures.js    procedural canvas textures (travertine, marble, walnut, zebra rug, grass, fronds…)
```

To change street names, villa numbers or specs, edit `STREETS` in `js/main.js`. To change the camera path, edit `KEYS` (positions are in villa-local metres) and `WEIGHTS` (scroll distance per segment).
