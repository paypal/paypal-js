import type { Meta, StoryObj } from "@storybook/react";

import { PayLaterOneTimePaymentButton } from "../../../v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    presentationModeArgType,
    disabledArgType,
} from "../shared/api";

const meta: Meta<typeof PayLaterOneTimePaymentButton> = {
    title: "V6/Buttons/PayLaterOneTimePaymentButton",
    component: PayLaterOneTimePaymentButton,
    argTypes: {
        presentationMode: presentationModeArgType,
        disabled: disabledArgType,
    },
};

export default meta;

type Story = StoryObj<typeof PayLaterOneTimePaymentButton>;

export const Default: Story = {
    args: {
        createOrder,
        presentationMode: "auto",
        ...oneTimePaymentCallbacks,
    },
};
