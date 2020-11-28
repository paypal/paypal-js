import React, { useState } from "react";
import {
    PayPalScriptProvider,
    PayPalMarks,
    PayPalButtons,
    FUNDING,
} from "../index";

const scriptProviderOptions = {
    "client-id": "sb",
    components: "buttons,marks,funding-eligibility",
};

export default {
    title: "Example/PayPalMarks",
    component: PayPalMarks,
    decorators: [
        (Story) => (
            <PayPalScriptProvider options={scriptProviderOptions}>
                <Story />
            </PayPalScriptProvider>
        ),
    ],
};

export const Default = () => <PayPalMarks />;

export const StandAlone = () => <PayPalMarks fundingSource={FUNDING.PAYPAL} />;

export const RadioButtons = () => {
    const fundingSources = [FUNDING.PAYPAL, FUNDING.CARD, FUNDING.PAYLATER];

    const [selectedFundingSource, setSelectedFundingSource] = useState(
        fundingSources[0]
    );

    function onChange({ target: { value } }) {
        setSelectedFundingSource(value);
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
