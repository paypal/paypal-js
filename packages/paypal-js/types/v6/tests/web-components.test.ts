import type {
  ApplePayButtonElement,
  PayPalBasicCardButtonElement,
  PayPalButtonElement,
  PayPalCreditButtonElement,
  PayPalMessageElement,
  PayPalPayLaterButtonElement,
} from "../index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function main() {
  const paypalButton = document.createElement("paypal-button");
  paypalButton.type = "checkout";
  paypalButton.disabled = true;
  paypalButton.onError = (error) => {
    console.error(error.code);
  };
  const typedPayPalButton: PayPalButtonElement = paypalButton;

  const venmoButton = document.querySelector("venmo-button");
  venmoButton?.addEventListener("click", () => {});
  const typedVenmoButton: PayPalButtonElement | null = venmoButton;

  const payLaterButton = document.createElement("paypal-pay-later-button");
  payLaterButton.countryCode = "US";
  payLaterButton.productCode = "PAY_LATER_SHORT_TERM";
  const typedPayLaterButton: PayPalPayLaterButtonElement = payLaterButton;

  const creditButton = document.createElement("paypal-credit-button");
  creditButton.countryCode = "US";
  const typedCreditButton: PayPalCreditButtonElement = creditButton;

  const basicCardButton = document.createElement("paypal-basic-card-button");
  basicCardButton.buyerCountry = "US";
  const typedBasicCardButton: PayPalBasicCardButtonElement = basicCardButton;

  const message = document.createElement("paypal-message");
  message.amount = "10.00";
  message["currency-code"] = "USD";
  message["logo-position"] = "INLINE";
  message.setContent?.({ amount: "10.00" });
  const typedMessage: PayPalMessageElement = message;

  const applePayButton = document.createElement("apple-pay-button");
  applePayButton.buttonstyle = "black";
  applePayButton.locale = "en-US";
  const typedApplePayButton: ApplePayButtonElement = applePayButton;

  console.log({
    typedPayPalButton,
    typedVenmoButton,
    typedPayLaterButton,
    typedCreditButton,
    typedBasicCardButton,
    typedMessage,
    typedApplePayButton,
  });
}
