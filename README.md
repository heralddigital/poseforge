# PoseForge

A web app that generates very detailed, natural-looking lifestyle photo prompts (pose, outfit, location, camera body, lens, angle, lighting, composition, colour grade, realism details and more) for pasting into Higgsfield or any image generator. Every prompt is saved to a History tab where you mark it as unused, generated, posted or rejected.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 26 tests
npm run build && npm start
```

Requires Node 20+. Deploy to Vercel by importing the repo (no environment variables needed).

## Using it

- **Generate**: Randomize (or press `R`), or batch ×5 / ×10 / ×25. Choose length (Full 250–400 words, Condensed 150–220, Short 60–100), format (paragraph / structured), aspect ratio, pronoun and a realism slider (more or fewer imperfection details).
- **Style**: *Girl next door* (default) biases picks toward everyday looks: phone cameras, natural makeup, casual and cosy outfits, home / café / street settings, candid poses, warm smiles and realistic imperfections, and adds one short "girl-next-door feel" line to each prompt. *Standard mix* turns the bias off. It only changes weights; compatibility rules still apply. Tune it in `lib/style.ts`.
- **Cards**: *Details* shows every part of the prompt. `↻` re-rolls just that part; `pin` keeps that choice in all future generations. Length and format can be switched per card.
- **Filters**: setting, time of day, season/weather, outfit vibe, shot type and camera look. Options inside a group are OR-ed, groups are AND-ed. If your filters are so narrow the engine has to break a compatibility rule, you get a warning.
- **History**: infinite scroll, status filters, search (prompt text, title, notes), star, notes, bulk select (mark / reject / export / delete) and JSON / CSV export. Import accepts the app's own JSON. Deletes and bulk status changes have **Undo**.
- **Library**: edit every option pool: text, weight, tags, requires / excludes, enable / disable, add / delete. In option text, `|` separates detail levels (Short uses the first part, Condensed the first two, Full all of them).
- **Settings**: Character lock (text prepended to every prompt, so the same person is described identically each time), always-append text, never-include words, template editor, storage backend.
- **Shortcuts** (when not typing in a field): `R` randomize, `C` copy the latest prompt, `U` mark the latest as generated, `/` search history.

## How the prompts stay coherent

Each option carries tags. Picks are made in order (location → time → wardrobe → … ) and later picks must satisfy earlier tags (`requires` / `excludes`), plus global conflict pairs and rules in `lib/rules.ts` (for example no sun lighting at night, a mirror selfie needs a phone and a mirror angle, swimwear needs a water setting, busy hands mean no extra props). A look-ahead check avoids dead ends and a de-duplication guard avoids repeating a recent location + pose combination. All of it is deterministic per seed.

Measured on this build (my own test runs, not an external benchmark): 6000 default-settings generations produced no rule relaxations and every option in every pool was picked at least once. Filter combinations that are physically contradictory (for example a gym vibe in a winter coquette outfit set) can still force a rule to relax. A final residual case I know of: shot type = "full" alone can leave the framing category unresolved; the UI shows the warning.

## Data and storage

- Default: IndexedDB in your browser (one record per prompt). **Clearing site data deletes it**, so export JSON now and then. This deliberately replaces the localStorage mentioned in the original brief because of its small quota.
- Optional Supabase (Settings → Storage): run `docs/supabase.sql`, enter URL + anon key. The adapter uses plain fetch against PostgREST. **It has not been tested against a live Supabase project.** The provided policies are open to anyone with your anon key; read the warning in the SQL file before using real data.

## Editing

- Pools: `data/pools-*.ts` (seed DSL: `s(text, tags, requires, excludes, weight)`), or live in the Library tab (stored per browser).
- Templates: Settings → Templates, defaults in `lib/templates.ts`. `[[optional block]]` vanishes if any placeholder inside is empty.
- Rules: `lib/rules.ts`.

## Caveats you should know

- **Camera and lens specs are unverified.** I wrote the body and lens descriptions (sensor sizes, apertures, focal lengths) from general knowledge without checking manufacturer spec sheets; some models or details may be wrong or outdated. Check any you care about.
- **Higgsfield behaviour is untested.** I did not test these prompts in Higgsfield, and I don't know its prompt-length limits or how closely it follows detailed camera terms. Prompts are 250–400 words in Full mode; if results degrade, use Condensed or Short. Camera and lens wording may influence the look only loosely in AI image models.
- The re-rolled prompts keep their original seed field for display, so a re-rolled prompt is stored with its exact selections but cannot be regenerated from the seed alone.
- Not implemented from the original brief: swipe gestures on History cards and a dedicated Supabase sync-conflict UI (last write wins).
- Tested here: unit tests (26), type-check, lint, production build and a headless-browser smoke test (generate, save, reload persistence, status change, tab switching). Not tested: other browsers, mobile layouts, and Supabase.

## Sample output (default settings, "Full", paragraph, seeds 2026 / 777 / 31415)

**Seed 2026 - Golden Hour Vineyard Rows – Standing**

> Unposed influencer-style photograph: her standing with her back to the camera looking out at the view, arms relaxed at her sides, head turned slightly in profile, gazing off-camera into the distance, a faint thoughtful frown, attention clearly elsewhere. Props: a cardigan or light jacket draped over one arm, soft fabric folding, a casual, just-in-case air. She is wearing a pale pink lace-trimmed cardigan over a ribbon-strap camisole, a pleated white mini skirt, ballet flats, with a bucket hat in cream canvas, a soft slouch, shading the top of her face. Hair: a sleek low ponytail, tight, glossy and parted down the center, a single smooth line down her back. Makeup: a sun-kissed bronzed look, freckles visible through a light tint, a warm glow on the cheeks. Shot in vineyard rows in warm countryside, vines receding toward a stone farmhouse, a dirt track between the plants, green plants and trailing foliage in the background, layered leaf shapes, a fresh, natural backdrop, during golden hour, low warm sun and glowing highlights, long soft shadows. Lighting: golden hour backlight with a warm rim light, the sun low behind her and glowing around the hair edges, about 3200K warm tones. Equipment: shot on a Sony A7R V, a 61MP full-frame sensor, exceptionally fine detail, with a Sony FE 35mm f/1.4 GM, a natural storytelling field of view, smooth subject separation. Perspective: shot from behind, her back to the lens, a view over her shoulder toward the scene; an outfit-focused framing from chin to knees, her face partly cropped, an editorial fashion feel; moderately shallow depth of field, her face crisp while the background is gently softened, a natural separation; frozen sharp action, a fast shutter around 1/1000s, every strand and fold crisp. Compose it as layered depth with foreground, subject and background, three clear planes of interest, a rich dimensionality, in a vertical 4:5 frame. Look: a Kodak Ektar 100 look, vivid saturated color, clean strong reds and blues, slightly overexposed highlights on bright surfaces and subtle moisture and shine on the lips. Mood: an off-duty model mood, casual and unstudied, an easy cool. High-fidelity photograph, coherent lighting and shadows, believable materials, crisp and natural.

**Seed 777 - Night Cocktail Bar – Crouching Low to Tie**

> She is captured in a natural, unposed lifestyle photo, crouching low to tie her shoe, one knee near the ground, head bowed in focus, biting her lower lip lightly while trying not to laugh, eyes bright, a shy, amused look. Outfit: a vintage-washed band tee knotted at the waist, low-rise straight jeans, platform sneakers; accessories: a slim silver ear cuff and a couple of tiny studs, a clean piercing stack and a delicate gold chain necklace with a tiny pendant, resting on the collarbone; hair: voluminous blowout waves, bouncy and glossy, movement at the ends; makeup: a clean bare face with natural skin texture, tinted lip balm, visible pores and freckles. Held: no other props in frame, her hands occupied only by what the pose describes. Location: a cocktail bar with dark wood and amber back-bar lighting, brass fixtures and leather stools, bottles glowing behind the counter, the faint glow of a neon sign, a pink and blue wash on the wall, a night-city accent. Time and weather: a night with neon signs reflecting, colorful glow on every surface, a dark sky above. Light: a narrow spotlight pool, a beam isolating her against dark surroundings, a dramatic falloff. Shot on a Leica Q3, a 60MP full-frame fixed-lens compact, crisp and elegant rendering; lens: the fixed 28mm f/1.7 Summilux lens, a wide yet intimate perspective, crisp detail with a soft blur; angle: eye-level, a straightforward, honest perspective, the lens at her chin height; framing: an outfit-focused framing from chin to knees, her face partly cropped, an editorial fashion feel; focus: layered focus with a blurred foreground element, a sharp subject and softly blurred background, a sense of depth; shutter: a soft handheld sway implying a candid snapshot, a tiny bit of edge softness, an organic look. Composition: a casually cropped candid composition, part of her body cut by the frame edge, an unposed spontaneous feel, vertical 4:5 frame. Grade: a Kodak Gold 200 look, warm yellow highlights, nostalgic golden tones; details: natural fabric creases at the elbows and waist and a faint lens flare drifting in from one corner. Mood: a getting-ready-for-a-night-out mood, anticipation and polish, a spark of confidence. Photorealistic, anatomically correct hands and fingers, natural proportions, believable lighting.

**Seed 31415 - Midday Sunlit Kitchen – Adjusting Her Sunglasses**

> Candid lifestyle photograph of her adjusting her sunglasses with one hand, chin tilted slightly down, fingertips catching the frame. Expression: turned in profile with her gaze on the horizon, jaw line clean against the light, a composed stillness. Props and hands: no other props in frame, her hands occupied only by what the pose describes. She is wearing a lightweight cream linen co-ord set, matching wide shorts and an open-collar shirt, slim leather sandals, with small diamond-cut crystal drop earrings, a subtle sparkle, elegant and light. Hair: a claw clip twisted up at the back of her head, loose strands at the neck, a casual half-up shape. Makeup: a pink monochrome look, blush swept over the cheeks and lids, a glossy lip. The setting is a sunlit kitchen with a marble island, open wooden shelves and a ceramic bowl of fruit, soft morning light on the counter, with a window with sheer curtains behind her, diffused daylight softening the edges, a quiet domestic calm, during bright daylight pouring through the windows, clean airy light and soft window shadows, a fresh, open mood. Lighting: light through sheer curtains, billowing soft light and a gentle gradient across the frame, a dreamy low contrast. Shot on a Hasselblad X2D 100C, a 100MP medium-format sensor, a smooth, creamy tonal transition, with a Hasselblad XCD 38V f/2.5, a medium-format wide perspective, clean, expansive detail. Camera angle: a chest-height documentary angle, the lens level with her sternum, a natural, human perspective. Framing: a detail shot of the hands, jewelry and a small object, the face only partly in frame, an editorial still-life feel. Depth of field: deep depth of field, foreground to background all acceptably sharp, a clear environmental context. Shutter: frozen sharp action, a fast shutter around 1/1000s, every strand and fold crisp. Composition: a casually cropped candid composition, part of her body cut by the frame edge, an unposed spontaneous feel, in a vertical 4:5 frame. Color grade: a high-contrast editorial grade, deep blacks and bright highlights, clean skin. Realism details: a few stray strands of hair across the face and natural skin texture with visible pores and tiny freckles. Mood: an effortless-luxury mood, understated, polished and calm, quiet confidence without effort. High-fidelity photograph, coherent lighting and shadows, believable materials, crisp and natural.
