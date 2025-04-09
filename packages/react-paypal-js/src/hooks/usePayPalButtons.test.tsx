import React, { PropsWithChildren, useMemo, useState } from "react";
import {
    FUNDING_SOURCE,
    PayPalButtonMessage,
    PayPalNamespace,
} from "@paypal/paypal-js";
import { renderHook } from "@testing-library/react-hooks";
import { userEvent } from "@testing-library/user-event";
import { screen, render, waitFor } from "@testing-library/react";
import { loadScript } from "@paypal/paypal-js";

import { PayPalScriptProvider } from "../components/PayPalScriptProvider";
import { usePayPalButtons } from "./usePayPalButtons";
import { PayPalButtonsComponentProps } from "../types";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
}));

const Providers = ({ children }: PropsWithChildren<never>) => (
    <PayPalScriptProvider options={{ clientId: "test" }}>
        {children}
    </PayPalScriptProvider>
);

describe("usePayPalButtons", () => {
    const enableMockFn = jest.fn(() => Promise.resolve());
    const disableMockFn = jest.fn(() => Promise.resolve());

    beforeEach(() => {
        jest.clearAllMocks();

        window.paypal = {
            Buttons: jest.fn().mockImplementation(
                ({
                    onClick,
                    onInit,
                    fundingSource = "paypal",
                    message,
                }: {
                    onClick: () => void;
                    onInit: (
                        _data: unknown,
                        actions: {
                            enable: () => Promise<void>;
                            disable: () => Promise<void>;
                        },
                    ) => void;
                    fundingSource: FUNDING_SOURCE;
                    message: PayPalButtonMessage;
                }) => ({
                    isEligible: () => true,
                    close: async () => undefined,
                    render: async (ref: HTMLDivElement) => {
                        const el = document.createElement("button");
                        el.id = "mock-button";

                        const pay = document.createElement("span");
                        pay.textContent = `Pay with ${fundingSource}`;
                        el.appendChild(pay);

                        if (message) {
                            const msg = document.createElement("span");
                            msg.textContent = `message.amount is ${message.amount}`;
                            el.appendChild(msg);
                        }

                        if (onClick) {
                            el.addEventListener("click", onClick);
                        }

                        onInit(undefined, {
                            enable: enableMockFn,
                            disable: disableMockFn,
                        });

                        ref.appendChild(el);
                    },
                    updateProps: (props: PayPalButtonsComponentProps) => {
                        if (props.message) {
                            const el = document.getElementById("mock-button");
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            const msg = el!.lastChild;
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            msg!.textContent = `message.amount is ${props.message.amount}`;
                        }
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

            await userEvent.click(fundingSourceButton);

            payButton = await screen.findByText(/Pay with venmo/);
            expect(payButton).toBeInTheDocument();

            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(2);
            expect(window.paypal?.Buttons).toHaveBeenCalledWith(
                expect.objectContaining({ fundingSource: "venmo" }),
            );
        });

        test("should enable and disable buttons based on disabled prop", async () => {
            userEvent.setup();

            const onClickFn = jest.fn();

            const Wrapper = () => {
                const [disabled, setDisabled] = useState(false);

                function onClick() {
                    onClickFn();
                }

                const { Buttons } = usePayPalButtons({ onClick });

                return (
                    <div>
                        <button
                            data-testid="disable-button"
                            onClick={() => setDisabled((prev) => !prev)}
                        >
                            Disable buttons: {disabled}
                        </button>
                        <Buttons disabled={disabled} />
                    </div>
                );
            };

            render(
                <PayPalScriptProvider options={{ clientId: "test" }}>
                    <Wrapper />
                </PayPalScriptProvider>,
            );

            const payButton = await screen.findByText(/Pay with paypal/);
            expect(payButton).toBeInTheDocument();
            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(1);
            const parent = payButton.parentElement?.parentElement;
            expect(parent).not.toHaveClass("paypal-buttons-disabled");

            expect(disableMockFn).not.toHaveBeenCalled();
            expect(enableMockFn).toHaveBeenCalledTimes(1); // this gets called on first render

            const disableButton = screen.getByTestId("disable-button");
            await userEvent.click(disableButton);
            expect(parent).toHaveClass("paypal-buttons-disabled");
            expect(disableMockFn).toHaveBeenCalledTimes(1);

            await userEvent.click(disableButton);
            expect(parent).not.toHaveClass("paypal-buttons-disabled");
            expect(enableMockFn).toHaveBeenCalledTimes(2);

            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(1); // assert we aren't re-rendering the SDK at any point in this
        });

        test("should update message without re-rendering", async () => {
            userEvent.setup();

            const Wrapper = () => {
                const [amount, setAmount] = useState(100);

                const message: PayPalButtonMessage = useMemo(
                    () => ({ amount, align: "center", color: "black" }),
                    [amount],
                );

                const { Buttons } = usePayPalButtons({ message });

                return (
                    <div>
                        <button
                            data-testid="amount-button"
                            onClick={() => setAmount((prev) => prev + 100)}
                        >
                            Add amount: {amount}
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

            const payButton = await screen.findByText(/Pay with paypal/);
            expect(payButton).toBeInTheDocument();
            expect(window.paypal?.Buttons).toHaveBeenCalledTimes(1);
            expect(
                await screen.findByText("message.amount is 100"),
            ).toBeInTheDocument();

            const amountButton = screen.getByTestId("amount-button");
            await userEvent.click(amountButton);

            expect(
                await screen.findByText("message.amount is 200"),
            ).toBeInTheDocument();
        });
    });
});
