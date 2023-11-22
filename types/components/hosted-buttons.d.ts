export interface PayPalHostedButtonsComponentOptions {
    hostedButtonId: string;
}

export interface PayPalHostedButtonsComponent {
    render: (container: HTMLElement | string) => Promise<void>;
}
