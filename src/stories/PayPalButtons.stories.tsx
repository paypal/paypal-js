import React, {
    useState,
    FunctionComponent,
    ReactElement,
    ChangeEvent,
} from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import type {
    CreateOrderActions,
    OnApproveData,
    OnApproveActions,
} from "@paypal/paypal-js/types/components/buttons";

import { PayPalScriptProvider, PayPalButtons, FUNDING } from "../index";
import { getOptionsFromQueryString, generateRandomString } from "./utils";

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Example/PayPalButtons",
    component: PayPalButtons,
    argTypes: {
        style: { control: null },
    },
    args: {
        // Storybook passes empty functions by default for props like `onShippingChange`.
        // This turns on the `onShippingChange()` feature which uses the popup experience with the Standard Card button.
        // We pass null to opt-out so the inline guest feature works as expected with the Standard Card button.
        onShippingChange: null,
    },
    decorators: [
        (Story: FunctionComponent): ReactElement => (
            <PayPalScriptProvider
                options={{
                    ...scriptProviderOptions,
                    "data-namespace": generateRandomString(),
                }}
            >
                <div style={{ minHeight: "200px" }}>
                    <Story />
                </div>
            </PayPalScriptProvider>
        ),
    ],
};

export const Default: FunctionComponent = () => {
    return <PayPalButtons />;
};

export const Horizontal: FunctionComponent = () => (
    <PayPalButtons style={{ layout: "horizontal" }} />
);

export const CustomStyle: FunctionComponent = () => (
    <PayPalButtons
        style={{ color: "blue", shape: "pill", label: "pay", height: 40 }}
    />
);

export const Standalone: FunctionComponent = () => (
    <PayPalButtons fundingSource={FUNDING.PAYPAL} />
);

export const Donate: FunctionComponent = () => (
    <PayPalButtons
        fundingSource={FUNDING.PAYPAL}
        style={{ label: "donate" }}
        createOrder={(data, actions) => {
            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: "2.00",
                            breakdown: {
                                item_total: {
                                    currency_code: "USD",
                                    value: "2.00",
                                },
                            },
                        },
                        items: [
                            {
                                name: "donation-example",
                                quantity: "1",
                                unit_amount: {
                                    currency_code: "USD",
                                    value: "2.00",
                                },
                                category: "DONATION",
                            },
                        ],
                    },
                ],
            });
        }}
    />
);

export const Tiny: FunctionComponent = () => (
    <div style={{ maxWidth: "80px" }}>
        <PayPalButtons fundingSource={FUNDING.PAYPAL} style={{ height: 25 }} />
    </div>
);

export const DynamicAmount: FunctionComponent = () => {
    const [amount, setAmount] = useState("2.00");
    const [orderID, setOrderID] = useState("");
    const [onApproveMessage, setOnApproveMessage] = useState("");
    const [onErrorMessage, setOnErrorMessage] = useState("");

    function createOrder(
        data: Record<string, unknown>,
        actions: CreateOrderActions
    ) {
        return actions.order
            .create({
                purchase_units: [
                    {
                        amount: {
                            value: amount,
                        },
                    },
                ],
            })
            .then((orderID) => {
                setOrderID(orderID);
                return orderID;
            });
    }

    function onApprove(data: OnApproveData, actions: OnApproveActions) {
        return actions.order.capture().then(function (details) {
            setOnApproveMessage(
                `Transaction completed by ${details.payer.name.given_name}!`
            );
        });
    }

    function onError(err: Record<string, unknown>) {
        setOnErrorMessage(err.toString());
    }

    function onChange(event: ChangeEvent<HTMLSelectElement>) {
        setAmount(event.target.value);
        setOrderID("");
        setOnApproveMessage("");
        setOnErrorMessage("");
    }

    return (
        <div style={{ minHeight: "300px" }}>
            <table className="table" style={{ maxWidth: "400px" }}>
                <tbody>
                    <tr>
                        <th>
                            <label htmlFor="amount">Order Amount: </label>
                        </th>
                        <td>
                            <select
                                onChange={onChange}
                                name="amount"
                                id="amount"
                            >
                                <option value="2.00">$2.00</option>
                                <option value="4.00">$4.00</option>
                                <option value="6.00">$6.00</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>Order ID:</th>
                        <td>{orderID ? orderID : "unknown"}</td>
                    </tr>
                    <tr>
                        <th>On Approve Message: </th>
                        <td data-testid="message">{onApproveMessage}</td>
                    </tr>
                    <tr>
                        <th>On Error Message: </th>
                        <td data-testid="error">{onErrorMessage}</td>
                    </tr>
                </tbody>
            </table>

            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                forceReRender={[amount]}
            />
        </div>
    );
};

export const Disabled: FunctionComponent = () => {
    const [isDisabled, setIsDisabled] = useState(true);

    function onCheckboxChange(event: ChangeEvent<HTMLInputElement>) {
        setIsDisabled(!event.target.checked);
    }

    return (
        <>
            <label htmlFor="check">Check here to continue</label>
            <input
                id="check"
                name="check"
                type="checkbox"
                onChange={onCheckboxChange}
            />

            <PayPalButtons
                fundingSource={FUNDING.PAYPAL}
                disabled={isDisabled}
            />
        </>
    );
};
