/* eslint @typescript-eslint/no-var-requires: "off" */

const childProcess = require("child_process");

const command =
    'npx eslint dist/iife/paypal-js.js dist/iife/paypal-js.legacy.js --no-eslintrc --parser-options="{ ecmaVersion: 3 }"';

describe("es3", () => {
    it("should parse browser bundle using eslint's es3 parser", (done) => {
        childProcess.exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                console.log(error, stderr);
                throw new Error(stderr);
            }
            done();
        });
    });
});
