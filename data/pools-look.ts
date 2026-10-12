import { build, s } from './seed';

const AESTHETICS = ['cleangirl', 'oldmoney', 'streetwear', 'cozy', 'luxtravel', 'athleisure', 'boho', 'minimalist', 'y2k', 'coquette', 'quietluxury', 'gymcore'];

/**
 * Look pools: color grade & film stock, mood, imperfection & realism details, technical quality tail.
 *
 * Mood options carry aesthetic tags (cleangirl oldmoney streetwear cozy luxtravel athleisure boho
 * minimalist y2k coquette quietluxury gymcore). Moods without an aesthetic tag are "neutral" and pass
 * any vibe filter.
 *
 * Imperfection / tech options tagged `real` become more likely as the Realism Intensity slider rises.
 */

export const grade = build('grade', [
  s('a Kodak Portra 400 color palette|warm skin tones and soft pastel highlights|gentle contrast|a creamy mid-tone roll-off', 'film warm portra'),
  s('a Fujifilm Pro 400H-inspired palette|pastel greens and cool-leaning skin|airy highlights|a fresh, light feel', 'film pastel cool'),
  s('a Kodak Gold 200 look|warm yellow highlights|nostalgic golden tones|lightly saturated greens', 'film warm', '', '', 1.2),
  s('a Kodak Ektar 100 look|vivid saturated color|clean strong reds and blues|fine grain', 'film vivid', 'sunny|golden|outdoor', 'night'),
  s('a Fujifilm Superia 400 look|slightly cool shadows with green tinges|punchy mid-tones|everyday film charm', 'film cool', '', '', 1.0),
  s('a CineStill 800T look|tungsten-balanced color with a red halation glow around highlights|teal shadows|a moody night palette', 'film halation cool', 'night|artificial|blue|neon', '', 1.0),
  s('a Kodak Vision3 500T cinematic look|soft halation|rich blacks and warm highlights|an elegant film-still finish', 'film cinematic halation', 'night|artificial|blue|neon|overcast'),
  s('an Ilford black and white look|rich contrast and fine grain|deep blacks and luminous highlights|a timeless monochrome finish', 'bw film', '', '', 0.3),
  s('a Kodak Tri-X-style black and white|gritty contrast|pronounced grain|a documentary feel', 'bw film', '', '', 0.2),
  s('a muted VSCO-style tone|desaturated greens|lifted blacks|a soft matte finish', 'muted matte', '', '', 1.2),
  s('a clean bright iPhone HDR look|accurate natural color|crisp but gentle contrast|a polished everyday feel', 'clean phone-look', 'body-phone', '', 1.5),
  s('a teal-and-orange cinematic grade|warm skin against cool shadows|a controlled contrast|a polished movie-still look', 'cinematic warm cool', '', '', 1.0),
  s('a warm faded matte look|lifted black point|soft peach highlights|a gentle nostalgic wash', 'muted matte warm', '', '', 1.2),
  s('a clean Instagram-bright color grade|fresh whites and natural skin|slightly lifted exposure|a polished social look', 'clean bright', '', '', 1.5),
  s('a moody desaturated green-teal grade|deep shadows|restrained color|a quiet cinematic feel', 'cool moody cinematic', 'overcast|night|blue|rain|artificial', 'sunny', 0.9),
  s('a cool minimal Scandinavian palette|crisp whites|pale blue shadows|a clean airy finish', 'cool clean minimal', '', 'neon night', 0.9),
  s('a sun-bleached summer palette|bright warm highlights|faded blues|a hazy holiday feel', 'warm bright', 'sunny|summer|golden', 'night winter', 1.0),
  s('a high-contrast editorial grade|deep blacks and bright highlights|clean skin|a magazine-like finish', 'contrast editorial', '', '', 0.8),
  s('a soft pastel lifestyle grade|creamy peach and baby blue tones|gentle contrast|a dreamy delicate finish', 'pastel soft', '', 'night', 1.0),
  s('a Portra 160-style soft palette|low contrast and fine grain|natural skin|a quiet understated tonality', 'film soft', '', '', 1.0),
  s('a vintage 70s warm grade|amber highlights and faded greens|soft vignetting|a nostalgic feel', 'film warm retro', '', '', 0.9),
  s('a rich autumn palette|deep oranges and browns|muted greens|a warm earthy mood', 'warm earthy', 'autumn|golden|trees|nature', 'neon', 0.8),
  s('a cool blue-hour palette|deep cobalt shadows|warm lit windows|a calm contrast', 'cool blue', 'blue|dusk|night', '', 1.0),
  s('a pink-and-cyan neon grade|saturated magenta glow|cool shadows|a nightlife energy', 'neon cinematic', 'neon|nightlife', '', 1.0),
  s('a flash-lit disposable camera look|a warm cast|coarse grain and a slightly crunchy contrast|an authentic snapshot feel', 'film disposable', 'cam-disposable'),
  s('an early-2000s digicam look|blown highlights|slightly oversharpened detail|a nostalgic noisy finish', 'digicam retro', 'cam-digicam'),
  s('an instant-film look|a soft vignette and a warm chemical cast|slightly washed contrast|a dreamy imperfect tone', 'instant film', 'cam-polaroid'),
  s('a medium-format film look|creamy skin and a smooth tonal gradation|fine grain|a luxurious softness', 'film mf', 'mf', '', 1.0),
  s('a warm film-fade grade|slightly lifted blacks and warm mid-tones|a faint grain|a gentle nostalgic mood', 'film warm', '', '', 1.0),
  s('a bright airy white-balance look|overexposed highlights kept clean|soft pastel skin|a fresh morning feel', 'clean bright pastel', 'morning|sunny|window|day', 'night', 1.0),
  s('a deep rich chocolate-brown grade|warm shadows|creamy highlights|a quiet-luxury palette', 'warm moody luxury', 'indoor|evening|night|golden', '', 0.8)
]);

const moodRaw = build('mood', [
  s('a quiet Sunday morning mood|unhurried and gentle|a soft private warmth', 'cleangirl cozy minimalist', 'morning|dawn'),
  s('a spontaneous city adventure mood|curious and light on {poss} feet|an unplanned day out', 'streetwear luxtravel'),
  s('a post-workout glow|healthy, calm and proud|a quiet endorphin ease', 'athleisure gymcore'),
  s('a getting-ready-for-a-night-out mood|anticipation and polish|a spark of confidence', 'y2k coquette quietluxury', 'evening|night|blue|dusk'),
  s('a slow-travel holiday mood|relaxed and unscheduled|a sense of having nowhere to be', 'luxtravel boho oldmoney'),
  s('a cozy at-home comfort mood|soft textures and slow time|a contented stillness', 'cozy cleangirl'),
  s('an effortless-luxury mood|understated, polished and calm|quiet confidence without effort', 'quietluxury oldmoney'),
  s('a café-hopping weekend mood|small pleasures and good light|a casual in-the-moment feeling', 'cleangirl minimalist'),
  s('a main-character city mood|cinematic and self-assured|everyday life framed like a film', 'streetwear y2k'),
  s('a romantic, dreamy mood|soft pastel feelings|a delicate nostalgia', 'coquette boho'),
  s('a clean-girl morning routine mood|fresh skin and tidy details|a calm reset', 'cleangirl minimalist', 'morning|dawn|indoor'),
  s('a vintage-inspired mood|old-world elegance|a refined, timeless air', 'oldmoney quietluxury'),
  s('a sun-soaked summer freedom mood|bare shoulders and bright light|a carefree ease', 'boho luxtravel', 'sunny|summer|golden', 'night winter cold'),
  s('a cold-weather cozy mood|warm layers and a warm drink|a snug winter calm', 'cozy oldmoney', 'winter|cold|snow|autumn|rain|overcast'),
  s('a street-style editorial mood|bold, deliberate and effortless|a confident, relaxed stance', 'streetwear'),
  s('a Y2K nostalgia mood|glossy, playful and a little cheeky|a throwback spark', 'y2k'),
  s('a gym-core determination mood|focused and calm|an unhurried discipline', 'gymcore athleisure'),
  s('a gentle wanderlust mood|discovery and wonder|a lightness of heart', 'luxtravel boho'),
  s('a minimalist calm mood|clean lines and quiet space|a pared-back peace', 'minimalist cleangirl'),
  s('a late-night glow mood|neon and warm light|a soft after-hours pulse', 'y2k streetwear', 'night|blue'),
  s('a coquette dollcore mood|soft bows and sweet detail|a lightly playful innocence', 'coquette'),
  s('a hotel-lobby jet-set mood|polished, assured and unhurried|a travelled elegance', 'luxtravel quietluxury'),
  s('an off-duty model mood|casual and unstudied|an easy cool'),
  s('a sleepy slow-morning mood|soft light and warm blankets|a lazy contentment', 'cozy cleangirl', 'morning|dawn'),
  s('a golden-hour nostalgia mood|warmth and fading light|a bittersweet softness', '', 'golden|sunset'),
  s('a playful weekend mood|lighthearted and bright|a laughing ease'),
  s('a reflective solo mood|quiet thoughts and open space|a calm self-possession'),
  s('a classic old-money weekend mood|a country-club ease|polished but never stiff', 'oldmoney quietluxury athleisure'),
  s('a bohemian wandering mood|loose layers and sunlit trails|a free-spirited ease', 'boho'),
  s('a snowy-day hush mood|muffled quiet and rosy cheeks|a gentle stillness', 'cozy', 'snow|winter|cold|outdoor'),
  s('a travel-day mood|in transit, relaxed and curious|a sense of arrival and adventure', 'luxtravel minimalist', 'travel'),
  s('a polished business-casual mood|calm authority|a quiet professional ease', 'quietluxury minimalist oldmoney')
]);

/** A mood with aesthetic tags is only eligible when the wardrobe already carries one of them. */
export const mood = moodRaw.map((o) => {
  const a = o.tags.filter((tag) => AESTHETICS.includes(tag));
  return a.length ? { ...o, requires: [...(o.requires ?? []), a.join('|')] } : o;
});

export const imperfection = build('imperfection', [
  s('subtle film grain across the image', 'real film-ish'),
  s('a faint lens flare drifting in from one corner', 'real', 'sunny|golden|neon|night'),
  s('natural skin texture with visible pores and tiny freckles', 'real', '', '', 1.6),
  s('flyaway hairs catching the light along the edge of the head', 'real', '', '', 1.4),
  s('mild vignetting toward the corners', 'real'),
  s('slightly overexposed highlights on bright surfaces', 'real'),
  s('minor focus softness toward the frame edges', 'real'),
  s('natural fabric creases at the elbows and waist', 'real', '', '', 1.4),
  s('a tiny trace of motion blur in the fingertips', 'real', 'candid|walking|motion'),
  s('a very slightly tilted horizon', 'real', '', 'closeup', 0.9),
  s('a faint smudge-like softness suggesting a fingerprint on the lens', 'real', 'body-phone', '', 0.5),
  s('slightly uneven skin tone with natural redness around the nose and cheeks', 'real', '', '', 1.0),
  s('small asymmetries in the face and hair that feel human', 'real', '', '', 1.2),
  s('light digital noise in the shadows', 'real digital-ish', 'night|blue|artificial|indoor'),
  s('a soft highlight bloom around bright lights', 'real', 'night|neon|blue|golden|sunny'),
  s('a slightly crooked collar and an untucked hem', 'real', 'needs-full|walking|candid', '', 0.8),
  s('a soft chromatic fringe along high-contrast edges', 'real', '', 'film', 0.6),
  s('dust specks and a hint of grain on the negative', 'real', 'film', '', 0.8),
  s('a faint orange light leak along one edge of the frame', 'real', 'film', '', 0.6),
  s('slightly crushed shadows with a hint of color noise', 'real', 'night|artificial|indoor', '', 0.7),
  s('a few stray strands of hair across the face', 'real', 'wind|outdoor|candid', '', 1.0),
  s('slightly shiny skin on the forehead and nose, unretouched', 'real', '', '', 0.9),
  s('fine peach fuzz catching the backlight', 'real', 'sunny|golden', 'night', 0.7),
  s('smart-HDR style tone mapping with gently flattened shadows', 'real', 'body-phone', '', 1.0),
  s('slight oversharpening typical of smartphone processing', 'real', 'body-phone', '', 0.8),
  s('subtle moisture and shine on the lips', 'real', '', '', 0.8),
  s('uneven natural lighting with one side slightly brighter', 'real', '', '', 0.9),
  s('a slightly blown sky in the upper corner', 'real', 'outdoor sunny|golden|overcast', 'night', 0.7),
  s('soft lens breathing and gentle edge falloff', 'real digital-ish', 'body-ilc', '', 0.6),
  s('visible fabric texture and tiny lint specks on the clothing', 'real', '', '', 0.9),
  s('slightly imperfect framing with a bit of extra space on one side', 'real', '', '', 0.8),
  s('natural under-eye texture and fine lines around the smile', 'real', '', '', 0.8)
]);

export const tech = build('tech', [
  s('ultra-detailed, photorealistic, natural color, high dynamic range, sharp focus on the eyes', 'clean', '', 'cam-polaroid cam-disposable cam-digicam'),
  s('photorealistic, lifelike skin texture, accurate color, crisp focus on the eyes, no retouching', 'real'),
  s('hyper-realistic candid photograph, natural light behavior, believable skin and fabric detail, sharp eyes', 'real'),
  s('professional lifestyle photograph, high resolution, true-to-life color, clean detail', 'clean', '', 'cam-polaroid cam-disposable cam-digicam'),
  s('unretouched, authentic and candid, photorealistic skin, believable lens behavior, fine detail', 'real', '', '', 1.2),
  s('8K resolution, ultra-sharp detail, natural color science, rich dynamic range', 'clean', '', 'cam-polaroid cam-disposable cam-digicam', 0.7),
  s('photojournalistic realism, honest light, natural imperfections, sharp focus on the eyes', 'real'),
  s('editorial-quality photograph, natural skin rendering, balanced exposure, precise focus', 'clean', '', 'cam-polaroid cam-disposable cam-digicam'),
  s('raw, unedited social-media photograph, natural tones, genuine texture, realistic anatomy and hands', 'real', '', '', 1.2),
  s('photorealistic, anatomically correct hands and fingers, natural proportions, believable lighting', 'clean real', '', '', 1.1),
  s('true-to-life photograph, subtle grain, natural color, believable depth, sharp focus on the face', 'real'),
  s('high-fidelity photograph, coherent lighting and shadows, believable materials, crisp and natural', 'clean', '', 'cam-polaroid cam-disposable cam-digicam')
]);
