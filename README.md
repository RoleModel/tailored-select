# Overview

## Name and aliases

The project is named Tailored Select. Some will refer to it as Bob Select or Yoinker™️.

## Purpose

Tailored Select is a Web Component built to be a searchable select box. Inspired by tom-select.js to provide a framework agnostic autocomplete widget with native-feeling keyboard navigation. Useful for tagging, contact lists, etc.

## Technologies

### Chosen

* [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) As the foundational technology.
* [Lit](https://lit.dev/) for easily creating Web Components.
* [Vite](https://vitejs.dev/) for a fast development environment that handles developing, building, and publishing the project.

## Technology relationships

* Web Component
* Simple Form Component (TODO: link to rolemodel rails)
* Capybara test helper (TODO: link to rolemodel rails)

## Supported browsers

This project is supported in all modern browsers.

# How to set up the project

## External tool installation

`yarn install`

## How to run locally

`yarn vite`

## How to run tests

TODO: Add tests

## Editor plugins

* TODO: Maybe add prettier?

## Troubleshooting information

* [App Status Page](http://app.<applicationname>.com/_ping) will give you information about what is running.
* Alternatively, you can ssh in and check that the application server and web server are both running.

## Testing Strategy

### Unit tests

Due to the nature of this application, unit tests are prominent and handle most of the confidence building and documentation needs of the system below the user interface.

## Testing tools

TODO: Which tools are we using?

## Branching strategy

To begin a new feature run, `git checkout -b <branchname>`.
When finished with the feature and the code has been reviewed, the commits should be squashed before merging. See [RoleModel Best Practices](https://github.com/RoleModel/BestPractices) for more information.

## Deployment

A Github Action is set up to build and deploy the project to NPM and Github packages. The deployment uses the `main` branch and is triggered by creating a release.

### Local build

To build the project locally, run `yarn build`.

## Copyright & licensing

Copyright (c) 2024 Open Source @RoleModel Software
