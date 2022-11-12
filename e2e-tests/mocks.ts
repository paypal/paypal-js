export function successfulSDKResponseMock() {
    return `
    window.paypal = {};
    window.paypal.Buttons = () => { return  { render: () => {} }};
    document.currentScript.setAttribute("data-uid-auto", 12345);
    `.trim();
}

export function validationErrorSDKResponseMock() {
    return `
    throw new Error("SDK Validation error: 'Expected client-id to be passed'" );

    /* Original Error:

    Expected client-id to be passed (debug id: 0808a38319a91)

    */`.trim();
}
