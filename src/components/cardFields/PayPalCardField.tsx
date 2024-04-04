import React, { useEffect, useRef, useState } from "react";

import {
    PayPalCardFieldsIndividualField,
    PayPalCardFieldsRef,
    type PayPalCardFieldsIndividualFieldOptions,
} from "../../types";
import { usePayPalCardFields } from "./hooks";

type func = keyof PayPalCardFieldsIndividualFieldOptions;

// type PayPalCardFieldProps = PayPalCardFieldsIndividualFieldOptions & {
//     [key: func]: () => void;
// };

export const PayPalCardField: React.FC<
    PayPalCardFieldsIndividualFieldOptions
> = (options) => {
    const { cardFields } = usePayPalCardFields();
    const [cleanupComplete, setCleanupComplete] = useState(false);
    const fieldContainerRef = useRef<HTMLDivElement>(null);
    const individualFieldRef = useRef<PayPalCardFieldsIndividualField | null>(
        null
    );

    useEffect(() => {
        if (!cardFields) {
            return;
        }

        individualFieldRef.current = cardFields.CVVField(options);

        if (fieldContainerRef.current) {
            individualFieldRef.current.render(fieldContainerRef.current);
        }

        return () => {
            individualFieldRef.current?.close().then(() => {
                setCleanupComplete(true);
            });
        };
    }, [cleanupComplete]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!cleanupComplete) {
        return null;
    }
    return <div ref={fieldContainerRef} />;
};
