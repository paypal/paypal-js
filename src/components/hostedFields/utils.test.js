import React from "react";

import { PayPalHostedField } from "./PayPalHostedField";
import {
    generateMissingHostedFieldsError,
    generateHostedFieldsFromChildren,
} from "./utils";
import { SDK_SETTINGS } from "../../constants";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";

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
        expect(generateMissingHostedFieldsError({})).toEqual(
            exceptionMessagePayPalNamespace
        );
    });

    test("should throw exception unknown exception ", () => {
        window.paypal = {};

        expect(
            generateMissingHostedFieldsError({ components: "hosted-fields" })
        ).toEqual(
            "Unable to render <PayPalHostedFieldsProvider /> because window.paypal.HostedFields is undefined."
        );
    });
});

describe("generateHostedFieldsFromChildren", () => {
    test("should return empty object when children argument is an empty array", () => {
        expect(generateHostedFieldsFromChildren([])).toEqual({});
    });

    test("should return empty object when children argument doesn't have PayPalHostedField components", () => {
        expect(
            generateHostedFieldsFromChildren([
                <div key="0"></div>,
                <input key="1" />,
                <button key="2">Submit</button>,
            ])
        ).toEqual({});
    });

    test("should return teh PayPalHostedField children components", () => {
        expect(
            generateHostedFieldsFromChildren([
                <PayPalHostedField
                    key="0"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                    options={{ selector: ".car-number" }}
                />,
                <PayPalHostedField
                    key="1"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE}
                    options={{ selector: ".expiration" }}
                />,
                <PayPalHostedField
                    key="2"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                    options={{ selector: ".cvv" }}
                />,
            ])
        ).toMatchObject({
            number: {
                selector: ".car-number",
            },
            expirationDate: {
                selector: ".expiration",
            },
            cvv: {
                selector: ".cvv",
            },
        });
    });
});
