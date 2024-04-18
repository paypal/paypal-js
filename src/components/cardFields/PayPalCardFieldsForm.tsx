import React from "react";

import { PayPalCardFieldsFormOptions } from "../../types";
import { PayPalCardField } from "./PayPalCardField";
import { FlexContainer } from "../ui/FlexContainer";

export const PayPalCardFieldsForm: React.FC<PayPalCardFieldsFormOptions> = ({
    className,
    ...options
}) => {
    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `.w-full { width:100%; }`,
                }}
            />
            <div className={className}>
                <PayPalCardField fieldName="NameField" {...options} />
                <PayPalCardField fieldName="NumberField" {...options} />
                <FlexContainer>
                    <PayPalCardField
                        fieldName="ExpiryField"
                        className="w-full"
                        {...options}
                    />
                    <PayPalCardField
                        fieldName="CVVField"
                        className="w-full"
                        {...options}
                    />
                </FlexContainer>
            </div>
        </>
    );
};
