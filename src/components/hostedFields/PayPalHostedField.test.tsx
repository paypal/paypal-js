import React, { type ReactNode, type ProviderProps } from "react";
import { render, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";

import { PayPalHostedField } from "./PayPalHostedField";
import { PAYPAL_HOSTED_FIELDS_TYPES } from "../../types/enums";
import { PayPalHostedFieldsContext } from "../../context/payPalHostedFieldsContext";

import type { PayPalHostedFieldContext } from "../../types";

const onError = jest.fn();
const wrapper = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        {children}
    </ErrorBoundary>
);

const providerRender = (
    ui: ReactNode,
    {
        providerProps,
        ...renderOptions
    }: { providerProps: ProviderProps<PayPalHostedFieldContext> }
) => {
    return render(
        <PayPalHostedFieldsContext.Provider {...providerProps}>
            {ui}
        </PayPalHostedFieldsContext.Provider>,
        renderOptions
    );
};
const defaultProviderValue = {
    providerProps: { value: { registerHostedField: jest.fn() } },
};

describe("PayPalHostedField", () => {
    test("should render component using id as selector", () => {
        const { container } = providerRender(
            <PayPalHostedFieldsContext.Provider
                value={{ registerHostedField: jest.fn() }}
            >
                <PayPalHostedField
                    id="number"
                    hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                    options={{ selector: "#number" }}
                />
            </PayPalHostedFieldsContext.Provider>,
            defaultProviderValue
        );

        expect(
            container.querySelector("#number") instanceof HTMLDivElement
        ).toBeTruthy();
    });

    test("should render component with a list of classes", () => {
        const { container } = providerRender(
            <PayPalHostedField
                className="class1 class2 class3"
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{ selector: ".class1" }}
            />,
            defaultProviderValue
        );
        const renderedElement = container.querySelector(".class1");

        expect(renderedElement?.classList.contains("class2")).toBeTruthy();
        expect(renderedElement?.classList.contains("class3")).toBeTruthy();
    });

    test("should render component with specific style", () => {
        const { container } = providerRender(
            <PayPalHostedField
                className="number"
                style={{
                    color: "black",
                    border: "1px solid",
                }}
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{ selector: ".number" }}
            />,
            defaultProviderValue
        );
        const renderedElement =
            container.querySelector<HTMLDivElement>(".number");

        expect(renderedElement?.style.color).toEqual("black");
        expect(renderedElement?.style.border).toEqual("1px solid");
    });

    test("should fail rendering the component when context is invalid", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        render(
            <PayPalHostedField
                className="number"
                style={{
                    color: "black",
                    border: "1px solid",
                }}
                hostedFieldType={PAYPAL_HOSTED_FIELDS_TYPES.NUMBER}
                options={{ selector: ".number" }}
            />,
            { wrapper }
        );

        await waitFor(() => expect(onError).toBeCalledTimes(1));
        expect(onError.mock.calls[0][0].message).toBe(
            "The HostedField cannot be register in the PayPalHostedFieldsProvider parent component"
        );
        spyConsoleError.mockRestore();
    });
});
