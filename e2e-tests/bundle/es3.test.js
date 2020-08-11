import childProcess from 'child_process';

const command = 'npx eslint dist/paypal.browser.* --no-eslintrc --parser-options="{ ecmaVersion: 3 }"'

describe('es3', () => {
    it("should parse browser bundle using eslint's es3 parser", async () => {
        childProcess.exec(command, (error, stdout, stderr) => {
            if (error || stderr) {
                console.log(error, stderr);
                throw new Error(stderr);
            }
        });
    });
});
