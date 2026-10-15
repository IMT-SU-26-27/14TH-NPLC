# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Participants:** Indonesian high-school students (identified by NISN) competing in teams. A team leader creates the team, pays the registration fee by QRIS and tracks the review; members join with the team's code. They use the site on phones and laptops about equally; the competitive programming contest itself is done on laptops.
- **Admins:** the organizing committee. They manage competitions, review payment proofs, accept or reject teams with a reason, write contest problems and start/stop the live contest.

## Product Purpose

Registration and contest platform for the 14th NPLC (National Programming & Logic Competition). It replaces manual sign-up and payment checking: teams register online, pay by QRIS, and see exactly where their registration stands. Accepted competitive programming teams compete online with real-time judging (self-hosted Judge0) and a live leaderboard. Success means every team knows its status without contacting the committee, and the contest runs without manual scoring.

## Operating Context

- Several competitions can run at once. Currently: Competitive Programming (online contest on this site) and Category 2 (logic; registration only for now).
- Payment is manual: the admin uploads a QRIS image per competition, the leader pays and uploads proof, an admin verifies it. No payment gateway (no Midtrans/Xendit).
- The CP contest opens only when an admin presses start; participants wait in a waiting room until then. Problems are levels with sample and hidden test cases; languages are Python, C++ and Java.
- Times are Indonesian Western Time (WIB).

## Capabilities and Constraints

- Email/password sign-in. Google sign-in is planned later; accounts with the same email must link.
- Team size per competition is set by the admin. Team names are fixed once created; leaders can only add (by code) or remove members.
- Only accepted registrations count toward "registered" totals.
- Stack is fixed: Next.js 16 (App Router, Cache Components), self-hosted Supabase (Postgres, Auth, Realtime), Cloudinary for files, shadcn/ui components only, colors only from the theme in `globals.css`.
- **Language:** bilingual, Bahasa Indonesia by default with an English option.

## Brand Commitments

- Name: "14th NPLC". No logo, color or typography assets exist yet; a logo may be added later, so layouts should leave room for one.
- **Standing visual preference (chosen 2026-10-15):** the category standard, executed at full craft: a clean product dashboard, not a themed or illustrative world. Quality bar: Stripe Dashboard and the official shadcn/ui examples.
- The admin dashboard must show registrations over time for Competitive Programming and Category 2.

## Evidence on Hand

- No sponsor logos, past-winner stories, statistics, testimonials or prize details have been provided. Do not invent them.

## Product Principles

1. Status is never a mystery: every team can see where it stands and why.
2. Fair contest above all: timing, judging and the leaderboard must be trustworthy and identical for every team.
3. Admin work is fast and checkable: find any team in seconds, decide with the evidence in view.
4. Works on a student's phone as well as on a laptop.
