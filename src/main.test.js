import { getScript } from './main';

jest.mock('./utils', () => (
    {
        ...(jest.requireActual('./utils')),
        insertScriptElement: (_url, onloadCallback) => {
            onloadCallback();
        }
    }
));

describe('getScript()', () => {
    test('resolves the promise', () => {
        expect.assertions(1);
        window.paypal = {};
        return expect(getScript({ clientID: 'sb' })).resolves.toEqual(window.paypal);
    });
});
