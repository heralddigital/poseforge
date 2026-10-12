import { build, s } from './seed';

/**
 * Camera pools: camera body, lens, depth of field, angle, composition, framing, motion.
 *
 * Camera look tags (used by the camera-look filter): phone digital film compact cinema
 * Body identity tags are referenced by lens options so only plausible pairings occur:
 *   body-phone, body-ilc (digital interchangeable), mount-e mount-rf mount-z mount-x mount-m mount-fd,
 *   mount-p67 mount-xcd, cam-<name> for fixed-lens bodies, mount-cine.
 * Lens speed/class tags (used by depth-of-field options): fast mid slow wide normal portrait tele mf vintage
 *   phone-lens deep zoom anamorphic cine.
 *
 * NOTE: lens and body names are real products, but you should verify focal-length/aperture claims
 * against the model you are prompting (see README).
 */

export const camera = build('camera', [
  // phones
  s('shot on an iPhone 15 Pro main camera|a 48MP sensor with natural computational processing|slight smart-HDR tone mapping', 'phone body-phone'),
  s('shot on an iPhone 16 Pro main camera|clean modern smartphone rendering|a gently lifted shadow range', 'phone body-phone'),
  s('shot on an iPhone front-facing selfie camera|a slightly wide perspective|soft smartphone skin smoothing', 'phone body-phone selfie-cam'),
  // full-frame / APS-C digital
  s('shot on a Sony A7 IV|a 33MP full-frame mirrorless sensor|clean accurate colors', 'digital body-ilc mount-e'),
  s('shot on a Sony A7R V|a 61MP full-frame sensor|exceptionally fine detail', 'digital body-ilc mount-e'),
  s('shot on a Sony A7C II|a compact full-frame body|a natural lifelike rendering', 'digital body-ilc mount-e'),
  s('shot on a Canon EOS R5|a 45MP full-frame sensor|warm, flattering skin tones', 'digital body-ilc mount-rf'),
  s('shot on a Canon EOS R6 Mark II|a 24MP full-frame sensor|soft, smooth tonality', 'digital body-ilc mount-rf'),
  s('shot on a Canon EOS R8|a lightweight full-frame body|natural skin rendering', 'digital body-ilc mount-rf'),
  s('shot on a Nikon Z8|a 45MP full-frame stacked sensor|neutral, true-to-life color', 'digital body-ilc mount-z'),
  s('shot on a Nikon Z6 III|a 24MP full-frame sensor|smooth, natural highlights', 'digital body-ilc mount-z'),
  s('shot on a Fujifilm X-T5|a 40MP APS-C sensor|characteristic Fuji color science', 'digital body-ilc mount-x'),
  s('shot on a Fujifilm X-Pro3|an APS-C rangefinder-style body|a rich filmic color rendering', 'digital body-ilc mount-x'),
  s('shot on a Leica M11|a 60MP full-frame rangefinder|a classic Leica color and micro-contrast', 'digital body-ilc mount-m'),
  s('shot on a Hasselblad X2D 100C|a 100MP medium-format sensor|a smooth, creamy tonal transition', 'digital body-ilc mount-xcd mf'),
  // compacts with a fixed lens
  s('shot on a Fujifilm X100V|a 26MP APS-C sensor in a fixed-lens compact|a discreet street-photography feel', 'compact digital cam-x100'),
  s('shot on a Fujifilm X100VI|a 40MP APS-C sensor in a fixed-lens compact|a discreet street-photography feel', 'compact digital cam-x100'),
  s('shot on a Leica Q3|a 60MP full-frame fixed-lens compact|crisp and elegant rendering', 'compact digital cam-q3'),
  s('shot on a Ricoh GR III|a pocketable APS-C compact|a high-contrast snapshot character', 'compact digital cam-gr'),
  s('shot on a vintage early-2000s compact digicam|a small CCD sensor|slightly harsh flash and blown highlights', 'compact digital cam-digicam'),
  // film
  s('shot on a Contax T2|a 35mm film point-and-shoot|a Carl Zeiss lens look with rich contrast', 'film compact cam-t2'),
  s('shot on a Canon AE-1|a 35mm film SLR|a warm, nostalgic character', 'film mount-fd body-filmslr'),
  s('shot on a Pentax 67|a 6x7 medium-format film body|a large-negative smoothness and depth', 'film mf mount-p67 body-filmslr'),
  s('shot on a disposable film camera|a plastic lens and a built-in flash|a raw, imperfect snapshot', 'film compact cam-disposable', '', '', 0.9),
  s('shot on a Polaroid instant camera|a square instant-film frame|soft, dreamy chemical color', 'film cam-polaroid', '', '', 0.7),
  // cinema
  s('shot on an ARRI Alexa Mini LF|a large-format cinema sensor|a smooth filmic highlight rolloff', 'cinema digital body-cine mount-cine'),
  s('shot on a Sony FX3|a full-frame cinema body|clean, cinematic video-still rendering', 'cinema digital body-cine mount-cine'),
  s('shot on a Blackmagic Pocket Cinema Camera 6K|a Super 35 sensor|a filmic organic image', 'cinema digital body-cine mount-cine', '', '', 0.8)
]);

export const lens = build('lens', [
  // phone lenses
  s('the iPhone main 24mm-equivalent lens at about f/1.8|a wide natural perspective|deep focus in most of the scene', 'phone-lens wide deep', 'body-phone', 'selfie-cam'),
  s('the iPhone 2x crop at about 48mm-equivalent|a more flattering portrait perspective|subtle background softening', 'phone-lens normal deep', 'body-phone', 'selfie-cam'),
  s('the iPhone telephoto at about 77mm-equivalent|a flattering compressed portrait perspective|a gentle background blur', 'phone-lens portrait', 'body-phone', 'selfie-cam'),
  s('the iPhone 0.5x ultra-wide at about 13mm-equivalent|exaggerated depth and edge stretching|a deep, everything-sharp frame', 'phone-lens wide deep', 'body-phone', 'selfie-cam', 0.6),
  s('the front-facing camera|a wide-angle selfie perspective|an arm-length selfie distance', 'phone-lens wide deep selfie', 'selfie-cam'),
  // Sony E mount
  s('a Sony FE 24mm f/1.4 GM|wide environmental perspective|crisp corners and smooth bokeh', 'fast wide', 'mount-e'),
  s('a Sony FE 35mm f/1.4 GM|a natural storytelling field of view|smooth subject separation', 'fast wide normal', 'mount-e'),
  s('a Sony FE 50mm f/1.2 GM|a classic portrait perspective|a razor-thin focal plane with creamy blur', 'fast normal', 'mount-e'),
  s('a Sony FE 85mm f/1.4 GM|a flattering portrait compression|beautiful subject separation', 'fast portrait', 'mount-e'),
  s('a Sony FE 70-200mm f/2.8 GM II at 135mm|a compressed telephoto perspective|strong background separation', 'mid tele zoom', 'mount-e'),
  s('a Sony FE 24-70mm f/2.8 GM II at 35mm|a versatile natural perspective|sharp, clean rendering', 'mid wide normal zoom', 'mount-e'),
  s('a Sony FE 16-35mm f/2.8 GM at 16mm|a dramatic wide perspective|a strong sense of space', 'mid wide zoom', 'mount-e', '', 0.7),
  // Canon RF
  s('a Canon RF 35mm f/1.8 Macro IS STM|a natural lifestyle perspective|gentle background softness', 'mid wide normal', 'mount-rf'),
  s('a Canon RF 50mm f/1.2L USM|a classic portrait perspective|dreamy shallow depth of field', 'fast normal', 'mount-rf'),
  s('a Canon RF 85mm f/1.2L USM|a flattering portrait compression|a creamy blurred background', 'fast portrait', 'mount-rf'),
  s('a Canon RF 28-70mm f/2L at 35mm|a fast zoom perspective|rich subject separation', 'fast wide normal zoom', 'mount-rf'),
  s('a Canon RF 24-70mm f/2.8L IS USM at 28mm|a wide natural perspective|sharp and clean', 'mid wide zoom', 'mount-rf'),
  s('a Canon RF 70-200mm f/2.8L IS USM at 135mm|a compressed telephoto perspective|smooth background blur', 'mid tele zoom', 'mount-rf'),
  // Nikon Z
  s('a Nikon Z 85mm f/1.2 S|a flattering portrait compression|a luscious, fall-off bokeh', 'fast portrait', 'mount-z'),
  s('a Nikon Z 50mm f/1.2 S|a classic natural perspective|a smooth tonal rendering', 'fast normal', 'mount-z'),
  s('a Nikon Z 35mm f/1.8 S|a natural everyday perspective|clean sharp detail', 'mid wide normal', 'mount-z'),
  s('a Nikon Z 24-70mm f/2.8 S at 24mm|a wide-angle environmental perspective|crisp edge sharpness', 'mid wide zoom', 'mount-z'),
  s('a Nikon Z 70-200mm f/2.8 VR S at 135mm|a compressed telephoto perspective|strong separation', 'mid tele zoom', 'mount-z'),
  s('a Nikon Z 135mm f/1.8 S Plena|a tight portrait perspective|a beautifully smooth background', 'fast tele portrait', 'mount-z'),
  // Fuji X
  s('a Fujifilm XF 23mm f/1.4 R LM WR|a 35mm-equivalent natural perspective|gentle depth and character', 'fast wide normal', 'mount-x'),
  s('a Fujifilm XF 33mm f/1.4 R LM WR|a 50mm-equivalent classic perspective|an organic rendering', 'fast normal', 'mount-x'),
  s('a Fujifilm XF 56mm f/1.2 R|an 85mm-equivalent portrait perspective|a soft dreamy blur', 'fast portrait', 'mount-x'),
  s('a Fujifilm XF 16mm f/1.4 R WR|a 24mm-equivalent wide perspective|a lively sense of space', 'fast wide', 'mount-x'),
  s('a Fujifilm XF 90mm f/2 R LM WR|a 135mm-equivalent short telephoto|a smooth, compressed background', 'mid tele portrait', 'mount-x'),
  // Leica M
  s('a Leica Summilux-M 35mm f/1.4 ASPH|a classic documentary perspective|a gentle glow at the edges', 'fast wide normal vintage', 'mount-m'),
  s('a Leica Summilux-M 50mm f/1.4 ASPH|a classic natural perspective|elegant micro-contrast', 'fast normal', 'mount-m'),
  s('a Leica Noctilux-M 50mm f/0.95 ASPH|an ultra-fast portrait perspective|dreamy glowing bokeh', 'fast normal vintage', 'mount-m'),
  s('a Leica APO-Summicron-M 75mm f/2 ASPH|a refined portrait perspective|crisp detail with a smooth blur', 'mid portrait', 'mount-m'),
  s('a Leica Summilux-M 28mm f/1.4 ASPH|a wide yet natural perspective|a lively, intimate feel', 'fast wide', 'mount-m'),
  // Canon FD
  s('a Canon FD 50mm f/1.4 S.S.C.|a vintage standard perspective|a soft, dreamy glow and gentle vignetting', 'fast normal vintage', 'mount-fd'),
  s('a Canon FD 28mm f/2.8|a vintage wide perspective|an old-school snapshot character', 'mid wide vintage', 'mount-fd'),
  s('a Canon FD 85mm f/1.8|a vintage portrait perspective|soft glowing highlights', 'fast portrait vintage', 'mount-fd'),
  // Pentax 67
  s('an SMC Pentax 67 105mm f/2.4|a medium-format standard portrait perspective|a smooth, large-negative blur', 'fast mf portrait vintage', 'mount-p67'),
  s('an SMC Pentax 67 90mm f/2.8 leaf-shutter lens|a medium-format wide-normal perspective|a delicate tonal smoothness', 'mid mf normal vintage', 'mount-p67'),
  s('an SMC Pentax 67 55mm f/4|a medium-format wide perspective|deep detailed focus', 'slow mf wide vintage', 'mount-p67'),
  // Hasselblad XCD
  s('a Hasselblad XCD 80mm f/1.9|a medium-format portrait perspective|a silky smooth background', 'fast mf portrait', 'mount-xcd'),
  s('a Hasselblad XCD 55V f/2.5|a medium-format natural perspective|a refined, gentle falloff', 'mid mf normal', 'mount-xcd'),
  s('a Hasselblad XCD 38V f/2.5|a medium-format wide perspective|clean, expansive detail', 'mid mf wide', 'mount-xcd'),
  s('a Hasselblad XCD 90V f/2.5|a medium-format short-telephoto perspective|elegant subject isolation', 'mid mf tele portrait', 'mount-xcd'),
  // fixed lenses
  s('the fixed 23mm f/2 lens (about 35mm-equivalent)|a natural street-photography perspective|gentle depth of field', 'mid wide normal', 'cam-x100'),
  s('the fixed 28mm f/1.7 Summilux lens|a wide yet intimate perspective|crisp detail with a soft blur', 'fast wide', 'cam-q3'),
  s('the fixed 28mm f/2.8 GR lens|a snapshot wide perspective|a bold, contrasty look', 'slow wide', 'cam-gr'),
  s('the fixed 38mm f/2.8 Carl Zeiss Sonnar lens|a classic compact perspective|rich contrast and a soft glow', 'mid normal', 'cam-t2'),
  s('the plastic fixed wide-angle lens (roughly 30mm-equivalent)|a small aperture with soft edges|an everything-in-focus snapshot feel', 'slow wide deep vintage', 'cam-disposable'),
  s('the built-in fixed plastic lens of the instant camera|soft focus with slightly dreamy edges|a vintage instant look', 'slow normal deep vintage', 'cam-polaroid'),
  s('the built-in small zoom lens at the wide end|a slightly soft, over-sharpened look|small-sensor noise', 'slow wide deep vintage', 'cam-digicam'),
  // cinema lenses
  s('a Cooke S4/i 32mm T2|a warm classic cinema rendering|gentle focus falloff', 'fast wide cine', 'mount-cine'),
  s('a Zeiss Supreme Prime 50mm T1.5|a crisp, clean cinema perspective|a smooth bokeh', 'fast normal cine', 'mount-cine'),
  s('an ARRI Signature Prime 35mm T1.8|a large-format cinema perspective|a soft organic transition', 'fast wide cine', 'mount-cine'),
  s('an Atlas Orion 50mm T2 anamorphic lens|a wide cinematic frame with oval bokeh|subtle horizontal flares', 'mid normal cine anamorphic', 'mount-cine')
]);

export const dof = build('dof', [
  s('razor-thin depth of field with creamy bokeh|focus locked on the near eye|a background melting into soft color', 'optical-shallow', 'fast|portrait', 'phone-lens deep'),
  s('moderately shallow depth of field|{poss} face crisp while the background is gently softened|a natural separation', 'mid-dof', 'fast|mid', 'deep'),
  s('deep depth of field|foreground to background all acceptably sharp|a clear environmental context', 'deep-dof', 'wide|slow|deep'),
  s('layered focus with a blurred foreground element|a sharp subject and softly blurred background|a sense of depth', 'optical-shallow', 'fast|portrait', 'phone-lens'),
  s('a zone-focused snapshot look|everything from a couple of meters to infinity reading sharp|an unfussy documentary feel', 'deep-dof', 'cam-disposable|cam-t2|cam-gr|cam-digicam|cam-polaroid|slow'),
  s('a medium-format falloff|a gentle subject separation and a smooth tonal transition|a creamy depth', 'mf-dof', 'mf'),
  s('telephoto compression with a strongly blurred background|a flattened perspective|{poss} face sitting inside a soft wash', 'tele-dof', 'tele|portrait', 'phone-lens'),
  s('wide-angle environmental sharpness with subtle foreground distortion|a deep field of view|a vivid sense of place', 'deep-dof', 'wide', '', 0.9),
  s('swirly bokeh with cat-eye highlights toward the frame edges|vintage lens character|a dreamy glow around highlights', 'optical-shallow', 'vintage fast', 'phone-lens deep'),
  s('background lights rendered as soft round bokeh discs|shallow focus|a glittering depth', 'optical-shallow', 'fast|portrait night|blue|neon', 'phone-lens deep'),
  s('natural phone-camera depth|a tiny sensor keeping most of the scene sharp|a mild background softness', 'phone-dof', 'phone-lens', '', 1.4),
  s('a computational portrait-style blur|a slightly artificial edge falloff|clean cutout softness around the hair', 'phone-dof', 'phone-lens portrait'),
  s('a cinematic shallow focus with oval anamorphic bokeh|horizontal flares|a rich, widescreen depth', 'cine-dof', 'anamorphic'),
  s('a cinematic mid-range depth|crisp subject and softly resolved surroundings|a filmic roll-off', 'cine-dof', 'cine', '', 1.0)
]);

export const angle = build('angle', [
  s('eye-level|a straightforward, honest perspective|the lens at {poss} chin height', 'angle-eye', '', 'mirror-selfie', 1.6),
  s('a slightly low angle|the camera just below {poss} chin height|a subtle sense of presence|{poss} frame gently elongated', 'angle-low', '', 'mirror-selfie'),
  s('a high angle looking gently down|the lens above eye level|a flattering softness around the jaw|a hint of vulnerability', 'angle-high', '', 'mirror-selfie'),
  s('an overhead top-down angle|looking straight down on {obj}|a graphic composition against the surface', 'angle-top', 'lying', 'mirror-selfie'),
  s('a subtle Dutch tilt|a few degrees of horizon lean|a playful off-kilter energy', 'angle-dutch', '', 'mirror-selfie', 0.8),
  s('an over-the-shoulder angle|the lens just behind one shoulder|{poss} profile in soft focus', 'angle-ots', '', 'mirror-selfie', 0.7),
  s('a through-the-glass framing with faint reflections|the window surface softening the scene|an observing, voyeuristic distance', 'angle-glass', 'window|mirror-ok', 'mirror-selfie', 0.7),
  s('a mirror-selfie perspective|the phone visible in the reflection|a casual chest-height framing', 'angle-mirror mirror-angle', 'mirror-selfie body-phone'),
  s('shot from behind|{poss} back to the lens|a view over {poss} shoulder toward the scene', 'angle-behind', 'turned-away', 'eye-contact'),
  s('a three-quarter profile angle|the lens at about forty-five degrees|a flattering facial structure', 'angle-34', '', 'mirror-selfie', 1.4),
  s('a low-to-the-ground angle|the lens near knee height|a heroic upward tilt|{poss} legs elongated', 'angle-ground', 'needs-full|sit', 'mirror-selfie closeup'),
  s('a slightly high arm-length selfie angle|the phone held above eye level|a close, intimate distance', 'angle-selfie selfie', 'body-phone selfie-cam', 'mirror-selfie'),
  s('a friend-took-this candid angle|the lens at chest height|a casual slightly off-center capture', 'angle-candid', '', 'mirror-selfie', 1.3),
  s('a chest-height documentary angle|the lens level with {poss} sternum|a natural, human perspective', 'angle-chest', '', 'mirror-selfie'),
  s('a frontal head-on angle|the lens square to {poss} shoulders|a calm symmetrical presence', 'angle-front', '', 'mirror-selfie turned-away'),
  s('a gentle high three-quarter angle from a balcony or step above|looking down toward {obj}|the environment spreading out below', 'angle-high', 'steps|balcony|railing', 'mirror-selfie'),
  s('a hip-level snapshot angle|the camera at {poss} waist height|a spontaneous unaimed feel', 'angle-hip', '', 'mirror-selfie', 0.8),
  s('a tripod-timer angle|the lens stable at about hip height|a slightly distant natural framing', 'angle-tripod', 'needs-full', 'mirror-selfie closeup'),
  s('an upward angle from a seated position|the lens near the floor|a dramatic stretch of vertical lines', 'angle-ground', 'steps|floor|street', 'mirror-selfie'),
  s('a profile angle|the lens at 90 degrees to {poss} face|a clean silhouette against the background', 'angle-profile', '', 'mirror-selfie eye-contact', 0.8),
  s('a tilted-down angle through foliage|leaves framing the edge|a secretive observed feel', 'angle-foliage', 'trees|plants', 'mirror-selfie', 0.7),
  s('a shoulder-height angle from slightly behind and above|the lens trailing {obj} as {subj} walks|a following-shot feel', 'angle-follow', 'walking', 'mirror-selfie', 0.8),
  s('a 35mm-style street angle|the lens at about chest height|a spontaneous passer-by perspective', 'angle-street', 'street', 'mirror-selfie', 0.8),
  s('a reflection-in-water angle|the lens near the surface|the subject mirrored below', 'angle-reflect', 'water', 'mirror-selfie', 0.5),
  s('a cropped angle from just beside the subject|a partial frame cutting off one edge|a candid unplanned look', 'angle-cropped', '', 'mirror-selfie', 0.8)
]);

export const composition = build('composition', [
  s('the subject placed on the right third of the frame|the left two-thirds left for context and light|a balanced asymmetry', 'comp-thirds'),
  s('the subject placed on the left third of the frame|the right side opening onto the scene|a gentle sense of space', 'comp-thirds'),
  s('a centered symmetrical composition|the subject standing dead center|clean equal weight on both sides', 'comp-center', 'wall|door|steps|indoor'),
  s('leading lines converging toward {obj}|the architecture drawing the eye inward|a strong depth cue', 'comp-lines', 'street|steps|railing|wall|path'),
  s('generous negative space above {obj}|a clean sky or wall for breathing room|a minimal editorial balance', 'comp-neg'),
  s('a frame-within-a-frame using a doorway or window|the edges darkening slightly|the subject nested in the opening', 'comp-frame', 'door|window|steps'),
  s('a softly blurred foreground element at the edge of the frame|leaves or objects out of focus|a layered sense of depth', 'comp-fg', 'grass|trees|plants|table|street|window'),
  s('an environmental portrait with the subject small in the scene|the setting telling the story|a wide breathing frame', 'comp-env', '', 'closeup detail'),
  s('a diagonal composition|strong angled lines running across the frame|a dynamic energy', 'comp-diag', 'steps|street|railing|wall|path|floor'),
  s('a golden-ratio composition|the eye drawn to {poss} face along a soft spiral|a quietly classical balance', 'comp-ratio'),
  s('layered depth with foreground, subject and background|three clear planes of interest|a rich dimensionality', 'comp-layer', '', 'detail'),
  s('a symmetrical corridor composition|the walls receding toward a vanishing point|the subject small and centered', 'comp-center', 'indoor|street', 'closeup detail'),
  s('a reflection-based composition|a mirrored copy of the scene in glass or water|a doubled image', 'comp-reflect', 'window|mirror-ok|water', '', 0.8),
  s('a casually cropped candid composition|part of {poss} body cut by the frame edge|an unposed spontaneous feel', 'comp-candid', '', '', 1.3),
  s('a tight crop with comfortable headroom|the face filling the lower two-thirds of the frame|an intimate presence', 'comp-tight', '', 'needs-full'),
  s('a balanced triangle composition|{poss} head, arm and the background anchor forming a shape|a stable visual weight', 'comp-triangle', '', 'detail'),
  s('a vertical composition emphasizing height|strong vertical lines in the background|the subject elongated within the frame', 'comp-vertical', 'wall|steps|trees|street|railing|door', '', 0.9),
  s('a sun-flare-edged composition|light leaking softly across one corner of the frame|a luminous warmth', 'comp-flare', 'sunny|golden', 'night', 0.8),
  s('the subject placed slightly off-center with the horizon on the lower third|a wide sky above|a spacious airy feel', 'comp-thirds', 'outdoor', 'closeup detail'),
  s('a close detail-heavy composition|small textures and objects given room in the frame|{poss} hands and a small object', 'comp-detail', '', 'needs-full', 0.8),
  s('a framed-by-foliage composition|leaves arching across the top corners|the subject nested in green', 'comp-frame', 'trees|plants|grass', '', 0.8),
  s('a one-point perspective composition|everything converging on a point behind {obj}|a clean graphic structure', 'comp-lines', 'street|steps|indoor|path', '', 0.8),
  s('a loose, dynamic composition|the subject leaning into the movement|space ahead of {obj} in the frame', 'comp-motion', 'walking|motion', ''),
  s('a quiet still-life composition around {obj}|simple shapes and muted blocks of color|a calm visual hierarchy', 'comp-still', '', 'needs-full', 0.8),
  s('a rule-of-thirds composition with the eyes on the upper-third line|a clean uncluttered background|a classic portrait structure', 'comp-thirds', '', 'needs-full detail'),
  s('a negative-space composition against a soft textured wall|the subject placed low in the frame|a minimal architectural feel', 'comp-neg', 'wall', '', 0.8)
]);

export const framing = build('framing', [
  s('a full-body shot from head to toe|the surroundings visible all around|a clear read of the outfit', 'full', '', 'upper-body closeup', 1.3),
  s('a three-quarter-length framing from head to mid-thigh|the outfit clearly visible|{poss} stance reading naturally', 'threeq', '', 'x-none', 1.4),
  s('a waist-up framing|the subject filling the frame|a natural conversational distance', 'waist', '', 'needs-full', 1.4),
  s('a close-up portrait framing from the shoulders up|a sharp, intimate view of the face|a soft background', 'closeup', '', 'needs-full', 1.0),
  s('a tight beauty crop on the face and hair|a quiet, concentrated frame|skin texture clearly visible', 'closeup', '', 'needs-full', 0.7),
  s('a detail shot of the hands, jewelry and a small object|the face only partly in frame|an editorial still-life feel', 'detail', '', 'needs-full', 0.5),
  s('a medium-wide environmental portrait|the subject integrated into the setting|a relaxed distance', 'full threeq', '', 'closeup', 1.2),
  s('a knee-up cowboy-shot framing|the hands and outfit clearly visible|a confident distance', 'threeq', '', 'x-none'),
  s('a wide establishing frame with the subject small in the scene|a strong sense of place|plenty of context', 'full', '', 'upper-body closeup', 0.8),
  s('an outfit-focused framing from chin to knees|{poss} face partly cropped|an editorial fashion feel', 'threeq waist', '', 'x-none', 0.6)
]);

export const motion = build('motion', [
  s('frozen sharp action|a fast shutter around 1/1000s|every strand and fold crisp', 'motion-freeze', '', '', 1.2),
  s('slight motion blur on hair and fabric|a shutter around 1/125s|a hint of lively movement', 'motion-blur', 'walking|motion', ''),
  s('a panning blur with the background streaking while the subject stays sharp|a deliberate sense of speed|a smooth horizontal smear', 'motion-pan', 'walking|motion street', '', 0.6),
  s('a subtle blur on {poss} hands only|the rest of the frame crisp|a natural micro-movement', 'motion-blur', 'upper-body candid|candid', '', 0.9),
  s('completely still and static|a shutter fast enough to freeze breathing|a calm clean frame', 'motion-still', '', 'walking motion', 1.4),
  s('a slow shutter drag at about 1/30s with the subject sharp from flash|ghosting around the edges|a lively night-time movement', 'motion-drag flash', 'night|artificial|blue', 'closeup', 0.6),
  s('a micro-blur in the fabric edges|a shutter around 1/250s|delicate softness at the hem', 'motion-blur', 'walking|motion', ''),
  s('wind-driven movement in hair and clothing|loose strands flicking across the frame|an energetic outdoor feel', 'wind motion-blur', 'outdoor|airflow', '', 0.9),
  s('a mid-air hair flick frozen at 1/1000s|droplets or loose strands suspended|a playful frozen instant', 'motion-freeze', 'motion needs-full', '', 0.6),
  s('natural unposed micro-movements captured at about 1/250s|breath, blink and gesture all feeling alive|a casual snapshot rhythm', 'motion-freeze', '', '', 1.2),
  s('a soft handheld sway implying a candid snapshot|a tiny bit of edge softness|an organic look', 'motion-handheld', '', '', 1.0),
  s('a crisp stride frozen mid-step|the back foot just leaving the ground|a clear sense of forward motion', 'motion-freeze', 'walking', '', 1.0)
]);
