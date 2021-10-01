import { useContext } from "react";

import { PayPalHostedFieldsContext } from "../context/payPalHostedFieldsContext";
import type { HostedFieldsHandler } from "@paypal/paypal-js/types/components/hosted-fields";

/**
 * Custom hook to get access to the PayPal Hosted Fields instance.
 * The instance represent the returned object after the render process
 * With this object a user can submit the fields and dynamically modify the cards
 *
 * @returns the hosted fields instance if is available in the component
 */
export function usePayPalHostedFields(): HostedFieldsHandler | null {
    return useContext(PayPalHostedFieldsContext);
}
