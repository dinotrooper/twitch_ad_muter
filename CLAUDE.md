# CLAUDE.md

## Build and test in Docker

Run `npm install`, builds and tests inside a Docker container, never on the host.

- **Image:** use a Node image with npm that was published at least three weeks before the current date and has no critical CVEs. Pin it by digest.
- **Current image:** `node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1` (published 2026-09-18; Trivy scan on 2026-10-20 found 0 critical).
- **Checking an image:** scan it with Trivy before switching, for example:
  `docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --scanners vuln --severity CRITICAL <image>`
- **New npm packages:** apply the same three-week rule with `npm install --before=<date three weeks ago>`.

Use the `Makefile`, which runs each step in that image as your own user:

- `make test`: run the tests.
- `make build`: package the addon into `web-ext-artifacts/`.
- `make` (or `make all`): test, then build.
- `make install`: run `npm ci` (the other targets do this when needed).
- `make clean`: remove `node_modules` and `web-ext-artifacts`.

When changing the image, update `IMAGE` in the `Makefile` and the current image above. For other npm commands, use the same `docker run` line as `DOCKER_RUN` in the `Makefile`.
