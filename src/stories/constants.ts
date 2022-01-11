import { FUNDING, CURRENCY } from "@paypal/sdk-constants/dist/module";

export const COMPONENT_PROPS_CATEGORY = { table: { category: "Props" } };
export const COMPONENT_EVENTS = "Events";
export const COMPONENT_TYPES = "Types";
export const ORDER_ID = "orderID";
export const ERROR = "Error";
export const SDK = "SDK";
export const APPROVE = "approve";
export const SUBSCRIPTION = "subscription";
export const ORDER_INSTANCE_ERROR = "No order instance was provided";

export const CONTAINER_SIZE = {
    name: "container width",
    description:
        "This is not a property from PayPalButtons. It is custom control to change the size of the PayPal buttons container in pixels.",
    control: { type: "range", min: 200, max: 750, step: 5 },
    table: {
        defaultValue: {
            summary: "750px",
        },
        category: "Custom",
        type: { summary: "number" },
    },
};

export const ARG_TYPE_AMOUNT = {
    description:
        "This is not a property from PayPalButtons. It is custom control for testing the amount sent in the createOrder process",
    options: ["2", "30", "100"],
    control: {
        type: "select",
    },
    table: {
        defaultValue: {
            summary: "2.00",
        },
        category: "Custom",
        type: { summary: "number|string" },
    },
};

export const ARG_TYPE_CURRENCY = {
    options: Object.values(CURRENCY),
    description:
        "This is not a property from PayPalButtons. It is custom control to change the currency create create a PayPal order.",
    control: {
        type: "select",
    },
    table: {
        category: "Custom",
        type: { summary: "string" },
        defaultValue: { summary: "USD" },
    },
};

export const FUNDING_SOURCE_ARG = {
    options: [...Object.values(FUNDING), undefined],
    control: {
        type: "select",
        labels: {
            undefined: "all",
        },
    },
    ...COMPONENT_PROPS_CATEGORY,
};

export const SANDPACK_STYLES = `body {
    font-family: sans-serif;
    -webkit-font-smoothing: auto;
    -moz-font-smoothing: auto;
    -moz-osx-font-smoothing: grayscale;
    font-smoothing: auto;
    text-rendering: optimizeLegibility;
    font-smooth: always;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
}

.card-field {
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    margin-top: 6px;
    margin-bottom: 16px;
    resize: vertical;
    height: 40px;
    background: white;
    font-size: 17px;
    color: #3a3a3a;
    font-family: helvetica, tahoma, calibri, sans-serif;
}

.btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    cursor: pointer;
}

.btn-primary {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
}

.mark {
    display: flex;
    align-items: center;
}
.spinner {
    display: inline-block;
    height: 40px;
    width: 40px;
    box-sizing: border-box;
    border: 3px solid rgba(0, 0, 0, 0.2);
    border-top-color: rgba(33, 128, 192, 0.8);
    border-radius: 100%;
    animation: rotation 0.7s infinite linear;
}

.spinner.tiny {
    height: 20px;
    width: 20px;
    border-top-color: #007bff;
    position: relative;
    top: 3px;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(359deg);
    }
}`;
