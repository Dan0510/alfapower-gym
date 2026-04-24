const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function getSecret(name, { parse = false } = {}) {
    const [version] = await client.accessSecretVersion({
        name: `projects/182411964865/secrets/${name}/versions/latest`,
    });

    const value = version.payload.data.toString();

    return parse ? JSON.parse(value) : value;
}

module.exports = { getSecret };