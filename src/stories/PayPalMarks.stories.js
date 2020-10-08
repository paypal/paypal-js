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
Default.parameters = {
    docs: {
        source: {
            code: "<PayPalMarks />",
        },
    },
};

export const StandAlone = Template.bind({});
StandAlone.args = { fundingSource: FUNDING.PAYPAL };
StandAlone.parameters = {
    docs: {
        source: {
            code: "<PayPalMarks fundingSource={FUNDING.PAYPAL} />",
        },
    },
};

function RadioButtonTemplate(args) {
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
                    <PayPalMarks {...args} />
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
                        value={FUNDING.PAYLATER}
                    />
                    <PayPalMarks fundingSource={FUNDING.PAYLATER} />
                </label>
            </form>
            <PayPalButtons fundingSource={fundingSource} />
        </PayPalScriptProvider>
    );
}

export const RadioButtons = RadioButtonTemplate.bind({});
RadioButtons.args = { fundingSource: FUNDING.PAYPAL };
