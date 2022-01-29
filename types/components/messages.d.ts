export interface PayPalMessagesComponentOptions {
    account?: string;
    amount?: number | string;
    style?: {
        layout?: "text" | "flex" | "custom";
        color?: string;
        logo?: {
            type?: "primary" | "alternative" | "inline" | "none";
            position?: "left" | "right" | "top";
        };
        text?: {
            color?: "black" | "white" | "monochrome" | "grayscale";
            size?: 10 | 11 | 12 | 13 | 14 | 15 | 16;
            align?: "left" | "center" | "right";
        };
    };
}

export interface PayPalMessagesComponent {
    render: (container: HTMLElement | string) => Promise<void>;
}
