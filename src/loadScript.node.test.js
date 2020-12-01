/**
 * @jest-environment node
 */

import loadScript from './loadScript';

test('should resolve with null when global window object does not exist', () => {
    return expect(loadScript({})).resolves.toBe(null);
});
