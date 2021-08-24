import { ReactElement } from "react";
import type { PayPalButtonsComponentOptions } from "@paypal/paypal-js/types/components/buttons";

export interface PayPalButtonsComponentProps
    extends PayPalButtonsComponentOptions {
    /**
     * Used to re-render the component.
     * Changes to this prop will destroy the existing Buttons and render them again using the current props.
     */
    forceReRender?: unknown[];
    /**
     * Pass a css class to the div container.
     */
    className?: string;
    /**
     * Disables the buttons.
     */
    disabled?: boolean;
    /**
     * Used to render custom content when ineligible.
     */
    children?: ReactElement | null;
}
