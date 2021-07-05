import React, {
    useState,
    FunctionComponent,
    ReactElement,
    ChangeEvent,
} from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";
import type { CreateOrderActions } from "@paypal/paypal-js/types/components/buttons";

import { FUNDING, PayPalScriptProvider, PayPalButtons } from "../index";
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

export const Default: FunctionComponent = () => <PayPalButtons />;

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

export const Tiny: FunctionComponent = () => (
    <div style={{ maxWidth: "80px" }}>
        <PayPalButtons fundingSource={FUNDING.PAYPAL} style={{ height: 25 }} />
    </div>
);

export const DynamicAmount: FunctionComponent = () => {
    const [amount, setAmount] = useState("2.00");
    const [orderID, setOrderID] = useState("");

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

    function onChange(event: ChangeEvent<HTMLSelectElement>) {
        setAmount(event.target.value);
        setOrderID("");
    }

    return (
        <div style={{ minHeight: "300px" }}>
            <label htmlFor="amount">Order Amount: </label>
            <select onChange={onChange} name="amount" id="amount">
                <option value="2.00">$2.00</option>
                <option value="4.00">$4.00</option>
                <option value="6.00">$6.00</option>
            </select>
            <p>Order ID: {orderID ? orderID : "unknown"}</p>

            <PayPalButtons createOrder={createOrder} forceReRender={[amount]} />
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
