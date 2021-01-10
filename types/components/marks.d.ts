export interface PayPalMarksComponentProps {
    fundingSource?: string;
}

export interface PayPalMarksComponent {
    isEligible: () => boolean;
    render: (container: HTMLElement | string) => Promise<void>;
}
