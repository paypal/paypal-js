import { findScript, insertScriptElement, objectToQueryString, processOptions } from './utils';

jest.useFakeTimers();

describe('objectToQueryString()', () => {
    test('coverts an object to a query string', () => {
        const params = {
            'client-id': 'sb',
            currency: 'USD'
        };

        expect(objectToQueryString(params)).toBe('client-id=sb&currency=USD');
    });
});

describe('processOptions()', () => {
    test('returns dataAttributes and queryString', () => {
        const options = {
            'client-id': 'sb',
            currency: 'USD',
            'data-order-id': '12345',
            'some-random-key': 'some-random-value'
        };

        const { queryString, dataAttributes } = processOptions(options);

        expect(queryString).toBe('client-id=sb&currency=USD&some-random-key=some-random-value');
        expect(dataAttributes).toEqual({ 'data-order-id': '12345' });
    });
    test('when no options are passed in it returns empty dataAttributes and queryString', () => {
        const { queryString, dataAttributes } = processOptions();

        expect(queryString).toBe('');
        expect(dataAttributes).toEqual({});
    });
});

describe('findScript()', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
    });

    test('finds the existing script in the DOM', () => {
        const url = 'https://www.paypal.com/sdk/js?client-id=sb';
        document.head.innerHTML = `<script src="${url}"></script>`;

        const result = findScript(url);
        expect(result.src).toBe(url);
    });

    test('returns null when the script is not found', () => {
        expect(findScript('https://www.paypal.com/sdk/js?client-id=sb')).toBe(null);
    });
});

describe('insertScriptElement()', () => {
    const loadFailureSrcKey = 'error';
    let originalHTMLScriptElementSrcPrototype;

    beforeEach(() => {
        document.head.innerHTML = '';

        // JSDOM does not implement behavior for script loading so we need to mock it
        originalHTMLScriptElementSrcPrototype = Object.getOwnPropertyDescriptor(
            global.HTMLScriptElement.prototype,
            'src'
        );

        // let currentSrc;

        Object.defineProperty(global.HTMLScriptElement.prototype, 'src', {
            set(src) {
                this.currentSrc = src;
                if (src === loadFailureSrcKey) {
                    setTimeout(() => this.onerror());
                } else if (this.onload) {
                    setTimeout(() => this.onload());
                }
            },
            get() {
                return this.currentSrc;
            }
        });

    });

    afterEach(() => {
        Object.defineProperty(global.HTMLScriptElement.prototype, 'src', originalHTMLScriptElementSrcPrototype);
    });

    test('inserts a <script> with attributes into the DOM', () => {
        const url = 'https://www.paypal.com/sdk/js';
        insertScriptElement({
            url,
            dataAttributes: { 'data-order-id': '12345' }
        });

        const scriptFromDOM = document.querySelector('head script');
        expect(scriptFromDOM.src).toBe(url);
        expect(scriptFromDOM.getAttribute('data-order-id')).toBe('12345');
    });

    test('prepends a <script> to the top of the <head> before any other scripts', () => {
        // simulate having the JS SDK already loaded with currency=USD
        const existingScript = document.createElement('script');
        existingScript.src = 'https://www.paypal.com/sdk/js?client-id=sb&currency=USD';
        document.head.appendChild(existingScript);

        // load the JS SDK with currency=EUR
        const newScriptSrc = 'https://www.paypal.com/sdk/js?client-id=sb&currency=EUR';
        insertScriptElement({ url: newScriptSrc });

        const [firstScript, secondScript] = document.querySelectorAll('head script');

        expect(firstScript.src).toBe(newScriptSrc);
        expect(secondScript.src).toBe(existingScript.src);
    });

    test("onload() event", () => {
        expect.assertions(1);
        const onloadMock = jest.fn();

        const url = 'https://www.paypal.com/sdk/js';
        insertScriptElement({
            url,
            onSuccess: onloadMock
        });

        jest.runAllTimers();
        expect(onloadMock).toBeCalled();
    });

    test("onerror() event", () => {
        expect.assertions(1);
        const onErrorMock = jest.fn();
        const url = loadFailureSrcKey;

        insertScriptElement({ url, onError: onErrorMock });

        jest.runAllTimers();
        expect(onErrorMock).toBeCalled();
    });
});
