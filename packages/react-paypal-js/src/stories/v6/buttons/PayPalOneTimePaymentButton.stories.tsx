import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { withPayPalProvider } from "../decorators";
import { PayPalOneTimePaymentButton } from "../../../v6";

const meta: Meta<typeof PayPalOneTimePaymentButton> = {
    title: "V6/Buttons/PayPalOneTimePaymentButton",
    component: PayPalOneTimePaymentButton,
    decorators: [withPayPalProvider],
};

export default meta;

type Story = StoryObj<typeof PayPalOneTimePaymentButton>;

export const Default: Story = {
    args: {
        orderId: "TEST_ORDER_ID",
    },
};
