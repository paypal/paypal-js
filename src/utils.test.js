import { camelCaseToCabobCase, objectToQueryParams, insertScriptElement } from './utils';

jest.useFakeTimers();

describe('camelCaseToCabobCase()', () => {
    test('coverts camelCase keys to cabob-case', () => {
        const params = {
            clientID: 'client-id',
            merchantID: 'merchant-id'
        };

        Object.keys(params).forEach(key => {
            expect(camelCaseToCabobCase(key)).toBe(params[key]);
        });

    });
});

describe('objectToQueryParams()', () => {
    test('coverts an object to a query parameter string', () => {
        const params = {
            clientID: 'sb',
            currency: 'USD'
        };

        expect(objectToQueryParams(params)).toBe('client-id=sb&currency=USD');

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

    test('inserts a <script> into the DOM', () => {
        const url = 'https://www.paypal.com/sdk/js';
        insertScriptElement(url);

        const scriptFromDOM = document.querySelector('head script');
        expect(scriptFromDOM.src).toBe(url);
    });

    test("onload() event", () => {
        expect.assertions(1);
        const onloadMock = jest.fn();

        const url = 'https://www.paypal.com/sdk/js';
        insertScriptElement(url, onloadMock);

        jest.runAllTimers();
        expect(onloadMock).toBeCalled();
    });

    test("onerror() event", () => {
        expect.assertions(1);

        const url = loadFailureSrcKey;
        insertScriptElement(loadFailureSrcKey);
        try {
            jest.runAllTimers();
        } catch(e) {
            expect(e.message).toBe(`The script "${url}" didn't load correctly.`);
        }
    });
});
