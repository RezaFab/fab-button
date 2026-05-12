# Contributing

Thanks for your interest in contributing to FabButton.

## How to Contribute

- Open an issue for bugs, feature ideas, or adapter proposals.
- Submit a pull request for fixes or improvements.
- Keep changes focused, documented, and covered by tests when relevant.

## Local Development

```bash
pnpm install
pnpm build
pnpm storybook
```

## Release Flow (pnpm Workspace)

Use this flow for publishing:

```bash
pnpm run release
git add -A
git commit -m "chore: version packages"
pnpm run release:publish
```

`release:publish` publishes workspace packages first, then publishes the workspace root package.
Avoid using `changeset publish` directly in this repo, because it runs `npm publish` and may publish `workspace:*` dependencies without conversion.
