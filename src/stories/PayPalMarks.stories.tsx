import React, {
    useState,
    FunctionComponent,
    ReactElement,
    ChangeEvent,
} from "react";
import type { PayPalScriptOptions } from "@paypal/paypal-js/types/script-options";

import {
    PayPalScriptProvider,
    PayPalMarks,
    PayPalButtons,
    FUNDING,
} from "../index";
import { getOptionsFromQueryString } from "./utils";

const scriptProviderOptions: PayPalScriptOptions = {
    "client-id": "test",
    components: "buttons,marks,funding-eligibility",
    ...getOptionsFromQueryString(),
};

export default {
    title: "Example/PayPalMarks",
    component: PayPalMarks,
    decorators: [
        (Story: FunctionComponent): ReactElement => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Default: FunctionComponent = () => <PayPalMarks />;

export const StandAlone: FunctionComponent = () => (
    <PayPalMarks fundingSource={FUNDING.PAYPAL} />
);

export const RadioButtons: FunctionComponent = () => {
    const fundingSources = [FUNDING.PAYPAL, FUNDING.CARD, FUNDING.PAYLATER];

    const [selectedFundingSource, setSelectedFundingSource] = useState(
        fundingSources[0]
    );

    function onChange(event: ChangeEvent<HTMLInputElement>) {
        setSelectedFundingSource(event.target.value);
    }

    return (
        <>
            <form>
                {fundingSources.map((fundingSource) => (
                    <label className="mark" key={fundingSource}>
                        <input
                            defaultChecked={
                                fundingSource === selectedFundingSource
                            }
                            onChange={onChange}
                            type="radio"
                            name="fundingSource"
                            value={fundingSource}
                        />
                        <PayPalMarks fundingSource={fundingSource} />
                    </label>
                ))}
            </form>
            <br />
            <PayPalButtons
                fundingSource={selectedFundingSource}
                style={{ color: "white" }}
            />
        </>
    );
};
