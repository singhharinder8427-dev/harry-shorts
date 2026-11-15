import React, {createContext, useContext} from 'react';
/* Outline scale. A drawing placed with scale(k) writes stroke widths as px / useK(), so its outline keeps a constant
 * on-screen weight. <Cel> (World3D.tsx) provides k for every flat character. */
const KCtx = createContext(1);
export const useK = () => useContext(KCtx);
export const KScale: React.FC<{k: number; children?: React.ReactNode}> = ({k, children}) => <KCtx.Provider value={k}>{children}</KCtx.Provider>;
