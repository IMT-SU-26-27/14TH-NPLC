---
name: 14th NPLC
description: Registration, payment review and live competitive-programming contest app for the 14th National Programming and Logic Competition.
colors:
  background: "oklch(0.985 0.002 286)"
  foreground: "oklch(0.141 0.005 285.823)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.141 0.005 285.823)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.141 0.005 285.823)"
  primary: "oklch(0.546 0.245 262.881)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.967 0.003 264.542)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.967 0.001 286.375)"
  muted-foreground: "oklch(0.517 0.014 285.938)"
  accent: "oklch(0.955 0.02 260)"
  accent-foreground: "oklch(0.379 0.146 265.522)"
  destructive: "oklch(0.577 0.245 27.325)"
  success: "oklch(0.527 0.154 150.069)"
  success-foreground: "oklch(0.985 0 0)"
  border: "oklch(0.92 0.004 286.32)"
  input: "oklch(0.92 0.004 286.32)"
  ring: "oklch(0.623 0.214 259.815)"
  chart-1: "oklch(0.546 0.245 262.881)"
  chart-2: "oklch(0.646 0.222 41.116)"
  chart-3: "oklch(0.6 0.118 184.704)"
  chart-4: "oklch(0.552 0.016 285.938)"
  chart-5: "oklch(0.769 0.188 70.08)"
  dark-background: "oklch(0.145 0 0)"
  dark-foreground: "oklch(0.985 0 0)"
  dark-card: "oklch(0.205 0 0)"
  dark-primary: "oklch(0.623 0.214 259.815)"
  dark-secondary: "oklch(0.269 0 0)"
  dark-muted: "oklch(0.269 0 0)"
  dark-muted-foreground: "oklch(0.708 0 0)"
  dark-accent: "oklch(0.269 0 0)"
  dark-destructive: "oklch(0.704 0.191 22.216)"
  dark-success: "oklch(0.696 0.17 162.48)"
  dark-success-foreground: "oklch(0.145 0 0)"
  dark-border: "oklch(1 0 0 / 10%)"
  dark-input: "oklch(1 0 0 / 15%)"
  dark-ring: "oklch(0.623 0.214 259.815)"
  dark-chart-1: "oklch(0.623 0.214 259.815)"
  dark-chart-2: "oklch(0.75 0.183 55.934)"
  dark-chart-3: "oklch(0.439 0 0)"
  dark-chart-4: "oklch(0.371 0 0)"
  dark-chart-5: "oklch(0.269 0 0)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 600
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  pill: "26px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    typography: "{typography.body}"
    height: "32px"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-ghost:
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  button-destructive:
    textColor: "{colors.destructive}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "0 10px"
  input:
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "4px 10px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge-accepted:
    backgroundColor: "{colors.success}"
    textColor: "{colors.success-foreground}"
    rounded: "{rounded.pill}"
    typography: "{typography.label}"
    height: "20px"
    padding: "2px 8px"
  badge-under-review:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
    rounded: "{rounded.pill}"
    typography: "{typography.label}"
    height: "20px"
  badge-rejected:
    textColor: "{colors.destructive}"
    rounded: "{rounded.pill}"
    typography: "{typography.label}"
    height: "20px"
  badge-pending-payment:
    textColor: "{colors.foreground}"
    rounded: "{rounded.pill}"
    typography: "{typography.label}"
    height: "20px"
---

# Design System: 14th NPLC

## Overview

**Creative North Star: "The Quiet Ledger"**

A calm, dense product dashboard built to the category standard (Stripe Dashboard, shadcn/ui examples). There is no themed costume: no competition mascots, no neon, no gradients. The only expression is clarity of status and data. A participant should see which step their team is on and what to do next within seconds; an admin should find any team, see the evidence and decide.

The world is a faint zinc page ground carrying white cards, zinc neutrals for text and borders, and a single blue primary reserved for primary actions, the current step and focus. Meaning lives in status badges (accepted green, under review grey, rejected red, waiting outlined) rather than in decoration. The landing page persuades inside this same world with nothing but larger type and a short GSAP fade.

Every surface is composed from shadcn/ui (base-nova style) primitives with 1px hairlines and gently rounded corners. Depth comes from tone (white card on near-white ground) and a 1px ring, never from shadows.

**Key Characteristics:**
- One blue primary on a zinc/white ground; green is reserved for accepted/passed.
- Geist Sans for everything, Geist Mono for codes, NISN, phone numbers and slugs.
- Flat cards with a 1px foreground/10% ring and 14px corners.
- Single centred shell column (max-w-6xl, 1152px) with 16px gutters.
- Bilingual (Indonesian default, English) with every visible string from the dictionaries.

## Colors

Restrained zinc neutrals with one saturated blue voice and a semantic green/red pair; all values are OKLCH custom properties in `src/app/globals.css`, with a full `.dark` set.

### Primary
- **Signal Blue** (`primary`; dark `dark-primary`): primary buttons, the done/current dots and connector in the team progress step list, links, keywords and the cursor in the Monaco editor, chart series 1. The same hue drives `ring` for focus.
- **Mist Blue** (`accent` / `accent-foreground`): light-mode hover and highlight surfaces in menus and selects; collapses to neutral grey in dark mode.

### Secondary
- **Ledger Green** (`success` / `success-foreground`): accepted registrations and Accepted CP verdicts only, and strings in the code editor. It exists so an accepted state never reads as a primary action.
- **Verdict Red** (`destructive`): rejected status, failed verdicts, failed steps, delete actions, field errors and destructive alerts. Always used as tinted text on a 10% (dark 20%) tint, never as a solid fill.

### Tertiary (chart series)
- **Series tokens** (`chart-1` .. `chart-5`): chart-1 is Signal Blue (Competitive Programming), chart-2 is Ember Orange (second category), chart-3 teal, chart-4 zinc, chart-5 amber. Series colour follows the competition's stable order, never its rank. Dark mode keeps blue and orange and steps 3-5 down to greys.

### Neutral
- **Faint Zinc Ground** (`background`): the page itself, a hair off white so white cards read as lifted.
- **Card White** (`card`, `popover`): cards, popovers, dialogs, the Monaco editor background.
- **Ink Zinc** (`foreground`): body and heading text.
- **Pewter** (`muted-foreground`): descriptions, meta lines, mono codes in tables, upcoming steps, comments in the editor.
- **Zinc Wash** (`secondary`, `muted`): secondary buttons, under-review badge, hover fills, card footers at 50%, current-line highlight.
- **Hairline** (`border`, `input`): every 1px border and divider; scrollbar thumb.

### Named Rules
**The Token-Only Rule.** Every colour comes from a `globals.css` custom property through its Tailwind alias (`bg-primary`, `text-muted-foreground`, `var(--chart-1)`). No hex, no Tailwind palette classes (`bg-blue-600`, `text-green-700`), no inline colour values. Code that needs literal colours (Monaco) resolves the tokens at runtime (`src/lib/cp/monaco-theme.ts`).

**The One Blue Rule.** Blue means "act here" or "you are here". It is never used for an accepted state or as decoration.

**The Green Means Done Rule.** `success` appears only on accepted registrations and Accepted verdicts (and editor strings), applied as `bg-success text-success-foreground` on the default Badge.

## Typography

**Display Font:** Geist (via `next/font`, `--font-sans`, also `--font-heading`)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (`--font-geist-mono`, mapped to `font-mono`)

**Character:** One neutral grotesk carrying every role through size and weight alone; the mono is a functional tool for identifiers, not a voice.

### Hierarchy
- **Display** (600, 36px rising to 60px at `sm`, tracking -0.025em, balanced): the landing hero title only.
- **Headline** (600, 24px, tracking -0.025em): page `h1`s and landing section titles; one-line muted description beneath.
- **Title** (500, 16px, snug): card titles; raised to 20px for the single primary card on a focused form page (register, join, admin create).
- **Body** (400, 14px): all app copy, tables, descriptions. Hero lede is 18px muted, max 672px wide.
- **Label** (500, 12px): badges, meta lines, mono identifiers in tables.

### Named Rules
**The Tabular Rule.** Tables and card titles set `font-variant-numeric: tabular-nums` globally so stats and columns align.

**The Mono-for-Identifiers Rule.** Referral/team codes, NISN, phone numbers and competition slugs are set in Geist Mono; team-code inputs and the referral-code field add wide tracking (and uppercase on entry). Nothing else is mono.

## Layout

A single centred column: `max-w-6xl` (1152px) with 16px side padding is the shell for the header, footer, landing sections, admin, register and CP pages. Narrower measures are content-driven: the hero at 768px, prose at 672px, auth forms at 448px.

Page rhythm: `main` gets 32px vertical padding (48px on register) and 24px between stacked blocks; inside cards, 16px padding (12px for `size="sm"`), 8-16px gaps between fields and list items, 4px between a label and its value. Grids collapse to one column on mobile and go to two columns from `md`/`lg` (dashboard progress card beside members + payment card).

The header is a 56px sticky bar with a translucent background blur and a bottom hairline: wordmark "14th NPLC" left, language switcher, ghost nav links (hidden below `sm`) and user menu right.

Motion: the only scripted motion is the landing hero, where each `[data-hero-item]` fades up 24px over 0.8s, staggered 0.12s, `power3.out`, gated on `prefers-reduced-motion: no-preference`. Everything else uses the primitives' own short colour/opacity transitions and the 1px press nudge on buttons. Charts render with animation off.

## Elevation & Depth

Flat. Depth is tonal: a white card on the faint zinc ground, outlined by a 1px ring at foreground/10%. There is no shadow vocabulary in the app's own surfaces; overlays (dialogs, popovers, menus, toasts) take whatever the shadcn primitives ship. The sticky header uses an 80% background with backdrop blur rather than a shadow.

### Named Rules
**The Hairline-Not-Shadow Rule.** Separate surfaces with 1px borders, rings and tone. Do not add `shadow-*` utilities to cards, sections or badges.

## Shapes

Gently rounded everywhere from one base radius (`--radius` 10px): controls (buttons, inputs, selects, tabs) at 10px, small buttons capped at 8-12px, cards and card images at 14px, badges as full pills. Borders are always 1px in the `border`/`input` token. Focus is a 3px ring in `ring` at 50% plus a border shift to `ring`; invalid fields swap both to `destructive`.

## Components

shadcn/ui base-nova primitives in `src/components/ui` are the only building blocks; features compose them and never restyle their colour or shape.

### Buttons
- **Shape:** gently rounded (10px), 32px tall (36px `lg` for hero CTAs), 10px horizontal padding, 14px medium text, 16px icons.
- **Primary:** Signal Blue fill with near-white text; one per view, on the main action (sign up, pay/upload in the payment card, submit).
- **Hover / Focus:** primary dims to 80%; outline/ghost gain a Zinc Wash fill; focus shows the 3px ring; press shifts 1px down.
- **Outline / Ghost / Secondary:** outline for secondary actions beside a primary (hero "join with code"); ghost for header nav and icon actions; secondary for quiet fills.
- **Destructive:** red text on a 10% red tint, never a solid red block; destructive actions confirm through AlertDialog.

### Chips (status badges)
- **Style:** 20px pill, 12px medium text, 8px horizontal padding.
- **Registration status:** `pending_payment` outline, `under_review` secondary (grey), `accepted` success green, `rejected` destructive tint.
- **CP verdicts:** Accepted success green; Time Limit secondary; internal/exec-format errors outline; every other failure destructive tint.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Card White on the Faint Zinc Ground.
- **Shadow Strategy:** none; 1px ring at foreground/10% (see Elevation).
- **Border:** footer separated by a top hairline on a 50% muted wash.
- **Internal Padding:** 16px (12px for `size="sm"`).

### Inputs / Fields
- **Style:** 32px, 1px `input` border, transparent fill (dark: input at 30%), 10px radius, 14px text.
- **Focus:** border to `ring` plus 3px ring at 50%.
- **Error / Disabled:** `aria-invalid` turns border and ring destructive, with the message in `FieldError`; disabled drops to 50% opacity. Forms are built from `Field` / `FieldLabel` / `FieldDescription` / `FieldError` groups.

### Feedback states
- **Alert** (default card or destructive text) for inline form-level errors and notices.
- **Empty** for every no-data state (no teams, no registrations, no problems).
- **Skeleton** for loading in Suspense fallbacks (header actions, tables); **Spinner** inside buttons while a submit is pending.
- **Sonner** toasts, top-right, for transient confirmations.

### Navigation
- Sticky 56px header described in Layout; admin sub-navigation is a wrapping row of button-styled links above a bottom hairline, the active page as a secondary (Zinc Wash) button and the rest ghost; user actions sit in a DropdownMenu.

### Progress step list (signature)
A vertical list of team registration steps: Signal Blue icon for done and current steps (current marked `aria-current="step"`), Pewter for upcoming, Verdict Red for failed, joined by a 1px connector that is blue between completed steps and hairline otherwise.

### Charts
shadcn `ChartContainer` over Recharts: 288px tall line chart, horizontal grid only, no axis lines, 2px monotone lines without dots, legend plus crosshair tooltip, and a Table tab carrying the same data. Series colour comes from `--chart-N` by stable competition order.

### Code editor
Monaco themed from tokens at runtime: Card White background, Signal Blue keywords/types/cursor, Ledger Green strings, Verdict Red numbers, italic Pewter comments, Zinc Wash current line, primary at 20% for selection.

## Do's and Don'ts

### Do:
- **Do** take every colour from `globals.css` tokens through Tailwind aliases or `var(--token)`; add a new token there (light and dark) before using a new colour.
- **Do** compose screens only from `src/components/ui` shadcn primitives; use Field for forms, Alert for errors, Empty for no-data, Skeleton for loading and Spinner for pending buttons.
- **Do** keep pages in the `max-w-6xl` column with 16px gutters and 24px block spacing.
- **Do** colour statuses through the shared `RegistrationStatusBadge` and `VerdictBadge` mappings.
- **Do** set codes, NISN, phone numbers and slugs in Geist Mono, and numbers in tabular figures.
- **Do** source every visible string from the `id` and `en` dictionaries (Indonesian default), and format dates and numbers with `INTL_LOCALE` (`id-ID`, `en-GB`).
- **Do** gate any new motion on `prefers-reduced-motion` and keep it to the hero-style fade.

### Don't:
- **Don't** use hex values, Tailwind palette colours or inline colour styles anywhere in components.
- **Don't** use blue for accepted/passed states or green for actions.
- **Don't** add shadows, gradients or themed decoration to cards and sections.
- **Don't** fill destructive buttons or badges with solid red; use the 10% tint.
- **Don't** hard-code user-facing text in one language.
- **Don't** add scroll-triggered or looping animation outside the landing hero.
