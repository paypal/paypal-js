import type {
    ReactChild,
    ReactFragment,
    ReactPortal,
    ReactElement,
} from "react";

import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types";
import {
    HOSTED_FIELDS_CHILDREN_ERROR,
    HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR,
} from "../../constants";

/**
 * Get only PayPalHostedField children, exclude all the other children
 *
 * @param childrenList the list of children
 * @returns a new list containing only the PayPalHostedField components
 */
const getPayPalHostedFieldChildren = (
    childrenList: (ReactChild | ReactFragment | ReactPortal)[]
) => {
    return childrenList.reduce<PAYPAL_HOSTED_FIELDS_TYPES[]>(
        (accumulator, child) => {
            const reactElement = child as ReactElement;

            if (reactElement.props.hostedFieldType) {
                accumulator.push(reactElement.props.hostedFieldType);
            }

            return accumulator;
        },
        []
    );
};
/**
 * Validate the expiration date children. Valid combinations are:
 * 1- Exists expirationDate field and not exists expirationMonth and expirationYear fields
 * 2- Exists expirationMonth and expirationYear and not exists expirationDate
 * All the other possible combinations are invalid
 *
 * @param registerTypes
 * @returns @type {true} when the children are valid
 */
const validateExpirationDate = (
    registerTypes: PAYPAL_HOSTED_FIELDS_TYPES[]
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
const notDuplicateChildren = (registerTypes: PAYPAL_HOSTED_FIELDS_TYPES[]) => {
    if (registerTypes.length !== new Set(registerTypes).size) {
        throw new Error(HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR);
    }
};

/**
 * Validate the hosted fields children past to the PayPalHostedFieldsProvider component
 * These are the rule:
 * 1- We need to find 3 default children type [[number, expiration, cvv]
 * 2- We cannot find duplicate children type
 * 3- We cannot find expirationDate field combine with expirationMonth and expirationYear
 *
 * @param childrenList     the list of children
 * @param requiredChildren the list with required children [number, expiration, cvv]
 */
export const validateHostedFieldChildren = (
    childrenList: (ReactChild | ReactFragment | ReactPortal)[]
): void => {
    const registerTypes = getPayPalHostedFieldChildren(childrenList);

    hasDefaultChildren(registerTypes);
    notDuplicateChildren(registerTypes);
};
