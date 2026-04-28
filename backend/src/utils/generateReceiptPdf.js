const PDFDocument = require('pdfkit');
const fetch = require('node-fetch'); // si usas URL para logo


async function getLogoBuffer(logoUrl) {
    const res = await fetch(logoUrl);
    return await res.buffer();
}

exports.generateReceiptPdf = async (data) => {

    return new Promise(async (resolve) => {

        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // ===============================
        // 🎨 COLORES (AlfaPower)
        // ===============================
        const turquoise = '#00E0FF';
        const fuchsia = '#FF00FF';
        const dark = '#121212';

        // ===============================
        // 🖼️ LOGO
        // ===============================
        try {
            if (data.logo_url) {
                const logoBuffer = await getLogoBuffer("https://storage.googleapis.com/alfapower-gym/logo_alfapower_transparent.png");
                doc.image(logoBuffer, 40, 30, { width: 80 });
            }
        } catch (e) {
            console.log('No se pudo cargar logo');
        }

        // ===============================
        // 🏋️ HEADER
        // ===============================
        doc
            .fillColor(turquoise)
            .fontSize(20)
            .text('ALFA POWER GYM', 130, 40);

        doc
            .fillColor('black')
            .fontSize(12)
            .text('RECIBO DE PAGO', 130);

        doc.moveDown(2);

        // Línea
        doc
            .moveTo(40, doc.y)
            .lineTo(550, doc.y)
            .strokeColor(turquoise)
            .lineWidth(2)
            .stroke();

        doc.moveDown();

        // ===============================
        // 📅 INFO
        // ===============================
        doc.fontSize(10).fillColor('black');

        doc.text(`FECHA: ${data.date}`);
        doc.text(`FOLIO: ${data.folio}`);

        doc.moveDown();

        // ===============================
        // 👤 CLIENTE
        // ===============================
        doc
            .fillColor(fuchsia)
            .text('SOCIO(S):', { continued: true })
            .fillColor('black')
            .text(` ${data.members}`);

        doc.moveDown();

        // ===============================
        // 📦 CONCEPTO
        // ===============================
        doc
            .fillColor(fuchsia)
            .text('CONCEPTO:', { continued: true })
            .fillColor('black')
            .text(` ${data.concept}`);

        doc.moveDown();

        // ===============================
        // 💳 PAGOS
        // ===============================
        doc.text(`FORMA DE PAGO: ${data.payment_methods}`);
        doc.text(`TIPO DE PAGO: ${data.payment_type}`);

        doc.moveDown();

        // ===============================
        // 💰 CAJA DE TOTALES
        // ===============================
        const boxTop = doc.y;

        doc
            .roundedRect(40, boxTop, 510, 80, 10)
            .strokeColor(turquoise)
            .stroke();

        doc.fontSize(11);

        doc.text(`TOTAL: $${data.total}`, 60, boxTop + 15);
        doc.text(`DESCUENTO: $${data.discount}`, 60, boxTop + 35);

        const net = Number(data.total) - Number(data.discount);

        doc
            .fillColor(fuchsia)
            .text(`TOTAL PAGADO: $${net}`, 300, boxTop + 25);

        doc.fillColor('black');

        doc.moveDown(5);

        // ===============================
        // 📅 PRÓXIMO PAGO
        // ===============================
        doc
            .fillColor('red')
            .text(`PRÓXIMA FECHA DE PAGO: ${data.next_payment_date}`);

        doc.fillColor('black');

        doc.moveDown();

        // ===============================
        // 👨‍💼 ATENDIÓ
        // ===============================
        doc.text(`ATENDIÓ: ${data.attended_by}`);

        doc.moveDown(3);

        // ===============================
        // ❌ CANCELADO
        // ===============================
        if (data.is_cancelled) {
            doc
                .fontSize(50)
                .fillColor('red')
                .rotate(-20, { origin: [300, 400] })
                .text('CANCELADO', 100, 350, {
                    align: 'center',
                    width: 400
                });

            doc.rotate(20, { origin: [300, 400] });
            doc.fillColor('black');
        }

        // ===============================
        // 🔚 FOOTER
        // ===============================
        doc
            .fontSize(9)
            .fillColor('gray')
            .text('Gracias por entrenar en AlfaPower 💪', 40, 780, {
                align: 'center',
                width: 510
            });

        doc.end();
    });
};