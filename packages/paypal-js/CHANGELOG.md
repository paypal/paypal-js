# Changelog

## 8.3.1

### Patch Changes

-   c22489a: Update tsconfig location for paypal-js package

## 8.3.0

### Minor Changes

-   f594d7e: Update rollup config and add V6 types

## 8.2.0

### Minor Changes

-   6f339f6: Adding test for card-fields.test.ts

## 8.1.3

### Patch Changes

-   b2253cc: Prevent option paremeter being modified by processOptions()

## 8.1.2

### Patch Changes

-   a83971e: Allows button message amount type to be string

## 8.1.1

### Patch Changes

-   d36e386: add the shape: "sharp" in style
-   638e8e6: remove .nvmrc and lint-staged.config.js in react-paypal-js
-   638e8e6: remove the prettier dependency from each packages, update the prettier root version, fixed build error, update note version to 18
-   543fa08: Add button style borderRadius type
-   22f23ab: Split up each props into its own type to export

## 8.1.0

### Minor Changes

-   c0badf3: Support env param in loadScript options object

### Patch Changes

-   5adf3b6: updates PayPalButtonComponentOptions to add message

## 8.0.5

### Patch Changes

-   81faf35: Exported the card field types. They were previously defined but not exported.
-   b3da231: Adjust card-field types.
-   a33a65f: Updated the type for the card fields onApprove parameter.

## 8.0.4

### Patch Changes

-   076881a: Add dataJsSdkLibrary to PayPalScriptDataAttributes

## 8.0.3

### Patch Changes

-   99822f5: Set default data-js-sdk-library value

## 8.0.2

### Patch Changes

-   a59d626: Ensure publish config is set to public

## 8.0.1

### Patch Changes

-   082bd2f: move to monorepo

NOTE: Previous to v8.0.0, `standard-version` was used for changelog generation. Starting from 8.0.1, changesets is being used to generate changelog

## [8.0.0](https://github.com/paypal/paypal-js/compare/v7.1.1...v8.0.0) (2023-12-20)

### ⚠ BREAKING CHANGES

-   **types:** The TypeScript types for the PayPal APIs have changed.
    Now they are auto generated based on the Open API 3.0 specs.

### Features

-   **types:** auto generate api types with openapi specs ([#443](https://github.com/paypal/paypal-js/issues/443)) ([efb26f8](https://github.com/paypal/paypal-js/commit/efb26f867da604a4ca043c070e51caa460cb5a26))

### Bug Fixes

-   use bundler module resoluion ts strategy ([3bceb9e](https://github.com/paypal/paypal-js/commit/3bceb9e692a1fbc7c53bbcab86b6e042abcbded1))

### [7.1.1](https://github.com/paypal/paypal-js/compare/v7.1.0...v7.1.1) (2023-11-27)

### Bug Fixes

-   **types:** add type definition for createVaultSetupToken ([#439](https://github.com/paypal/paypal-js/issues/439)) ([a5e9424](https://github.com/paypal/paypal-js/commit/a5e94245d98e1e052484443be002df7ef4b121e0))

## [7.1.0](https://github.com/paypal/paypal-js/compare/v7.0.3...v7.1.0) (2023-11-13)

### Features

-   add support for crossorigin attribute ([#435](https://github.com/paypal/paypal-js/issues/435)) ([d504cc7](https://github.com/paypal/paypal-js/commit/d504cc755b497616aff455d0c376378cda3ae3e8))

### Bug Fixes

-   **types:** add displayOnly option for Buttons ([#431](https://github.com/paypal/paypal-js/issues/431)) ([1acba3f](https://github.com/paypal/paypal-js/commit/1acba3f869ed14cd867d3ea33e6657df3d2b820f))

### [7.0.3](https://github.com/paypal/paypal-js/compare/v7.0.2...v7.0.3) (2023-09-19)

### Bug Fixes

-   **types:** add new disableMaxWidth style option ([#423](https://github.com/paypal/paypal-js/issues/423)) ([aa10eff](https://github.com/paypal/paypal-js/commit/aa10eff7be5b7cad8d3bd0b446ceec29fcfd736a))
-   **types:** add types for new shipping callbacks ([#427](https://github.com/paypal/paypal-js/issues/427)) ([0602040](https://github.com/paypal/paypal-js/commit/060204076aa2387c98fd544e69e76b1dc884e70f))

### [7.0.2](https://github.com/paypal/paypal-js/compare/v7.0.1...v7.0.2) (2023-08-26)

### Bug Fixes

-   **types:** query params as an array or string ([#420](https://github.com/paypal/paypal-js/issues/420)) ([f829bb8](https://github.com/paypal/paypal-js/commit/f829bb8a2a9cfda3b1abfd07ecb6a8170af5624b))

### [7.0.1](https://github.com/paypal/paypal-js/compare/v7.0.0...v7.0.1) (2023-08-26)

### Bug Fixes

-   **tests:** update e2e test mock url ([#414](https://github.com/paypal/paypal-js/issues/414)) ([240e9fe](https://github.com/paypal/paypal-js/commit/240e9fef08f1599a61952160b29324293753e536))
-   **types:** update ScriptOptions to support array or string values ([380d04e](https://github.com/paypal/paypal-js/commit/380d04ecc5547f72e51df2c736d2a43856fc8bae))

## [7.0.0](https://github.com/paypal/paypal-js/compare/v6.0.1...v7.0.0) (2023-08-16)

### ⚠ BREAKING CHANGES

-   The logic for fetching and parsing the plain text error
    message for the JS SDK script is being removed. We replaced this
    logic with a general error message recommending the developer
    check the http response to learn why the JS SDK failed to load.

### Bug Fixes

-   remove custom fetch error parsing ([#412](https://github.com/paypal/paypal-js/issues/412)) ([48b1820](https://github.com/paypal/paypal-js/commit/48b1820cb27172858dddb2d8d9bf3d2df1db6946))

### [6.0.1](https://github.com/paypal/paypal-js/compare/v6.0.0...v6.0.1) (2023-07-19)

### Bug Fixes

-   **types:** add types for payment_source with order creation ([#402](https://github.com/paypal/paypal-js/issues/402)) ([f27b895](https://github.com/paypal/paypal-js/commit/f27b8955b0b6e77efd09dc1df17b67f45e97d243))

## [6.0.0](https://github.com/paypal/paypal-js/compare/v5.1.6...v6.0.0) (2023-06-02)

### ⚠ BREAKING CHANGES

-   this is a breaking change for the TypeScript types.

### Features

-   camelCase instead of kebab-case for params ([#375](https://github.com/paypal/paypal-js/issues/375)) ([f73df41](https://github.com/paypal/paypal-js/commit/f73df412c8a1ef65d3b3db132e50e79566a341fe))

### Bug Fixes

-   **types:** remove deprecated disable-card param ([#379](https://github.com/paypal/paypal-js/issues/379)) ([a4abfc2](https://github.com/paypal/paypal-js/commit/a4abfc246df9fee9525ea894e0501d626b555052))
-   **types:** update patch request body for order actions ([#360](https://github.com/paypal/paypal-js/issues/360)) ([6b45244](https://github.com/paypal/paypal-js/commit/6b45244f94564117b3ba66918b6d979faad43edf))

### [5.1.6](https://github.com/paypal/paypal-js/compare/v5.1.5...v5.1.6) (2023-03-27)

### [5.1.5](https://github.com/paypal/paypal-js/compare/v5.1.4...v5.1.5) (2023-03-21)

### Bug Fixes

-   **types:** add optional data-uid script attribute ([#346](https://github.com/paypal/paypal-js/issues/346)) ([c845035](https://github.com/paypal/paypal-js/commit/c845035dbc923b9da005aad1956869ce025a2686))
-   **types:** add type for minimal response from orders api ([#347](https://github.com/paypal/paypal-js/issues/347)) ([562a5fc](https://github.com/paypal/paypal-js/commit/562a5fc72302604d6bb26d0a36a5fba9bee6d520))
-   **types:** update response type for actions.order.patch() ([#333](https://github.com/paypal/paypal-js/issues/333)) ([7eebb58](https://github.com/paypal/paypal-js/commit/7eebb586a775e07618d4f9df87012b1c691e4eef))
-   update load-script.js ([a195e79](https://github.com/paypal/paypal-js/commit/a195e79278f65fada5a8fb7c4ff4aa19ab5a63b4))

### [5.1.4](https://github.com/paypal/paypal-js/compare/v5.1.3...v5.1.4) (2022-11-29)

### Bug Fixes

-   **types:** fix type for hosted fields getState function ([#320](https://github.com/paypal/paypal-js/issues/320)) ([1ec2691](https://github.com/paypal/paypal-js/commit/1ec26918dec4a5549f72c33b09382122fef5f9b5))

### [5.1.3](https://github.com/paypal/paypal-js/compare/v5.1.2...v5.1.3) (2022-11-29)

### Bug Fixes

-   **types:** add missing action for revising a subscription ([#318](https://github.com/paypal/paypal-js/issues/318)) ([48e720e](https://github.com/paypal/paypal-js/commit/48e720e10be9cb77b83a35f85de376e78fccdb89))

### [5.1.2](https://github.com/paypal/paypal-js/compare/v5.1.1...v5.1.2) (2022-11-11)

### Bug Fixes

-   **types:** add missing on and off events for hostedFields ([#299](https://github.com/paypal/paypal-js/issues/299)) ([216356e](https://github.com/paypal/paypal-js/commit/216356e5ab1337dc14346170ee7a7589e549f5d3))

### [5.1.1](https://github.com/paypal/paypal-js/compare/v5.1.0...v5.1.1) (2022-08-03)

### Bug Fixes

-   **types:** add missing types for messaging component ([#274](https://github.com/paypal/paypal-js/issues/274)) ([dd6bc48](https://github.com/paypal/paypal-js/commit/dd6bc48d0755efcd5ad529e92322cd1ec051d84c))
-   **types:** update order shipping options to match spec ([#276](https://github.com/paypal/paypal-js/issues/276)) ([e23c7d2](https://github.com/paypal/paypal-js/commit/e23c7d2c48a677ad64de97e9de2b1e954e06c192))

## [5.1.0](https://github.com/paypal/paypal-js/compare/v5.0.6...v5.1.0) (2022-06-30)

### Features

-   **types:** add types for funding source options ([#258](https://github.com/paypal/paypal-js/issues/258)) ([65ebaab](https://github.com/paypal/paypal-js/commit/65ebaabfd5bddeb2178976b183f419ad5552c892))

### [5.0.6](https://github.com/paypal/paypal-js/compare/v5.0.5...v5.0.6) (2022-05-17)

### Bug Fixes

-   **types:** add types for installments for HostedFields ([#239](https://github.com/paypal/paypal-js/issues/239)) ([3b89277](https://github.com/paypal/paypal-js/commit/3b892779d169851fcf2037b23473b0e853ec9049))

### [5.0.5](https://github.com/paypal/paypal-js/compare/v5.0.4...v5.0.5) (2022-04-21)

### [5.0.4](https://github.com/paypal/paypal-js/compare/v5.0.3...v5.0.4) (2022-04-06)

### Bug Fixes

-   **types:** add missing types for orders ([#217](https://github.com/paypal/paypal-js/issues/217)) ([8393506](https://github.com/paypal/paypal-js/commit/83935066164598da653ab24706bc65ff533ef977))

### [5.0.3](https://github.com/paypal/paypal-js/compare/v5.0.2...v5.0.3) (2022-03-25)

### [5.0.2](https://github.com/paypal/paypal-js/compare/v5.0.1...v5.0.2) (2022-01-30)

### Bug Fixes

-   **types:** add missing style props for messages ([#167](https://github.com/paypal/paypal-js/issues/167)) ([e969f9a](https://github.com/paypal/paypal-js/commit/e969f9a65269a97645adc0dab685257f7f38ce96))

### [5.0.1](https://github.com/paypal/paypal-js/compare/v5.0.0...v5.0.1) (2022-01-11)

### Bug Fixes

-   **types:** export type PayPalScriptOptions ([#147](https://github.com/paypal/paypal-js/issues/147)) ([8d36446](https://github.com/paypal/paypal-js/commit/8d36446cd3aee468511869a75b6503bc6d16846d))

## [5.0.0](https://github.com/paypal/paypal-js/compare/v4.2.2...v5.0.0) (2022-01-10)

### ⚠ BREAKING CHANGES

-   **types:** update `OnApproveActions` to support subscriptions (#140)

### Features

-   **types:** export all types ([#143](https://github.com/paypal/paypal-js/issues/143)) ([0542336](https://github.com/paypal/paypal-js/commit/054233643fcaa5628530d40ed04303be804cc7c9))
-   **types:** remove deprecated order type ([#145](https://github.com/paypal/paypal-js/issues/145)) ([355ebaa](https://github.com/paypal/paypal-js/commit/355ebaac31c762cea2736f06daebf50d5233242a))

### Bug Fixes

-   **types:** update `OnApproveActions` to support subscriptions ([#140](https://github.com/paypal/paypal-js/issues/140)) ([3bdaaa2](https://github.com/paypal/paypal-js/commit/3bdaaa2cb8baaa7a1c677c9bac231950b311016d))

### [4.2.2](https://github.com/paypal/paypal-js/compare/v4.2.1...v4.2.2) (2021-12-17)

### Bug Fixes

-   **types:** add additional sdk attributes ([48abf67](https://github.com/paypal/paypal-js/commit/48abf672dd7ad6759d46116ee315da8735450e82))
-   **types:** remove unused CreateOrderActions type for hostedFields ([#137](https://github.com/paypal/paypal-js/issues/137)) ([63b675c](https://github.com/paypal/paypal-js/commit/63b675c1da2017974f097f5bf2da077dbf6ff49a))

### [4.2.1](https://github.com/paypal/paypal-js/compare/v4.2.0...v4.2.1) (2021-11-24)

### Bug Fixes

-   add types for onShippingChange callback ([#135](https://github.com/paypal/paypal-js/issues/135)) ([65c5302](https://github.com/paypal/paypal-js/commit/65c5302276925a920ae2bec19aa7aebef8d0aaae))

## [4.2.0](https://github.com/paypal/paypal-js/compare/v4.1.0...v4.2.0) (2021-11-17)

### Features

-   useful error message for failed script loads ([#128](https://github.com/paypal/paypal-js/issues/128)) ([a64945b](https://github.com/paypal/paypal-js/commit/a64945b58595b450045726e304a252881b149379))

### Bug Fixes

-   **ie11:** remove usage on Object.assign ([76509ca](https://github.com/paypal/paypal-js/commit/76509ca0c4166c93428444b746aaf8f4bfd15dae))

## [4.1.0](https://github.com/paypal/paypal-js/compare/v4.0.12...v4.1.0) (2021-10-06)

### Features

-   **types:** enhance the hostedFields type ([#124](https://github.com/paypal/paypal-js/issues/124)) ([9f3a025](https://github.com/paypal/paypal-js/commit/9f3a025edde9eeb35c88e7859d2c7f6836baccd1))

### [4.0.12](https://github.com/paypal/paypal-js/compare/v4.0.11...v4.0.12) (2021-09-29)

### [4.0.11](https://github.com/paypal/paypal-js/compare/v4.0.10...v4.0.11) (2021-09-10)

### Bug Fixes

-   **types:** update submit response for hosted fields ([#117](https://github.com/paypal/paypal-js/issues/117)) ([31ac8b4](https://github.com/paypal/paypal-js/commit/31ac8b4bfa526f7b06dd9ec7fbb9f2b42b94c62c))

### [4.0.10](https://github.com/paypal/paypal-js/compare/v4.0.9...v4.0.10) (2021-09-04)

### [4.0.9](https://github.com/paypal/paypal-js/compare/v4.0.8...v4.0.9) (2021-09-04)

### Bug Fixes

-   **types:** remove unsupported data-order-id attribute ([3ddc963](https://github.com/paypal/paypal-js/commit/3ddc9637c2a8a65247dd06bb135c355cddc9633a))
-   **types:** update createOrder for HostedFields ([#116](https://github.com/paypal/paypal-js/issues/116)) ([62fb2b1](https://github.com/paypal/paypal-js/commit/62fb2b1f9d024b96225195dd6b1332be8a3ef0b6))

### [4.0.8](https://github.com/paypal/paypal-js/compare/v4.0.7...v4.0.8) (2021-08-20)

### Bug Fixes

-   **types:** move restart() and redirect() onApprove actions ([#113](https://github.com/paypal/paypal-js/issues/113)) ([51bb788](https://github.com/paypal/paypal-js/commit/51bb788722f566647973b7d7abe7a8f82d4e225b))

### [4.0.7](https://github.com/paypal/paypal-js/compare/v4.0.6...v4.0.7) (2021-08-11)

### Bug Fixes

-   **types:** add sdk-integration-source script attribute ([d8b0c09](https://github.com/paypal/paypal-js/commit/d8b0c09872d3eb6dfafba3149a56e83e66df0c6f))
-   **types:** support authorizing payments ([b24b5fb](https://github.com/paypal/paypal-js/commit/b24b5fbc157ad9ebf9a7406ff696b4c9f61a4ff0))

### [4.0.6](https://github.com/paypal/paypal-js/compare/v4.0.5...v4.0.6) (2021-07-09)

### [4.0.5](https://github.com/paypal/paypal-js/compare/v4.0.4...v4.0.5) (2021-07-09)

### [4.0.4](https://github.com/paypal/paypal-js/compare/v4.0.3...v4.0.4) (2021-07-09)

### [4.0.3](https://github.com/paypal/paypal-js/compare/v4.0.2...v4.0.3) (2021-07-09)

### Bug Fixes

-   **types:** add new category for donation ([3241f46](https://github.com/paypal/paypal-js/commit/3241f4670a0ae3d9748c3413d9c08ecd9983769b))
-   **types:** add support for donations ([b4eb180](https://github.com/paypal/paypal-js/commit/b4eb180446f4423ec293efdd42ee9977b96414d4))
-   **types:** update sku and category to be optional ([0e0b129](https://github.com/paypal/paypal-js/commit/0e0b129a3ddb4e998626b840bc8faad41daa11dc))

### [4.0.2](https://github.com/paypal/paypal-js/compare/v4.0.1...v4.0.2) (2021-07-05)

### Bug Fixes

-   **types:** add labels 'subscribe' and 'donate' ([8550a0a](https://github.com/paypal/paypal-js/commit/8550a0a162834876f3173192943810dc08145b04))

### [4.0.1](https://github.com/paypal/paypal-js/compare/v4.0.0...v4.0.1) (2021-06-26)

### Bug Fixes

-   **types:** add type for authorize() ([#96](https://github.com/paypal/paypal-js/issues/96)) ([b30bf77](https://github.com/paypal/paypal-js/commit/b30bf77835743db707177e396158454b61212723))

## [4.0.0](https://github.com/paypal/paypal-js/compare/v3.1.11...v4.0.0) (2021-06-04)

### ⚠ BREAKING CHANGES

-   new urls for the dist files hosted on unpkg.com

### Features

-   improve dist folder structure ([16053a0](https://github.com/paypal/paypal-js/commit/16053a0d559ca056ec89a05346edf0d705820fef))

### [3.1.11](https://github.com/paypal/paypal-js/compare/v3.1.10...v3.1.11) (2021-06-03)

### [3.1.10](https://github.com/paypal/paypal-js/compare/v3.1.9...v3.1.10) (2021-05-11)

### Bug Fixes

-   **types:** export all api types ([966091a](https://github.com/paypal/paypal-js/commit/966091a24579b6436b4d9ebc3b8bd04f01c09d1e))

### [3.1.9](https://github.com/paypal/paypal-js/compare/v3.1.8...v3.1.9) (2021-04-27)

### [3.1.8](https://github.com/paypal/paypal-js/compare/v3.1.7...v3.1.8) (2021-04-21)

### Bug Fixes

-   override tsconfig target in legacy build ([#76](https://github.com/paypal/paypal-js/issues/76)) ([3228e57](https://github.com/paypal/paypal-js/commit/3228e578d2fcc7659f59773d37569ed56a0ef289))

### [3.1.7](https://github.com/paypal/paypal-js/compare/v3.1.6...v3.1.7) (2021-04-10)

### Bug Fixes

-   **types:** add types for hosted-fields component ([#72](https://github.com/paypal/paypal-js/issues/72)) ([fd8652a](https://github.com/paypal/paypal-js/commit/fd8652a5bc192f3694c32ad734d42bf03c170098))
-   **types:** rename 'props' to 'options' ([a01c86e](https://github.com/paypal/paypal-js/commit/a01c86ee372f71c099f11e5a7c0d2d283b0d9db6))

### [3.1.6](https://github.com/paypal/paypal-js/compare/v3.1.5...v3.1.6) (2021-04-02)

### Bug Fixes

-   **types:** add types for funding-eligibility ([b78de97](https://github.com/paypal/paypal-js/commit/b78de970170c7f86d51524e97bee9edcd41bf2a8))

### [3.1.5](https://github.com/paypal/paypal-js/compare/v3.1.4...v3.1.5) (2021-03-29)

### Bug Fixes

-   **types:** add types for onApprove callback data ([9d98fd9](https://github.com/paypal/paypal-js/commit/9d98fd9a99cf7a469ab609d0f3970069b6e385c3))
-   **types:** update OrderApplicationContext fields to be optional ([#69](https://github.com/paypal/paypal-js/issues/69)) ([9a43f7f](https://github.com/paypal/paypal-js/commit/9a43f7f3fb903e50600ce35ced388dc91cdfeac7))

### [3.1.4](https://github.com/paypal/paypal-js/compare/v3.1.3...v3.1.4) (2021-03-22)

### Bug Fixes

-   do not mutate the options object ([28b5984](https://github.com/paypal/paypal-js/commit/28b5984bc2d2d7c4b001f66118b9354a2c3f3df5))

### [3.1.3](https://github.com/paypal/paypal-js/compare/v3.1.2...v3.1.3) (2021-03-21)

### Bug Fixes

-   **types:** button action functions return promises ([aeac03f](https://github.com/paypal/paypal-js/commit/aeac03f418b576fe2fce960e01ac33e9d21de067))

### [3.1.2](https://github.com/paypal/paypal-js/compare/v3.1.1...v3.1.2) (2021-03-19)

### Bug Fixes

-   ignore data-uid-auto attribute in findScript ([99a7c8a](https://github.com/paypal/paypal-js/commit/99a7c8a8c2a7b6a4cb46be6539b1bf395b208ebf))

### [3.1.1](https://github.com/paypal/paypal-js/compare/v3.1.0...v3.1.1) (2021-03-14)
