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
    test('returns dataAttributes and url', () => {
        const options = {
            'client-id': 'sb',
            currency: 'USD',
            'data-order-id': '12345',
            'some-random-key': 'some-random-value'
        };

        const { url, dataAttributes } = processOptions(options);

        expect(url).toBe('https://www.paypal.com/sdk/js?client-id=sb&currency=USD&some-random-key=some-random-value');
        expect(dataAttributes).toEqual({ 'data-order-id': '12345' });
    });

    test('sets a custom base url', () => {
        const { url } = processOptions({ 'client-id': 'sb', sdkBaseURL: 'http://localhost.paypal.com:8000/sdk/js' });

        expect(url).toBe('http://localhost.paypal.com:8000/sdk/js?client-id=sb');
    });

    test('default values when only client-id is passed in', () => {
        const { url, dataAttributes } = processOptions({ 'client-id': 'sb' });

        expect(url).toBe('https://www.paypal.com/sdk/js?client-id=sb');
        expect(dataAttributes).toEqual({});
    });
});

describe('findScript()', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
    });

    test('finds the existing script in the DOM', () => {
        const url = 'https://www.paypal.com/sdk/js?client-id=sb';
        document.head.innerHTML = `<script src="${url}" data-order-id="123" data-page-type="checkout"></script>`;

        const result = findScript(url, { 'data-page-type': 'checkout', 'data-order-id': '123' });
        if (!result) throw new Error('Expected to find <script> element');

        expect(result.src).toBe(url);
    });

    test('returns null when the script is not found', () => {
        expect(findScript('https://www.paypal.com/sdk/js?client-id=sb')).toBeNull();
    });

    test('returns null when the script is found but the number of data attributes do not match', () => {
        const url = 'https://www.paypal.com/sdk/js?client-id=sb';
        document.head.innerHTML = `<script src="${url}" data-order-id="12345" data-page-type="home"></script>`;

        const result = findScript(url, { 'data-order-id': '12345' });
        expect(result).toBeNull();
    });

    test('returns null when the script is found but the data attribute values do not match', () => {
        const url = 'https://www.paypal.com/sdk/js?client-id=sb';
        document.head.innerHTML = `<script src="${url}" data-page-type="home"></script>`;

        const result = findScript(url, { 'data-page-type': 'checkout' });
        expect(result).toBeNull();
    });
});

describe('insertScriptElement()', () => {
    const url = 'https://www.paypal.com/sdk/js?client-id=sb';

    beforeEach(() => {
        document.head.innerHTML = '';
    });

    test('inserts a <script> with attributes into the DOM', () => {
        insertScriptElement({
            url,
            dataAttributes: { 'data-order-id': '12345' },
            onError: jest.fn(),
            onSuccess: jest.fn()
        });

        const scriptFromDOM = document.querySelector<HTMLScriptElement>('head script');
        if (!scriptFromDOM) throw new Error('Expected to find <script> element');

        expect(scriptFromDOM.src).toBe(url);
        expect(scriptFromDOM.getAttribute('data-order-id')).toBe('12345');
    });

    test('sets a nonce on the script tag when data-csp-nonce is used', () => {
        insertScriptElement({
            url,
            dataAttributes: { 'data-csp-nonce': '12345' },
            onError: jest.fn(),
            onSuccess: jest.fn()
        });

        const scriptFromDOM = document.querySelector<HTMLScriptElement>('head script');
        if (!scriptFromDOM) throw new Error('Expected to find <script> element');

        expect(scriptFromDOM.getAttribute('data-csp-nonce')).toBe('12345');
        expect(scriptFromDOM.getAttribute('nonce')).toBe('12345');
    });

    test('prepends a <script> to the top of the <head> before any other scripts', () => {
        // simulate having the JS SDK already loaded with currency=USD
        const existingScript = document.createElement('script');
        existingScript.src = `${url}&currency=USD`;
        document.head.appendChild(existingScript);

        // load the JS SDK with currency=EUR
        const newScriptSrc = `${url}&currency=EUR`;
        insertScriptElement({
            url: newScriptSrc,
            onError: jest.fn(),
            onSuccess: jest.fn()
        });

        const [firstScript, secondScript] = document.querySelectorAll<HTMLScriptElement>('head script');

        expect(firstScript.src).toBe(newScriptSrc);
        expect(secondScript.src).toBe(existingScript.src);
    });

    describe("callbacks", () => {
        const loadFailureSrcKey = 'http://localhost/error';

        beforeEach(() => {
            const insertBeforeSpy = jest.spyOn(document.head, 'insertBefore');
            interface MockHTMLScriptElement extends Node {
                src: string;
                onerror: () => void;
                onload: () => void;
            }
            insertBeforeSpy.mockImplementation(domNode => {
                const newScript = <MockHTMLScriptElement>domNode;
                if (newScript.src === loadFailureSrcKey) {
                    setTimeout(() => newScript.onerror());
                } else if (newScript.onload) {
                    setTimeout(() => newScript.onload());
                }
                return newScript;
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test("onload() event", () => {
            expect.assertions(1);
            const onloadMock = jest.fn();

            const url = 'https://www.paypal.com/sdk/js';
            insertScriptElement({
                url,
                onError: jest.fn(),
                onSuccess: onloadMock
            });

            jest.runAllTimers();
            expect(onloadMock).toBeCalled();
        });

        test("onerror() event", () => {
            expect.assertions(1);
            const onErrorMock = jest.fn();
            const url = loadFailureSrcKey;

            insertScriptElement({
                url,
                onError: onErrorMock,
                onSuccess: jest.fn()
            });

            jest.runAllTimers();
            expect(onErrorMock).toBeCalled();
        });
    });
});
