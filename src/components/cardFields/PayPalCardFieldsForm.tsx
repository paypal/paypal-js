import React from "react";

import { PayPalCardFieldsFormOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";
import { FlexContainer } from "../ui/FlexContainer";
import { FullWidthContainer } from "../ui/FullWidthContainer";

export const PayPalCardFieldsForm: React.FC<PayPalCardFieldsFormOptions> = ({
    className,
}) => {
    return (
        <div className={className}>
            <PayPalCardField fieldName="NameField" />
            <PayPalCardField fieldName="NumberField" />
            <FlexContainer>
                <FullWidthContainer>
                    <PayPalCardField fieldName="ExpiryField" />
                </FullWidthContainer>
                <FullWidthContainer>
                    <PayPalCardField fieldName="CVVField" />
                </FullWidthContainer>
            </FlexContainer>
        </div>
    );
};
