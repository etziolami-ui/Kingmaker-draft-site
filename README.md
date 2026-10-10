# T.A.B. draft site

This is the **draft download/landing page for T.A.B. (Tiny Ass Browser)** — the public-facing
name for the Kingmaker browser engine project (a from-scratch browser engine in pure Rust).

**T.A.B. is not released.** There are no binaries, no installers, no checksums, and no release
dates. This page is the skeleton of the download page that will exist when there is something to
download, and every placeholder on it is marked as a placeholder.

Live draft: `https://etziolami-ui.github.io/Kingmaker-draft-site/` (GitHub Pages, `main` branch).

## Files

| file | purpose |
|---|---|
| `index.html` | the page (hero, download, why, conformance, FAQ) |
| `styles.css` | dark theme, responsive, system fonts only |
| `app.js` | renders the conformance table client-side from `data/conformance.json` |
| `data/conformance.json` | verbatim copy of the conformance board snapshot |

No build step, no framework, no external requests, no web fonts. Renders offline. The page is
`noindex` while it is a draft.

## Where the numbers come from

`data/conformance.json` is a byte-for-byte copy of the project's internal conformance board
snapshot (`site-draft-data/conformance-snapshot.json` in the engine workspace). The snapshot has
one entry per suite with `passed`, `attempted`, `failed`, `timed_out`, `crashed`,
`harness_errors`, `skipped`, `not_run`, and a `measured` flag, plus the board run seal
(`board_run`, e.g. `20261010T131758Z-194d7e512b3c`).

Rendering rules enforced by `app.js`:

- Percentages are computed in the browser, only as `passed / attempted`.
- A suite with `measured: false` is labelled **"carried from an earlier run"** — never presented
  as fresh. `measured: true` is labelled **"fresh"**.
- If a suite had no data at all it would read "not yet measured"; if the data file fails to load
  the panel says so instead of claiming anything.
- `app.js` also re-checks live that every suite's itemization sums exactly to `attempted`, and
  states the result on the page.
- There is deliberately **no cross-suite total pass rate** — per-suite rows only, no scoreboard
  inflation.

## Regenerating the numbers

1. Run the conformance board for the suite(s) you want fresh.
2. Export its snapshot as `conformance-snapshot.json` (same field shape as above).
3. Copy it over `data/conformance.json` in this repo, byte-for-byte — do not hand-edit numbers.
4. Keep the `measured` flags honest: only suites measured in the new run get `true`.
5. Commit and push; Pages redeploys automatically.

## Size footnote on the page

The "Written in Rust" card cites `636,648` lines, produced by:

```
find crates -name '*.rs' | xargs wc -l | tail -1
```

run in the engine workspace on 2026-10-10, across all 30 workspace crates (including legacy-path
crates being superseded). Re-run it if you update the figure.

## Honesty rules for edits

Never add release dates, version numbers, file sizes, checksums, or signed-installer claims.
Never present carried conformance numbers as fresh. Anything not in the snapshot says
"not yet measured". The domain (`tab.tools`) is a marked placeholder — domain TBD.
