# Local production and deployment readiness

This repository is pre-launch. The commands below create local production previews only; they do not deploy, publish, bind a domain, enable indexing, or activate monitoring or commercial providers.

## Build and run locally

Use Node 20 with npm 11 and the committed lockfile. The Docker dependency stage pins npm 11.6.2 before running `npm ci` so its lockfile parser matches the repository toolchain:

```powershell
npm.cmd ci
npm.cmd run build:app
$env:HOSTNAME = "127.0.0.1"
$env:PORT = "3000"
node .next/standalone/server.js
```

For the standalone server, copy `.next/static` into `.next/standalone/.next/static` and `public` into `.next/standalone/public` before starting when testing outside Docker. The Docker image performs these copies.

Local container preview:

```powershell
docker build -t clearmoney-local-preview:3a05 .
docker run --rm --name clearmoney-3a05 -p 127.0.0.1:3000:3000 clearmoney-local-preview:3a05
```

Or, where Docker Compose v2 is installed:

```powershell
docker compose -f docker-compose.preview.yml up --build
docker compose -f docker-compose.preview.yml down
```

Never add `-v`, external interfaces, production secrets, or a public registry to this local preview workflow without a separately reviewed deployment design.

## Readiness and health

`getDeploymentReadiness()` in `lib/deployment/readiness.ts` is the central gate. It currently returns false because the approved public name, legal operator, verified HTTPS canonical origin, verified feedback address, policy approvals, author/reviewer evidence, and publication approval are incomplete. No single environment variable can bypass those facts.

`GET /healthz` returns only `{"status":"ok"}` with `Cache-Control: no-store, max-age=0`. It must not expose configuration, versions, paths, repository state, or calculator data.

Smoke-check a running preview:

```powershell
$paths = "/", "/calculators", "/calculators/compound-interest", "/healthz"
foreach ($path in $paths) { Invoke-WebRequest -UseBasicParsing "http://127.0.0.1:3000$path" }
```

## Security response checks

Verify actual responses for `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and `Cross-Origin-Opener-Policy`. HSTS is intentionally absent on local HTTP and must be added only after an approved HTTPS deployment design.

A CSP is intentionally deferred. Next.js emits inline bootstrap scripts for the current statically generated pages. A nonce policy would force dynamic rendering and remove static/CDN advantages; an `unsafe-inline` script policy would not meet the desired protection level, and experimental SRI is not adopted as a release foundation. Reassess a strong CSP after the hosting platform and production origin are approved.

## Performance and monitoring

Laboratory targets are LCP <= 2.5 s, CLS <= 0.1, and TBT <= 200 ms. TBT is only a laboratory responsiveness proxy, never a field INP claim. Long-term field targets are LCP <= 2.5 s, INP <= 200 ms, and CLS <= 0.1 at the 75th percentile. There is currently **no field-data claim**.

The production response-body baseline was measured from the four required routes after a standalone build. The largest route referenced 592,558 bytes of JavaScript, 42,339 bytes of CSS, 62,905 bytes of initial HTML, 697,802 bytes in total, and 11 HTML/static-asset responses. Accordingly, the enforceable ceilings are 650,000 JavaScript bytes, 50,000 CSS bytes, 80,000 initial HTML bytes, 800,000 total bytes, and 15 responses. These are uncompressed referenced response-body measurements, not Core Web Vitals or field telemetry. Use system fonts, prefer CSS/SVG for simple visuals, size and compress any future raster image, lazy-load below-the-fold media, and remeasure before accepting a new font or image payload.

The build has zero permitted third-party script requests. Monitoring, analytics, advertising, affiliate, and personalization network transmission remain disabled. Future monitoring may send only a route template, performance metric, time bucket, and coarse device category; it must omit query strings, calculator inputs, IP addresses, identifiers, fingerprints, and personal data.

Before enabling any external service, update Privacy, obtain Human and legal approval, validate consent requirements for the intended regions, and repeat the release gate.

## Decisions still required

The formal brand, legal operator, production domain, hosting platform and region, feedback address, author/reviewer identities, legal review, monitoring/analytics providers, CMP, AdSense account, and affiliate partners all remain Human decisions. This local preview is not a production deployment and is not ready for public release.
