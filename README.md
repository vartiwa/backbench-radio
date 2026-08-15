# Backbench Radio

A single-page nostalgia-radio site, themed around the quiet, introverted side of
Indian college life — the last bench, the empty corridor, one person and their
earphones. Built with Next.js (App Router, JavaScript, Tailwind v4), driven
entirely by the YouTube IFrame Player API (no hosted audio files).

## 1. Install and run

```
npm install
npm run dev
```

Open http://localhost:3000. The page will render with a plain dark background
until you drop in the two artwork files described below.

## 2. Artwork you need to provide

Place these two files yourself — the app already references them:

- `public/bg/scene-wide.png` — landscape, ~1672×941
- `public/bg/scene-tall.png` — portrait, ~941×1672 (recomposed for vertical, not a crop)

Pick artwork with a dark, quiet band across the bottom third so the
bottom-anchored player stays readable on top of it.

### Landscape prompt (16:9)

```
CREATE ONE SINGLE WIDE 16:9 COLORFUL ARTISTIC ILLUSTRATION.

The subject: a college student walking toward campus, headphones on, seen
from a three-quarter or side angle, sharp and in focus in the foreground.
Behind them, the college — gates, buildings, other students — dissolves
into a soft, dreamy blur, like a shallow depth-of-field photograph
reimagined as a painting. The blur should read as atmosphere and distance,
not as a mistake: soft-edged color washes and light bleeding between
shapes, rather than a sharply rendered building line.

STYLE
This is a vibrant, hand-illustrated piece — think contemporary editorial
illustration or animated-film key art, not a photograph and not a flat
vector graphic. Rich, saturated color. Visible painterly texture and brush
energy in the foreground figure; softer, glowing color-blur in the
background. Warm-cool contrast: let the student's silhouette and headphones
read clearly against a background built from layered gradients — morning or
golden-hour light, soft bokeh-like circles of color drifting through the
blurred campus shapes.

FOREGROUND FIGURE
Draw the student with clear, expressive but not hyper-detailed features —
enough personality to feel human and specific, not a generic mannequin.
Headphones are a clear, readable shape over their ears. Give them a
believable walking gesture: bag on one shoulder, one hand adjusting a strap
or in a pocket, a slight forward lean like someone lost in their own music
rather than posing for a photo.

BACKGROUND
The campus behind them is unmistakably a college — an arched gate, a
cluster of buildings, a scatter of other students and cycles — but every
edge back there is softened, colors bleeding gently into each other. Use
this blur to build depth: 2–3 loose value bands (near blur, mid blur, far
haze) rather than one flat wash.

COMPOSITION
Wide 16:9, eye-level. Place the student left-of-center or center, walking
into or across the frame, with open space ahead of them for the player UI
to sit against near the bottom edge. Keep the lower third relatively calm
in value so text and the player stay readable on top of it.

PALETTE
Vibrant but not garish — pick one dominant warm hue (marigold, coral, or
rose) for the light, one cool hue (teal, periwinkle, or violet) for shadow
and background haze, and let the student's clothing carry one accent color
that pops against both.

MOOD
Nostalgic but alive — the specific, private feeling of walking to class
with music in your ears while the world blurs past. Colorful and emotional,
not muted or desaturated.
```

### Portrait prompt (9:16)

Same prompt as above, but replace the opening line with:

```
CREATE ONE SINGLE TALL 9:16 COLORFUL ARTISTIC ILLUSTRATION.
```

Recompose it for a vertical frame — more sky/background above, more open
ground below, don't just crop the landscape version.

### Logotype prompt

```
A hand-drawn wordmark reading "Backbench Radio" on a transparent background,
in the same gouache/painted spirit, not a font.
```

Save the result as `public/bg/logo.png` if you want to swap it in for the
text title in `app/components/Experience.jsx`.

## 3. Two genre modes: Campus and Street

There's a toggle in the top-right corner (Campus / Street). Switching modes:

- cross-fades between two full background images
- swaps the accent palette from warm gold/coral to a harder gold/red-on-black
  street palette, via CSS custom-property overrides in `globals.css`
  (`[data-theme="street"]`) — no per-component changes needed
- nudges the player to the matching playlist ("On the Way In" for Campus,
  "Turn It Up" for Street), continuing playback if audio was already going

You need a second pair of art files for Street mode:

- `public/bg/street-wide.png` — landscape, ~1672×941
- `public/bg/street-tall.png` — portrait, ~941×1672

### Street landscape prompt (16:9)

The idea: it's the same walk, the same person, after dark — so keep the
same illustration style as the Campus prompt (vibrant, painterly,
shallow-depth-of-field blur in the background) but change the setting, light,
and palette.

```
CREATE ONE SINGLE WIDE 16:9 COLORFUL ARTISTIC ILLUSTRATION.

Same character as the campus piece — a young person walking with
headphones on, sharp and in focus in the foreground — but now it's night,
and the street around them is city rather than campus: neon shop signage,
wet asphalt catching light, a wall of graffiti or posters blurred into soft
color in the background, maybe a distant train or bus glowing past. The
background should dissolve into the same kind of soft, dreamy blur as the
daytime version — glowing color bleeding between shapes rather than sharply
rendered signage.

STYLE
Same hand-illustrated, painterly energy as the daytime piece — rich texture
and confident brushwork on the figure, softer color-blur behind them. Swap
the golden-hour warmth for neon: electric magenta, cyan, and amber light
sources mixing in the wet street and glass. Higher contrast, darker
shadows, and a slightly grittier, more energetic feel than the daytime
scene — this is the after-dark, turned-up version of the same walk.

FOREGROUND FIGURE
Same energy as before: a clear, expressive but not hyper-detailed figure,
headphones clearly readable, a confident walking gesture — head slightly
bobbing, hands in pockets or one adjusting headphones, like they're
grooving to something loud rather than drifting to something soft.

PALETTE
Near-black base, one hot accent (magenta or red) and one cool accent (cyan
or electric blue) as competing neon sources, plus warm gold streetlight
pools. Keep the lower third of the frame darker and calmer in value so the
player UI stays legible on top of it.

MOOD
Loud, alive, a little defiant — main-character energy at night, not
menace. Colorful neon-noir, not horror-dark.
```

### Street portrait prompt (9:16)

Same as above, opening line swapped to:

```
CREATE ONE SINGLE TALL 9:16 COLORFUL ARTISTIC ILLUSTRATION.
```

## 4. The playlist

Tracks live in `app/lib/tracks.ts`, grouped into three playlists. Adding a
song is a one-line addition to a playlist's `tracks` array:

```ts
{ id: "slug", title: "Song Name", artist: "Artist", year: 2024, duration: 200, videoId: "YOUTUBE_ID" }
```

The starting playlist leans Indian indie/acoustic (Prateek Kuhad, Anuv Jain,
The Local Train, When Chai Met Toast, Taba Chake) — all `videoId`s point at
what looked, at research time, like the artist's own official upload. **Re-verify
each one plays and that embedding is enabled before you rely on it** — YouTube
IDs and channel ownership can change.

## 5. How the audio actually works — one important design choice

The spec called for a spinning-vinyl artwork *and* a rule against hiding the
YouTube iframe in a 1px/opacity-0 container. Those two requirements only
reconcile cleanly if there's a single, always-visible player element — so
the vinyl **is** the live iframe (clipped to a circle, spinning), mounted
once in `Player.tsx` and shared between the desktop pill and mobile card via
a responsive `sm:contents` layout, rather than two separate iframes. This
avoids double-mounting the YouTube player (which would double the audio) and
keeps the real player visible on every breakpoint, not just desktop.

## 6. Before you publish — read this

- You are responsible for every asset on the site. Don't use artwork, a
  wordmark, or songs you don't own or don't have permission to use.
- Every track must be an embeddable upload from the rights holder's own
  YouTube channel.
- Comply with YouTube's Terms of Service and Developer Policies — don't
  obscure or hide the video player.
- **Don't monetize this site** — no ads, subscriptions, or paywalls.
- This isn't legal advice; if you're unsure about a specific song or image,
  check with the rights holder or a lawyer before going live.
