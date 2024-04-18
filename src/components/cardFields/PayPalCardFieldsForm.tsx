import React from "react";

import { PayPalCardFieldsFormOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";
import { FlexContainer } from "../ui/FlexContainer";
import { FullWidthContainer } from "../ui/FullWidthContainer";

export const PayPalCardFieldsForm: React.FC<PayPalCardFieldsFormOptions> = ({
    className,
    ...options
}) => {
    return (
        <div className={className}>
            <PayPalCardField fieldName="NameField" {...options} />
            <PayPalCardField fieldName="NumberField" {...options} />
            <FlexContainer>
                <FullWidthContainer>
                    <PayPalCardField fieldName="ExpiryField" {...options} />
                </FullWidthContainer>
                <FullWidthContainer>
                    <PayPalCardField fieldName="CVVField" {...options} />
                </FullWidthContainer>
            </FlexContainer>
        </div>
    );
};
