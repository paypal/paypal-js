/**
 * V6-specific constants for Storybook stories
 */

export const V6_CLIENT_ID = "test";

export const V6_ENVIRONMENT = "sandbox";

// Event action names for Storybook actions addon
export const V6_EVENTS = {
    ON_INIT: "v6:onInit",
    ON_CLICK: "v6:onClick",
    ON_APPROVE: "v6:onApprove",
    ON_ERROR: "v6:onError",
    ON_CANCEL: "v6:onCancel",
    ORDER_CREATED: "v6:orderCreated",
} as const;

// Storybook control configurations
export const V6_CONTAINER_SIZE = {
    description: "Container width for the button",
    control: { type: "number", min: 300, max: 1000, step: 50 },
    table: {
        defaultValue: { summary: "750" },
        category: "Layout",
        type: { summary: "number" },
    },
};

export const V6_COMPONENT_PROPS_CATEGORY = {
    table: {
        category: "Component Props",
    },
};

export const V6_COMPONENT_EVENTS = "Component Events";

// Placeholder order IDs for testing
export const MOCK_ORDER_ID = "ORDER_123456789";
export const MOCK_SUBSCRIPTION_ID = "SUB_123456789";
