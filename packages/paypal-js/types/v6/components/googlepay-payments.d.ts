/* eslint-disable tsdoc/syntax */
/**
 * @module
 */
/* eslint-enable tsdoc/syntax */

/**
 * Configuration for Google Pay payment request
 *
 * @remarks
 * This is the formatted configuration passed to Google's PaymentsClient.
 * It is derived from the eligibility response via formatConfigForPaymentRequest().
 */
export type GooglePayConfig = {
  allowedPaymentMethods: ReadonlyArray<{
    parameters: {
      allowedAuthMethods: ReadonlyArray<"CRYPTOGRAM_3DS" | "PAN_ONLY">;
      allowedCardNetworks: ReadonlyArray<
        "AMEX" | "DISCOVER" | "INTERAC" | "JCB" | "MASTERCARD" | "VISA"
      >;
      assuranceDetailsRequired?: boolean;
      billingAddressRequired?: boolean;
      billingAddressParameters?: {
        format?: "MIN" | "FULL";
        phoneNumberRequired?: boolean;
      };
    };
    tokenizationSpecification: {
      parameters: {
        gateway: string;
        gatewayMerchantId: string;
      };
      type: string;
    };
    type: string;
  }>;
  apiVersion: number;
  apiVersionMinor: number;
  countryCode: string;
  merchantInfo: {
    authJwt?: string;
    merchantId: string;
    merchantName?: string;
    merchantOrigin: string;
  };
};

/**
 * Transaction information for Google Pay payment requests
 *
 * @remarks
 * Passed to Google PaymentsClient.loadPaymentData() as part of the request payload.
 */
export type GooglePayTransactionInfo = {
  countryCode: string;
  currencyCode: string;
  totalPriceStatus: "FINAL" | "ESTIMATED" | "NOT_CURRENTLY_KNOWN";
  totalPrice: string;
  totalPriceLabel?: string;
  displayItems?: Array<{
    label: string;
    type: string;
    price: string;
  }>;
  [key: string]: unknown;
};

/**
 * Request payload for Google PaymentsClient.isReadyToPay()
 */
export type GooglePayIsReadyToPayRequest = {
  allowedPaymentMethods: GooglePayConfig["allowedPaymentMethods"];
  apiVersion: GooglePayConfig["apiVersion"];
  apiVersionMinor: GooglePayConfig["apiVersionMinor"];
};

/**
 * Request payload for Google PaymentsClient.loadPaymentData()
 */
export type GooglePayPaymentDataRequest = GooglePayIsReadyToPayRequest & {
  merchantInfo: GooglePayConfig["merchantInfo"];
  transactionInfo: GooglePayTransactionInfo;
  callbackIntents: ReadonlyArray<"PAYMENT_AUTHORIZATION">;
};

/**
 * Options for Google PaymentsClient.createButton()
 */
export type GooglePayButtonOptions = {
  onClick: () => void;
  buttonType?:
    | "book"
    | "buy"
    | "checkout"
    | "donate"
    | "order"
    | "pay"
    | "plain"
    | "subscribe";
  buttonColor?: "default" | "black" | "white";
  buttonSizeMode?: "static" | "fill";
  buttonLocale?: string;
};

/**
 * Google Pay configuration from the eligibility response
 *
 * @remarks
 * This is the configuration returned from `getDetails("googlepay").config`
 * after the SDK's internal camelization. It must be transformed via
 * `formatConfigForPaymentRequest()` before passing to Google's PaymentsClient,
 * as that step performs additional field renames (e.g. `supportedNetworks`
 * becomes `allowedCardNetworks`, `merchantCountry` becomes `countryCode`).
 */
export type GooglePayConfigFromFindEligibleMethods = {
  eligible: boolean;
  merchantCountry: string;
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: ReadonlyArray<{
    type: string;
    parameters: {
      allowedAuthMethods: ReadonlyArray<"CRYPTOGRAM_3DS" | "PAN_ONLY">;
      supportedNetworks: ReadonlyArray<
        "AMEX" | "DISCOVER" | "INTERAC" | "JCB" | "MASTERCARD" | "VISA"
      >;
      billingAddressRequired: boolean;
      assuranceDetailsRequired: boolean;
      billingAddressParameters: {
        format?: "MIN" | "FULL";
        phoneNumberRequired?: boolean;
      };
    };
    tokenizationSpecification: {
      type: string;
      parameters: {
        gateway: string;
        gatewayMerchantId: string;
      };
    };
  }>;
  merchantInfo: {
    merchantOrigin: string;
    merchantId: string;
    authJwt?: string;
  };
};

/**
 * Contact information in Google Pay payment data
 */
export type GooglePayPaymentContact = {
  name: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
  address1: string;
  address2: string;
  address3: string;
  locality: string;
  administrativeArea: string;
  sortingCode: string;
};

/**
 * Card assurance details from Google Pay
 *
 * @internal
 */
type AssuranceDetailsSpec = {
  accountVerified: boolean;
  cardHolderAuthenticated: boolean;
};

/**
 * Card information from Google Pay payment response
 *
 * @internal
 */
type CardInfo = {
  cardDetails: string;
  cardNetwork: string;
  assuranceDetails: AssuranceDetailsSpec;
  billingAddress?: GooglePayPaymentContact;
};

/**
 * Tokenization data from Google Pay
 *
 * @internal
 */
type GooglePayTokenizationData = {
  type: string;
  token: string;
};

/**
 * Payment method data returned from Google Pay
 *
 * @remarks
 * This is the data received from Google's PaymentsClient.loadPaymentData()
 * in the onPaymentAuthorized callback. It's passed to confirmOrder().
 */
export type GooglePayPaymentMethodData = {
  description: string | null;
  tokenizationData: GooglePayTokenizationData;
  type: string;
  info: CardInfo;
};

/**
 * Response from the Google Pay configuration API
 *
 * @remarks
 * This is returned by getGooglePayConfig(). Note: for merchant use,
 * the config bundled in findEligibleMethods() is recommended instead,
 * as it includes all required fields for Google's PaymentsClient.
 */
export type GooglePayConfigResponse = {
  allowedPaymentMethods: ReadonlyArray<{
    parameters: {
      allowedAuthMethods: ReadonlyArray<string>;
      allowedCardNetworks: ReadonlyArray<string>;
    };
    tokenizationSpecification: {
      parameters: {
        gateway: string;
        gatewayMerchantId: string;
      };
      type: string;
    };
    type: string;
  }>;
  merchantInfo: {
    authJwt: string;
    merchantId: string;
    merchantName: string;
    merchantOrigin: string;
  };
};

/**
 * Response from confirming a Google Pay order with PayPal
 *
 * @remarks
 * This is returned after successfully confirming a Google Pay payment.
 * Check the status field to determine if 3DS authentication is required.
 */
export type GooglePayApprovePaymentResponse = {
  id: string;
  status: string;
  payment_source: {
    google_pay: {
      name: string;
      card: {
        last_digits: string;
        type: string;
        brand: string;
      };
    };
  };
  links: ReadonlyArray<{
    href: string;
    rel: string;
    method: string;
  }>;
};

/**
 * Outcome of the issuer's 3D Secure authentication, indicating whether
 * liability for the transaction has shifted to the card issuer.
 */
export type LiabilityShiftType = "UNKNOWN" | "NO" | "YES" | "POSSIBLE";

/**
 * Options passed when launching the 3DS payer action flow.
 */
export type InitiatePayerActionOptions = {
  /** The PayPal order ID returned when the order was created. */
  orderId: string;
};

/**
 * Result of a successful 3DS payer action flow.
 *
 * If the buyer cancels the 3DS modal or authentication fails, the promise
 * rejects instead of resolving, so the merchant does not attempt to capture an
 * unauthenticated order.
 */
export type InitiatePayerActionResponse = {
  /**
   * The outcome of the issuer's authentication, indicating whether liability
   * for the transaction has shifted to the card issuer.
   */
  liabilityShift?: LiabilityShiftType;
};

/**
 * Options for confirming a Google Pay order
 *
 * @remarks
 * These are the parameters passed to session.confirmOrder().
 * The clientId is managed internally by the SDK.
 */
export type GooglePayConfirmOrderOptions = {
  orderId: string;
  paymentMethodData: GooglePayPaymentMethodData;
  shippingAddress?: GooglePayPaymentContact;
  billingAddress?: GooglePayPaymentContact;
  email?: string;
};

/**
 * Google Pay one-time payment session
 *
 * @remarks
 * This session object manages the Google Pay payment flow. Unlike other
 * payment methods, Google Pay does not use a start() callback pattern.
 * Instead, merchants control the flow via Google's PaymentsClient and
 * call confirmOrder() when payment data is received.
 */
export interface GooglePayOneTimePaymentSession {
  /**
   * Transforms Google Pay eligibility config into the format required by Google's PaymentsClient
   *
   * @remarks
   * Performs field renames required by Google's API:
   * - `supportedNetworks` becomes `allowedCardNetworks`
   * - `merchantCountry` becomes `countryCode`
   * - Removes `authJwt` in sandbox environments
   *
   * This must be called before passing config to `isReadyToPay()` or `loadPaymentData()`.
   *
   * @param googlePayConfigFromFindEligibleMethods - Configuration from `getDetails("googlepay").config`
   * @returns Formatted configuration ready for Google Pay SDK
   *
   * @example
   * ```typescript
   * const details = paymentMethods.getDetails("googlepay");
   * const googlePayConfig = session.formatConfigForPaymentRequest(details.config);
   * const isReady = await paymentsClient.isReadyToPay({
   *   allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
   *   apiVersion: googlePayConfig.apiVersion,
   *   apiVersionMinor: googlePayConfig.apiVersionMinor,
   * });
   * ```
   */
  formatConfigForPaymentRequest(
    googlePayConfigFromFindEligibleMethods: GooglePayConfigFromFindEligibleMethods,
  ): GooglePayConfig;

  /**
   * Fetches Google Pay configuration from PayPal
   *
   * @remarks
   * Makes an API request for fresh Google Pay configuration. This is an
   * alternative code path that is rarely used in practice — the config
   * bundled in findEligibleMethods() is the recommended approach.
   *
   * @returns Promise resolving to Google Pay configuration
   *
   * @example
   * ```typescript
   * const config = await session.getGooglePayConfig();
   * ```
   */
  getGooglePayConfig(): Promise<GooglePayConfigResponse>;

  /**
   * Confirms a Google Pay payment with PayPal
   *
   * @remarks
   * After the customer approves payment through Google Pay, call this method
   * with the payment data from Google's onPaymentAuthorized callback.
   * The response indicates whether 3DS authentication is required.
   *
   * @param options - Payment confirmation options
   * @returns Promise resolving to the approved payment response
   *
   * @example
   * ```typescript
   * const response = await session.confirmOrder({
   *   orderId: "ORDER-ID",
   *   paymentMethodData: paymentData.paymentMethodData,
   * });
   *
   * if (response.status !== "PAYER_ACTION_REQUIRED") {
   *   // Capture the order
   * }
   * ```
   */
  confirmOrder(
    options: GooglePayConfirmOrderOptions,
  ): Promise<GooglePayApprovePaymentResponse>;

  /**
   * Launches the 3DS (Strong Customer Authentication) flow for an order.
   *
   * @remarks
   * Call this after `confirmOrder` returns a `status` of
   * `"PAYER_ACTION_REQUIRED"`. It opens PayPal's 3DS iframe modal and resolves
   * once the buyer completes authentication, with the resulting `liabilityShift`.
   *
   * If the buyer cancels the modal or authentication fails, the promise
   * **rejects** so the merchant does not capture an unauthenticated order.
   *
   * Note for Google Pay: the 3DS modal can only open after Google's payment
   * sheet has closed, and that sheet stays open until the `onPaymentAuthorized`
   * callback resolves. Do **not** `await` this method inside
   * `onPaymentAuthorized` — return `{ transactionState: "SUCCESS" }` to close the
   * sheet first, then handle this promise out-of-band.
   *
   * @param options - Object containing the PayPal `orderId`
   * @returns Promise resolving with the 3DS `liabilityShift` outcome on success,
   *   and rejecting on cancel or failure
   */
  initiatePayerAction(
    options: InitiatePayerActionOptions,
  ): Promise<InitiatePayerActionResponse>;
}

/**
 * Interface for managing Google Pay payment operations within the PayPal SDK
 *
 * @remarks
 * This interface provides methods for creating and managing Google Pay payment sessions.
 * Unlike other payment methods, Google Pay uses merchant-controlled flow with Google's
 * native PaymentsClient for rendering the button and handling payment authorization.
 *
 * @example
 * ```typescript
 * const sdkInstance = await paypal.createInstance({
 *   clientId: "YOUR_CLIENT_ID",
 *   components: ["googlepay-payments"],
 * });
 *
 * const paymentMethods = await sdkInstance.findEligibleMethods();
 * if (paymentMethods.isEligible("googlepay")) {
 *   const googlePaySession = sdkInstance.createGooglePayOneTimePaymentSession();
 *   // Use googlePaySession.formatConfigForPaymentRequest() and confirmOrder()
 * }
 * ```
 */
export interface GooglePayPaymentsInstance {
  /**
   * Creates a Google Pay one-time payment session
   *
   * @remarks
   * This session object provides methods to configure Google Pay and confirm orders.
   * Note that this session does not drive the UI directly — you'll use Google's
   * PaymentsClient to render the button and collect payment data.
   *
   * @returns A session object for managing the Google Pay payment flow
   */
  createGooglePayOneTimePaymentSession(): GooglePayOneTimePaymentSession;
}
