const { Storage } = require('@google-cloud/storage');
const { getSecret } = require('../gcpSecretManager');

const storage = new Storage();

let bucketInstance = null;

async function getBucket() {
    if (bucketInstance) return bucketInstance;

    const bucketName = await getSecret('GCP_BUCKET_NAME-alfapower-gym');

    bucketInstance = storage.bucket(bucketName);

    return bucketInstance;
}

module.exports = {
    getBucket
};