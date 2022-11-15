export function successfulSDKResponseMock() {
    return `
    const button = document.createElement('button');
    button.setAttribute('class', 'loaded');
    button.setAttribute('class', 'paypal-button');
    button.innerHTML = 'PayPal';

    window.paypal = {};
    window.paypal.Buttons = () => {
        return {
            render: (container) => {
                document.querySelector(container).appendChild(button);
            }
        }
    };

    const randomNumber = Math.floor(Math.random()*90000) + 10000;
    document.currentScript.setAttribute("data-uid-auto", randomNumber);
    `.trim();
}

export function validationErrorSDKResponseMock() {
    return `
    throw new Error("SDK Validation error: 'Expected client-id to be passed'" );

    /* Original Error:

    Expected client-id to be passed (debug id: 0808a38319a91)

    */`.trim();
}
