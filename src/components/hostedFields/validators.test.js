import React from "react";

import { PayPalHostedField } from "./PayPalHostedField";
import {
    HOSTED_FIELDS_CHILDREN_ERROR,
    HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR,
} from "../../constants";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";
import { validateHostedFieldChildren } from "./validators.ts";

describe("validateHostedFieldChildren", () => {
    test("should fail when empty children", () => {
        expect(() => {
            validateHostedFieldChildren([]);
        }).toThrow(new Error(HOSTED_FIELDS_CHILDREN_ERROR));
    });

    test("should fail when cvv and card number is not a child", () => {
        expect(() => {
            validateHostedFieldChildren([
                <PayPalHostedField
                    key="0"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                />,
                <PayPalHostedField
                    key="1"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE}
                />,
            ]);
        }).toThrow(new Error(HOSTED_FIELDS_CHILDREN_ERROR));
    });

    test("should fail when expiration is not a child", () => {
        expect(() => {
            validateHostedFieldChildren([
                <PayPalHostedField
                    key="0"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                />,
                <PayPalHostedField
                    key="1"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                />,
            ]);
        }).toThrow(new Error(HOSTED_FIELDS_CHILDREN_ERROR));
    });

    test("should fail when using duplicate children", () => {
        expect(() => {
            validateHostedFieldChildren([
                <PayPalHostedField
                    key="0"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                />,
                <PayPalHostedField
                    key="1"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                />,
                <PayPalHostedField
                    key="2"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                />,
                <PayPalHostedField
                    key="3"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE}
                />,
            ]);
        }).toThrow(new Error(HOSTED_FIELDS_DUPLICATE_CHILDREN_ERROR));
    });

    test("should pass the validation process and exclude children other than PayPalHostedField", () => {
        expect(() => {
            validateHostedFieldChildren([
                <PayPalHostedField
                    key="0"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                />,
                <PayPalHostedField
                    key="1"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.EXPIRATION_DATE}
                />,
                <PayPalHostedField
                    key="2"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.CVV}
                />,
                <button key="3">Submit</button>,
                <div key="3">Pay with your credit card</div>,
            ]);
        }).not.toThrow();
    });
});
