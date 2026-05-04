# Versioning Rules

Format version: `MAJOR.MINOR.PATCH` (`0.0.0` format).

- `MAJOR`:
  - For major evolution of FabButton.
  - Current baseline starts at `1`.
- `MINOR`:
  - Increase for merged pull request that adds feature/improvement.
- `PATCH`:
  - Increase for any bug fix/hotfix.

## Practical Commands

- Major bump:
  - `npm run version:major-button`
- Minor bump (merge PR):
  - `npm run version:merge`
- Patch bump (fix):
  - `npm run version:fix`

## Notes

- Run version bump only when git working tree is clean.
- Always run `pnpm build` and `npm pack --dry-run` before publishing.
