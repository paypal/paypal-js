import React from "react";
import { render } from "@testing-library/react";

import { PayPalHostedField } from "./PayPalHostedField";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";

describe("PayPalHostedField", () => {
    test("should render component using id as selector", () => {
        const { container } = render(
            <PayPalHostedField
                id="number"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{ selector: "#number" }}
            />
        );

        expect(
            container.querySelector("#number") instanceof HTMLDivElement
        ).toBeTruthy();
    });

    test("should render component with a list of classes", () => {
        const { container } = render(
            <PayPalHostedField
                className="class1 class2 class3"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{ selector: ".class1" }}
            />
        );
        const renderedElement = container.querySelector(".class1");

        expect(renderedElement.classList.contains("class2")).toBeTruthy();
        expect(renderedElement.classList.contains("class3")).toBeTruthy();
    });

    test("should render component with specific style", () => {
        const { container } = render(
            <PayPalHostedField
                className="number"
                style={{
                    color: "black",
                    border: "1px solid",
                }}
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{ selector: ".number" }}
            />
        );
        const renderedElement = container.querySelector(".number");

        expect(renderedElement.style.color).toEqual("black");
        expect(renderedElement.style.border).toEqual("1px solid");
    });
});
