import { camelCaseToCabobCase, objectToQueryParams, insertScriptElement } from './utils';

describe('camelCaseToCabobCase()', () => {
  test('coverts camelCase keys to cabob-case', () => {

    // TODO: add all possible param options here
    const params = {
      clientID: 'client-id',
      merchantID: 'merchant-id'
    };

    Object.keys(params).forEach(key => {
      expect(camelCaseToCabobCase(key)).toBe(params[key]);
    });

  })
})

describe('objectToQueryParams()', () => {
  test('coverts an object to a query parameter string', () => {

    // TODO: add all possible param options here
    const params = {
      clientID: 'sb',
      currency: 'USD'
    };

    expect(objectToQueryParams(params)).toBe('client-id=sb&currency=USD');

  })
})
