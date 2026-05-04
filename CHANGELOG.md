# Changelog

Semua perubahan penting pada `@rezafab/fab-button` dicatat di file ini.

## [1.0.0] - 2026-05-04

- Set baseline major ke `1` sesuai aturan versioning baru.
- Rapikan konfigurasi publish npm agar isi paket hanya file production:
  - include: `README.md`, `LICENSE`, `package.json`, build output, `.d.ts`, compiled CSS
  - exclude: docs app, changeset folder, source/story/config yang tidak perlu untuk consumer
- Tambah export map root untuk akses subpath:
  - `./core`, `./react`, `./vue`, `./svelte`, `./element`
  - CSS subpath exports
- Tambah panduan versioning dan script bump versi:
  - major untuk perubahan besar button
  - minor untuk merge PR (fitur/improvement)
  - patch untuk fix

## [0.0.1]

- Initial published release of `@rezafab/fab-button`.
