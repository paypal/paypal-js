import { loadScript } from './main';
import * as utils from './utils';

describe('loadScript()', () => {
    beforeEach(() => {
        document.head.innerHTML = '';

        // eslint-disable-next-line no-import-assign
        utils.insertScriptElement = jest.fn()
            .mockImplementation(({ callback }) => {
                window.paypal = {};
                process.nextTick(() => callback());
            });

        Object.defineProperty(window, 'paypal', {
            writable: true,
            value: undefined
        });
    });
    afterEach(() => {
        utils.insertScriptElement.mockClear();
    });

    test('should insert <script> and resolve the promise', () => {
        expect.assertions(3);
        expect(window.paypal).toBe(undefined);

        return loadScript({ 'client-id': 'sb' })
            .then(response => {
                expect(utils.insertScriptElement).toHaveBeenCalledTimes(1);
                expect(response).toEqual({});
            });
    });

    test('should not insert <script> when an existing script with the same src is already in the DOM and window.paypal is set', () => {
        expect.assertions(3);
        expect(window.paypal).toBe(undefined);

        // simulate the script already being loaded
        document.head.innerHTML = '<script src="https://www.paypal.com/sdk/js?client-id=sb"></script>';
        window.paypal = {};

        return loadScript({ 'client-id': 'sb' })
            .then(response => {
                expect(utils.insertScriptElement).not.toHaveBeenCalled();
                expect(response).toEqual({});
            });
    });

    test('should only load the <script> once when loadScript() is called twice', () => {
        expect.assertions(3);
        expect(window.paypal).toBe(undefined);

        return Promise.all([
            loadScript({ 'client-id': 'sb' }),
            loadScript({ 'client-id': 'sb' })
        ])
            .then(response => {
                expect(utils.insertScriptElement).toHaveBeenCalledTimes(1);
                expect(response).toEqual([{}, {}]);
            });
    });

    test('should reject the promise when window.paypal is undefined after loading the <script>', () => {
        expect.assertions(3);

        // eslint-disable-next-line no-import-assign
        utils.insertScriptElement = jest.fn()
            .mockImplementation(({ callback }) => {
                // do not set window.paypal in the mock implementation
                process.nextTick(() => callback());
            });

        expect(window.paypal).toBe(undefined);

        return loadScript({ 'client-id': 'sb' })
            .catch(err => {
                expect(utils.insertScriptElement).toHaveBeenCalledTimes(1);
                expect(err.message).toBe('The window.paypal global variable is not available.');
            });
    });
});
