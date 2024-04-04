import React, { useEffect, useRef, useState } from "react";

import {
    PayPalCardFieldsIndividualField,
    type PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { usePayPalCardFields } from "./hooks";

export const PayPalCVVField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields } = usePayPalCardFields();
    const [cleanupComplete, setCleanupComplete] = useState(false);
    // const [isFirstRender, setIsFirstRender] = useState(true);
    const cvvContainer = useRef<HTMLDivElement>(null);
    const cvvRef = useRef<PayPalCardFieldsIndividualField | null>(null);
    const ignore = useRef(false);

    useEffect(() => {
        console.log("RUNNING USE EFFECT");

        function instantiate() {
            if (!cardFields) {
                return;
            }

            console.log({ ignore: ignore.current });

            if (cvvContainer.current && !ignore.current) {
                cvvRef.current = cardFields?.CVVField(options) ?? null;
                cvvRef.current?.render(cvvContainer.current);
            }
        }
        instantiate();

        return () => {
            console.log("cleanup started");
            if (ignore.current === true) {
                console.log("return early");
                ignore.current = false;
                return;
            }
            ignore.current = true;

            console.log("close started");
            cvvRef.current
                ?.close()
                .then(() => {
                    setCleanupComplete(true);
                    console.log("clean up ignore before: ", ignore.current);
                })
                // .then(() => {
                //     ignore.current = false;
                //     console.log("clean up ignore after: ", ignore.current);
                // })
                .catch((err) => {
                    return console.log("inside catch", err);
                });
        };
    }, [cleanupComplete]); // eslint-disable-line react-hooks/exhaustive-deps

    // if (cvvContainer.current && isFirstRender) {
    //     cvvRef.current.render(cvvContainer.current);
    // }

    // if (!cleanupComplete) {
    //     return null;
    // }

    return <div ref={cvvContainer} />;
};
