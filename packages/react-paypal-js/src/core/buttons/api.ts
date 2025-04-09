import { PayPalButtonsComponent } from "@paypal/paypal-js";
import { ComponentType } from "react";

import { PayPalButtonsComponentProps } from "../../types";

interface Options {
    handleUpdate?: (options: Options) => void;
    instance?: PayPalButtonsComponent & {
        hasReturned: () => boolean;
        resume: () => void;
    };
}

interface IButtonsAPI {
    Buttons: ComponentType<ButtonsComponentProps>;
    isEligible?: PayPalButtonsComponent["isEligible"];
    hasReturned?: () => boolean;
    resume?: () => void;
}

export interface ButtonsComponentProps {
    disabled?: boolean;
    className?: string;
}

export class ButtonsAPI implements IButtonsAPI {
    Buttons: React.ComponentType<PayPalButtonsComponentProps> = () => null;
    options: Options;

    constructor(options: Options) {
        this.options = options;
    }

    get isEligible(): PayPalButtonsComponent["isEligible"] {
        return this.options.instance?.isEligible ?? (() => false);
    }

    get hasReturned(): PayPalButtonsComponent["hasReturned"] {
        return this.options.instance?.hasReturned ?? (() => false);
    }

    get resume(): PayPalButtonsComponent["resume"] {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return this.options.instance?.resume ?? (() => {});
    }

    _update(options: Partial<Options>): void {
        this.options = { ...this.options, ...options };
        this.options.handleUpdate?.(this.options);
    }
}
