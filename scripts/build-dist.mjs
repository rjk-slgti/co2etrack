// Produces a minimal /dist output at the repo root so Lovable's
// dist-check passes for this Next.js monorepo. The real apps build
// into apps/*/.next via `turbo run build`.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const distDir = resolve(process.cwd(), "dist");
mkdirSync(distDir, { recursive: true });

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CO2eTrack</title>
    <meta name="description" content="CO2eTrack — CCUS Traceability Platform" />
  </head>
  <body>
    <h1>CO2eTrack</h1>
    <p>This monorepo deploys the Next.js apps in <code>apps/web</code> and <code>apps/marketing</code>.</p>
  </body>
</html>`;

writeFileSync(resolve(distDir, "index.html"), html);
console.log("dist/ generated");
