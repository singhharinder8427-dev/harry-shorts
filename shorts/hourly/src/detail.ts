/* Detail level (owner's amendment, 17 Nov 2026): set once per Short from the render question.
 * 'pc'    = rendered on the owner's PC (GPU, ~0.14 s per simple 2K frame): richer sets, effects and background life,
 *           budget ~0.5 s per 2K frame (check with a 5 s test of the busiest scene).
 * 'cloud' = rendered in the cloud (software WebGL, ~1-3 s per 2K frame): the standard level.
 * Scenes branch on it:  const pc = DETAIL === 'pc';  <Instances items={pc ? many : few} />  */
export type Detail = 'pc' | 'cloud';
export const DETAIL = 'pc' as Detail;   // new_project.sh writes 'pc' or 'cloud' here
/** pick a value per detail level: lvl(cloudValue, pcValue) */
export const lvl = <T,>(cloud: T, pc: T): T => (DETAIL === 'pc' ? pc : cloud);
