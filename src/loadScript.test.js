import loadScript from './loadScript';
import * as utils from './utils';

describe('loadScript()', () => {
    let PromiseBackup = window.Promise;

    beforeEach(() => {
        document.head.innerHTML = '';

        // eslint-disable-next-line no-import-assign
        utils.insertScriptElement = jest.fn()
            .mockImplementation(({ onSuccess }) => {
                window.paypal = {};
                process.nextTick(() => onSuccess());
            });

        Object.defineProperty(window, 'paypal', {
            writable: true,
            value: undefined
        });

        window.Promise = PromiseBackup;
    });

    afterEach(() => {
        utils.insertScriptElement.mockClear();
    });

    test('should insert <script> and resolve the promise', async () => {
        expect(window.paypal).toBe(undefined);

        const response = await loadScript({ 'client-id': 'sb' });
        expect(utils.insertScriptElement).toHaveBeenCalledTimes(1);
        expect(response).toEqual({});
    });

    test('should not insert <script> when an existing script with the same src is already in the DOM and window.paypal is set', async () => {
        expect(window.paypal).toBe(undefined);

        // simulate the script already being loaded
        document.head.innerHTML = '<script src="https://www.paypal.com/sdk/js?client-id=sb"></script>';
        window.paypal = {};

        const response = await loadScript({ 'client-id': 'sb' });
        expect(utils.insertScriptElement).not.toHaveBeenCalled();
        expect(response).toEqual({});
    });

    test('should only load the <script> once when loadScript() is called twice', async () => {
        expect(window.paypal).toBe(undefined);

        const response = await Promise.all([
            loadScript({ 'client-id': 'sb' }),
            loadScript({ 'client-id': 'sb' })
        ]);

        expect(utils.insertScriptElement).toHaveBeenCalledTimes(1);
        expect(response).toEqual([{}, {}]);
    });

    test('should reject the promise when window.paypal is undefined after loading the <script>', async () => {
        expect.assertions(3);

        // eslint-disable-next-line no-import-assign
        utils.insertScriptElement = jest.fn()
            .mockImplementation(({ onSuccess }) => {
                // do not set window.paypal in the mock implementation
                process.nextTick(() => onSuccess());
            });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ 'client-id': 'sb' });
        } catch (err) {
            expect(utils.insertScriptElement).toHaveBeenCalledTimes(1);
            expect(err.message).toBe('The window.paypal global variable is not available.');
        }
    });

    test('should throw an error from invalid arguments', () => {
        expect(() => loadScript()).toThrow(
            'Invalid arguments. Expected an object to be passed into loadScript().'
        );
    });

    test('should throw an error when the script fails to load', async () => {
        expect.assertions(3);

        // eslint-disable-next-line no-import-assign
        utils.insertScriptElement = jest.fn()
            .mockImplementation(({ onError }) => {
                process.nextTick(() => onError());
            });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ 'client-id': 'sb' });
        } catch (err) {
            expect(utils.insertScriptElement).toHaveBeenCalledTimes(1);
            expect(err.message).toBe("The script \"https://www.paypal.com/sdk/js?client-id=sb\" didn't load correctly.");
        }
    });

    test('should use the provided promise ponyfill', () => {
        const PromisePonyfill = jest.fn();

        loadScript({ 'client-id': 'sb' }, PromisePonyfill);
        expect(PromisePonyfill).toHaveBeenCalledTimes(1);
    });

    test('should throw an error when the Promise implementation is undefined', () => {
        delete window.Promise;

        expect(window.paypal).toBe(undefined);
        expect(window.Promise).toBe(undefined);
        expect(() => loadScript({ 'client-id': 'sb' })).toThrow(
            'Failed to load the PayPal JS SDK script because Promise is undefined. To resolve the issue, use a Promise polyfill.'
        );
    });
});
