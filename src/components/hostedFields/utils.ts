import { DEFAULT_PAYPAL_NAMESPACE, DATA_NAMESPACE } from "../../constants";
import { getPayPalWindowNamespace } from "../../utils";

import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types";
import type {
    ReactChild,
    ReactFragment,
    ReactPortal,
    ReactElement,
    FC,
} from "react";
import type { PayPalHostedFieldsComponent } from "@paypal/paypal-js/types/components/hosted-fields";
import type {
    PayPalHostedFieldsNamespace,
    DecoratedPayPalHostedFieldsComponent,
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
export const throwMissingHostedFieldsError = ({
    components = "",
    [DATA_NAMESPACE]: dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
}: PayPalHostedFieldsNamespace): never => {
    const expectedComponents = components
        ? `${components},hosted-fields`
        : "hosted-fields";
    let errorMessage = `Unable to render <PayPalHostedFieldsProvider /> because window.${dataNamespace}.HostedFields is undefined.`;

    if (!components.includes("hosted-fields")) {
        errorMessage += `\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: '${expectedComponents}'}}>`;
    }

    throw new Error(errorMessage);
};

/**
 * Decorate the HostedFields object in the window with a close custom method
 *
 * @param options scriptProvider options to get the HostedFields dependency
 * @returns the modified HostedFields object
 */
export const decorateHostedFields = (
    options: PayPalHostedFieldsNamespace
): DecoratedPayPalHostedFieldsComponent => {
    const hostedFields = getPayPalWindowNamespace(
        options[DATA_NAMESPACE]
    ).HostedFields;
    // check if the hosted fields are available in PayPal namespace
    if (hostedFields == null) throwMissingHostedFieldsError(options);

    return {
        ...(hostedFields as PayPalHostedFieldsComponent),
        close(container) {
            if (container) {
                container.querySelectorAll("*").forEach((element) => {
                    element.remove();
                });
            }
        },
    };
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
