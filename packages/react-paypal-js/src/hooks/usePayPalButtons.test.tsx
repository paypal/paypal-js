import React, { PropsWithChildren, useState } from "react";
import { FUNDING_SOURCE, PayPalNamespace } from "@paypal/paypal-js";
import { renderHook } from "@testing-library/react-hooks";
import { userEvent } from "@testing-library/user-event";
import { screen, render, waitFor } from "@testing-library/react";
import { loadScript } from "@paypal/paypal-js";

import { PayPalScriptProvider } from "../components/PayPalScriptProvider";
import { usePayPalButtons } from "./usePayPalButtons";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

const Providers = ({ children }: PropsWithChildren<never>) => (
    <PayPalScriptProvider options={{ clientId: "test" }}>
        {children}
    </PayPalScriptProvider>
);

describe("usePayPalButtons", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        window.paypal = {
            Buttons: jest
                .fn()
                .mockImplementation(
                    ({
                        onClick,
                        fundingSource = "paypal",
                    }: {
                        onClick: () => void;
                        fundingSource: FUNDING_SOURCE;
                    }) => ({
                        isEligible: () => true,
                        close: async () => undefined,
                        render: async (ref: HTMLDivElement) => {
                            const el = document.createElement("button");
                            el.id = "mock-button";
                            el.textContent = `Pay with ${fundingSource}`;
                            el.addEventListener("click", onClick);
                            ref.appendChild(el);
                        },
                    }),
                ),
        } as unknown as PayPalNamespace;

        (loadScript as jest.Mock).mockResolvedValue(window.paypal);
    });

    describe("hook", () => {
        test("should return Buttons component, hasReturned, isEligible, and resume", async () => {
            const {
                result: { current },
            } = renderHook(() => usePayPalButtons({}), {
                wrapper: Providers,
            });

            await waitFor(() => {
                expect(window.paypal?.Buttons).toHaveBeenCalled();
            });

            expect(current).toHaveProperty("Buttons");
            expect(current).toHaveProperty("isEligible");
            expect(current).toHaveProperty("resume");
            expect(current).toHaveProperty("hasReturned");
        });
    });

    describe("component", () => {
        test("should render Buttons when Buttons instance exists", async () => {
            userEvent.setup();

            const onClickFn = jest.fn();

            const Wrapper = () => {
                function onClick() {
                    onClickFn();
                }

                const { Buttons } = usePayPalButtons({ onClick });

                return <Buttons />;
            };

            render(
                <PayPalScriptProvider options={{ clientId: "test" }}>
                    <Wrapper />
                </PayPalScriptProvider>,
            );

            const payButton = await screen.findByText(/Pay with/);
            expect(payButton).toBeInTheDocument();
            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(1);
            expect(window.paypal?.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ onClick: expect.any(Function) }),
            );
        });

        test("should render from a stable Buttons component", async () => {
            userEvent.setup();

            const onClickFn = jest.fn();

            const Wrapper = () => {
                const [count, setCount] = useState(0);

                function onClick() {
                    onClickFn(count);
                }

                const { Buttons } = usePayPalButtons({ onClick });

                return (
                    <div>
                        <button
                            data-testid="count-button"
                            onClick={() => setCount(count + 1)}
                        >
                            Count: {count}
                        </button>
                        <Buttons />
                    </div>
                );
            };

            render(
                <PayPalScriptProvider options={{ clientId: "test" }}>
                    <Wrapper />
                </PayPalScriptProvider>,
            );

            const payButton = await screen.findByText(/Pay with/);
            expect(payButton).toBeInTheDocument();

            const countButton = screen.getByTestId("count-button");

            // forcing an update to assert that the hook returns the same Buttons component
            await userEvent.click(countButton);
            await userEvent.click(payButton);

            expect(onClickFn).toHaveBeenCalledWith(1);
            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(1);
            expect(window.paypal?.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ onClick: expect.any(Function) }),
            );
        });

        test("should render new buttons instance when fundingSource changes", async () => {
            userEvent.setup();

            const Wrapper = () => {
                const [fundingSource, setFundingSource] =
                    useState<FUNDING_SOURCE>("paypal");
                const { Buttons } = usePayPalButtons({
                    fundingSource,
                });

                return (
                    <div>
                        <button
                            data-testid="funding-source-button"
                            onClick={() =>
                                setFundingSource((prev) =>
                                    prev === "paypal" ? "venmo" : "paypal",
                                )
                            }
                        >
                            Funding Source: {fundingSource}
                        </button>
                        <Buttons />
                    </div>
                );
            };

            render(
                <PayPalScriptProvider options={{ clientId: "test" }}>
                    <Wrapper />
                </PayPalScriptProvider>,
            );

            let payButton = await screen.findByText(/Pay with paypal/);
            expect(payButton).toBeInTheDocument();

            const fundingSourceButton = screen.getByTestId(
                "funding-source-button",
            );

            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(1);
            expect(window.paypal?.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ fundingSource: "paypal" }),
            );

            // forcing an update to assert that the hook returns the same Buttons component
            await userEvent.click(fundingSourceButton);

            payButton = await screen.findByText(/Pay with venmo/);
            expect(payButton).toBeInTheDocument();

            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(2);
            expect(window.paypal?.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ fundingSource: "venmo" }),
            );
        });
    });
});
