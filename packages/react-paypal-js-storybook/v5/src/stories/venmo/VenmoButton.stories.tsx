import React from "react";

import {
  PayPalScriptProvider,
  FUNDING,
  PayPalButtons,
} from "@paypal/react-paypal-js";
import { getOptionsFromQueryString, generateRandomString } from "../utils";
import DocPageStructure from "../components/DocPageStructure";
import { InEligibleError } from "../commons";
import { getDefaultCode } from "./code";

import type { FC } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js";

const scriptProviderOptions: PayPalScriptOptions = {
  clientId:
    "AdLzRW18VHoABXiBhpX2gf0qhXwiW4MmFVHL69V90vciCg_iBLGyJhlf7EuWtFcdNjGiDfrwe7rmhvMZ",
  components: "buttons,funding-eligibility",
  enableFunding: "venmo",
  ...getOptionsFromQueryString(),
};

const meta = {
  id: "example/VenmoButton",
  title: "PayPal/VenmoButton",
  parameters: {
    controls: { expanded: true },
    docs: {
      page: (): JSX.Element => (
        <DocPageStructure
          code={getDefaultCode(meta.args.style)}
          options={{ previewHeight: "700px", codeHeight: "600px" }}
        />
      ),
      source: { type: "dynamic" },
      description: {
        component: `Pay with Venmo offers a simplified mobile checkout experience at no additional cost to you.

Your buyers get:

- A streamlined checkout process
- Splitting and sharing of purchases.

It relies on the \`<PayPalScriptProvider />\` parent component for managing state related to loading the JS SDK script.
For more information, see [Pay with Venmo](https://developer.paypal.com/docs/business/checkout/pay-with-venmo/)
`,
      },
    },
  },
  argTypes: {
    style: {
      description: "Styling options for customizing the button appearance.",
      control: { type: "object", expanded: true },
      table: {
        category: "Props",
        type: {
          summary: `{
                    color?: "blue" | "silver" | "white" | "black";
                    label?:
                        | "paypal"
                        | "checkout"
                        | "buynow"
                        | "pay"
                        | "installment"
                        | "subscribe"
                        | "donate";
                    shape?: "rect" | "pill";
                }`,
        },
      },
    },
    onShippingChange: {
      description:
        "Called when the buyer changes their shipping address on PayPal.",
      control: null,
      table: { category: "Events", type: { summary: "() => void" } },
    },
  },
  args: {
    // Storybook passes empty functions by default for props like `onShippingChange`.
    // This turns on the `onShippingChange()` feature which uses the popup experience with the Standard Card button.
    // We pass null to opt-out so the inline guest feature works as expected with the Standard Card button.
    onShippingChange: null,
    style: {
      color: "blue",
    },
  },
};

export default meta;

export const Default: FC<{
  style: {
    color?: "blue" | "silver" | "white" | "black";
    label?:
      | "paypal"
      | "checkout"
      | "buynow"
      | "pay"
      | "installment"
      | "subscribe"
      | "donate";
    shape?: "rect" | "pill";
  };
}> = ({ style }) => {
  const uid = generateRandomString();

  return (
    <PayPalScriptProvider
      options={{
        ...scriptProviderOptions,
        dataNamespace: uid,
        dataUid: uid,
      }}
    >
      <PayPalButtons
        fundingSource={FUNDING.VENMO}
        style={style}
        forceReRender={[style]}
      >
        <InEligibleError text="You are not eligible to pay with Venmo." />
      </PayPalButtons>
    </PayPalScriptProvider>
  );
};
