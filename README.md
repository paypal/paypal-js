## PayPal JS Monorepo

This is a collection of libraries intended to help developers more easily integrate with PayPal's JS SDK

### Packages Available

Below is a list of available packages to install.

Each package has its own documentation in it's respective README.

-   [@paypal/paypal-js](./packages/paypal-js/README.md): PayPal's Vanilla JS loader

### Contributing

#### Tools used

-   [changesets](https://github.com/changesets/changesets) for tracking version changes
-   [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces/) for monorepo package management
-   [prettier](https://prettier.io) for code formatting

#### Steps to make a change

1. Install dependencies:

    ```
    npm install
    ```

2. Make proposed changes
3. Run tests

    ```
    npm test
    ```

4. Add a changeset for versioning

    ```
    npm run changeset:add
    ```

5. Open a new PR

### Releasing

#### Releasing a new latest

To release a new version please leverage Github Actions. There is a release action that can be run to create a new release.

#### Release a new alpha

There is no Github Action for alpha release at this time. Because this repo utilizes changesets we can follow their process locally in the meantime. This document can be seen [here](https://github.com/changesets/changesets/blob/main/docs/prereleases.md).
