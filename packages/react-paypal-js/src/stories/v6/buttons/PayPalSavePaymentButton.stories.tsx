import type { Meta, StoryObj } from "@storybook/react";

import { PayPalSavePaymentButton } from "../../../v6";
import {
    createVaultToken,
    savePaymentCallbacks,
    buttonTypeArgType,
    presentationModeArgType,
    disabledArgType,
} from "../shared/utils";

const meta: Meta<typeof PayPalSavePaymentButton> = {
    title: "V6/Buttons/PayPalSavePaymentButton",
    component: PayPalSavePaymentButton,
    argTypes: {
        type: buttonTypeArgType,
        presentationMode: presentationModeArgType,
        disabled: disabledArgType,
    },
};

export default meta;

type Story = StoryObj<typeof PayPalSavePaymentButton>;

export const Default: Story = {
    args: {
        createVaultToken,
        presentationMode: "auto",
        ...savePaymentCallbacks,
    },
};
