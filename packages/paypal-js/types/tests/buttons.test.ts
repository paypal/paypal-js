import { loadScript } from "../../src/index";
import type { PayPalNamespace } from "../index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
  let paypal: PayPalNamespace | null;

  try {
    paypal = await loadScript({
      clientId: "test",
      components: "buttons",
    });
  } catch (err) {
    throw new Error(`Failed to load the paypal sdk script: ${err}`);
  }

  if (!paypal?.Buttons) {
    throw new Error("Invalid paypal object for buttons component");
  }

  paypal.Buttons().render("#container");
  paypal.Buttons().render(document.createElement("div"));

  // server-side integration
  // https://developer.paypal.com/demo/checkout/#/pattern/server
  paypal
    .Buttons({
      createOrder: () => {
        return fetch("/your/api/order/create/", {
          method: "post",
        })
          .then((res) => res.json())
          .then((orderData) => orderData.id);
      },

      onApprove: (data, actions) => {
        return fetch(`/your/api/order/${data.orderID}/capture/`, {
          method: "post",
        })
          .then((res) => res.json())
          .then((orderData) => {
            const errorDetail =
              Array.isArray(orderData.details) && orderData.details[0];

            if (errorDetail && errorDetail.issue === "INSTRUMENT_DECLINED") {
              return actions.restart();
            }

            if (errorDetail) {
              const msg = "Sorry, your transaction could not be processed.";
              return alert(msg);
            }

            const transaction =
              orderData.purchase_units[0].payments.captures[0];
            alert(
              `Transaction ${transaction.status}: ${transaction.id} \n\nSee console for all available details`
            );
          });
      },
    })
    .render("#paypal-button-container");

  // createSubscription
  paypal.Buttons({
    style: { label: "subscribe" },
    createSubscription: (data, actions) => {
      return actions.subscription.create({
        plan_id: "P-3RX123456M3469222L5IFM4I",
      });
    },
  });

  // validation with onInit and onClick
  // https://developer.paypal.com/docs/checkout/standard/customize/validate-user-input/
  paypal.Buttons({
    onInit: (data, actions) => {
      actions.disable();
      document.querySelector("#check")?.addEventListener("change", (event) => {
        if ((event.target as HTMLInputElement).checked) {
          actions.enable();
        } else {
          actions.disable();
        }
      });
    },
    onClick: () => {
      if (!document.querySelector<HTMLInputElement>("#check")?.checked) {
        document.querySelector("#error")?.classList.remove("hidden");
      }
    },
  });

  paypal
    .Buttons({
      onClick: (data, actions) => {
        return fetch("/my-api/validate", {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.validationError) {
              document.querySelector("#error")?.classList.remove("hidden");
              return actions.reject();
            } else {
              return actions.resolve();
            }
          });
      },
    })
    .render("#paypal-button-container");

  // standalone button integration
  // https://developer.paypal.com/docs/checkout/standard/customize/standalone-buttons/#link-renderastandalonebutton
  paypal.getFundingSources?.().forEach((fundingSource) => {
    if (!paypal?.Buttons) {
      return;
    }
    const button = paypal.Buttons({
      fundingSource: fundingSource,
    });

    if (button.isEligible()) {
      button.render("#paypal-button-container");
    }
  });

  // funding eligibility
  // https://developer.paypal.com/sdk/js/reference/#link-fundingeligibility
  if (paypal.FUNDING) {
    paypal.rememberFunding?.([paypal.FUNDING.VENMO]);
    paypal.isFundingEligible?.(paypal.FUNDING.VENMO);
  }
}
