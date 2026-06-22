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
  // createElement returns the typed element via HTMLElementTagNameMap.
  const paypalButton = document.createElement("paypal-button");
  paypalButton.type = "checkout";
  paypalButton.disabled = true;
  const typedPayPalButton: PayPalButtonElement = paypalButton;

  // Venmo button reuses PayPalButtonElement.
  const venmoButton = document.querySelector("venmo-button");
  const typedVenmoButton: PayPalButtonElement | null = venmoButton;

  const payLaterButton = document.createElement("paypal-pay-later-button");
  payLaterButton.countryCode = "US";
  payLaterButton.productCode = "PAY_LATER_SHORT_TERM";
  const typedPayLaterButton: PayPalPayLaterButtonElement = payLaterButton;

  const creditButton = document.createElement("paypal-credit-button");
  creditButton.countryCode = "GB";
  const typedCreditButton: PayPalCreditButtonElement = creditButton;

  const basicCardButton = document.createElement("paypal-basic-card-button");
  basicCardButton.buyerCountry = "US";
  basicCardButton.disabled = false;
  const typedBasicCardButton: PayPalBasicCardButtonElement = basicCardButton;

  // The container has no PayPal-specific properties; typed as HTMLElement.
  const basicCardContainer = document.createElement(
    "paypal-basic-card-container",
  );
  basicCardContainer.id = "card-container";

  const message = document.createElement("paypal-message");
  message.amount = "100.00";
  message.currencyCode = "USD";
  message.logoPosition = "INLINE";
  message.logoType = "MONOGRAM";
  message.autoBootstrap = true;
  const typedMessage: PayPalMessageElement = message;

  // <apple-pay-button> is defined by Apple's Apple Pay JS SDK. The canonical
  // pattern is setAttribute (per the SDK's integration docs), but the element
  // is still typed so querySelector returns a known shape.
  const applePayButton = document.createElement("apple-pay-button");
  applePayButton.setAttribute("buttonstyle", "black");
  applePayButton.setAttribute("type", "buy");
  applePayButton.setAttribute("locale", "en");
  const typedApplePayButton: ApplePayButtonElement = applePayButton;

  console.log({
    typedPayPalButton,
    typedVenmoButton,
    typedPayLaterButton,
    typedCreditButton,
    typedBasicCardButton,
    basicCardContainer,
    typedMessage,
    typedApplePayButton,
  });
}
