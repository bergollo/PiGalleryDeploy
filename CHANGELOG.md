# CHANGELOG
## Unreleased

- Add CI workflows for building frontend/backend and running tests.
- Improve Ansible role test coverage and idempotence checks.
- Add image optimization pipeline (automatic resizing, WebP conversion).
Replace npm scripts with pnpm workspace scripts for faster installs (optional).
Add OTA update flow for Pi devices and zero-downtime deployments.
Add encrypted secrets handling (Ansible Vault or similar).
Add smoke/integration tests that run against a simulated Pi in CI.
Improve documentation with screenshots, demo GIFs, and configuration examples.

## 0.1.0 — Initial release (example)
Initial monorepo with Next.js frontend, Express backend, and Ansible deployment roles.
Headless provisioning scripts for Raspberry Pi.
Basic UI for uploading and organizing photos.
Systemd service and nginx configuration templates included.
Packaging script to create deployable artifact.