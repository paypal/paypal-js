import { findScript, insertScriptElement, processOptions } from './utils';

jest.useFakeTimers();

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

describe('processOptions()', () => {
    test('returns a valid attribute object and query string', () => {
        const options = {
            'client-id': 'sb',
            currency: 'USD',
            'data-order-id': '12345',
            'invalid-property-that-should-be-ignored': 'invalid'
        };

        const { attributes, queryString } = processOptions(options);

        expect(attributes).toEqual({ 'data-order-id': '12345' });
        expect(queryString).toBe('client-id=sb&currency=USD');
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
            attributes: { 'data-order-id': '12345' }
        });

        const scriptFromDOM = document.querySelector('head script');
        expect(scriptFromDOM.src).toBe(url);
        expect(scriptFromDOM.getAttribute('data-order-id')).toBe('12345');
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
