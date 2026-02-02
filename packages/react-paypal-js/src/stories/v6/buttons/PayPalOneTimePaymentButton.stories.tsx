import type { Meta, StoryObj } from "@storybook/react";

import { PayPalOneTimePaymentButton } from "../../../v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    buttonTypeArgType,
    presentationModeArgType,
    disabledArgType,
} from "../shared/utils";

const meta: Meta<typeof PayPalOneTimePaymentButton> = {
    title: "V6/Buttons/PayPalOneTimePaymentButton",
    component: PayPalOneTimePaymentButton,
    argTypes: {
        type: buttonTypeArgType,
        presentationMode: presentationModeArgType,
        disabled: disabledArgType,
    },
};

export default meta;

type Story = StoryObj<typeof PayPalOneTimePaymentButton>;

export const Default: Story = {
    args: {
        createOrder,
        presentationMode: "auto",
        ...oneTimePaymentCallbacks,
    },
};
