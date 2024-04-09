import { createContext } from "react";
import {
    PayPalCardFieldsComponent,
    PayPalCardFieldsIndividualField,
} from "@paypal/paypal-js/types/components/card-fields";
import { ignore } from "./utils";

export type PayPalCardFieldsContextType = {
    cardFields: React.MutableRefObject<PayPalCardFieldsComponent | null>;
    nameField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    nameContainer: React.MutableRefObject<HTMLDivElement | null>;
    numberField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    numberContainer: React.MutableRefObject<HTMLDivElement | null>;
    expiryField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    expiryContainer: React.MutableRefObject<HTMLDivElement | null>;
    cvvField: React.MutableRefObject<PayPalCardFieldsIndividualField | null>;
    cvvContainer: React.MutableRefObject<HTMLDivElement | null>;
};

export const PayPalCardFieldsContext =
    createContext<PayPalCardFieldsContextType>({
        cardFields: { current: null },
        nameField: { current: null },
        nameContainer: { current: null },
        numberField: { current: null },
        numberContainer: { current: null },
        cvvField: { current: null },
        cvvContainer: { current: null },
        expiryField: { current: null },
        expiryContainer: { current: null },
    });

export type FieldComponentName =
    | "PayPalCVVField"
    | "PayPalExpiryField"
    | "PayPalNumberField"
    | "PayPalNameField";

export type PayPalCardFieldsRenderStateContextType = {
    registeredFields: React.MutableRefObject<Set<FieldComponentName>>;
    registerField: (field: FieldComponentName) => void;
    unregisterField: (field: FieldComponentName) => void;
};

export const PayPalCardFieldsRenderStateContext =
    createContext<PayPalCardFieldsRenderStateContextType>({
        registeredFields: { current: new Set() },
        registerField: ignore, // implementation is inside provider
        unregisterField: ignore, // implementation is inside provider
    });
