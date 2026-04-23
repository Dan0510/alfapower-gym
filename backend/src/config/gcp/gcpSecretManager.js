const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await client.accessSecretVersion({
    name: `projects/182411964865/secrets/${secretName}/versions/latest`
  });

  const payload = version.payload.data.toString();
  return JSON.parse(payload);
}

module.exports = { getSecret };
