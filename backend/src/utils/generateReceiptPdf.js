const PDFDocument = require('pdfkit');

exports.generateReceiptPdf = (data) => {

    return new Promise((resolve) => {

        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // 🧾 TÍTULO
        doc.fontSize(18).text('RECIBO DE PAGO', { align: 'right' });

        doc.moveDown();

        doc.fontSize(10);
        doc.text(`FECHA: ${data.date}`, { align: 'right' });
        doc.text(`TOTAL: $${data.total}`, { align: 'right' });
        doc.text(`DESCUENTO: $${data.discount}`, { align: 'right' });
        doc.text(`BUENO POR: $${data.total - data.discount}`, { align: 'right' });

        doc.moveDown(2);

        doc.text(`RECIBÍ DE: ${data.members}`);
        doc.moveDown();

        doc.text(`CONCEPTO: ${data.concept}`);
        doc.moveDown();

        doc.text(`FORMA DE PAGO: ${data.payment_methods}`);
        doc.text(`TIPO DE PAGO: ${data.payment_type}`);

        doc.moveDown();

        doc.fillColor('red')
           .text(`PRÓXIMA FECHA DE PAGO: ${data.next_payment_date}`);

        doc.fillColor('black');

        doc.moveDown();

        doc.text(`ATENDIÓ: ${data.attended_by}`);

        doc.moveDown(3);

        doc.text(`FOLIO: ${data.folio}`, { align: 'right' });

        doc.end();
    });
};