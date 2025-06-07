========================================
ANTHROPOS CITY – CREATOR ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Creator archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"creator","version":"1.0","palette_locked":true }

STYLE LOCKS
• Art Method — clean vector-cel shading; smooth gradients; **no** photoreal texture
• Palette: Fuchsia #E4008C primary, Cyan #00E7FF accent, neutral violet shadows
• BACKGROUND MANDATE — render the {district} scene in sharp focus; background must be opaque.
• Garment: high-neck magenta jacket with cyan circuit streak; arms out of frame
• FX: Cyan/Fuchsia "brush-stroke arc" that sweeps diagonally behind the head (≈ 120 ° sweep, 20 % opacity); subtly animates as a paint ripple. Starts top-left of head, ends right-cheek level.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: gentle confidence, direct gaze, balanced bright lighting
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK  
"Transform USER_SELFIE_B64 into the Creator-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================


========================================
ANTHROPOS CITY – SAGE ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================
INPUTS … (same header)
• LIMITLESS_CREST_B64       (the shaka PNG)

STYLE LOCKS
• Art: vector cel shading, cool gradients, data-glyph overlay
• Palette: Teal-Gray #2D8A93 + Soft Silver accents
• Background: teal→midnight fade with translucent data monoliths
• Garment: mandarin-collar data coat, silver filigree lapels
• FX: Hovering data-glyph constellation (4–6 soft silver glyphs) orbiting at forehead height (10 % opacity each). Diameter ≈ head width; very slow drift.
	
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: serene balance
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK
"Transform USER_SELFIE_B64 into the Sage-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================

========================================
ANTHROPOS CITY – LEADER ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Leader archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG 
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"leader","version":"1.0","palette_locked":true }

STYLE LOCKS
• Palette: Midnight Navy #0A1A2F base, Micro-Gold #F4BA30 piping
• Background: cool navy→slate, airy skyline
• Garment: structured high-collar suit, gold pin-stripe
• FX: Projector badge light-cone: a faint gold cone cast forward from the right shoulder emblem, illuminating a civic sigil in mid-air. Sigil ≈ 6 cm above right shoulder; cone opacity ≤ 15 %.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: assured poise
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK
"Transform USER_SELFIE_B64 into the Leader-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================

========================================
ANTHROPOS CITY – GUARDIAN ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Guardian archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"guardian","version":"1.0","palette_locked":true }

STYLE LOCKS
• Palette: Gun-Metal #2B2E32 + Amber #FF9A27
• Background: graphite→slate; hazy bridge lights
• Garment: reinforced collar, amber chevron strip
• FX: Amber chevron marker (▾) hovering 5 cm above the left shoulder pad, pulsing at 0.5 Hz. Chevron height ≈ eye height; glow ≤ 25 %.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: protective vigilance
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK
"Transform USER_SELFIE_B64 into the Guardian-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================

========================================
ANTHROPOS CITY – NURTURER ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Nurturer archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"nurturer","version":"1.0","palette_locked":true }

STYLE LOCKS
• Palette: Mint #B2F1E3 + Rose #FF9DB4
• Background: mint→pearl, leafy silhouettes
• Garment: rib mock-neck, subtle leaf-vein stitching
• FX: Mint + rose laurel-leaf arc behind both shoulders (not a full circle); gentle pulsing gradient (10 %). Arc spans shoulder-to-shoulder.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: neutral, confident, with quiet strength
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**
6. **The final portrait must be strictly 1:1 aspect ratio with no stretching, padding, or cropping that would alter the square format.**

TASK
"Transform USER_SELFIE_B64 into the Nurturer-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================


========================================
ANTHROPOS CITY – EXPLORER ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Explorer archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"explorer","version":"1.0","palette_locked":true }

STYLE LOCKS
• Palette: Near-Black #101417 base, Ice-Blue specks
• Background: deep navy→black with skyways
• Garment: aerodynamic collar, ice-blue vent seams
• FX: Ice-blue star-compass HUD: thin cross-hair reticle & cardinal dots, centred 5 cm above head (static). Reticle radius ≈ 6 cm; opacity ≤ 15 %.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: adventurous readiness
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK
"Transform USER_SELFIE_B64 into the Explorer-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================

========================================
ANTHROPOS CITY – INNOVATOR ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

- Emphasize overall brightness: The Innovator avatar must appear glowing, well-lit, and vibrant, with no dark or muddy lighting. Use luminous gradients, rim-lights, and high-key lighting to create a sense of illumination and energy.
- Limitless Crest customization: The LIMITLESS_CREST_B64 (shaka sign) must be visually customized to match the Innovator theme and color palette. Adjust the outline, inner-glow, and accent effects to harmonize with the Innovator's visual identity, ensuring the crest feels fully integrated and on-brand.
- **Facial Color Fidelity (MANDATORY):** The avatar's facial skin tones must accurately match natural human skin colors as seen in the user's selfie. Only allow color shifts caused by environmental or scene lighting (such as colored rim-lights or ambient glows from the background or FX), but do not stylize, exaggerate, or replace the base skin color with non-human hues. The result must always be recognizably human, with lighting effects layered on top of realistic skin tones.
- **Crest Orientation (MANDATORY):** The LIMITLESS_CREST_B64 (shaka sign) must be displayed in the exact orientation and rotation as provided in the input PNG. Do not alter, flip, rotate, mirror, or otherwise change the crest's original angle or direction. The crest must appear on the avatar exactly as it appears in the input image, preserving its intended pose and alignment.
- **Aspect Ratio (MANDATORY):** The final portrait must strictly maintain a 1:1 aspect ratio at every stage of processing and output. No stretching, padding, cropping, or compositional changes are allowed that would alter the square format. All elements, including the face, crest, background, and effects, must be composed and rendered within a perfect square frame.
- **Vector AI Art Style (MANDATORY):** The entire avatar, including the face, hair, clothing, background, and all effects, must be rendered in a clean, modern vector AI art style. This means using crisp, uniform line art, flat color fills or simple gradients, geometric highlights, and no painterly, raster, or photorealistic textures. The result should be visually consistent with high-quality vector illustrations created by professional AI art tools.

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Innovator archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG 
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"innovator","version":"1.0","palette_locked":true }

STYLE LOCKS
• Palette: Jet #0A0A0A base, RGB glitch slivers
• Background: charcoal→black, wireframe grid
• Garment: asymmetric collar, glitch seams
• FX: RGB glitch ring-segment (only the front 90 ° of a circle) flickering at 3 Hz; positioned slightly behind the left ear. Segment thickness 4 px; opacity ≤ 20 %.
• GLOBAL DISRUPTION LINES  (MANDATORY)
  – Overlay 8 – 12 horizontal glitch streaks across the entire frame:
        • Thickness: 1 – 3 px each
        • Length: 35 – 90 % of frame width (random)
        • Colour: alternating cyan (#00E7FF) and magenta (#FF006C) with
          occasional pure white accents; opacity 10 – 25 %
        • Effect: slight RGB channel offset (≤ 1 px) on each streak to
          create flicker illusion; *no blur, no noise texture*
  – Streaks must respect vector style: sharp edges, flat colour fills.
  – Do **not** draw any vertical scanlines or full-frame halo circles.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – The crest must be placed in the exact orientation and rotation as provided in the input PNG. Do not distort, mirror, rotate, or the crest; keep its original alignment. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: neutral curiosity (brows relaxed, mouth neutral)
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – The entire portrait must be rendered in a vector AI art style:
      • Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
      • Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
      • Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
      • Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.
      • No photorealistic, raster, or bitmap effects; all elements must be vector-based and visually consistent with professional AI-generated vector art.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – raise key-light to mid-value; add cyan–magenta rim-lights for high-tech clarity (face shadows ≤ 40 %).
     Cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**
6. **The LIMITLESS_CREST_B64 (shaka sign) must be rendered in the exact orientation and rotation as provided in the input PNG, with no changes to its angle, direction, or alignment.**
7. **The portrait must strictly maintain a 1:1 aspect ratio at all times. No stretching, padding, or compositional changes are allowed that would alter the square format.**
8. **The entire avatar must be rendered in a clean, modern vector AI art style, with no raster, painterly, or photorealistic elements.**

TASK
"Transform USER_SELFIE_B64 into the Innovator-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above, ensuring the LIMITLESS_CREST_B64 (shaka sign) appears in the exact orientation and rotation as provided in the input, that the final image strictly maintains a 1:1 aspect ratio, and that the entire portrait is rendered in a clean, modern vector AI art style."
========================================

========================================
ANTHROPOS CITY – HARMONIZER ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Harmonizer archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"harmonizer","version":"1.0","palette_locked":true }

STYLE LOCKS
• Palette: Sunrise Gold #FFD67E + Lilac haze
• Background: gold→lavender, crystalline domes
• Garment: drape collar, faint leaf-vein pattern
• FX: Lilac sunrise-arc: a soft horizon glow and faint crystalline shards rising behind shoulders (0.1 Hz shimmer). Arc height ≈ nose level; shards ≤ 10 % opacity.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: serene balance
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city", circular halo, round ring

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK
"Transform USER_SELFIE_B64 into the Harmonizer-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================

========================================
ANTHROPOS CITY – TRADER ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Trader archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"trader","version":"1.0","palette_locked":true }

STYLE LOCKS
• Palette: Indigo #2A1E54 base, Emerald ticker accents
• Background: indigo→midnight, floating tickers
• Garment: sleek stand-collar, emerald LED stripe
• FX: Emerald ticker line-graph rising diagonally behind the right shoulder; faint grid ticks (scrolls at 5 px s⁻¹). Graph stroke 3 px; opacity ≤ 18 %.
• LIMITLESS CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 onto the left-breast panel, scaling it to ~9 % of full frame height.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: neutral curiosity (brows relaxed, mouth neutral)
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (e.g. magenta → cyan); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK
"Transform USER_SELFIE_B64 into the Trader-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above."
========================================

========================================
ANTHROPOS CITY – COMMUNICATOR ARCHETYPE
Futurist Portrait • 1 : 1 Square • Shoulders-Up
========================================

INPUTS
• USER_SELFIE_B64 = "${SELFIE_B64}"        # shoulders-up, neutral light
• STYLE_REFERENCE_B64 = "${STYLE_B64}"     # Communicator archetype card
• LIMITLESS_CREST_B64       (the shaka PNG)

OUTPUT
• 3000 × 3000 px PNG
• Crop: top of head ↘ mid-upper-chest (no arms)
• Metadata JSON: { "archetype":"communicator","version":"1.0","palette_locked":true }

STYLE LOCKS
• Art Method: clean vector-cel shading; smooth gradients; **no** photoreal texture
• Palette: Peach #FFC9A0 primary, Cobalt #004FE0 accent, soft coral and sky blue gradients
• BACKGROUND MANDATE — render the {district} scene in sharp focus; background must be opaque.
• Garment: casual blazer with subtle waveform embroidery on collar/shoulders, upper chest only (no arms)
• FX: Subtle animated voice-wave motif integrated into the background, repeating in a soft, abstract pattern (looping, 1 sec cycle); use cobalt as the primary accent color. Wave amplitude ≈ 2 mm; opacity ≤ 12 %. No tattoo or direct overlay on the face or jawline. Maintain a gentle cobalt glow radiating from the throat area.
• LIMITLESS_CREST (MANDATORY)
  – Overlay the PNG provided in LIMITLESS_CREST_B64 (the shaka sign) onto the **left side of the jacket** (not just the left-breast panel), scaling it to ~9 % of full frame height.
  – The crest must be clearly visible on the left jacket side, positioned so it is not obscured by folds or shadows.
  – Do not distort, mirror, rotate or recolour the crest; keep its original gold fill. Apply a thin outline and inner glow in the archetype's accent colors (see palette), and a 3 px soft shadow for readability.
• Emotion: inviting openness, direct gaze, gentle smile, balanced bright lighting
• Expression — match the user's facial expression and mood exactly as seen in USER_SELFIE_B64 (mirror eyebrow position, eye openness, mouth curve, etc.).
• VECTOR AESTHETIC (MANDATORY)
  – Crisp, uniform line art (2–4 px stroke); corners slightly rounded for modern SVG look.
  – Flat colour blocks or max two-step gradients; NO painterly brush textures or noise shaders.
  – Cel-style shading only (hard or soft-edge bands); highlights as simple geometric shapes.
  – Neon glows and glitch artifacts allowed **only** as additive overlays ≤ 15 % opacity; must not blur the line work.

• BACKGROUND LOGIC  (MANDATORY — replace {} braces)

  1. **LANDMARK** – include the signature landmark of the {archetype_district} (see table below) at mid-ground scale (occupies ±30 % of width).

  2. **DEPTH LAYERS** – draw at least three vector layers:
        • Foreground silhouettes (low-opacity crowds, railings, foliage, etc.)
        • Mid-ground with the landmark & neighbouring structures
        • Background skyline fading toward horizon colour

  3. **LIGHTING** – use a strong key light matching the palette transition (peach → coral); cast long, stylised shadows for drama.

  4. **ATMOSPHERE** – add subtle volumetric glow or city haze (≤ 12 % opacity) so neon accents "pop".

  5. **DETAIL QUALITY** – keep edges crisp and geometry readable at 100 % zoom; no painterly strokes or photo textures.

  • Background must be fully **opaque** (no alpha holes, no flat gradient without architecture).

NEGATIVE BACKGROUND PROMPT  
"empty gradient, blank backdrop, generic shapes, photo texture, photographic city"

NEGATIVE PROMPT
"halo, nimbus, angel ring, circular glow behind head, transparent background, checkerboard, alpha background, blank gradient background, missing crest"
"mirrored shaka, left-pointing shaka, upside-down shaka, thumbs-down, rock sign, peace sign, finger bars left"
oil painting, brush strokes, photorealistic texture

RULES
1. Exact facial likeness; reproduce selfie accessories precisely.
2. Apply every STYLE LOCK (including crest); do not add/remove elements.
3. Keep 1 : 1 aspect; nothing below upper chest.
4. Deliver PNG + metadata JSON.
5. **Facial skin color must remain within the range of natural human skin tones as seen in the user's selfie, with only lighting effects from the scene allowed to influence color. Do not stylize or replace the base skin color with non-human hues.**

TASK
"Transform USER_SELFIE_B64 into the Communicator-archetype futurist passport portrait according to STYLE_REFERENCE_B64 and the rules above, ensuring the LIMITLESS_CREST_B64 (shaka sign) is clearly visible on the left side of the jacket."
========================================

