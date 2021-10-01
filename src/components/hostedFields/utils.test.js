import React from "react";

import { PayPalHostedField } from "./PayPalHostedField";
import {
    throwMissingHostedFieldsError,
    decorateHostedFields,
    generateHostedFieldsFromChildren,
} from "./utils";
import { DATA_NAMESPACE } from "../../constants";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";

const exceptionMessagePayPalNamespace =
    "Unable to render <PayPalHostedFieldsProvider /> because window.paypal.HostedFields is undefined.\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: 'hosted-fields'}}>";

describe("throwMissingHostedFieldsError", () => {
    const exceptionMessage =
        "Unable to render <PayPalHostedFieldsProvider /> because window.Braintree.HostedFields is undefined.\nTo fix the issue, add 'hosted-fields' to the list of components passed to the parent PayPalScriptProvider: <PayPalScriptProvider options={{ components: 'marks,hosted-fields'}}>";

    test("should throw exception with Braintree namespace", () => {
        expect(() => {
            throwMissingHostedFieldsError({
                components: "marks",
                [DATA_NAMESPACE]: "Braintree",
            });
        }).toThrow(new Error(exceptionMessage));
    });

    test("should throw exception with default namespace", () => {
        expect(() => {
            throwMissingHostedFieldsError({});
        }).toThrow(new Error(exceptionMessagePayPalNamespace));
    });

    test("should throw exception unknown exception ", () => {
        window.paypal = {};

        expect(() => {
            throwMissingHostedFieldsError({ components: "hosted-fields" });
        }).toThrow(
            new Error(
                "Unable to render <PayPalHostedFieldsProvider /> because window.paypal.HostedFields is undefined."
            )
        );
    });
});

describe("decorateHostedFields", () => {
    test("should throw exception when HostedFields is unavailable", () => {
        window.paypal = {};

        expect(() => {
            decorateHostedFields({});
        }).toThrow(new Error(exceptionMessagePayPalNamespace));
    });

    test("should decorate the HostedFields when is available in window", () => {
        window.paypal = {
            HostedFields: {},
        };
        const decoratedHostedFields = decorateHostedFields({});

        expect(decoratedHostedFields).toHaveProperty("close");
    });

    test("should decorated close function remove all the children", () => {
        window.paypal = {
            HostedFields: {},
        };
        const decoratedHostedFields = decorateHostedFields({});

        expect(decoratedHostedFields).toHaveProperty("close");
    });

    test("should remove hosted fields container", () => {
        window.paypal = {
            HostedFields: {},
        };
        // Define a hosted fields container
        const divIdentifier = "test-hosted-field";
        const divElement = document.createElement("div");
        divElement.setAttribute("id", divIdentifier);
        document.body.appendChild(divElement);
        // Define a car number element inside the container
        const cardNumberIdentifier = "test-hosted-field-card_number";
        const cardNumberInput = document.createElement("input");

        cardNumberInput.setAttribute("id", cardNumberIdentifier);
        divElement.appendChild(cardNumberInput);
        const decoratedHostedFields = decorateHostedFields({});

        expect(
            document.querySelector(`#${divIdentifier}`) instanceof
                HTMLDivElement
        ).toBeTruthy();
        expect(
            document.querySelector(`#${cardNumberIdentifier}`) instanceof
                HTMLInputElement
        ).toBeTruthy();

        // Shouldn't remove anything if argument is null|undefined
        decoratedHostedFields.close();
        expect(
            document.querySelector(`#${cardNumberIdentifier}`) instanceof
                HTMLInputElement
        ).toBeTruthy();
        // Should remove children inside the container pass as argument
        decoratedHostedFields.close(divElement);
        expect(
            document.querySelector(`#${cardNumberIdentifier}`) instanceof
                HTMLInputElement
        ).toBeFalsy();
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
