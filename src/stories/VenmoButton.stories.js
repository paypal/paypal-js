import React from "react";
import { FUNDING, PayPalScriptProvider, PayPalButtons } from "../index";

const scriptProviderOptions = {
    "client-id":
        "AdLzRW18VHoABXiBhpX2gf0qhXwiW4MmFVHL69V90vciCg_iBLGyJhlf7EuWtFcdNjGiDfrwe7rmhvMZ",
    components: "buttons,funding-eligibility",
    "enable-funding": "venmo",
};

export default {
    title: "Example/VenmoButton",
    argTypes: {
        style: { control: null },
    },
    args: {
        // Storybook passes empty functions by default for props like `onShippingChange`.
        // This turns on the `onShippingChange()` feature which uses the popup experience with the Standard Card button.
        // We pass null to opt-out so the inline guest feature works as expected with the Standard Card button.
        onShippingChange: null,
    },
    decorators: [
        (Story) => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Standalone = () => (
    <PayPalButtons fundingSource={FUNDING.VENMO} style={{ color: "blue" }} />
);

export const Default = () => <PayPalButtons />;

export const Horizontal = () => (
    <PayPalButtons style={{ layout: "horizontal" }} />
);

export const CustomStyle = () => (
    <PayPalButtons
        style={{ color: "blue", shape: "pill", label: "pay", height: 40 }}
    />
);
