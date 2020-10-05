import React, { useState } from "react";
import {
    PayPalScriptProvider,
    PayPalMarks,
    PayPalButtons,
    FUNDING,
} from "../index";

export default {
    title: "Example/PayPalMarks",
    component: PayPalMarks,
};

function Template(args) {
    return (
        <PayPalScriptProvider
            options={{
                "client-id": "sb",
                components: "buttons,marks,funding-eligibility",
            }}
        >
            <PayPalMarks {...args} />
        </PayPalScriptProvider>
    );
}

export const Default = Template.bind({});
Default.args = {};

export const StandAlone = Template.bind({});
StandAlone.args = { fundingSource: FUNDING.PAYPAL };

function RadioButtonTemplate() {
    const [fundingSource, setFundingSource] = useState(FUNDING.PAYPAL);

    function onClick(event) {
        setFundingSource(event.target.value);
    }

    return (
        <PayPalScriptProvider
            options={{
                "client-id": "sb",
                components: "buttons,marks,funding-eligibility",
            }}
        >
            <form>
                <label className="mark">
                    <input
                        onClick={onClick}
                        type="radio"
                        name="fundingSource"
                        value={FUNDING.PAYPAL}
                        defaultChecked
                    />
                    <PayPalMarks fundingSource="paypal" />
                </label>

                <label className="mark">
                    <input
                        onClick={onClick}
                        type="radio"
                        name="fundingSource"
                        value={FUNDING.CARD}
                    />
                    <PayPalMarks fundingSource={FUNDING.CARD} />
                </label>

                <label className="mark">
                    <input
                        onClick={onClick}
                        type="radio"
                        name="fundingSource"
                        value={FUNDING.CREDIT}
                    />
                    <PayPalMarks fundingSource={FUNDING.CREDIT} />
                </label>
            </form>
            <PayPalButtons fundingSource={fundingSource} />
        </PayPalScriptProvider>
    );
}

export const RadioButtons = RadioButtonTemplate.bind({});
RadioButtons.args = {};
