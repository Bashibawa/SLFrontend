# Design System Tokens

`src/styles/tokens.css` is the source of truth for every design token. This page explains how the
tokens are organised and how to add new ones.

## How tokens are organised

| Layer | Prefix | Example | Use it for |
|---|---|---|---|
| Primitive colors | `--color-brand-*` | `--color-brand-primary: #4a42b8` | Raw brand palette. Each hex value has an `-rgb` twin for alpha (`rgb(var(--color-brand-primary-rgb) / 0.2)`). |
| Semantic colors | `--color-bg-*`, `--color-text-*`, `--color-border-*`, `--color-focus-ring` | `--color-text-muted` | What components should reference. Each one points at a primitive or a single extra hex value. |
| Spacing | `--space-*` | `--space-4: 1rem` | 4px-based scale. |
| Radius / shadow | `--radius-*`, `--shadow-*` | `--radius-md` | Corners and elevation. |
| Typography | `--font-*`, `--type-*`, `--line-*`, `--letter-*` | `--type-body-size` | Type scale primitives and semantic text roles. |

Dark mode overrides live under `[data-theme='dark']` in the same file. Components use semantic
tokens, so a theme only has to remap the semantic layer.

## Adding new tokens

Reuse first. Most needs are already covered:

1. **Look for an existing semantic token** that describes the role (`--color-text-muted`,
   `--color-bg-subtle`, `--space-3`, ...). If one fits, use it, even if the exact value is a few
   pixels or shades off what a mockup shows.
2. **Add a semantic alias, not a new primitive**, when a new role appears but the value already
   exists in the palette (for example `--color-bg-highlight: var(--color-brand-lilac)`).
3. **Add a new primitive only when the value is genuinely new** and is expected to be reused in
   more than one component. A one-off value for a single component belongs in that component, not
   in `tokens.css`.

When you do add a token:

- Follow the existing naming pattern: `--<category>-<role>[-<variant>]`, kebab-case, no component
  names (`--color-text-warning`, not `--quiz-timer-red`).
- Add it to the matching section of `tokens.css`, and to the `[data-theme='dark']` block if it is
  a color that should change in dark mode.
- Give each new hex primitive its `-rgb` twin.
- Explain in the PR description why no existing token fits.

### Required for new color tokens: WCAG contrast check

Before a PR that adds or changes a color token can be merged:

1. Work out every foreground/background pair the token will be used in (text on a background,
   white text on a filled button, a border on the page background, ...).
2. Add those pairs to `src/test/tokens-contrast.test.ts` with `getHexToken(css, '<token-name>')`
   and the right minimum:
   - **4.5:1** for normal body text (WCAG 2.1 AA)
   - **3:1** for large text (24px+, or 18.66px+ bold) and for UI components such as borders,
     icons and focus rings
3. Run the test and make sure it passes:

   ```bash
   npx vitest run src/test/tokens-contrast.test.ts
   ```

4. Add the verified ratios to the "WCAG 2.1 AA contrast pairs" comment in `tokens.css`.

A PR that adds a color token without a matching contrast assertion should not be merged.
