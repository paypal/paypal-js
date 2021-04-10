export interface PayPalMessagesComponentOptions {
    account?: string;
    amount?: number | string;
    style?: {
        layout?: "text" | "flex" | "custom";
        color?: string;
    };
}

export interface PayPalMessagesComponent {
    render: (container: HTMLElement | string) => Promise<void>;
}
