import {
    DEFAULT_PAYPAL_NAMESPACE,
    SDK_SETTINGS,
    HOSTED_FIELDS_CHILDREN_ERROR,
    HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR,
} from "../../constants";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";

import type { PayPalHostedFieldsNamespace } from "../../types/payPalHostedFieldTypes";

/**
 * Throw an exception if the HostedFields is not found in the paypal namespace
 * Probably cause for this problem is not sending the hosted-fields string
 * as part of the components props in options
 * {@code <PayPalScriptProvider options={{ components: 'hosted-fields'}}>}
 *
 * @param param0 and object containing the components and namespace defined in options
 * @throws {@code Error}
 *
 */
export const generateMissingHostedFieldsError = ({
    components = "",
    [SDK_SETTINGS.DATA_NAMESPACE]: dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
}: PayPalHostedFieldsNamespace): string => {
    const expectedComponents = components
        ? `${components},hosted-fields`
        : "hosted-fields";
    let errorMessage = `Unable to render <PayPalHostedFieldsProvider /> because window.${dataNamespace}.HostedFields is undefined.`;

    if (!components.includes("hosted-fields")) {
        errorMessage += `\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: '${expectedComponents}'}}>`;
    }

    return errorMessage;
};

/**
 * Validate the expiration date component. Valid combinations are:
 * 1- Only the `expirationDate` field exists.
 * 2- Only the `expirationMonth` and `expirationYear` fields exist. Cannot be used with the `expirationDate` field.
 *
 * @param registerTypes
 * @returns @type {true} when the children are valid
 */
const validateExpirationDate = (
    registerTypes: PAYPAL_HOSTED_FIELDS_TYPES[],
) => {
    return (
        !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE) &&
        !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_MONTH) &&
        !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_YEAR)
    );
};

/**
 * Check if we find the [number, expiration, cvv] in children
 *
 * @param requiredChildren the list with required children [number, expiration, cvv]
 * @param registerTypes    the list of all the children types pass to the parent
 * @throw an @type {Error} when not find the default children
 */
const hasDefaultChildren = (registerTypes: PAYPAL_HOSTED_FIELDS_TYPES[]) => {
    if (
        !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.NUMBER) ||
        !registerTypes.includes(PAYPAL_HOSTED_FIELDS_TYPES.CVV) ||
        validateExpirationDate(registerTypes)
    ) {
        throw new Error(HOSTED_FIELDS_CHILDREN_ERROR);
    }
};

/**
 * Check if we don't have duplicate children types
 *
 * @param registerTypes the list of all the children types pass to the parent
 * @throw an @type {Error} when duplicate types was found
 */
const noDuplicateChildren = (registerTypes: PAYPAL_HOSTED_FIELDS_TYPES[]) => {
    if (registerTypes.length !== new Set(registerTypes).size) {
        throw new Error(HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR);
    }
};

/**
 * Validate the hosted field children in the PayPalHostedFieldsProvider component.
 * These are the rules:
 * 1- We need to find 3 default children for number, expiration, cvv
 * 2- No duplicate children are allowed
 * 3- No invalid combinations of `expirationDate`, `expirationMonth`, and `expirationYear`
 *
 * @param childrenList     the list of children
 * @param requiredChildren the list with required children [number, expiration, cvv]
 */
export const validateHostedFieldChildren = (
    registeredFields: PAYPAL_HOSTED_FIELDS_TYPES[],
): void => {
    hasDefaultChildren(registeredFields);
    noDuplicateChildren(registeredFields);
};
