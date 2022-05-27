import React from "react";
import { render, waitFor } from "@testing-library/react";
import { mock } from "jest-mock-extended";
import { loadScript, PayPalNamespace } from "@paypal/paypal-js";
import { ErrorBoundary } from "react-error-boundary";

import { PayPalMessages } from "..";
import { PayPalScriptProvider } from "../components/PayPalScriptProvider";

import type { ReactNode } from "react";

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

describe("<PayPalMessages />", () => {
    beforeEach(() => {
        window.paypal = mockPayPalNamespace;
        (loadScript as jest.Mock).mockResolvedValue(mockPayPalNamespace);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should render PayPalMessages with props", async () => {
        const style = {
            color: "blue",
        };
        window.paypal = {
            Messages: jest.fn(() => ({
                render: jest.fn().mockResolvedValue({}),
            })),
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{ "client-id": "test", components: "messages" }}
            >
                <PayPalMessages style={style} className="customClass" />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(window.paypal?.Messages).toHaveBeenCalledWith({ style })
        );
    });

    test("should use className prop and add to div container", async () => {
        window.paypal = {
            Messages: jest.fn(() => ({
                render: jest.fn().mockResolvedValue({}),
            })),
            version: "",
        };

        const { container } = render(
            <PayPalScriptProvider
                options={{ "client-id": "test", components: "messages" }}
            >
                <PayPalMessages className="custom-class-name" />
            </PayPalScriptProvider>
        );

        await waitFor(() =>
            expect(
                container.querySelector("div.custom-class-name")
            ).not.toBeNull()
        );
    });

    test("should throw an error when namespace is undefined", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal = undefined;

        render(
            <PayPalScriptProvider options={{ "client-id": "test" }}>
                <PayPalMessages />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should throw an error when the 'messages' function is not available in the namespace", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        window.paypal = {
            Messages: undefined,
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    components: "messages",
                }}
            >
                <PayPalMessages />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });

    test("should throw an error when the render process fails and ignore error if the container is no longer in the DOM", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        const mockRender = jest
            .fn()
            .mockRejectedValue(new Error("Fail to render"));
        window.paypal = {
            Messages() {
                return { render: mockRender };
            },
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    components: "messages",
                }}
            >
                <PayPalMessages />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(mockRender).toBeCalled());
        spyConsoleError.mockRestore();
    });

    test("should throw an error when the render process fails and the container is in the DOM", async () => {
        const spyConsoleError = jest
            .spyOn(console, "error")
            .mockImplementation();
        const mockRender = jest.fn((element) => {
            // Add a children component to avoid ignoring error
            const markElement = document.createElement("div");

            markElement.setAttribute("id", "children-div");
            element.append(markElement);
            return Promise.reject();
        });
        window.paypal = {
            Messages() {
                return { render: mockRender };
            },
            version: "",
        };

        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    components: "messages",
                }}
            >
                <PayPalMessages />
            </PayPalScriptProvider>,
            { wrapper }
        );

        await waitFor(() => expect(onError).toHaveBeenCalled());
        expect(onError.mock.calls[0][0].message).toMatchSnapshot();
        spyConsoleError.mockRestore();
    });
});
