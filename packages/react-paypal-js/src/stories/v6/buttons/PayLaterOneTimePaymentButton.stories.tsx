/**
 * Storybook stories for V6 PayLaterOneTimePaymentButton component
 */

import React from "react";
import { action } from "@storybook/addon-actions";
import type { Meta, StoryFn } from "@storybook/react";

// V6 Decorators and utilities
import { withPayPalProvider } from "../decorators";
import {
    V6_EVENTS,
    V6_CONTAINER_SIZE,
    V6_COMPONENT_PROPS_CATEGORY,
    V6_COMPONENT_EVENTS,
} from "../constants";
import { getPayLaterOneTimePaymentCode } from "./code";

/**
 * Mock V6 PayLaterOneTimePaymentButton component
 * Replace with actual implementation
 */
const MockPayLaterOneTimePaymentButton: React.FC<any> = (props) => {
    return (
        <div
            style={{
                padding: "20px",
                border: "2px dashed #00c9a7",
                borderRadius: "8px",
                textAlign: "center",
            }}
        >
            <p style={{ margin: 0, color: "#00c9a7", fontWeight: "bold" }}>
                [V6 Mock] PayLater One-Time Payment Button
            </p>
            <p style={{ margin: "10px 0", fontSize: "12px", color: "#666" }}>
                Order ID: {props.orderId || "Not set"}
            </p>
            <button
                onClick={() => {
                    props.onClick?.();
                    props.onApprove?.({ orderId: props.orderId });
                }}
                disabled={props.disabled}
                style={{
                    padding: "10px 20px",
                    backgroundColor: props.disabled ? "#ccc" : "#00c9a7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: props.disabled ? "not-allowed" : "pointer",
                }}
            >
                Mock Pay Later
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

const meta: Meta<StoryProps> = {
    title: "V6/Buttons/PayLater One-Time Payment",
    component: MockPayLaterOneTimePaymentButton,
    decorators: [withPayPalProvider],
    parameters: {
        controls: { expanded: true, sort: "requiredFirst" },
        docs: {
            description: {
                component:
                    "V6 PayLater One-Time Payment Button. Allows customers to pay in installments using the new V6 architecture.",
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
        orderId: "ORDER_PAYLATER_123",
        disabled: false,
        size: 750,
    },
};

export default meta;

// Default story
export const Default: StoryFn<StoryProps> = (args) => {
    return (
        <MockPayLaterOneTimePaymentButton
            {...args}
            onInit={() =>
                action(V6_EVENTS.ON_INIT)("PayLater button initialized")
            }
            onClick={() =>
                action(V6_EVENTS.ON_CLICK)("PayLater button clicked")
            }
            onApprove={(data: any) => {
                action(V6_EVENTS.ON_APPROVE)(data);
            }}
            onError={(error: Error) => action(V6_EVENTS.ON_ERROR)(error)}
            onCancel={() => action(V6_EVENTS.ON_CANCEL)("PayLater cancelled")}
        />
    );
};

// Story with messaging
export const WithInstallmentInfo: StoryFn<StoryProps> = (args) => {
    return (
        <div>
            <div
                style={{
                    marginBottom: "20px",
                    padding: "15px",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "8px",
                    border: "1px solid #00c9a7",
                }}
            >
                <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>
                    💡 Pay in 4 interest-free payments of{" "}
                    <strong>$25.00</strong>
                </p>
            </div>
            <MockPayLaterOneTimePaymentButton
                {...args}
                onApprove={(data: any) => action(V6_EVENTS.ON_APPROVE)(data)}
                onError={(error: Error) => action(V6_EVENTS.ON_ERROR)(error)}
            />
        </div>
    );
};

// Disabled state
export const Disabled: StoryFn<StoryProps> = (args) => {
    return (
        <MockPayLaterOneTimePaymentButton
            {...args}
            disabled={true}
            onInit={() =>
                action(V6_EVENTS.ON_INIT)("PayLater button initialized")
            }
            onClick={() => action(V6_EVENTS.ON_CLICK)("Should not fire")}
        />
    );
};

// Override parameters
Default.parameters = {
    docs: {
        source: {
            code: getPayLaterOneTimePaymentCode({}),
        },
    },
};

WithInstallmentInfo.parameters = {
    docs: {
        description: {
            story: "Shows the PayLater button with installment information messaging.",
        },
    },
};

Disabled.parameters = {
    docs: {
        description: {
            story: "Shows the PayLater button in a disabled state (e.g., when amount is below minimum).",
        },
    },
};
