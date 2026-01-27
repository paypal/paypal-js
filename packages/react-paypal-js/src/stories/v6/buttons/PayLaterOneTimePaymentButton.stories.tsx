import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { withPayPalProvider } from "../decorators";
import { PayLaterOneTimePaymentButton } from "../../../v6";

const meta: Meta<typeof PayLaterOneTimePaymentButton> = {
    title: "V6/Buttons/PayLaterOneTimePaymentButton",
    component: PayLaterOneTimePaymentButton,
    decorators: [withPayPalProvider],
};

export default meta;

type Story = StoryObj<typeof PayLaterOneTimePaymentButton>;

export const Default: Story = {
    args: {
        orderId: "TEST_ORDER_ID",
    },
};
