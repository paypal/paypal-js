import React from "react";

import { PayPalScriptProvider, PayPalMessages } from "@paypal/react-paypal-js";
import DocPageStructure from "./components/DocPageStructure";
import { getOptionsFromQueryString } from "./utils";
import { COMPONENT_PROPS_CATEGORY } from "./constants";

import type { FC } from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js";

const scriptProviderOptions: PayPalScriptOptions = {
  clientId: "test",
  components: "messages",
  ...getOptionsFromQueryString(),
};

const meta = {
  id: "example/PayPalMessages",
  title: "PayPal/PayPalMessages",
  component: PayPalMessages,
  parameters: {
    controls: { expanded: true },
    actions: { disable: true },
    docs: {
      source: { type: "dynamic" },
      page: (): JSX.Element => (
        <DocPageStructure code={getDefaultCode(meta.args.style)} />
      ),
    },
  },
  argTypes: {
    style: {
      description:
        "Make inline change in the way the component will be render.",
      ...COMPONENT_PROPS_CATEGORY,
    },
    forceReRender: {
      control: null,
      description:
        "List of dependencies to re-render the PayPal messages component. This is similar to the useEffect hook dependencies list.",
      ...COMPONENT_PROPS_CATEGORY,
    },
    className: {
      control: null,
      description: "Pass a CSS class to the div container.",
      ...COMPONENT_PROPS_CATEGORY,
    },
    account: {
      control: null,
      description: "Set the account identifier.",
      ...COMPONENT_PROPS_CATEGORY,
    },
    amount: {
      control: null,
      description:
        "This represent the amount of money to charge. Can be a numeric value `10` or a string value `'10.00'`",
      ...COMPONENT_PROPS_CATEGORY,
    },
  },
  args: {
    style: { layout: "text" },
  },
};

export default meta;

export const Default: FC<{
  style: {
    layout?: "text" | "flex" | "custom";
    color: string;
  };
}> = ({ style }) => (
  <PayPalScriptProvider options={scriptProviderOptions}>
    <PayPalMessages style={style} forceReRender={[style]} />
  </PayPalScriptProvider>
);

/********************
 * OVERRIDE STORIES *
 *******************/
const getDefaultCode = (style: Record<string, unknown>): string =>
  `import { PayPalScriptProvider, PayPalMessages } from "@paypal/react-paypal-js";

const style = ${JSON.stringify(style)};

export default function App() {
	return (
		<PayPalScriptProvider
			options={{
				clientId: "test",
				components: "messages",
			}}
		>
			<PayPalMessages
				style={style}
                forceReRender={[style]}
			/>
		</PayPalScriptProvider>
	);
}`;
