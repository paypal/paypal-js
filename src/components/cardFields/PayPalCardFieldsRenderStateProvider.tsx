import React, { ReactNode, useRef, useState } from "react";

import { CARD_FIELDS_DUPLICATE_CHILDREN_ERROR } from "../../constants";
import {
    FieldComponentName,
    PayPalCardFieldsRenderStateContext,
} from "./context";

export const PayPalCardFieldsRenderStateProvider = ({
    children,
}: {
    children: ReactNode;
}): JSX.Element => {
    const registeredFields = useRef<Set<FieldComponentName>>(new Set());

    const registerField = (fieldName: FieldComponentName) => {
        console.log("registering ", fieldName, "...");
        if (registeredFields.current.has(fieldName)) {
            throw new Error(CARD_FIELDS_DUPLICATE_CHILDREN_ERROR);
        }
        registeredFields.current.add(fieldName);
        // setRegisteredFields((prevFields) => new Set(prevFields).add(fieldName));
    };

    const unregisterField = (fieldName: FieldComponentName) => {
        // setRegisteredFields((prevFields) => {
        // const newFields = new Set(prevFields);
        console.log("unregistering ", fieldName, "...");

        registeredFields.current.delete(fieldName);
        // return newFields;
        // });
    };

    return (
        <PayPalCardFieldsRenderStateContext.Provider
            value={{
                registeredFields,
                registerField,
                unregisterField,
            }}
        >
            {children}
        </PayPalCardFieldsRenderStateContext.Provider>
    );
};
