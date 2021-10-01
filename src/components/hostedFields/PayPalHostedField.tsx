import React from "react";
import type { FC } from "react";

import type { PayPalHostedFieldProps } from "../../types/payPalHostedFieldTypes";

/**
 * TODO: Complete documentation for further storybook
 * React functional component to create a specific hosted fields
 * Available hosted fields are @enum {PAYPAL_HOSTED_FIELDS_TYPES}
 *
 * @param param0
 * @returns
 */
// @typescript-eslint/no-unused-vars
export const PayPalHostedField: FC<PayPalHostedFieldProps> = ({
    hostedFieldType, // eslint-disable-line @typescript-eslint/no-unused-vars
    options, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...props
}) => <div {...props} />;
