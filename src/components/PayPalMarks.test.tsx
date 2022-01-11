import React, { ReactNode } from "react";
import { render, waitFor } from "@testing-library/react";
import { mock } from "jest-mock-extended";
import { PayPalScriptProvider } from "../components/PayPalScriptProvider";
import { PayPalMarks } from "./PayPalMarks";
import { FUNDING } from "../index";
import { loadScript, PayPalNamespace } from "@paypal/paypal-js";
import { ErrorBoundary } from "react-error-boundary";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

const mockPayPalNamespace = mock<PayPalNamespace>();

const onError = jest.fn();
const wrapper = ({ children }: { children: ReactNode }) => (
    <ErrorBoundary fallback={<div>Error</div>} onError={onError}>
        {children}
    </ErrorBoundary>
);

describe("<PayPalMarks />", () => {
    beforeEach(() => {
        window.paypal = mockPayPalNamespace;
        (loadScript as jest.Mock).mockResolvedValue(window.paypal);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should pass props to window.paypal.Marks()", async () => {
        window.paypal = {
            Marks: jest.fn(() => ({
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{ "client-id": "test", components: "marks" }}
            >
                <PayPalMarks fundingSource={FUNDING.CREDIT} />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(window.paypal?.Marks).toHaveBeenCalledWith({
                fundingSource: FUNDING.CREDIT,
            })
        );
    });

    test("should use className prop and add to div container", async () => {
        window.paypal = {
            Marks: jest.fn(() => ({
                isEligible: jest.fn().mockReturnValue(true),
                render: jest.fn().mockResolvedValue({}),
            })),
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{ "client-id": "test", components: "marks" }}
            >
                <PayPalMarks className="custom-class-name" />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(document.querySelector("div.custom-class-name")).toBeTruthy()
        );
    });

    test("should throw an error when no components are passed to the PayPalScriptProvider", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalMarks />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should throw an error when the 'marks' component is missing from the components list passed to the PayPalScriptProvider", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    components: "buttons,messages",
                }}
            >
                <PayPalMarks />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should throw an error when the 'marks' component is in the components list but wasn't load in the paypal object", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    components: "buttons,messages,marks",
                }}
            >
                <PayPalMarks />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should catch and throw unexpected zoid render errors", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal = {
            Marks() {
                return {
                    isEligible: jest.fn().mockReturnValue(true),
                    render: jest.fn((element) => {
                        // simulate adding markup for paypal mark
                        if (typeof element !== "string") {
                            element.append(document.createElement("div"));
                        }
                        return Promise.reject("Unknown error");
                    }),
                };
            },
            version: "",
        };

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalMarks />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should safely ignore error on render process when paypal marks container is no longer in the DOM ", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        const mockRender = jest
            .fn()
            .mockRejectedValue(new Error("Unknown error"));
        window.paypal = {
            Marks() {
                return {
                    isEligible: jest.fn().mockReturnValue(true),
                    render: mockRender,
                };
            },
            version: "",
        };

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalMarks className="test-class" />
            </PayPalScriptProvider>
        );

        await waitFor(() => expect(mockRender).toBeCalled());
        spyConsoleError.mockRestore();
    });

    test("should not render component when ineligible", async () => {
        const mockIsEligible = jest.fn().mockReturnValue(false);
        const mockRender = jest.fn().mockResolvedValue(true);
        window.paypal = {
            Marks() {
                return {
                    isEligible: mockIsEligible,
                    render: mockRender,
                };
            },
            version: "",
        };

        const { container } = render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalMarks className="mark-container">
                    <div className="ineligible"></div>
                </PayPalMarks>
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(
                container.querySelector(".ineligible") instanceof HTMLDivElement
            ).toBeTruthy()
        );
        expect(container.querySelector(".mark-container")).toBeNull();
        expect(mockIsEligible).toBeCalledTimes(1);
        expect(mockRender).not.toBeCalled();
    });

    test("should rerender the component when the funding source change", async () => {
        const mockRender = jest.fn((element) => {
            const markElement = document.createElement("div");

            markElement.setAttribute("id", "children-div");
            element.append(markElement);
            return Promise.resolve();
        });
        window.paypal = {
            Marks() {
                return {
                    isEligible: jest.fn().mockReturnValue(true),
                    render: mockRender,
                };
            },
            version: "",
        };

        const { rerender } = render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalMarks fundingSource="paypal" />
            </PayPalScriptProvider>
        );

        await waitFor(() => expect(mockRender).toBeCalledTimes(1));

        rerender(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalMarks fundingSource="card" />
            </PayPalScriptProvider>
        );

        await waitFor(() => expect(mockRender).toBeCalledTimes(2));
    });
});
