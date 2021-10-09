/**
 * Enum for the SDK script resolve status,
 *
 * @enum {string}
 */
export enum SCRIPT_LOADING_STATE {
    INITIAL = "initial",
    PENDING = "pending",
    REJECTED = "rejected",
    RESOLVED = "resolved",
}

/**
 * Enum for the PayPalScriptProvider context dispatch actions
 *
 * @enum {string}
 */
export enum DISPATCH_ACTION {
    LOADING_STATUS = "setLoadingStatus",
    RESET_OPTIONS = "resetOptions",
    SET_BRAINTREE_INSTANCE = "braintreeInstance",
}

/**
 * Enum for all the available hosted fields
 *
 * @enum {string}
 */
export enum PAYPAL_HOSTED_FIELDS_TYPES {
    NUMBER = "number",
    CVV = "cvv",
    EXPIRATION_DATE = "expirationDate",
    EXPIRATION_MONTH = "expirationMonth",
    EXPIRATION_YEAR = "expirationYear",
    POSTAL_CODE = "postalCode",
}
