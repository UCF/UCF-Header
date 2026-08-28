// Build-time constants, injected by esbuild `define` (see scripts/build.mjs).
declare const __UCFHB_VERSION__: string;
declare const __UCFHB_ROOT_URL__: string;
declare const __UCFHB_GA__: string;
declare const __UCFHB_SEARCH_URL__: string;
declare const __UCFHB_SESSION__: boolean;

// Assets are inlined as strings by esbuild's `text` loader.
declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.css' {
  const content: string;
  export default content;
}
