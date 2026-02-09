import type { Meta, StoryObj } from "@storybook/react";

import { VenmoOneTimePaymentButton } from "@paypal/react-paypal-js/sdk-v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    buttonTypeArgType,
    venmoPresentationModeArgType,
    disabledArgType,
} from "../../shared/utils";
import { V6DocPageStructure } from "../../components";
import { getVenmoOneTimePaymentButtonCode } from "../../shared/code";

const meta: Meta<typeof VenmoOneTimePaymentButton> = {
    title: "V6/Buttons/VenmoOneTimePaymentButton",
    component: VenmoOneTimePaymentButton,
    tags: ["autodocs"],
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `Pay with Venmo offers a simplified mobile checkout experience at no additional cost.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [Pay with Venmo](https://docs.paypal.ai/payments/methods/venmo/integrate)
`,
            },
            page: () => (
                <V6DocPageStructure code={getVenmoOneTimePaymentButtonCode()} />
            ),
        },
    },
    argTypes: {
        type: buttonTypeArgType,
        presentationMode: venmoPresentationModeArgType,
        disabled: disabledArgType,
        createOrder: {
            description:
                "Function that creates an order and returns the order ID.",
            table: { category: "Events" },
        },
        onApprove: {
            description: "Called when the buyer approves the payment.",
            table: { category: "Events" },
        },
        onCancel: {
            description: "Called when the buyer cancels the payment.",
            table: { category: "Events" },
        },
        onError: {
            description: "Called when an error occurs during the payment flow.",
            table: { category: "Events" },
        },
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
