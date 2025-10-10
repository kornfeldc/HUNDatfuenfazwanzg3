// Prettier configuration enabling automatic Tailwind CSS class sorting
// Prettier v3 requires explicit plugin listing
// This will sort Tailwind classes whenever Prettier formats your files (e.g., on save if your IDE runs Prettier on save)

/** @type {import('prettier').Config} */
export default {
  plugins: [
    // Format Svelte files correctly
    'prettier-plugin-svelte',
    // Automatically sort Tailwind CSS classes
    'prettier-plugin-tailwindcss'
  ],
  // Recommended options for Svelte projects
  svelteSortOrder: 'scripts-markup-styles',
  svelteStrictMode: false,
  svelteBracketNewLine: true,
  svelteAllowShorthand: true,
  svelteIndentScriptAndStyle: true,
  // Keep line width reasonable
  printWidth: 100,
};