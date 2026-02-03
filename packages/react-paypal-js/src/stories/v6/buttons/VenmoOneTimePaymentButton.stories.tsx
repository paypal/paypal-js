import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";

import { VenmoOneTimePaymentButton } from "../../../v6";
import {
    createOrder,
    oneTimePaymentCallbacks,
    buttonTypeArgType,
    venmoPresentationModeArgType,
    disabledArgType,
} from "../shared/utils";
import V6DocPageStructure from "../../components/V6DocPageStructure";
import { getVenmoOneTimePaymentButtonCode } from "../shared/code";

const meta: Meta<typeof VenmoOneTimePaymentButton> = {
    title: "V6/Buttons/VenmoOneTimePaymentButton",
    component: VenmoOneTimePaymentButton,
    parameters: {
        controls: { expanded: true },
        docs: {
            description: {
                component: `Pay with Venmo offers a simplified mobile checkout experience at no additional cost.

It relies on the \`<PayPalProvider />\` parent component for managing SDK initialization and state.
For more information, see [Pay with Venmo](https://docs.paypal.ai/payments/methods/venmo/integrate)
`,
            },
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

(Default as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <V6DocPageStructure
                context={context}
                code={getVenmoOneTimePaymentButtonCode()}
            />
        ),
    },
};
