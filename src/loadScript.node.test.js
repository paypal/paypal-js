/**
 * @jest-environment node
 */

import loadScript from './loadScript';

test('should resolve with null when global window object does not exist', () => {
    expect.assertions(1);

    return loadScript({ 'client-id': 'sb' })
        .then(response => {
            expect(response).toBe(null);
        });
});
