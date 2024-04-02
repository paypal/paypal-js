import { DEFAULT_PAYPAL_NAMESPACE, SDK_SETTINGS } from "../../constants";

import type { PayPalCardFieldsNamespace } from "../../types/payPalCardFieldsTypes";

/**
 * Throw an exception if the CardFields is not found in the paypal namespace
 * Probably cause for this problem is not sending the card-fields string
 * as part of the components props in options
 * {@code <PayPalScriptProvider options={{ components: 'card-fields'}}>}
 *
 * @param param0 and object containing the components and namespace defined in options
 * @throws {@code Error}
 *
 */
export const generateMissingCardFieldsError = ({
    components = "",
    [SDK_SETTINGS.DATA_NAMESPACE]: dataNamespace = DEFAULT_PAYPAL_NAMESPACE,
}: PayPalCardFieldsNamespace): string => {
    const expectedComponents = components
        ? `${components},card-fields`
        : "card-fields";
    let errorMessage = `Unable to render <PayPalCardFieldsProvider /> because window.${dataNamespace}.CardFields is undefined.`;

    if (!components.includes("card-fields")) {
        errorMessage += `\nTo fix the issue, add 'card-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: '${expectedComponents}'}}>`;
    }

    return errorMessage;
};
