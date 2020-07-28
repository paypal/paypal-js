import { insertScriptElement, objectToQueryString, processOptions } from './utils';

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
    test('returns dataAttributes, scriptAttributes, and queryString', () => {
        const options = {
            'client-id': 'sb',
            currency: 'USD',
            defer: false,
            'data-order-id': '12345',
            'some-random-key': 'some-random-value'
        };

        const { queryString, dataAttributes, scriptAttributes } = processOptions(options);

        expect(queryString).toBe('client-id=sb&currency=USD&some-random-key=some-random-value');
        expect(dataAttributes).toEqual({ 'data-order-id': '12345' });
        expect(scriptAttributes).toEqual({ defer: false });
    });
    test('when no options are passed in it returns empty dataAttributes, scriptAttributes, and queryString', () => {
        const { queryString, dataAttributes, scriptAttributes } = processOptions();

        expect(queryString).toBe('');
        expect(dataAttributes).toEqual({});
        expect(scriptAttributes).toEqual({});
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

        let currentSrc;

        Object.defineProperty(global.HTMLScriptElement.prototype, 'src', {
            set(src) {
                currentSrc = src;
                if (src === loadFailureSrcKey) {
                    setTimeout(() => this.onerror(new Error('error message')));
                } else if (this.onload) {
                    setTimeout(() => this.onload());
                }
            },
            get() {
                return currentSrc;
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
        expect(scriptFromDOM.defer).toBe(true);
        expect(scriptFromDOM.getAttribute('data-order-id')).toBe('12345');
    });

    test('sets the defer property to false', () => {
        const url = 'https://www.paypal.com/sdk/js';
        insertScriptElement({
            url,
            scriptAttributes: { defer: false }
        });

        const scriptFromDOM = document.querySelector('head script');
        expect(scriptFromDOM.src).toBe(url);
        expect(scriptFromDOM.defer).toBe(false);
    });

    test("onload() event", () => {
        expect.assertions(1);
        const onloadMock = jest.fn();

        const url = 'https://www.paypal.com/sdk/js';
        insertScriptElement({
            url,
            callback: onloadMock
        });

        jest.runAllTimers();
        expect(onloadMock).toBeCalled();
    });

    test("onerror() event", () => {
        expect.assertions(1);

        const url = loadFailureSrcKey;
        insertScriptElement({ url });
        try {
            jest.runAllTimers();
        } catch(e) {
            expect(e.message).toBe(`The script "${url}" didn't load correctly.`);
        }
    });
});
