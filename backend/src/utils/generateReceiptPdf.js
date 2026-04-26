const PDFDocument = require('pdfkit');

exports.generateReceiptPdf = (data) => {
    return new Promise((resolve) => {

        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // 🔲 CONTENEDOR (simulación de tarjeta)
        doc.roundedRect(20, 20, 555, 750, 10).strokeColor('#CCCCCC').stroke();

        // 🧾 TÍTULO
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text('RECIBO DE PAGO', 350, 50, { align: 'right' });

        // 📅 BLOQUE DERECHO
        doc.moveDown();

        doc.fontSize(11).font('Helvetica-Bold');
        doc.text(`FECHA: `, 350, 90, { continued: true });
        doc.font('Helvetica').text(`${data.date}`);

        doc.font('Helvetica-Bold').text(`TOTAL $: `, 350, 110, { continued: true });
        doc.font('Helvetica').text(`${data.total}`);

        doc.font('Helvetica-Bold').text(`DESCUENTO $: `, 350, 130, { continued: true });
        doc.font('Helvetica').text(`${data.discount}`);

        doc.font('Helvetica-Bold').text(`BUENO POR $: `, 350, 150, { continued: true });
        doc.font('Helvetica').text(`${data.total - data.discount}`);

        // 🧍 SOCIOS
        doc.moveDown(4);

        doc.font('Helvetica-Bold')
            .text('RECIBÍ DE: ', 50, 200, { continued: true });

        doc.font('Helvetica')
            .text(data.members);

        // 📌 CONCEPTO
        doc.moveDown();

        doc.font('Helvetica-Bold')
            .text('POR CONCEPTO DE: ', { continued: true });

        doc.font('Helvetica')
            .text(data.concept);

        // 📝 NOTA
        doc.moveDown();

        doc.font('Helvetica-Bold')
            .text('NOTA: ', { continued: true });

        doc.font('Helvetica')
            .text(data.notes || 'N/A');

        // 💳 FORMA DE PAGO + TIPO
        doc.moveDown();

        doc.font('Helvetica-Bold')
            .text('FORMA DE PAGO: ', 50, doc.y, { continued: true });

        doc.font('Helvetica')
            .text(data.payment_methods);

        doc.font('Helvetica-Bold')
            .text('TIPO DE PAGO: ', 350, doc.y - 15, { continued: true });

        doc.font('Helvetica')
            .text(data.payment_type);

        // 📅 PRÓXIMA FECHA (ROJO)
        doc.moveDown();

        doc.font('Helvetica-Bold')
            .text('PRÓXIMA FECHA DE PAGO: ', { continued: true });

        doc.fillColor('red')
            .text(data.next_payment_date);

        doc.fillColor('black');

        // 👤 ATENDIÓ
        doc.moveDown();

        doc.font('Helvetica-Bold')
            .text('ATENDIÓ: ', { continued: true });

        doc.font('Helvetica')
            .text(data.attended_by);

        // ➖ LÍNEA
        doc.moveTo(50, doc.y + 20)
            .lineTo(550, doc.y + 20)
            .strokeColor('#CCCCCC')
            .stroke();

        // 📍 DIRECCIÓN
        doc.fontSize(10)
            .fillColor('#666666')
            .text('PASEO DE LA ESTANCIA NO. 501 11', 50, doc.y + 30);

        doc.text('LOCAL 6 PLANTA ALTA');

        // 🔢 FOLIO
        doc.fontSize(12)
            .fillColor('black')
            .font('Helvetica-Bold')
            .text('FOLIO ', 400, doc.y - 30, { continued: true });

        doc.fillColor('red')
            .text(data.folio);

        doc.end();
    });
};