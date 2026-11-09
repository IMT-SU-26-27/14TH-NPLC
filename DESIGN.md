---
name: 14th NPLC
description: Registration, payment review and live competitive-programming contest app for the 14th National Programming and Logic Competition.
colors:
  background: "#F4F7FD"
  foreground: "#1D3451"
  card: "#FFFFFF"
  card-foreground: "#1D3451"
  popover: "#FFFFFF"
  popover-foreground: "#1D3451"
  primary: "#315BF0"
  primary-foreground: "#FFFFFF"
  secondary: "#EAF0FD"
  secondary-foreground: "#1D3451"
  muted: "#EDF1FA"
  muted-foreground: "#56657D"
  accent: "#E6EDFE"
  accent-foreground: "#2443BF"
  destructive: "#C8000A"
  destructive-soft: "#FDE7E9"
  success: "#008236"
  success-foreground: "#FFFFFF"
  success-soft: "#DCFCE7"
  warning: "#B45309"
  warning-foreground: "#FFFFFF"
  highlight: "#D8F939"
  highlight-foreground: "#1D3451"
  brand-purple: "#9C74F7"
  brand-sky: "#78D9FF"
  border: "#D9E1F0"
  input: "#CFD8EA"
  ring: "#315BF0"
  chart-1: "#315BF0"
  chart-2: "#9C74F7"
  chart-3: "#78D9FF"
  chart-4: "#D8F939"
  chart-5: "#1D3451"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 600
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.333
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
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

**Creative North Star: "Decode the Unknown"**

The NPLC XIV master design (masdes), carried by a calm, dense product dashboard. First impressions are branded: Home, sign-in and sign-up may use the wave, sparkle and mascot artwork. Working screens stay quiet, so a participant sees which step their team is on within seconds and an admin can find any team, see the evidence and decide. There, brand is limited to the logo, palette and type.

The world is a cool blue-white page ground carrying white cards, navy text and a single blue primary reserved for primary actions, the current step and focus. Lime, purple and sky are small accents. Meaning lives in status badges (accepted green, under review blue-grey, rejected red, waiting outlined), never in decoration.

Every surface is composed from shadcn/ui (base-nova style) primitives with 1px hairlines and gently rounded corners. Depth comes from tone and a 1px ring, not from shadows.

The Figma file [NPLC XIV – Website (Final)](https://www.figma.com/design/KmXmjSDV3syoSzru6OZ6PJ) is the source of truth for layouts. Its frames are references to rebuild with shadcn components, not components to copy. Pages are moving to these layouts feature by feature, so a page may still use an older layout on the current tokens.

**Key Characteristics:**
- One blue primary on a blue-white ground; green is reserved for accepted/passed.
- Space Grotesk for headings, Inter for body text, Geist Mono for code, codes, NISN, phone numbers, timers and slugs.
- Flat cards with a 1px foreground/10% ring and 14px corners.
- Single centred shell column (max-w-6xl, 1152px) with 16px gutters.
- Light only. The `.dark` values in `globals.css` are unused and are not part of this theme.
- Bilingual (Indonesian default, English) with every visible string from the dictionaries.

## Colors

Navy and cool neutrals with one saturated blue voice, small masdes accents and semantic green, amber and red. All values are custom properties in `src/app/globals.css`. Every text pairing below passes WCAG AA (4.5:1).

### Primary
- **Decode Blue** (`primary`): primary buttons, the done/current dots and connector in the team progress step list, links, keywords and the cursor in the Monaco editor, chart series 1. The same value drives `ring` for focus.
- **Mist Blue** (`accent` / `accent-foreground`): hover and highlight surfaces in menus and selects.

### Secondary
- **Pass Green** (`success` / `success-foreground`, tint `success-soft`): accepted registrations and Accepted CP verdicts only, and strings in the code editor. It exists so an accepted state never reads as a primary action.
- **Verdict Red** (`destructive`, tint `destructive-soft`): rejected status, failed verdicts, failed steps, delete actions, field errors and destructive alerts. Used as tinted text on a tint, never as a solid fill.
- **Caution Amber** (`warning` / `warning-foreground`): warnings that need attention but have not failed.

### Masdes accents
- **Signal Lime** (`highlight` / `highlight-foreground`): small highlights only.
- **Decode Purple** (`brand-purple`): decoration and chart series 2.
- **Sky** (`brand-sky`): decoration and chart series 3.

### Tertiary (chart series)
- **Series tokens** (`chart-1` .. `chart-5`): chart-1 is Decode Blue (Competitive Programming), chart-2 is Decode Purple (Category 2), chart-3 Sky, chart-4 Signal Lime, chart-5 Navy. Series colour follows the competition's stable order, never its rank.

### Neutral
- **Blue-White Ground** (`background`): the page itself, tinted so white cards read as lifted.
- **Card White** (`card`, `popover`): cards, popovers, dialogs, the Monaco editor background.
- **Navy** (`foreground`): body and heading text.
- **Slate** (`muted-foreground`): descriptions, meta lines, mono codes in tables, upcoming steps, comments in the editor.
- **Blue Wash** (`secondary`, `muted`): secondary buttons, under-review badge, hover fills, card footers at 50%, current-line highlight.
- **Hairline** (`border`, `input`): every 1px border and divider; scrollbar thumb.

### Hero fades
`--hero-fade`, `--hero-fade-v` and `--hero-fade-bottom` soften the wave behind Home hero text. `--tagline-gradient` is the hero tagline's blue-to-purple fill. Apply them with `bg-(image:--hero-fade)`, never with colour values in a component.

### Named Rules
**The Token-Only Rule.** Every colour comes from a `globals.css` custom property through its Tailwind alias (`bg-primary`, `text-muted-foreground`, `var(--chart-1)`). No hex, no Tailwind palette classes (`bg-blue-600`, `text-green-700`), no inline colour values. Code that needs literal colours (Monaco) resolves the tokens at runtime (`src/lib/cp/monaco-theme.ts`).

**The One Blue Rule.** Blue means "act here" or "you are here". It is never used for an accepted state or as decoration.

**The Green Means Done Rule.** `success` appears only on accepted registrations and Accepted verdicts (and editor strings), applied as `bg-success text-success-foreground` on the default Badge.

**The Lime Rule.** Lime always carries `highlight-foreground` text (10.55:1). Never put white text on it.

**The Purple Rule.** `brand-purple` is decoration. White text on it reaches only 3.36:1, so never use it as a text background.

**The Decoration Boundary Rule.** Wave, sparkle and mascot artwork appear only on Home, sign-in and sign-up. Decorative images use `alt=""` and `aria-hidden`; mascots use a descriptive `alt`.

## Typography

**Display Font:** Space Grotesk 500/600/700 (via `next/font`, `--font-space-grotesk`, mapped to `font-heading`; `h1`-`h3` use it by default)
**Body Font:** Inter (via `next/font`, `--font-sans`)
**Label/Mono Font:** Geist Mono (`--font-geist-mono`, mapped to `font-mono`)

**Character:** A technical grotesk for headings over a neutral text face; the mono is a functional tool for identifiers, not a voice. The masdes display fonts appear only inside the logo image, because their licences do not cover web use.

### Hierarchy
- **Display** (600, 36px rising to 60px at `sm`, tracking -0.025em, balanced): the landing hero title only.
- **Headline** (600, 24px, tracking -0.025em): page `h1`s and landing section titles; one-line muted description beneath.
- **Title** (500, 16px, snug): card titles; raised to 20px for the single primary card on a focused form page (register, join, admin create).
- **Body** (400, 14px): all app copy, tables, descriptions. Hero lede is 18px muted, max 672px wide.
- **Label** (500, 12px): badges, meta lines, mono identifiers in tables.

### Named Rules
**The Tabular Rule.** Tables and card titles set `font-variant-numeric: tabular-nums` globally so stats and columns align.

**The Mono-for-Identifiers Rule.** Code, referral/team codes, NISN, phone numbers, timers and competition slugs are set in Geist Mono; team-code inputs and the referral-code field add wide tracking (and uppercase on entry). Nothing else is mono.

## Layout

A single centred column: `max-w-6xl` (1152px) with 16px side padding is the shell for the header, footer, landing sections, admin, register and CP pages. Narrower measures are content-driven: the hero at 768px, prose at 672px, auth forms at 448px.

Page rhythm: `main` gets 32px vertical padding (48px on register) and 24px between stacked blocks; inside cards, 16px padding (12px for `size="sm"`), 8-16px gaps between fields and list items, 4px between a label and its value. Grids collapse to one column on mobile and go to two columns from `md`/`lg` (dashboard progress card beside members + payment card).

The header is a 56px sticky bar with a translucent background blur and a bottom hairline: the NPLC XIV logo left (26px tall, 20px below 360px wide), language switcher, ghost nav links (hidden below `sm`) and user menu right.

Motion: the only scripted motion is the landing hero, where each `[data-hero-item]` fades up 24px over 0.8s, staggered 0.12s, `power3.out`, gated on `prefers-reduced-motion: no-preference`. Everything else uses the primitives' own short colour/opacity transitions and the 1px press nudge on buttons. Charts render with animation off.

## Elevation & Depth

Flat. Depth is tonal: a white card on the blue-white ground, outlined by a 1px ring at foreground/10%. There is no shadow vocabulary in the app's own surfaces; overlays (dialogs, popovers, menus, toasts) take whatever the shadcn primitives ship. The sticky header uses an 80% background with backdrop blur rather than a shadow.

### Named Rules
**The Hairline-Not-Shadow Rule.** Separate surfaces with 1px borders, rings and tone. Do not add `shadow-*` utilities to cards, sections or badges.

## Shapes

Gently rounded everywhere from one base radius (`--radius` 10px): controls (buttons, inputs, selects, tabs) at 10px, small buttons capped at 8-12px, cards and card images at 14px, badges as full pills. Borders are always 1px in the `border`/`input` token. Focus is a 3px ring in `ring` at 50% plus a border shift to `ring`; invalid fields swap both to `destructive`.

## Components

shadcn/ui base-nova primitives in `src/components/ui` are the only building blocks; features compose them and never restyle their colour or shape.

### Buttons
- **Shape:** gently rounded (10px), 32px tall (36px `lg` for hero CTAs), 10px horizontal padding, 14px medium text, 16px icons.
- **Primary:** Decode Blue fill with white text; one per view, on the main action (sign up, pay/upload in the payment card, submit).
- **Hover / Focus:** primary dims to 80%; outline/ghost gain a Blue Wash fill; focus shows the 3px ring; press shifts 1px down.
- **Outline / Ghost / Secondary:** outline for secondary actions beside a primary (hero "join with code"); ghost for header nav and icon actions; secondary for quiet fills.
- **Destructive:** red text on a 10% red tint, never a solid red block; destructive actions confirm through AlertDialog.

### Chips (status badges)
- **Style:** 20px pill, 12px medium text, 8px horizontal padding.
- **Registration status:** `pending_payment` outline, `under_review` secondary (blue-grey), `accepted` success green, `rejected` destructive tint.
- **CP verdicts:** Accepted success green; Time Limit secondary; internal/exec-format errors outline; every other failure destructive tint.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** Card White on the Blue-White Ground.
- **Shadow Strategy:** none; 1px ring at foreground/10% (see Elevation).
- **Border:** footer separated by a top hairline on a 50% muted wash.
- **Internal Padding:** 16px (12px for `size="sm"`).

### Inputs / Fields
- **Style:** 32px, 1px `input` border, transparent fill, 10px radius, 14px text.
- **Focus:** border to `ring` plus 3px ring at 50%.
- **Error / Disabled:** `aria-invalid` turns border and ring destructive, with the message in `FieldError`; disabled drops to 50% opacity. Forms are built from `Field` / `FieldLabel` / `FieldDescription` / `FieldError` groups.

### Feedback states
- **Alert** (default card or destructive text) for inline form-level errors and notices.
- **Empty** for every no-data state (no teams, no registrations, no problems).
- **Skeleton** for loading in Suspense fallbacks (header actions, tables); **Spinner** inside buttons while a submit is pending.
- **Sonner** toasts, top-right, for transient confirmations.

### Navigation
- Sticky 56px header described in Layout; admin sub-navigation is a wrapping row of button-styled links above a bottom hairline, the active page as a secondary (Blue Wash) button and the rest ghost; user actions sit in a DropdownMenu.

### Progress step list (signature)
A vertical list of team registration steps: Decode Blue icon for done and current steps (current marked `aria-current="step"`), Slate for upcoming, Verdict Red for failed, joined by a 1px connector that is blue between completed steps and hairline otherwise.

### Charts
shadcn `ChartContainer` over Recharts: 288px tall line chart, horizontal grid only, no axis lines, 2px monotone lines without dots, legend plus crosshair tooltip, and a Table tab carrying the same data. Series colour comes from `--chart-N` by stable competition order.

### Code editor
Monaco themed from tokens at runtime: Card White background, Decode Blue keywords/types/cursor, Pass Green strings, Verdict Red numbers, italic Slate comments, Blue Wash current line, primary at 20% for selection.

## Do's and Don'ts

### Do:
- **Do** take every colour from `globals.css` tokens through Tailwind aliases or `var(--token)`; add a new token there before using a new colour.
- **Do** compose screens only from `src/components/ui` shadcn primitives; use Field for forms, Alert for errors, Empty for no-data, Skeleton for loading and Spinner for pending buttons.
- **Do** keep pages in the `max-w-6xl` column with 16px gutters and 24px block spacing.
- **Do** colour statuses through the shared `RegistrationStatusBadge` and `VerdictBadge` mappings.
- **Do** set codes, NISN, phone numbers and slugs in Geist Mono, and numbers in tabular figures.
- **Do** source every visible string from the `id` and `en` dictionaries (Indonesian default), and format dates and numbers with `INTL_LOCALE` (`id-ID`, `en-GB`).
- **Do** gate any new motion on `prefers-reduced-motion` and keep it to the hero-style fade.

### Don't:
- **Don't** use hex values, Tailwind palette colours or inline colour styles anywhere in components.
- **Don't** use blue for accepted/passed states or green for actions.
- **Don't** add shadows, gradients or themed decoration to cards and sections on working screens.
- **Don't** install the masdes display fonts on the web.
- **Don't** fill destructive buttons or badges with solid red; use the 10% tint.
- **Don't** hard-code user-facing text in one language.
- **Don't** add scroll-triggered or looping animation outside the landing hero.
