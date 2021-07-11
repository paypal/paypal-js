# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [7.2.0](https://github.com/paypal/react-paypal-js/compare/v7.1.2...v7.2.0) (2021-07-11)

### Features

-   more robust package publishing ([#130](https://github.com/paypal/react-paypal-js/issues/130)) ([e5caf02](https://github.com/paypal/react-paypal-js/commit/e5caf02ece24b22f50f7f82b40203358746b5cc2))

### Bug Fixes

-   **release:** do not publish types from storybook ([#131](https://github.com/paypal/react-paypal-js/issues/131)) ([6534d59](https://github.com/paypal/react-paypal-js/commit/6534d595033dc9960b1fe6939a31482e8f22fdbd))
-   increase opacity for disabled button ([d1ac1d2](https://github.com/paypal/react-paypal-js/commit/d1ac1d28d729774900dd757e0829812ab4cbc4f9))
-   type declarations don’t depend on internal typings ([#129](https://github.com/paypal/react-paypal-js/issues/129)) ([76a3b9f](https://github.com/paypal/react-paypal-js/commit/76a3b9f72b4893aa7c2210e0d77711820a875bef))

### [7.1.2](https://github.com/paypal/react-paypal-js/compare/v7.1.1...v7.1.2) (2021-07-05)

### [7.1.1](https://github.com/paypal/react-paypal-js/compare/v7.1.0...v7.1.1) (2021-07-05)

### Bug Fixes

-   **types:** export the ScriptProviderProps interface ([e97e3d0](https://github.com/paypal/react-paypal-js/commit/e97e3d0b0cc404e807f7f9e1173ec532592fc8cf))
-   **types:** update resetOptions to support PayPalScriptOptions type ([236c3cf](https://github.com/paypal/react-paypal-js/commit/236c3cff9be53959b24725718a8b0a999e17f02c))

## [7.1.0](https://github.com/paypal/react-paypal-js/compare/v7.0.0...v7.1.0) (2021-06-27)

### Features

-   **storybook:** add support for overriding js sdk query params ([#121](https://github.com/paypal/react-paypal-js/issues/121)) ([14d62d0](https://github.com/paypal/react-paypal-js/commit/14d62d04b3be17312b8478e815ab826434dfc6fb))

## [7.0.0](https://github.com/paypal/react-paypal-js/compare/v6.0.2...v7.0.0) (2021-06-04)

### ⚠ BREAKING CHANGES

-   new file names for built files in dist folder.

### Features

-   improve dist folder structure ([b032f77](https://github.com/paypal/react-paypal-js/commit/b032f77ceeb0181123741c0b3422ac19af94131d))

### [6.0.2](https://github.com/paypal/react-paypal-js/compare/v6.0.1...v6.0.2) (2021-06-04)

### [6.0.1](https://github.com/paypal/react-paypal-js/compare/v6.0.0...v6.0.1) (2021-05-16)

### Bug Fixes

-   **types:** improve type for ScriptLoadingState ([#113](https://github.com/paypal/react-paypal-js/issues/113)) ([402afe4](https://github.com/paypal/react-paypal-js/commit/402afe4f54b58bd5dc1d097e7c8d64e12fc852ff))

## [6.0.0](https://github.com/paypal/react-paypal-js/compare/v5.2.0...v6.0.0) (2021-04-12)

### ⚠ BREAKING CHANGES

-   forceReRender prop now accepts an array.

### Features

-   update forceReRender to be an array ([#102](https://github.com/paypal/react-paypal-js/issues/102)) ([c41ee40](https://github.com/paypal/react-paypal-js/commit/c41ee40e6899f86f2300285c4826203458f457e5))

## [5.2.0](https://github.com/paypal/react-paypal-js/compare/v5.1.2...v5.2.0) (2021-04-05)

### Features

-   add deferLoading prop to control sdk script loading ([2cf3904](https://github.com/paypal/react-paypal-js/commit/2cf3904ebe21edcd8ffd14dcd67b553ad6ced6c8))

### [5.1.2](https://github.com/paypal/react-paypal-js/compare/v5.1.1...v5.1.2) (2021-04-02)

### Bug Fixes

-   prevent script provider from loading more than one sdk script ([8d5dbb7](https://github.com/paypal/react-paypal-js/commit/8d5dbb709082bec45835336a0e04312fcc9c5e1e))

### [5.1.1](https://github.com/paypal/react-paypal-js/compare/v5.1.0...v5.1.1) (2021-03-30)

## [5.1.0](https://github.com/paypal/react-paypal-js/compare/v5.0.1...v5.1.0) (2021-03-22)

### Features

-   add support for custom namespaces ([8d3cd26](https://github.com/paypal/react-paypal-js/commit/8d3cd2612f9176dc266b4e0633827871a6ce5457))
-   support rendering custom content when ineligible ([c590e90](https://github.com/paypal/react-paypal-js/commit/c590e90dbead2539b3af6602a63f652aa6fcd7d8))

### Bug Fixes

-   ignore errors related to enable/disable actions ([f62eda7](https://github.com/paypal/react-paypal-js/commit/f62eda76b9ac00cadcce2a41b7fe14e80b9083a6))
-   ignore errors when cleaning up buttons component ([5a3e6f1](https://github.com/paypal/react-paypal-js/commit/5a3e6f15b81d37688cc40e8101c70ec3b07970ab))
-   use error boundaries approach for all components ([56f1b7e](https://github.com/paypal/react-paypal-js/commit/56f1b7e7486097701655e08be92b23de3135c863))
