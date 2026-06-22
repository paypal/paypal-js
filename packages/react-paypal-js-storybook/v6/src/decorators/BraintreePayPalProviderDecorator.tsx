import React, { useEffect, useState } from "react";
import type { Decorator } from "@storybook/react";

import {
  BraintreePayPalProvider,
  type BraintreeV6Namespace,
} from "@paypal/react-paypal-js/sdk-v6";
import { getBraintreeClientToken } from "../shared/braintree/utils";

declare global {
  interface Window {
    braintree?: BraintreeV6Namespace;
  }
}

const ERROR_BOX_STYLE: React.CSSProperties = {
  padding: "1rem",
  border: "1px solid #e53e3e",
  borderRadius: "4px",
  backgroundColor: "#fff5f5",
  color: "#c53030",
};

function ErrorBox({
  title,
  detail,
}: {
  title: string;
  detail: React.ReactNode;
}) {
  return (
    <div style={ERROR_BOX_STYLE}>
      <strong>{title}</strong>
      <p style={{ margin: "0.5rem 0 0" }}>{detail}</p>
    </div>
  );
}

function BraintreeProviderWrapper({ children }: { children: React.ReactNode }) {
  const [clientToken, setClientToken] = useState<string | undefined>(undefined);
  const [tokenError, setTokenError] = useState<Error | null>(null);

  useEffect(() => {
    getBraintreeClientToken().then(setClientToken).catch(setTokenError);
  }, []);

  if (tokenError) {
    return (
      <ErrorBox
        title="Failed to fetch Braintree client token"
        detail={
          <>
            {tokenError.message}. Verify the sample server at{" "}
            <code>
              v6-web-sdk-with-braintree-sdk-sample-integration.fly.dev
            </code>{" "}
            is reachable.
          </>
        }
      />
    );
  }

  // The Braintree client and paypal-checkout-v6 scripts must be loaded in
  // .storybook/preview-head.html so window.braintree is defined before mount.
  if (typeof window !== "undefined" && !window.braintree) {
    return (
      <ErrorBox
        title="Braintree SDK scripts not loaded"
        detail={
          <>
            <code>window.braintree</code> is undefined. Confirm that{" "}
            <code>.storybook/preview-head.html</code> includes the Braintree
            client and <code>paypal-checkout-v6</code> script tags.
          </>
        }
      />
    );
  }

  if (!clientToken) {
    return <div>Fetching Braintree client token…</div>;
  }

  return (
    <BraintreePayPalProvider
      namespace={window.braintree!}
      braintreeClientToken={clientToken}
    >
      {children}
    </BraintreePayPalProvider>
  );
}

export const withBraintreePayPalProvider: Decorator = (Story) => (
  <BraintreeProviderWrapper>
    <Story />
  </BraintreeProviderWrapper>
);
