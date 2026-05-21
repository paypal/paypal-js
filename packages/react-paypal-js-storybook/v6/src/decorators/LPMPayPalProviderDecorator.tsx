import React, { useEffect } from "react";
import type { Decorator } from "@storybook/react";
import { action } from "storybook/actions";

import {
  PayPalProvider,
  usePayPal,
  INSTANCE_LOADING_STATE,
  LPM_REGISTRY,
} from "@paypal/react-paypal-js/sdk-v6";
import type { LPMName } from "@paypal/react-paypal-js/sdk-v6";
import { PAYPAL_CLIENT_ID } from "../shared/utils";

function SdkStatusMonitor({ children }: { children: React.ReactNode }) {
  const { loadingStatus } = usePayPal();

  useEffect(() => {
    if (loadingStatus === INSTANCE_LOADING_STATE.RESOLVED) {
      action("SDK")("Library initialized and rendered");
    }
  }, [loadingStatus]);

  return <>{children}</>;
}

function LPMProviderWrapper({
  lpm,
  testBuyerCountry,
  children,
}: {
  lpm: LPMName;
  testBuyerCountry?: string;
  children: React.ReactNode;
}) {
  const config = LPM_REGISTRY[lpm];

  if (!PAYPAL_CLIENT_ID) {
    return (
      <div
        style={{
          padding: "1rem",
          border: "1px solid #e53e3e",
          borderRadius: "4px",
          backgroundColor: "#fff5f5",
          color: "#c53030",
        }}
      >
        <strong>Missing environment variable</strong>
        <p style={{ margin: "0.5rem 0 0" }}>
          <code>STORYBOOK_PAYPAL_SANDBOX_CLIENT_ID</code> is not set. Copy{" "}
          <code>.env.example</code> to <code>.env</code> and add your sandbox
          client ID from{" "}
          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noreferrer"
          >
            developer.paypal.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    // key includes lpm + testBuyerCountry so the provider remounts when either
    // changes, loading the correct component bundle and buyer-country eligibility.
    <PayPalProvider
      key={`${lpm}-${testBuyerCountry ?? ""}`}
      clientId={PAYPAL_CLIENT_ID}
      components={[config.component]}
      pageType="checkout"
      testBuyerCountry={testBuyerCountry}
    >
      <SdkStatusMonitor>{children}</SdkStatusMonitor>
    </PayPalProvider>
  );
}

export const withLPMPayPalProvider: Decorator = (Story, context) => {
  const lpm = (context.args.lpm as LPMName) ?? "ideal";
  const testBuyerCountry = context.args.testBuyerCountry as string | undefined;

  return (
    <LPMProviderWrapper lpm={lpm} testBuyerCountry={testBuyerCountry}>
      <Story />
    </LPMProviderWrapper>
  );
};
