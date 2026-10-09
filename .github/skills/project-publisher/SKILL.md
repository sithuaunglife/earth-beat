---
name: project-publisher
description: Create, structure, or publish a product made of separate app, API, and mobile repositories plus a Git submodule superproject. Use when scaffolding projects, preparing GitHub source publishing, or creating READMEs, licenses, and repository links.
---

# Multi-Repository Project Publishing

Treat app, API, and mobile as independent projects with independent Git histories and remotes. Also create a separate root repository that integrates them as Git submodules. Do not turn the product repositories into ordinary nested folders in the root repo.

## Default project stack

- App: React, React Router, TanStack Query (React Query), and shadcn/ui initialized with preset `beEhfqy2`.
- API: Express, SQLite, Prisma 7, and JWT authentication. Include a substantial deterministic seed dataset, clearly distinguished from real third-party data.
- Mobile: React Native and Expo.
- Ask the user about product features, data sources, account behavior, or stack choices when the request does not establish them. Do not delay work to ask about decisions already specified.

## Repository layout and naming

For a project named `<projectname>`, create and publish these repositories independently:

- `<projectname>-app`
- `<projectname>-api`
- `<projectname>-mobile`
- `<projectname>` as the root superproject containing submodule references to the three repositories.

Each subproject has its own package/dependency setup, tests, CI as appropriate, README, and suitable license. The root repo has its own README, license, and submodule configuration. Explain each repository's responsibility, setup, test/build commands, environment variables, and relationship to the others. Pin submodules to intentional commits and verify a recursive clone.

## GitHub visibility and release safety

- The app repository is public by default unless the user explicitly asks for it to be private. An explicit private request always wins; never flip a private repository to public without authorization.
- Confirm visibility for API, mobile, and root repositories when the user has not specified it. A public app does not imply permission to expose the API, mobile app, or root repository.
- Confirm the GitHub owner/organization before creating remotes. Never publish on an assumed account.
- Before publishing, inspect staged and untracked files for credentials, private data, local databases, generated artifacts, and unlicensed assets. Use environment examples without real secrets; keep tokens out of remotes and submodule URLs.
- Select licenses appropriate to source, documentation, assets, and dependencies; do not invent ownership or apply a license the user has not approved when the choice is consequential.
- Run each project's install, lint, tests, and production build independently when available. Verify root submodule status and a fresh recursive clone before calling the integration repository complete.

## Execution

1. Inspect the workspace and establish whether the requested work is a prototype, a production project, or both.
2. Record confirmed product scope, stack, data provenance, repository names, visibility, and licensing decisions. Ask concise questions only for unresolved decisions that block safe implementation or publication.
3. Create each project in its own repository-ready root. Keep project-specific commits and publishing independent.
4. Initialize the root superproject, add each remote as a submodule, write integration documentation, and verify the recursive checkout.
5. Report repository names, visibility, validations, and any decisions still awaiting the user. Do not create or publish GitHub repositories unless the user has authorized that action and the required owner/visibility information is known.
