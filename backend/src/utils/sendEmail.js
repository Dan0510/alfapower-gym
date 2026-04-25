const { sgMail, initMailer } = require('../config/mail/mailer');

exports.sendReceiptEmail = async (emails, pdfBuffer, folio) => {

    await initMailer();

    const msg = {
        to: emails,
        from: 'contacto@alfapowergym.com',
        subject: `Recibo de pago ${folio}`,
        text: 'Adjunto encontrarás tu recibo de pago.',
        attachments: [
            {
                content: pdfBuffer.toString('base64'),
                filename: `${folio}.pdf`,
                type: 'application/pdf',
                disposition: 'attachment'
            }
        ]
    };

    await sgMail.sendMultiple(msg);
};