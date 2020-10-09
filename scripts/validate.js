const { exec, echo, exit } = require("shelljs");

// validate git
if (exec("git diff-files --quiet").code !== 0) {
    echo("ERROR: Cannot continue with unstaged changes");
    exit(1);
}

if (exec("git diff-index --quiet --cached HEAD").code !== 0) {
    echo("ERROR: Cannot continue with uncommitted changes");
    exit(1);
}

// validate npm
let npmUser = exec("npm whoami").trim();

if (npmUser) {
    echo(`npm username: ${npmUser}`);
} else {
    echo("You must be logged in to publish a release. Running 'npm login'");
    exec("npm login");
    npmUser = exec("npm whoami").trim();
}

const userRole = JSON.parse(exec(`npm org ls @paypal ${npmUser} --json`));
const permission = userRole[npmUser];

if (!["developer", "owner"].includes(permission)) {
    echo(
        "ERROR: Invalid npm permissions. In order to publish you must be assigned the developer or owner role."
    );
    exit(1);
}
