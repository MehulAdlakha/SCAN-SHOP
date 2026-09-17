const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate bill PDF
 */
const generateBillPDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `bill-${order.orderId}.pdf`;
      const filePath = path.join(__dirname, '../uploads', fileName);

      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('SMART RETAIL', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Queue-less Shopping Experience', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text('123 Retail Street, City - 400001', { align: 'center' });
      doc.text('Phone: +91 98765 43210 | Email: info@smartretail.com', { align: 'center' });
      doc.moveDown(2);

      // Invoice details
      doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown();

      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice No: ${order.orderId}`, 50, doc.y);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 350, doc.y - 12);
      doc.moveDown();

      if (order.customerEmail) {
        doc.text(`Customer Email: ${order.customerEmail}`);
      }
      if (order.customerPhone) {
        doc.text(`Customer Phone: ${order.customerPhone}`);
      }
      doc.moveDown(2);

      // Table header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 250, tableTop);
      doc.text('Price', 300, tableTop);
      doc.text('Tax', 370, tableTop);
      doc.text('Total', 450, tableTop);
      doc.moveDown();

      // Line
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Items
      doc.font('Helvetica');
      let yPos = doc.y;
      
      order.items.forEach((item) => {
        doc.text(item.productName, 50, yPos, { width: 180 });
        doc.text(item.quantity.toString(), 250, yPos);
        doc.text(`₹${item.price.toFixed(2)}`, 300, yPos);
        doc.text(`₹${item.taxAmount.toFixed(2)}`, 370, yPos);
        doc.text(`₹${item.totalAmount.toFixed(2)}`, 450, yPos);
        yPos += 25;
      });

      doc.y = yPos + 10;
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Totals
      const totalsX = 350;
      doc.font('Helvetica');
      doc.text('Subtotal:', totalsX, doc.y);
      doc.text(`₹${order.subtotal.toFixed(2)}`, 450, doc.y);
      doc.moveDown(0.5);

      doc.text('Tax:', totalsX, doc.y);
      doc.text(`₹${order.totalTax.toFixed(2)}`, 450, doc.y);
      doc.moveDown(0.5);

      doc.moveTo(totalsX, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text('Grand Total:', totalsX, doc.y);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 450, doc.y);
      doc.moveDown(2);

      // Payment info
      doc.font('Helvetica').fontSize(10);
      doc.text(`Payment Method: ${order.paymentMethod}`);
      doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
      doc.moveDown(2);

      // Footer
      doc.fontSize(8).text('Thank you for shopping with Smart Retail!', { align: 'center' });
      doc.text('This is a computer-generated invoice.', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(fileName);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateBillPDF };
