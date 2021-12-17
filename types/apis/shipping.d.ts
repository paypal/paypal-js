export type ShippingOptionType = "SHIPPING" | "PICKUP";

export type ShippingAddress = {
    city: string;
    state: string;
    country_code: string;
    postal_code: string;
};

export type SelectedShippingOption = {
    label: string;
    type: ShippingOptionType;
    amount: {
        currency_code: string;
        value: string;
    };
};
