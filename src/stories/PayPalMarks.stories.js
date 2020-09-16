import React, { useState } from "react";
import { PayPalScriptProvider, PayPalMarks, PayPalButtons } from "../index";

export default {
    title: "Example/PayPalMarks",
    component: PayPalMarks,
};

function Template(args) {
    return (
        <PayPalScriptProvider
            options={{ "client-id": "sb", components: "marks" }}
        >
            <PayPalMarks {...args} />
        </PayPalScriptProvider>
    );
}

export const Default = Template.bind({});
Default.args = {};

export const StandAlone = Template.bind({});
StandAlone.args = { fundingSource: "paypal" };

function RadioButtonTemplate() {
    const [fundingSource, setFundingSource] = useState("paypal");

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
                        value="paypal"
                        defaultChecked
                    />
                    <PayPalMarks fundingSource="paypal" />
                </label>

                <label className="mark">
                    <input
                        onClick={onClick}
                        type="radio"
                        name="fundingSource"
                        value="card"
                    />
                    <PayPalMarks fundingSource="card" />
                </label>

                <label className="mark">
                    <input
                        onClick={onClick}
                        type="radio"
                        name="fundingSource"
                        value="credit"
                    />
                    <PayPalMarks fundingSource="credit" />
                </label>
            </form>
            <PayPalButtons fundingSource={fundingSource} />
        </PayPalScriptProvider>
    );
}

export const RadioButtons = RadioButtonTemplate.bind({});
RadioButtons.args = {};
