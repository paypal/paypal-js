import React from "react";
import { render } from "@testing-library/react";

import type { PayPalBasicCardButtonProps } from "./sdkWebComponents";

/**
 * `<paypal-basic-card-button>` buyer country.
 *
 * The element's observed attribute is the kebab-case `buyer-country`. A camelCase `buyerCountry`
 * JSX prop is lowercased to `buyercountry` on React <19 and never reaches the element, so the JSX
 * type exposes the `buyer-country` attribute (typed as a string).
 */
describe("<paypal-basic-card-button> buyer-country", () => {
  it("types buyer-country as a string prop and forwards it to the element", () => {
    // Compile-time: the props expose `buyer-country` (typed `string`). Renaming/removing it
    // from PayPalBasicCardButtonProps fails `tsc --noEmit`.
    const buyerCountry: PayPalBasicCardButtonProps["buyer-country"] = "US";

    const { container } = render(
      <paypal-basic-card-button buyer-country={buyerCountry} />,
    );

    const el = container.querySelector("paypal-basic-card-button");
    expect(el).not.toBeNull();
    expect(el?.getAttribute("buyer-country")).toBe("US");
  });
});
