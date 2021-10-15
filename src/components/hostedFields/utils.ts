import { DEFAULT_PAYPAL_NAMESPACE, DATA_NAMESPACE } from "../../constants";

import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types";
import type {
    ReactChild,
    ReactFragment,
    ReactPortal,
    ReactElement,
    FC,
} from "react";
import type {
    PayPalHostedFieldsNamespace,
    PayPalHostedFieldProps,
    PayPalHostedFieldOptions,
} from "../../types/payPalHostedFieldTypes";

// Define the type of the fields object use in the HostedFields.render options
type PayPalHostedFieldOption = {
    [key in PAYPAL_HOSTED_FIELDS_TYPES]?: PayPalHostedFieldOptions;
};

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
    [DATA_NAMESPACE]: dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
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
 * Identify all the valid hosted fields children and generate the valid options
 * to use in the HostedFields.render process
 *
 * @param childrenList     the list of children received
 * @param possibleChildren a list of child type to transform into fields format
 * @returns the fields object required to render the HostedFields
 */
export const generateHostedFieldsFromChildren = (
    childrenList: (ReactChild | ReactPortal | ReactFragment)[]
): PayPalHostedFieldOption =>
    childrenList.reduce<PayPalHostedFieldOption>((fields, child) => {
        const {
            props: { hostedFieldType, options },
        } = child as ReactElement<PayPalHostedFieldProps, FC>;

        if (
            Object.values(PAYPAL_HOSTED_FIELDS_TYPES).includes(hostedFieldType)
        ) {
            fields[hostedFieldType] = {
                selector: options.selector,
                placeholder: options.placeholder,
                type: options.type,
                formatInput: options.formatInput,
                maskInput: options.maskInput,
                select: options.select,
                maxlength: options.maxlength,
                minlength: options.minlength,
                prefill: options.prefill,
                rejectUnsupportedCards: options.rejectUnsupportedCards,
            };
        }
        return fields;
    }, {});
