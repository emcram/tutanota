# Repository Guidelines

## Project Structure & Build Focus (Debian Desktop)
- `src/`: primary desktop/client code (UI, API, crypto, worker). Most build issues trace here.
- `buildSrc/`: build tooling for web/desktop packaging.
- `desktop.js`: **entrypoint for Debian desktop builds**.
- `resources/` + `libs/`: packaged assets and vendor JS/wasm.
- `artifacts/desktop/`: output location used by CI for `.deb` packages.

## Build & Packaging (Debian)
- Install deps: `npm ci` (requires Node ≥ 22.16, npm ≥ 10 per `package.json`).
- Build workspace packages: `npm run build-packages`.
- Build Debian desktop package:
  - `node desktop release --custom-desktop-release --platform linux --architecture x64`
  - Produces `.deb` under `artifacts/desktop/` in CI; locally you’ll see artifacts under the build output paths used by `desktop.js`.
- Web build (used by desktop bundling):
  - `node make prod` (production web assets)

## CI Responsibilities (GitLab + GitHub Actions)
- **GitLab CI** (`.gitlab-ci.yml`) runs Rust verify/test using shared templates from  
  `core-assets/cicd-factory/delivery/rustc/{verify.yml,test.yml}`.  
  Jobs are **manual on protected `mcr/staging`** and **skipped on tags** by default.
  - Test scope is controlled by variables:  
    `CARGO_TEST_FLAGS="--package tuta-sdk --package crypto-primitives --package tutao_node-mimimi"`  
    `CARGO_FMT_FLAGS`, `CARGO_CLIPPY_FLAGS`, `RUSTUP_TOOLCHAIN`, `EXTRA_DEPS`.
- **GitHub Actions** (`.github/workflows/*.yml`) performs the **desktop build and Debian packaging**.  
  Tag pushes `gl-tutanota-v*` on `mcr/release` trigger the Debian artifact pipeline.

## Coding Style & Naming
- Indentation: **tabs**, `indent_size=2`, LF line endings; no final newline (`.editorconfig`).
- Keep names aligned with existing patterns (e.g., `*Facade`, `*Service`, `*View`).
- Format/lint: `npm run style:check`, `npm run lint:check` (or `npm run check`).

## Testing Guidelines
- Rust tests (local): `cargo test --package tuta-sdk --package crypto-primitives --package tutao_node-mimimi`.
- TypeScript tests (optional): `npm test`.
- In CI, Rust tests are controlled by `.gitlab-ci.yml` variables; avoid enabling `test-with-local-http-server` unless the runner provides it.

## Commit, Merge, and Tag Flow
- Work on `mcr/main`, then merge → `mcr/staging` → `mcr/release`.
- Tag releases at the **tip of `mcr/release`** using `gl-tutanota-v<version>-rN`.

## Configuration & Local Cache
- Desktop caches server models in `~/.config/tutanota-desktop/server_type_models.json`. Delete it when changing model versions to avoid stale headers.
