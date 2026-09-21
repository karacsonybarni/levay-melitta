# Lévay Melitta website

Hungarian-first, English-supported static website with a separate Google Apps Script email and appointment backend. Built with TypeScript and Vite, with locally bundled fonts and original SVG linework. No paid server, database, analytics, or marketing cookies.

## Status and content

This is a shareable **preview**, deliberately marked `noindex`. Melitta's verified professional title, practice areas, biography, bar registration, office address, contact details and approved privacy notice have not been provided. Do not remove the preview notice until these are verified. No credentials, awards, testimonials or case outcomes have been invented. The initial integration uses the setup owner's Google account and a dedicated calendar; test data only until the production controller and privacy terms are finalized.

## Development

Node.js 22 or later. Run `npm ci`, `npm test`, `npm run build`. Use `npm run dev` for local development. Copy `.env.example` to `.env.local` and set the dedicated Apps Script `/exec` URL to test integration. Never point this site at the Integral Counseling endpoint.

## Free hosting and CI/CD

Live site: https://karacsonybarni.github.io/levay-melitta/

Apps Script editor: https://script.google.com/home/projects/1wpaViJRSJV0daolAlGEUTxcsfBcIvQPPFyMv51pUKKxNxSNVWimA0gx_/edit

Public backend: https://script.google.com/macros/s/AKfycbyOBIMGl7llKgzZ97QJIDt_ofdJtJDxXTt7FOb3TomB6GsnWkxT3ztHcSkXzDd2G5t8/exec

Both frontend and backend CI/CD are configured and enabled. The Google deployment uses the setup owner's account and the separate **Lévay Melitta — website appointments** calendar.

The public repository deploys to GitHub Pages. `.github/workflows/deploy-pages.yml` runs backend regression tests, TypeScript checks, and the production build on pull requests and main pushes. Only successful main builds deploy. Set Pages source to **GitHub Actions**. Repository variable `VITE_APPS_SCRIPT_WEB_APP_URL` is the public backend URL, not a credential.

GitHub Pages and consumer Apps Script have no hosting subscription cost within their service limits. Apps Script daily mail/execution quotas apply; no unlimited delivery guarantee is made.

## Google backend

`apps-script/Code.gs` adapts the calendar caching, conflict checks, locking and booking retry protection from the user-owned `integral-counseling` project. Only free start times are public. Calendar titles, guests and event details stay server-side. MailApp delivers enquiries into the configured Gmail inbox, using the visitor's address as reply-to; it does not read the inbox.

1. Create a dedicated Apps Script project and copy `Code.gs`, `Setup.gs`, and `appsscript.json`.
2. Run `setupWebsite` once as the intended account owner and authorize Google Calendar and email sending. This creates a dedicated calendar and saves `BOOKING_CALENDAR_ID` and `RECIPIENT_EMAIL` in Script Properties. It does not modify Integral Counseling's script or calendar.
3. Deploy as a web app, executing as the owner, accessible to Anyone. Put its `/exec` URL in the GitHub repository variable above.
4. Test a contact message and a booking with controlled test data. Confirm the email, event, calendar invitation and disappearance of the booked slot.
5. Redeploy a new version of the same web-app deployment after backend changes. The existing URL remains stable. Frontend GitHub Actions deployment does not automatically deploy Apps Script unless the backend workflow below is configured.

### Backend CI/CD activation

`.github/workflows/deploy-backend.yml` verifies and publishes backend changes on main, retaining the existing deployment URL. It stays disabled until the first live Google setup and smoke test succeed. Configure the `google-backend` GitHub environment with secret `CLASP_AUTH` (the official CLI authorization JSON, never committed) and variables `APPS_SCRIPT_ID` and `APPS_SCRIPT_DEPLOYMENT_ID`. Set repository variable `APPS_SCRIPT_CI_ENABLED=true` only after configuration. The runner writes credentials to a temporary file with restrictive permissions and removes it afterward. Only main can deploy; pull requests do not receive credentials. If authorization is revoked, renew the secret through the official Google login flow. Scope changes can still require owner authorization in Google's editor.

Default preview appointment settings match the reference implementation: 55 minutes, starts every 30 minutes, 09:00–20:00 daily, 24 hours' notice, a 60-day horizon, and Europe/Budapest time. Agree Melitta's actual working hours and fees before production use. Dedicated-calendar availability does not automatically reflect events on other calendars.

The endpoint is public and uses light bot filtering (honeypot and minimum elapsed time), not a full abuse-prevention service. Do not collect confidential legal documents through it. Booking retries with the same browser-held request ID avoid duplicate events; uncertain responses should be checked against the invitation before retrying from a new page.

## Design references

Visual research date: 2026-09-21. Direct browser screenshot inspection of [Kümmerlein](https://www.kuemmerlein.de/) and [GRLICA LAW](https://www.grlicalaw.com/) informed the redesign: prominent firm identity, strong typographic scale, high contrast, structured navigation, and direct contact access. Kümmerlein's [German Brand Award case](https://www.german-brand-award.com/en/gallery/detail/brand-design-corporate-brand/kuemmerlein-anwaelte-notare) provides award context. These are specific visual references, not a claim that one palette represents the whole legal industry.

The current UI is a structural rebuild. It replaces the former split hero / values / three-step process / embedded contact-form landing page with:

- A full-width sans-serif name masthead and original architectural linework.
- A large contact directory and native expandable practical-information sections.
- Dedicated enquiry and appointment views, linked through query parameters so GitHub Pages can serve direct links without rewrite rules.
- Numbered intake fields and separate day/time controls populated from live availability.
- A navy, white and cobalt system, with phone layouts as the default and larger-screen grids added progressively.

Integral Counseling is exclusively the backend/integration reference. No invented professional specialty, portrait, office, award or client result appears. The original reskin was rejected because it retained the structure; that structure and stylesheet have now been replaced.

## Validation

`npm test` covers calendar overlap, stale slots, booking locks, retry deduplication, availability-cache invalidation and HTML response escaping. Real Google authorization, delivery and deployment need live smoke checks. Preview owner details in the bilingual privacy copy must be updated when ownership transfers to Melitta.

Live verification on 2026-09-21: Hungarian contact submission returned success and arrived in the configured Gmail inbox. English booking created a 55-minute event in the dedicated calendar, delivered the invitation and owner notification, and removed the selected and overlapping slots from anonymous availability. The disposable test booking was removed afterward. Backend GitHub Actions run `35611030874` successfully published a new version using the same public URL. Frontend workflow run `35610750796` successfully deployed the connected site. An independent reviewer cleared the implementation, security fixes, workflows, and deployment manifest. Professional details and production privacy wording still need Melitta's confirmation.
