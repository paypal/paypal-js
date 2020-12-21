/**
 * @jest-environment node
 */

import loadScript from './load-script';

test('should resolve with null when global window object does not exist', () => {
    return expect(loadScript({ 'client-id': 'sb' })).resolves.toBe(null);
});
