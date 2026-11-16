/* The cast for Blob the Brilliant.
 * BLOB is fixed in every video (brand character): white face, black hair on top, teal shirt #1FA6A0.
 * A costume is allowed only when the story needs one (costume('prison'), ...) - head, hair and face never change.
 * Supporting roles are TEMPLATES: each keeps its signature items, while colours, hair and accessories change per video.
 * Pass a different seed per video (e.g. the short's name) to get a new-looking scientist / boss / police officer.
 * Rules: no supporting role ever wears Blob's teal; no bun hairstyle on anyone (it reads as a brown circle / turban);
 * variety comes from caps, hats, headbands, glasses, sunglasses and held props instead. */
import {Outfit} from './Cast';
import {INK} from './color';

export const BLOB_TEAL = '#1FA6A0', BRAND_YELLOW = '#FFC83D';
export const BLOB: Outfit = {shirt: BLOB_TEAL, hair: INK, hairStyle: 'short'};

/** story costumes for Blob (head, hair and face stay Blob's) */
export const COSTUMES: Record<string, Outfit> = {
  prison:    {...BLOB, shirt: '#F08A24', buttons: true},
  astronaut: {...BLOB, shirt: '#ECEFF3', belt: '#5B6270', badge: '#E5484D', hat: 'helmet'},
  chef:      {...BLOB, shirt: '#FFFFFF', apron: '#F2F2F2', scarf: '#E5484D'},
  winter:    {...BLOB, scarf: '#E5484D', hat: 'beanie', hatColor: '#E5484D'},
  scientist: {...BLOB, coat: '#F7F7F2', coatStyle: 'lab', glasses: true, hold: 'clipboard'},
  worker:    {...BLOB, vest: '#FF8A1F', hat: 'hardhat', hatColor: '#FFD23F', hold: 'wrench'},
  detective: {...BLOB, coat: '#C8A46B', coatStyle: 'trench', hat: 'fedora', hatColor: '#3A3330', hold: 'magnifier'},
  athlete:   {...BLOB, headband: '#E5484D'},
};
export const costume = (name: string): Outfit => COSTUMES[name] ?? BLOB;

// deterministic choice from a seed (string or number), so the same video always gets the same look
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return h >>> 0; };   // FNV-1a + murmur finaliser = even spread
const chooser = (seed: string | number, salt: string) => { let n = 0; return <T,>(arr: T[]): T => arr[hash(`${seed}|${salt}|${n++}`) % arr.length]; };

type HS = Outfit['hairStyle'];
const HAIR = ['#151515', '#3B2416', '#6B4423', '#A0522D', '#D9A441', '#C0392B'];
const GREY = ['#8E8E8E', '#BDBDBD', '#E6E6E6'];
const CASUAL = ['#E5484D', '#3F7FD9', '#8E5BD6', '#F2994A', '#E85D9E', '#4CAF50', '#F2C94C', '#56CCF2'];   // no teal
const SPORT = ['#E5484D', '#2F5BEA', '#8E5BD6', '#F2994A', '#111827', '#4CAF50', '#FFFFFF'];

export type RoleName = 'scientist' | 'boss' | 'guard' | 'police' | 'detective' | 'athlete' | 'friend' | 'kid' | 'worker' | 'thief';
export type RoleLook = {outfit: Outfit; size: number; signature: string};
export const ROLES: Record<RoleName, (seed: string | number) => RoleLook> = {
  scientist: (seed) => { const c = chooser(seed, 'scientist'); const hs = c<HS>(['short', 'sides', 'long', 'ponytail', 'short']);
    return {signature: 'lab coat + glasses (+ clipboard)', size: 1, outfit: {coat: '#F7F7F2', coatStyle: 'lab', glasses: true,
      glassesColor: c([undefined, '#E5484D', '#2F5BEA', '#8E5BD6', '#F2994A']), shirt: c(['#7FB3E8', '#B79CE6', '#8FD18A', '#F2B36B', '#E8848A', '#F2C94C']),
      hair: hs === 'sides' ? c(GREY) : c([...HAIR, ...GREY]), hairStyle: hs, mustache: (hs === 'sides' || hs === 'short') && c([false, false, true]),
      tie: c([undefined, '#2E3A59', '#B03A48', '#2F5BEA']), hold: c([undefined, 'clipboard', 'clipboard', 'coffee'])}}; },
  boss: (seed) => { const c = chooser(seed, 'boss');
    return {signature: 'suit jacket + tie (+ briefcase / coffee / phone)', size: 1.05, outfit: {coat: c(['#24324F', '#5B1F2A', '#2F4F3A', '#4A2F5E', '#8A6A3E', '#2B2B30', '#7A7F88']), coatStyle: 'suit', shirt: '#FFFFFF',
      tie: c(['#E5484D', '#F2C94C', '#8E5BD6', '#2F5BEA', '#4CAF50']), hair: c([...HAIR, ...GREY]), hairStyle: c<HS>(['short', 'sides', 'short']),
      mustache: c([false, false, true]), sunglasses: c([false, false, false, true]), hat: c<Outfit['hat']>(['none', 'none', 'none', 'none', 'bowler', 'top']), hatColor: '#1E1E22',
      hold: c([undefined, 'briefcase', 'coffee', 'phone'])}}; },
  guard: (seed) => { const c = chooser(seed, 'guard'); const u = c(['#22365C', '#4A4A55', '#6B6A3A', '#7A2E2E', '#2F5D9E', '#3F5F4A']);
    return {signature: 'uniform + cap + big gold badge', size: 1, outfit: {shirt: u, hat: 'cap', hatColor: c([u, '#151515']), badge: '#F2C94C', belt: '#151515',
      buttons: true, hair: c(HAIR), hairStyle: 'short', mustache: c([false, false, true]), sunglasses: c([false, false, true]), hold: c([undefined, undefined, 'phone', 'coffee'])}}; },
  police: (seed) => { const c = chooser(seed, 'police'); const u = c(['#1E2F55', '#2C4A86', '#24324F', '#3B5BA8']);
    return {signature: 'police hat + badge + gun', size: 1.02, outfit: {shirt: u, hat: 'police', hatColor: c([u, '#151515']), badge: '#F2C94C', belt: '#151515',
      buttons: true, hair: c(HAIR), hairStyle: 'short', mustache: c([false, true]), sunglasses: c([false, true]), hold: 'gun'}}; },
  detective: (seed) => { const c = chooser(seed, 'detective');
    return {signature: 'trench coat + fedora + sunglasses + magnifier', size: 1, outfit: {coat: c(['#C8A46B', '#8A6A4A', '#6E6E73', '#4A3A2A', '#A9925E']), coatStyle: 'trench',
      shirt: '#FFFFFF', tie: c([undefined, '#151515', '#7A2E2E']), hat: 'fedora', hatColor: c(['#3A3330', '#2B2B30', '#5A4632', '#6E6E73']),
      sunglasses: c([true, true, false]), glasses: true, hair: c(HAIR), hairStyle: 'short', mustache: c([false, true]), cigarette: c([false, false, true]), hold: 'magnifier'}}; },
  athlete: (seed) => { const c = chooser(seed, 'athlete'); const shirt = c(SPORT);
    return {signature: 'sports shirt + headband with ribbon', size: 1, outfit: {shirt, headband: c(['#E5484D', '#2F5BEA', '#F2C94C', '#F2994A', '#E85D9E', '#8E5BD6'].filter((x) => x !== shirt)), hair: c(HAIR),
      hairStyle: c<HS>(['short', 'ponytail', 'short']), sunglasses: c([false, false, false, true])}}; },
  friend: (seed) => { const c = chooser(seed, 'friend');
    return {signature: 'bright casual shirt + one accessory', size: 1, outfit: {shirt: c(CASUAL), hair: c(HAIR), hairStyle: c<HS>(['short', 'long', 'ponytail', 'sides', 'short']),
      ...c<Partial<Outfit>>([{}, {hat: 'cap', hatColor: c(CASUAL)}, {hat: 'beanie', hatColor: c(CASUAL)}, {scarf: c(CASUAL)}, {glasses: true, glassesColor: c(CASUAL)}, {sunglasses: true}, {hold: 'phone'}, {hold: 'coffee'}])}}; },
  kid: (seed) => { const c = chooser(seed, 'kid');
    return {signature: 'smaller size + bright shirt', size: 0.72, outfit: {shirt: c(CASUAL), hair: c(HAIR.slice(0, 5)), hairStyle: c<HS>(['short', 'ponytail', 'short']),
      ...c<Partial<Outfit>>([{}, {hat: 'cap', hatColor: c(CASUAL)}, {scarf: c(CASUAL)}, {headband: c(CASUAL)}, {glasses: true, glassesColor: c(CASUAL)}])}}; },
  worker: (seed) => { const c = chooser(seed, 'worker');
    return {signature: 'hard hat + high-vis vest (+ wrench)', size: 1.02, outfit: {shirt: c(['#3F7FD9', '#6B6A3A', '#5B5B66', '#8C4A2F', '#2F5BEA']), vest: c(['#FF8A1F', '#D4E157']),
      hat: 'hardhat', hatColor: c(['#FFD23F', '#FF8A1F', '#F2F2F2', '#E5484D']), hair: c(HAIR), hairStyle: 'short', mustache: c([false, true]), hold: c(['wrench', 'wrench', 'coffee', undefined])}}; },
  thief: (seed) => { const c = chooser(seed, 'thief');
    return {signature: 'eye mask + beanie + dark shirt + loot sack', size: 0.98, outfit: {shirt: c(['#3A3F4A', '#2E2E36', '#4A3F55', '#3B4A3A']), hat: 'beanie', hatColor: c(['#151515', '#2B2B30', '#7A2E2E']),
      mask: '#151515', hair: c(HAIR), hairStyle: 'short', scarf: c([undefined, '#E5484D', '#F2C94C']), hold: 'sack'}}; },
};
/** one supporting character for a video: role('scientist', 'pink-cell') */
export const role = (name: RoleName, seed: string | number): RoleLook => ROLES[name](seed);
