import React, { useEffect, useRef } from "react";

import {
    PayPalCardFieldsIndividualField,
    type PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { closeField } from "./utils";
import { usePayPalCardFields } from "./hooks";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields } = usePayPalCardFields();
    const cvvContainer = useRef<HTMLDivElement>(null);
    const cvvRef = useRef<PayPalCardFieldsIndividualField | null>(null);
    useEffect(() => {
        if (!cardFields) {
            return;
        }

        cvvRef.current = cardFields.CVVField(options);

        if (cvvContainer.current) {
            console.log("rendering...");
            cvvRef.current.render(cvvContainer.current);
        }

        console.log({ "cvvRef.current": cvvRef.current });

        // const parentElement = document.getElementById("card-cvv-field");
        // console.log({ parentElement, children: parentElement?.children });

        // const children = parentElement?.children;

        // if (!parentElement?.hasChildNodes()) {
        //     console.log("element already closed");
        //     return;
        // }

        return () => closeField(cvvRef.current, "card-cvv-field");
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        console.log({
            children_nodes: cvvContainer.current?.children,
        });
    }, [cvvContainer.current?.children]);

    return <div ref={cvvContainer} id="card-cvv-field" />;
};
