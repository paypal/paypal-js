import {
    SDK_SETTINGS,
    HOSTED_FIELDS_CHILDREN_ERROR,
    HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR,
} from "../../constants";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";
import {
    validateHostedFieldChildren,
    generateMissingHostedFieldsError,
} from "./utils";

const exceptionMessagePayPalNamespace =
    "Unable to render <PayPalHostedFieldsProvider /> because window.paypal.HostedFields is undefined.\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: 'hosted-fields'}}>";

describe("generateMissingHostedFieldsError", () => {
    const exceptionMessage =
        "Unable to render <PayPalHostedFieldsProvider /> because window.Braintree.HostedFields is undefined.\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: 'marks,hosted-fields'}}>";

    test("should throw exception with Braintree namespace", () => {
        expect(
            generateMissingHostedFieldsError({
                components: "marks",
                [SDK_SETTINGS.DATA_NAMESPACE]: "Braintree",
            })
        ).toEqual(exceptionMessage);
    });

    test("should throw exception with default namespace", () => {
        expect(generateMissingHostedFieldsError({ components: "" })).toEqual(
            exceptionMessagePayPalNamespace
        );
    });

    test("should throw exception unknown exception ", () => {
        window.paypal = { version: "" };

        expect(
            generateMissingHostedFieldsError({ components: "hosted-fields" })
        ).toEqual(
            "Unable to render <PayPalHostedFieldsProvider /> because window.paypal.HostedFields is undefined."
        );
    });
});

describe("validateHostedFieldChildren", () => {
    test("should fail when empty children", () => {
        expect(() => {
            validateHostedFieldChildren([]);
        }).toThrow(new Error(HOSTED_FIELDS_CHILDREN_ERROR));
    });

    test("should fail when missing children for cvv and card number", () => {
        expect(() => {
            validateHostedFieldChildren([
                PAYPAL_HOSTED_FIELDS_TYPES.NUMBER,
                PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE,
            ]);
        }).toThrow(new Error(HOSTED_FIELDS_CHILDREN_ERROR));
    });

    test("should fail when missing children for expiration", () => {
        expect(() => {
            validateHostedFieldChildren([
                PAYPAL_HOSTED_FIELDS_TYPES.NUMBER,
                PAYPAL_HOSTED_FIELDS_TYPES.CVV,
            ]);
        }).toThrow(new Error(HOSTED_FIELDS_CHILDREN_ERROR));
    });

    test("should fail when using duplicate children", () => {
        expect(() => {
            validateHostedFieldChildren([
                PAYPAL_HOSTED_FIELDS_TYPES.NUMBER,
                PAYPAL_HOSTED_FIELDS_TYPES.CVV,
                PAYPAL_HOSTED_FIELDS_TYPES.CVV,
                PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE,
            ]);
        }).toThrow(new Error(HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR));
    });

    test("should pass the validation process and exclude children other than PayPalHostedField", () => {
        expect(() => {
            validateHostedFieldChildren([
                PAYPAL_HOSTED_FIELDS_TYPES.NUMBER,
                PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE,
                PAYPAL_HOSTED_FIELDS_TYPES.CVV,
                "custom_1" as PAYPAL_HOSTED_FIELDS_TYPES,
                "custom_2" as PAYPAL_HOSTED_FIELDS_TYPES,
            ]);
        }).not.toThrow();
    });
});
