# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [7.5.0](https://github.com/paypal/react-paypal-js/compare/v7.4.2...v7.5.0) (2021-11-29)

### Features

-   log loading errors for the JS SDK script ([#212](https://github.com/paypal/react-paypal-js/issues/212)) ([77973f0](https://github.com/paypal/react-paypal-js/commit/77973f0739e740ecbc4155cd79f733b9e2824484))

### [7.4.2](https://github.com/paypal/react-paypal-js/compare/v7.4.1...v7.4.2) (2021-10-15)

### Bug Fixes

-   add `createBillingAgreement` support for BraintreePayPalButtons ([#195](https://github.com/paypal/react-paypal-js/issues/195)) ([b4086ab](https://github.com/paypal/react-paypal-js/commit/b4086ab511565b1a904ceb241779c64f8adab36b))

### [7.4.1](https://github.com/paypal/react-paypal-js/compare/v7.4.0...v7.4.1) (2021-10-09)

### Bug Fixes

-   **types:** rename back to DISPATCH_ACTION ([#192](https://github.com/paypal/react-paypal-js/issues/192)) ([2b8f14a](https://github.com/paypal/react-paypal-js/commit/2b8f14ad41a6be3f461fe73b9661c92bd012df2a))

## [7.4.0](https://github.com/paypal/react-paypal-js/compare/v7.3.3...v7.4.0) (2021-10-08)

### Features

-   **hosted-fields:** add support for hosted-fields ([#160](https://github.com/paypal/react-paypal-js/issues/160)) ([e025d9a](https://github.com/paypal/react-paypal-js/commit/e025d9a1b45d43ad4b79e419188d59907b3cf1b8))
-   update Marks to support the children prop ([#155](https://github.com/paypal/react-paypal-js/issues/155)) ([6aebf98](https://github.com/paypal/react-paypal-js/commit/6aebf98b2592ed7ac68d6b232ab2fa4121dd114e))

### Bug Fixes

-   **types:** standardize types for children ([#157](https://github.com/paypal/react-paypal-js/issues/157)) ([cc956be](https://github.com/paypal/react-paypal-js/commit/cc956beb1323a7516e30174b7d7fd20c9cd60e13))
-   update Marks to rerender when fundingSource changes ([#154](https://github.com/paypal/react-paypal-js/issues/154)) ([f7b4a25](https://github.com/paypal/react-paypal-js/commit/f7b4a251b01e7777948fda846fe0b55d348ec60a))

### [7.3.3](https://github.com/paypal/react-paypal-js/compare/v7.3.2...v7.3.3) (2021-08-31)

### Bug Fixes

-   remove babel polyfill for typeof symbol ([d73fe72](https://github.com/paypal/react-paypal-js/commit/d73fe72e0bfa482226df8d38371dec969324583d))
-   update error handling logic for BraintreePayPalButtons ([1a1c73d](https://github.com/paypal/react-paypal-js/commit/1a1c73dfb15ff39452034d35a786938e5630aa5d))

### [7.3.2](https://github.com/paypal/react-paypal-js/compare/v7.3.1...v7.3.2) (2021-08-27)

### Bug Fixes

-   **buttons:** catch errors thrown during button initialization ([f60176e](https://github.com/paypal/react-paypal-js/commit/f60176e50fdbfab317bcbb08fdaac890a57ba615))
-   remove async/await usage to avoid babel polyfill ([#150](https://github.com/paypal/react-paypal-js/issues/150)) ([ecaf084](https://github.com/paypal/react-paypal-js/commit/ecaf08402f17bf92de527bb4d4d714c5007ba5cd))

### [7.3.1](https://github.com/paypal/react-paypal-js/compare/v7.3.0...v7.3.1) (2021-08-26)

### Bug Fixes

-   **types:** export all public types ([#147](https://github.com/paypal/react-paypal-js/issues/147)) ([9e8c39b](https://github.com/paypal/react-paypal-js/commit/9e8c39b773fa076c1ffabb3c259ca87f25c55141))

## [7.3.0](https://github.com/paypal/react-paypal-js/compare/v7.2.1...v7.3.0) (2021-08-25)

### Features

-   **braintree:** add new <BraintreePayPalButtons /> component ([#140](https://github.com/paypal/react-paypal-js/issues/140)) ([a2c7741](https://github.com/paypal/react-paypal-js/commit/a2c774168fbc5ae7a610df384feca684737d7fba))

### Bug Fixes

-   prevent numeric overflow with hashStr function ([#141](https://github.com/paypal/react-paypal-js/issues/141)) ([9914f60](https://github.com/paypal/react-paypal-js/commit/9914f60701c19dcde2fb42ad8791265aee37e34c))

### [7.2.1](https://github.com/paypal/react-paypal-js/compare/v7.2.0...v7.2.1) (2021-07-28)

### Bug Fixes

-   avoid reloading the script when options have not changed ([#135](https://github.com/paypal/react-paypal-js/issues/135)) ([0765e16](https://github.com/paypal/react-paypal-js/commit/0765e1600322bd511ddfc61b427d14b356d3f1b8))

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
