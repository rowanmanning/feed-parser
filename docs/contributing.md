

# Contribution Guide

I welcome contributions to this project. This guide outlines what's expected of you when you contribute, and what you can expect from me in return.

## Table of Contents

  * [What I expect from you](#what-i-expect-from-you)
  * [What you can expect from me](#what-you-can-expect-from-me)
  * [Technical](#technical)


## What I expect from you

If you're going to contribute to this project, thanks! I have a few expectations of contributors:

  1. [Follow the code of conduct](code_of_conduct.md)
  2. [Follow the technical contribution guidelines](#technical)
  3. Be respectful of the time and energy that me and other contributors offer


## What you can expect from me

If you're a contributor to this project, you can expect the following from me:

  1. I will enforce [this project's code of conduct](code_of_conduct.md)
  2. If I decide not to implement a feature or accept a PR, I will explain why

Contributing to this project **does not**:

  1. Guarantee you my (or any other contributor's) attention or time – I work on this in my free time and I make no promises about how quickly somebody will get back to you on a PR, Issue, or general query
  2. Mean your contribution will be accepted


## Technical

To contribute to this project's code, clone this repo locally and commit your work on a separate branch. Open a pull-request to get your changes merged. If you're doing any large feature work, please make sure to have a discussion in an issue first – I'd rather not waste your time if it's not a feature I want to add to this project 🙂

I don't offer any guarantees on how long it will take me to review a PR or respond to an issue, [as outlined here](#what-you-can-expect-from-me).

### Committing

Commit messages must be written using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). This is how our [release system](https://github.com/googleapis/release-please#readme) knows what a given commit means.

```
<type>: <description>

[body]
```

The `type` can be any of `feat`, `fix`, `docs` or `chore`.

The prefix is used to calculate the [Semantic Versioning](https://semver.org/) release:

| **type**  | when to use                                            | release level |
| --------- | ------------------------------------------------------ | ------------- |
| feat      | a feature has been added                               | `minor`       |
| fix       | a bug has been patched                                 | `patch`       |
| docs      | a change to documentation                              | `patch`       |
| chore     | repo maintenance and support tasks                     | none          |

Indicate a breaking change by placing an `!` between the type name and the colon, e.g.

```
feat!: add a breaking feature
```

We use [commitlint](https://commitlint.js.org/) to enforce these commit messages.

### Linting

This project is linted using [ESLint](https://eslint.org/), configured in the way I normally write JavaScript. Please keep to the existing style.

ESLint errors will fail the build on any PRs. Most editors have an ESLint plugin which will pick up errors, but you can also run the linter manually with the following command:

```
npm run verify:eslint
```

### TypeScript

Although this project is written in JavaScript, it is checked with [TypeScript](https://www.typescriptlang.org/) to ensure type-safety. We also document all types with JSDoc so you should get type hints if your editor supports these.

Type errors will fail the build on any PRs. Most editors have a TypeScript plugin which will pick up errors, but you can also check types manually with the following command:

```
npm run verify:types
```

### Unit tests

This project has unit tests with good coverage, and failing unit tests will fail the build on any PRs. If you add or remove features, please update the tests to match.

You can run tests manually with the following command:

```
npm run test:unit
```

### Integration tests

This project has end to end integration tests, and these tests can fail the build on PRs. If you add or remove features, please update the tests to match.

You can run integration tests manually with the following command:

```
npm run test:integration
```