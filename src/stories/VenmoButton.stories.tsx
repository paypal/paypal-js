import React, { FunctionComponent, ReactElement } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

import { FUNDING, PayPalScriptProvider, PayPalButtons } from "../index";
import { getOptionsFromQueryString, generateRandomString } from "./utils";

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id":
        "AdLzRW18VHoABXiBhpX2gf0qhXwiW4MmFVHL69V90vciCg_iBLGyJhlf7EuWtFcdNjGiDfrwe7rmhvMZ",
    components: "buttons,funding-eligibility",
    "enable-funding": "venmo",
    debug: true,
    ...getOptionsFromQueryString(),
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
        (Story: FunctionComponent): ReactElement => (
            <PayPalScriptProvider
                options={{
                    ...scriptProviderOptions,
                    "data-namespace": generateRandomString(),
                }}
            >
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Standalone: FunctionComponent = () => (
    <PayPalButtons fundingSource={FUNDING.VENMO} style={{ color: "blue" }}>
        <p>You are not eligible to pay with Venmo.</p>
    </PayPalButtons>
);

export const Default: FunctionComponent = () => <PayPalButtons />;

export const Horizontal: FunctionComponent = () => (
    <PayPalButtons style={{ layout: "horizontal" }} />
);

export const CustomStyle: FunctionComponent = () => (
    <PayPalButtons
        style={{ color: "blue", shape: "pill", label: "pay", height: 40 }}
    />
);
