/**
 * Storybook stories for V6 PayPalOneTimePaymentButton component
 */

import React from "react";
import { action } from "@storybook/addon-actions";
import type { Meta, StoryFn } from "@storybook/react";

// V6 Decorators and utilities
import { withPayPalProvider } from "../decorators";
import { createMockOrder, approveMockOrder } from "../utils";
import {
    V6_EVENTS,
    V6_CONTAINER_SIZE,
    V6_COMPONENT_PROPS_CATEGORY,
    V6_COMPONENT_EVENTS,
} from "../constants";
import { getPayPalOneTimePaymentCode } from "./code";

// TODO: Import actual V6 component
// import { PayPalOneTimePaymentButton } from "../../../v6";

/**
 * Mock V6 PayPalOneTimePaymentButton component
 * Replace with actual implementation
 */
const MockPayPalOneTimePaymentButton = (props: any) => {
    return (
        <div
            style={{
                padding: "20px",
                border: "2px dashed #0070ba",
                borderRadius: "8px",
                textAlign: "center",
            }}
        >
            <p style={{ margin: 0, color: "#0070ba", fontWeight: "bold" }}>
                [V6 Mock] PayPal One-Time Payment Button
            </p>
            <p style={{ margin: "10px 0", fontSize: "12px", color: "#666" }}>
                Order ID: {props.orderId || "Not set"}
            </p>
            <button
                onClick={() => {
                    props.onClick?.();
                    props.onApprove?.({ orderId: props.orderId });
                }}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#0070ba",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                Mock Pay with PayPal
            </button>
        </div>
    );
};

// Story configuration
type StoryProps = {
    orderId: string;
    disabled?: boolean;
    size?: number;
    onInit?: () => void;
    onClick?: () => void;
    onApprove?: (data: any) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
};

const meta: Meta<typeof MockPayPalOneTimePaymentButton> = {
    title: "V6/Buttons/PayPal One-Time Payment",
    component: MockPayPalOneTimePaymentButton,
    decorators: [withPayPalProvider],
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
        docs: {
            description: {
                component:
                    "V6 PayPal One-Time Payment Button. Uses the new PayPalProvider architecture for simplified integration.",
            },
        },
    },
    argTypes: {
        orderId: {
            description: "The PayPal order ID for this transaction",
            control: { type: "text" },
            ...V6_COMPONENT_PROPS_CATEGORY,
        },
        disabled: {
            description: "Whether the button is disabled",
            control: { type: "boolean" },
            ...V6_COMPONENT_PROPS_CATEGORY,
        },
        size: V6_CONTAINER_SIZE,
        onInit: { table: { category: V6_COMPONENT_EVENTS } },
        onClick: { table: { category: V6_COMPONENT_EVENTS } },
        onApprove: { table: { category: V6_COMPONENT_EVENTS } },
        onError: { table: { category: V6_COMPONENT_EVENTS } },
        onCancel: { table: { category: V6_COMPONENT_EVENTS } },
    },
    args: {
        orderId: "ORDER_12345",
        disabled: false,
        size: 750,
    },
};

export default meta;

// Default story
export const Default: StoryFn<StoryProps> = (args) => {
    return (
        <MockPayPalOneTimePaymentButton
            {...args}
            onInit={() => action(V6_EVENTS.ON_INIT)("Button initialized")}
            onClick={() => action(V6_EVENTS.ON_CLICK)("Button clicked")}
            onApprove={(data: any) => {
                action(V6_EVENTS.ON_APPROVE)(data);
            }}
            onError={(error: Error) => action(V6_EVENTS.ON_ERROR)(error)}
            onCancel={() => action(V6_EVENTS.ON_CANCEL)("Payment cancelled")}
        />
    );
};

// Story with dynamic order creation
export const WithDynamicOrder: StoryFn<StoryProps> = () => {
    const [orderId, setOrderId] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState(false);

    const handleCreateOrder = async () => {
        setIsLoading(true);
        try {
            const newOrderId = await createMockOrder("99.99");
            setOrderId(newOrderId);
            action(V6_EVENTS.ORDER_CREATED)(newOrderId);
        } catch (error) {
            action(V6_EVENTS.ON_ERROR)(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={handleCreateOrder}
                    disabled={isLoading}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#0070ba",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        opacity: isLoading ? 0.6 : 1,
                    }}
                >
                    {isLoading ? "Creating Order..." : "Create Order"}
                </button>
                {orderId && (
                    <p style={{ marginTop: "10px", color: "#0070ba" }}>
                        Order created: {orderId}
                    </p>
                )}
            </div>
            {orderId && (
                <MockPayPalOneTimePaymentButton
                    orderId={orderId}
                    onApprove={async (data: any) => {
                        const result = await approveMockOrder(data.orderId);
                        action(V6_EVENTS.ON_APPROVE)(result);
                    }}
                    onError={(error: Error) =>
                        action(V6_EVENTS.ON_ERROR)(error)
                    }
                />
            )}
        </div>
    );
};

// Disabled state story
export const Disabled: StoryFn<StoryProps> = (args) => {
    return (
        <MockPayPalOneTimePaymentButton
            {...args}
            disabled={true}
            onInit={() => action(V6_EVENTS.ON_INIT)("Button initialized")}
            onClick={() => action(V6_EVENTS.ON_CLICK)("Button clicked")}
            onApprove={(data: any) => action(V6_EVENTS.ON_APPROVE)(data)}
            onError={(error: Error) => action(V6_EVENTS.ON_ERROR)(error)}
        />
    );
};

// Override parameters for code snippets
Default.parameters = {
    docs: {
        source: {
            code: getPayPalOneTimePaymentCode({}),
        },
    },
};

WithDynamicOrder.parameters = {
    docs: {
        description: {
            story: "Demonstrates creating an order on-demand before showing the payment button.",
        },
    },
};

Disabled.parameters = {
    docs: {
        description: {
            story: "Shows the button in a disabled state.",
        },
    },
};
