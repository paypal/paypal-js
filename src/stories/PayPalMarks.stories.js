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

    function onChange(event) {
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
                {args.fundingSources.map((source, index) => (
                    <label className="mark" key={index}>
                        <input
                            defaultChecked={index === 0}
                            onChange={onChange}
                            type="radio"
                            name="fundingSource"
                            value={source}
                        />
                        <PayPalMarks fundingSource={source} />
                    </label>
                ))}
            </form>
            <br />
            <PayPalButtons fundingSource={fundingSource} />
        </PayPalScriptProvider>
    );
}

export const RadioButtons = RadioButtonTemplate.bind({});
RadioButtons.args = {
    fundingSources: [FUNDING.PAYPAL, FUNDING.CARD, FUNDING.PAYLATER],
};
