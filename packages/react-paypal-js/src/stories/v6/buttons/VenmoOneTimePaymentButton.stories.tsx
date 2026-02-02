import type { Meta, StoryObj } from "@storybook/react";

import { VenmoOneTimePaymentButton } from "../../../v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    buttonTypeArgType,
    venmoPresentationModeArgType,
    disabledArgType,
} from "../shared/api";

const meta: Meta<typeof VenmoOneTimePaymentButton> = {
    title: "V6/Buttons/VenmoOneTimePaymentButton",
    component: VenmoOneTimePaymentButton,
    argTypes: {
        type: buttonTypeArgType,
        presentationMode: venmoPresentationModeArgType,
        disabled: disabledArgType,
    },
};

export default meta;

type Story = StoryObj<typeof VenmoOneTimePaymentButton>;

export const Default: Story = {
    args: {
        createOrder,
        presentationMode: "auto",
        ...oneTimePaymentCallbacks,
    },
};
