const { getBucket } = require('../config/gcp/storage');

exports.uploadReceipt = async (buffer, fileName) => {

    const bucket = await getBucket();

    const filePath = `members/payment-receipts/${fileName}`;

    const file = bucket.file(filePath);

    await file.save(buffer, {
        metadata: {
            contentType: 'application/pdf'
        }
    });

    return filePath; // 👉 SOLO guardas el path
};