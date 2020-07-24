import { loadScript } from './main';
import * as utils from './utils';

// eslint-disable-next-line no-import-assign
utils.insertScriptElement = jest.fn()
    .mockImplementation(({ callback }) => {
        window.paypal = {};
        callback();
    });

describe('loadScript()', () => {
    test('should insert <script> and resolve the promise', () => {
        expect.assertions(2);

        return loadScript({ 'client-id': 'sb' })
            .then(response => {
                expect(utils.insertScriptElement).toBeCalled();
                expect(response).toBe(window.paypal);
            });
    });
});
