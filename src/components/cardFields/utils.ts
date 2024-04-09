import {
    CARD_FIELDS_CHILDREN_ERROR,
    CARD_FIELDS_DUPLICATE_CHILDREN_ERROR,
    DEFAULT_PAYPAL_NAMESPACE,
    SDK_SETTINGS,
} from "../../constants";
import { PayPalCardFieldsContextType } from "./context";

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

export function ignore(): void {
    return;
}

type ValidateCardFieldsChildrenProps = {
    numberField: PayPalCardFieldsContextType["numberField"];
    cvvField: PayPalCardFieldsContextType["cvvField"];
    expiryField: PayPalCardFieldsContextType["expiryField"];
};

const hasRequiredChildren = ({
    numberField,
    cvvField,
    expiryField,
}: ValidateCardFieldsChildrenProps) => {
    if (
        numberField.current === null ||
        cvvField.current === null ||
        expiryField.current === null
    ) {
        throw new Error(CARD_FIELDS_CHILDREN_ERROR);
    }
};

export type ZoidCardFieldName = "number" | "name" | "cvv" | "expiry";

export function zoidCardFieldsComponents(
    fieldName: ZoidCardFieldName
): NodeListOf<Element> {
    return document.querySelectorAll(
        `iframe[name^=__zoid__paypal_card_${fieldName}_field__]`
    );
}

const noDuplicateChildren = () => {
    const fields: ZoidCardFieldName[] = ["number", "name", "cvv", "expiry"];
    let hasDuplicateChildren = false;
    let hasRequiredFields = false;

    fields.forEach((fieldName) => {
        const zoidFields = zoidCardFieldsComponents(fieldName);
        if (fieldName !== "name" && !!zoidFields.length) {
            hasRequiredFields = false;
        }
        const isDuplicate = zoidFields.length > 1;
        if (isDuplicate) {
            hasDuplicateChildren = isDuplicate;
        }
    });

    if (!hasRequiredFields) {
        throw new Error(CARD_FIELDS_CHILDREN_ERROR);
    }

    if (hasDuplicateChildren) {
        throw new Error(CARD_FIELDS_DUPLICATE_CHILDREN_ERROR);
    }
};

export const validateHostedFieldsChildren = ({
    numberField,
    cvvField,
    expiryField,
}: ValidateCardFieldsChildrenProps): void => {
    // hasRequiredChildren({ numberField, cvvField, expiryField });
    noDuplicateChildren();
};

export function hasChildren(
    container: React.RefObject<HTMLDivElement>
): boolean {
    return !!container.current?.children.length;
}
