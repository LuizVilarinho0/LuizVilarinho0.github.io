/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "1" no build do GitHub Pages (sem PHP) */
  readonly VITE_ESTATICO?: string;
}
