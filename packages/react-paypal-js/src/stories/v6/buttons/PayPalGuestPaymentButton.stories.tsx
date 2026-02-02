import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { PayPalGuestPaymentButton } from "../../../v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    disabledArgType,
} from "../shared/api";

const GuestPaymentButtonWithContainer = (
    props: React.ComponentProps<typeof PayPalGuestPaymentButton>,
) => (
    <paypal-basic-card-container>
        <PayPalGuestPaymentButton {...props} />
    </paypal-basic-card-container>
);

const meta: Meta<typeof PayPalGuestPaymentButton> = {
    title: "V6/Buttons/PayPalGuestPaymentButton",
    component: GuestPaymentButtonWithContainer,
    argTypes: {
        disabled: disabledArgType,
    },
    parameters: {
        docs: {
            description: {
                component:
                    "Guest checkout button for credit/debit card payments without a PayPal account. " +
                    "Uses a fixed 'auto' presentation mode.",
            },
        },
    },
};

export default meta;

type Story = StoryObj<typeof PayPalGuestPaymentButton>;

export const Default: Story = {
    args: {
        createOrder,
        ...oneTimePaymentCallbacks,
    },
};
