import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import * as SDKV6 from "@paypal/react-paypal-js/sdk-v6";
import {
  LPM_REGISTRY,
  useEligibleMethods,
} from "@paypal/react-paypal-js/sdk-v6";
import type {
  LPMName,
  LPMOneTimePaymentButtonProps,
} from "@paypal/react-paypal-js/sdk-v6";
import {
  createOrder,
  disabledArgType,
  oneTimePaymentCallbacks,
} from "../utils";
import { getLPMStoryConfig } from "./config";

export interface LPMStoryArgs {
  disabled: boolean;
}

type NamedLPMButtonProps = Omit<LPMOneTimePaymentButtonProps, "lpm">;

const FIELD_VALUES = {
  name: "Test Buyer",
  email: "test-buyer@example.com",
};

function toPascalCase(lpm: LPMName): string {
  return lpm.charAt(0).toUpperCase() + lpm.slice(1);
}

function getButtonComponent(
  lpm: LPMName,
): React.ComponentType<NamedLPMButtonProps> {
  const exportName = `${toPascalCase(lpm)}OneTimePaymentButton`;
  const component = (SDKV6 as Record<string, unknown>)[exportName];

  if (!component) {
    throw new Error(`Missing SDK v6 export: ${exportName}`);
  }

  return component as React.ComponentType<NamedLPMButtonProps>;
}

export function createLPMMetaExtras(
  lpm: LPMName,
): Omit<Meta<LPMStoryArgs>, "title"> {
  const registryConfig = LPM_REGISTRY[lpm];
  const ButtonComponent = getButtonComponent(lpm);

  return {
    component: ButtonComponent as unknown as React.ComponentType<LPMStoryArgs>,
    parameters: {
      sdkComponents: [registryConfig.component],
      testBuyerCountry: registryConfig.testBuyerCountry,
    },
    argTypes: {
      disabled: disabledArgType,
    },
  };
}

export function createLPMStories(lpm: LPMName): {
  Default: StoryObj<LPMStoryArgs>;
} {
  const registryConfig = LPM_REGISTRY[lpm];
  const storyConfig = getLPMStoryConfig(lpm);
  const ButtonComponent = getButtonComponent(lpm);

  function LPMStory({ disabled }: LPMStoryArgs) {
    const {
      eligiblePaymentMethods,
      isLoading: isEligibilityLoading,
      error: eligibilityError,
    } = useEligibleMethods({
      payload: { currencyCode: storyConfig.currencyCode },
    });

    if (isEligibilityLoading) {
      return <div>Checking eligibility...</div>;
    }

    if (eligibilityError) {
      return <div>Failed to check eligibility: {eligibilityError.message}</div>;
    }

    if (!eligiblePaymentMethods?.isEligible(storyConfig.fundingSource)) {
      return (
        <div>
          {registryConfig.displayName} is not eligible for this configuration.
        </div>
      );
    }

    return (
      <ButtonComponent
        createOrder={() => createOrder(storyConfig.currencyCode)}
        presentationMode="popup"
        disabled={disabled}
        fieldValues={FIELD_VALUES}
        {...storyConfig.sessionFieldValues}
        {...oneTimePaymentCallbacks}
      />
    );
  }

  return {
    Default: {
      render: (args) => <LPMStory {...args} />,
      args: { disabled: false },
    },
  };
}
