# Handover Check

A mobile-first web app that guides flat buyers in Bangladesh through a
handover-day inspection and produces a PDF defect report to give the
developer.

"Handover Check" is a working title. It is set in one place,
`src/config.ts`.

## What it does

1. **Start screen.** Shows "What to bring" and "Ground rules", then the buyer
   enters the layout (bedrooms, bathrooms, balconies) and, optionally, the
   project name, flat number, their name and the visit date.
2. **Room-by-room checklist.** The app builds the room list from the layout:

   | Room or area                           | Sections used                                |
   | -------------------------------------- | -------------------------------------------- |
   | Living room, dining room, each bedroom | A                                            |
   | Each bathroom                          | A and B                                      |
   | Kitchen                                | A and C                                      |
   | Each balcony                           | D, plus the wall and ceiling checks A1 to A6 |
   | Whole flat, once                       | E                                            |
   | Building and common areas, once        | F                                            |
   | End of the visit                       | G                                            |

3. **Each item** is marked OK, Problem or Not applicable, with its "how to
   check" text underneath (the buyer can hide these). Each group has an
   **All OK** button, which marks only the items not yet answered, so it
   never hides a problem. A problem gets a severity (Minor, Major, Safety),
   a short note, and photos from the camera or gallery.
4. **Report.** Problems room by room with Safety items first, then a short
   list of items checked OK. It is saved as a PDF that can be shared (for
   example to WhatsApp or email) or saved on the phone.

Progress is saved on the phone as the buyer goes, so a refresh or a closed
tab does not lose work. After the first visit the app works with no
internet connection.

## Privacy

Everything stays on the buyer's phone. There is no server, no account and
no tracking. Answers are kept in the browser's local storage and photos in
its IndexedDB database. The repository holds no secrets or API keys, and
the app needs none.

## Requirements

- Node.js 20.19 or later (or 22.12 or later), with npm.

## Install

```sh
npm install
```

## Run during development

```sh
npm run dev
```

Then open the address it prints (usually http://localhost:5173). To try
it on a phone on the same Wi-Fi, run `npm run dev -- --host` and open the
"Network" address on the phone.

Offline mode is switched off in development. Use a production build to
test it (see below).

## Build

```sh
npm run build
```

This type-checks the code and writes a static site to `dist/`. Upload the
contents of `dist/` to any static web host. It works at the root of a
domain or in a sub-folder (for example GitHub Pages). The host must use
HTTPS, which browsers require for offline mode and installing to the home
screen.

To try the build locally:

```sh
npm run preview
```

## Publish on GitHub Pages

The workflow in `.github/workflows/deploy.yml` runs the tests, builds the
app and publishes it every time `main` changes. To switch it on once:

1. On GitHub, open the repository's **Settings > Pages**.
2. Under **Build and deployment > Source**, choose **GitHub Actions**.
3. Merge into `main`, or run the workflow by hand from the **Actions** tab.

The app is then at `https://<user>.github.io/<repository>/`, for this
repository https://mohaimanulrifat.github.io/Flat_Handover/. Open it on a
phone and use "Add to Home screen" to install it.

## Test

```sh
npm test            # run the tests once
npm run test:watch  # re-run tests on every change
npm run typecheck   # check TypeScript types
```

The tests cover:

- `src/lib/rooms.test.ts`: building the room list from the layout (room
  order, which sections each room gets, balcony A1 to A6, rooms that the
  flat does not have, stable room ids, invalid layout numbers).
- `src/data/checklist.test.ts`: the checklist data matches draft 1 (item
  codes, counts per section, the six [Confirm] items, the room mapping).
- `src/lib/inspection.test.ts`: answers, All OK, layout changes and saving.
- `src/lib/report.test.ts`: report order (Safety first, then by room and
  severity) and counts.

## Changing the content

| What                               | Where                                  |
| ---------------------------------- | -------------------------------------- |
| Checklist items, how-to-check text | `src/data/checklist.ts`                |
| What to bring, ground rules        | `src/data/checklist.ts`                |
| Severity meanings and examples     | `src/data/checklist.ts`                |
| Which sections each room uses      | `src/data/checklist.ts` (`roomTypes`)  |
| App name                           | `src/config.ts` (`APP_TITLE`)          |
| Severity names and colours         | `src/config.ts`                        |
| PDF report footer                  | `src/config.ts` (`REPORT_FOOTER_TEXT`) |

The checklist text comes from `Flat_Handover_Checklist_Draft1.docx`. The
"Your note" column and "Decisions for you" section of that document are
review material and are not in the app.

Items marked **[Confirm]** in the draft (A21, B13, D2, E3, E10 and G8) have
`confirm: true` in the data file, and D2 also keeps the marker's text in
`confirmNote`. The marker is not shown to buyers. When the reviewed draft
comes back, update the text and remove the flag; `npm test` will then
remind you to update the list of flagged items in
`src/data/checklist.test.ts`.

If you rename a severity level, also check the how-to-check texts that
mention a level by name (for example A1 "Mark Major", A2 "mark Safety").

After changing content, run `npm test` and `npm run build`, then deploy.
Phones that already have the app see an "Update now" button the next time
they open it online.

## How it is built

- Vite, React and TypeScript. The only other runtime dependency is
  [pdf-lib](https://pdf-lib.js.org/), loaded only when a PDF is made.
- `src/lib/rooms.ts` turns the layout into rooms using the mapping in the
  data file.
- `src/lib/inspection.ts` holds the answers and saves them;
  `src/lib/photos.ts` stores photos (shrunk to 1600 px on the phone).
- `src/lib/report.ts` orders the report; `src/lib/pdf.ts` draws the PDF.
  Text the PDF's built-in font cannot show, such as notes typed in Bangla,
  is drawn by the phone's browser and added as an image.
- `src/service-worker.js` and `build/offline.ts` provide offline use and
  the web app manifest, without a PWA library.

## Known limits

- Work is saved in one browser on one phone. Clearing the browser's data
  deletes it, and it does not move between devices.
- On iPhone, Safari may clear saved data for websites that are not used
  for several weeks. Adding the app to the home screen avoids this.
- Living room, dining room and kitchen are always included, one of each.
