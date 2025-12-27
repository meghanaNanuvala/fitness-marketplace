// Declarations for importing plain JS/JSX React components and static assets
// This prevents TS7016: Could not find a declaration file for module './.../Component'

declare module '*.jsx' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

declare module '*.js' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

declare module './components/*/*' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

declare module './components/*' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<any>;
  export default Component;
}

// Allow importing common static asset types without errors
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.gif';

// If you need stronger typing for specific components, replace `any` with explicit prop types
