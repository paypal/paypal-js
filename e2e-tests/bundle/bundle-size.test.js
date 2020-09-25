import filesize from 'filesize';
import fs from 'fs';

const maxBundleSizeInKiloBytes = 6;

describe('bundle size', () => {
    it(`paypal.browser.min.js should be less than ${maxBundleSizeInKiloBytes} KB`, () => {
        const { size: sizeInBytes } = fs.statSync('dist/paypal.browser.min.js');
        const [sizeInKiloBytes, label] = filesize(sizeInBytes, {output: "array"});
        console.log(`paypal.browser.min.js: ${sizeInKiloBytes} ${label}`);

        expect(sizeInKiloBytes).toBeLessThan(maxBundleSizeInKiloBytes);
    });
});
