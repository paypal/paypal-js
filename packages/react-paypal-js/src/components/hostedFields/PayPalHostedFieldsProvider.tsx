import React, { useState, useEffect } from "react";

import { PayPalHostedFieldsContext } from "../../context/payPalHostedFieldsContext";
import { useHostedFieldsRegister } from "./hooks";
import { useScriptProviderContext } from "../../hooks/scriptProviderHooks";
import { SDK_SETTINGS } from "../../constants";
import {
  validateHostedFieldChildren,
  generateMissingHostedFieldsError,
} from "./utils";
import {
  PAYPAL_HOSTED_FIELDS_TYPES,
  SCRIPT_LOADING_STATE,
} from "../../types/enums";
import { getPayPalWindowNamespace } from "../../utils";

import type { FC } from "react";
import type { PayPalHostedFieldsComponentProps } from "../../types/payPalHostedFieldTypes";
import type { HostedFieldsHandler } from "@paypal/paypal-js";

/**
This `<PayPalHostedFieldsProvider />` provider component wraps the form field elements and accepts props like `createOrder()`.

This provider component is designed to be used with the `<PayPalHostedField />` component.

Warning: If you don't see anything in the screen probably your client is ineligible.
To handle this problem make sure to use the prop `notEligibleError` and pass a component with a custom message.
Take a look to this link if that is the case: https://developer.paypal.com/docs/checkout/advanced/integrate/
*/
export const PayPalHostedFieldsProvider: FC<
  PayPalHostedFieldsComponentProps
> = ({ styles, createOrder, notEligibleError, children, installments }) => {
  const [{ options, loadingStatus }] = useScriptProviderContext();
  const [isEligible, setIsEligible] = useState<boolean>(true);
  const [cardFields, setCardFields] = useState<HostedFieldsHandler>();
  const [, setErrorState] = useState(null);
  const [registeredFields, registerHostedField] = useHostedFieldsRegister();

  useEffect(() => {
    validateHostedFieldChildren(
      Object.keys(registeredFields.current) as PAYPAL_HOSTED_FIELDS_TYPES[],
    );
    // Only render the hosted fields when script is loaded and hostedFields is eligible
    if (!(loadingStatus === SCRIPT_LOADING_STATE.RESOLVED)) {
      return;
    }
    // Get the hosted fields from the [window.paypal.HostedFields] SDK
    const hostedFields = getPayPalWindowNamespace(
      options[SDK_SETTINGS.DATA_NAMESPACE],
    )?.HostedFields;

    if (!hostedFields) {
      throw new Error(
        generateMissingHostedFieldsError({
          components: options.components,
          [SDK_SETTINGS.DATA_NAMESPACE]: options[SDK_SETTINGS.DATA_NAMESPACE],
        }),
      );
    }
    if (!hostedFields.isEligible()) {
      return setIsEligible(false);
    }
    let isSubscribed = true;
    let cardFieldsInstance: HostedFieldsHandler | undefined;

    const teardown = async () => {
      try {
        await cardFieldsInstance?.teardown();
      } catch {
        // Ignore errors when closing an obsolete or unmounted instance.
      }
    };

    hostedFields
      .render({
        // Call your server to set up the transaction
        createOrder: createOrder,
        fields: registeredFields.current,
        installments,
        styles,
      })
      .then((instance) => {
        cardFieldsInstance = instance;
        if (isSubscribed) {
          setCardFields(instance);
        } else {
          return teardown();
        }
      })
      .catch((err) => {
        if (!isSubscribed) {
          return;
        }
        setErrorState(() => {
          throw new Error(
            `Failed to render <PayPalHostedFieldsProvider /> component. ${err}`,
          );
        });
      });

    return () => {
      isSubscribed = false;
      teardown();
      setCardFields(undefined);
    };
  }, [loadingStatus, styles]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {isEligible ? (
        <PayPalHostedFieldsContext.Provider
          value={{
            cardFields: cardFields,
            registerHostedField,
          }}
        >
          {children}
        </PayPalHostedFieldsContext.Provider>
      ) : (
        notEligibleError
      )}
    </div>
  );
};
