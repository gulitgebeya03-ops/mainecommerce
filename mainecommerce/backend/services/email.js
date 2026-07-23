const nodemailer = require('nodemailer');

let _transporter = null;
function getTransporter() {
  if (!_transporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return _transporter;
}

const FROM_EMAIL = process.env.SMTP_USER || 'onboarding@resend.dev';
const STORE_NAME = 'GULIT Gebeya';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

function buildOrderItemsHtml(products = []) {
  if (!products.length) return '<p style="color:#6b7280;font-size:13px;">No items.</p>';
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:12px;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Item</th>
          <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Price</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${products.map((p) => `
          <tr>
            <td style="padding:8px 12px;font-size:13px;color:#111827;border-bottom:1px solid #f3f4f6;">${p.title || p.name || 'Item'}</td>
            <td style="padding:8px 12px;text-align:center;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">${p.quantity}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;color:#374151;border-bottom:1px solid #f3f4f6;">ETB ${Number(p.price).toLocaleString()}</td>
            <td style="padding:8px 12px;text-align:right;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">ETB ${(Number(p.price) * Number(p.quantity)).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function baseLayout(title, bodyHtml) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"/></head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:#ea580c;padding:24px 32px;">
                <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">${STORE_NAME}</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 16px;font-size:18px;font-weight:800;color:#111827;">${title}</h2>
                ${bodyHtml}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">This is an automated email from ${STORE_NAME}. Please do not reply.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`;
}

async function sendEmail({ to, subject, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[email] SMTP credentials not set – skipping email to', to);
    return null;
  }
  if (!to || (Array.isArray(to) && !to.length)) {
    console.warn('[email] No recipient address provided – skipping.');
    return null;
  }

  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to];
  if (ADMIN_EMAIL && !recipients.includes(ADMIN_EMAIL)) {
    recipients.push(ADMIN_EMAIL);
  }

  try {
    const result = await transporter.sendMail({
      from: `"${STORE_NAME}" <${FROM_EMAIL}>`,
      to: recipients.join(', '),
      subject,
      html,
    });
    console.log('[email] Sent to', recipients.join(', '), '— messageId:', result.messageId);
    return result;
  } catch (err) {
    console.error('[email] Failed to send to', recipients.join(', '), err?.message || err);
    return null;
  }
}

// ── Order Confirmation (COD) ──────────────────────────────────────────────────

async function sendOrderConfirmation(order) {
  const itemsHtml = buildOrderItemsHtml(order.products);
  const body = `
    <p style="font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${order.customerName || 'Customer'}</strong>,</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;">Your order has been placed successfully. Here are the details:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:8px 12px;background:#fff7ed;border-radius:8px 0 0 8px;border:1px solid #fed7aa;">
          <span style="font-size:12px;color:#9a3412;font-weight:700;">Order Code</span><br/>
          <span style="font-size:14px;color:#ea580c;font-weight:800;font-family:monospace;">${order.orderCode}</span>
        </td>
        <td style="padding:8px 12px;background:#fff7ed;border:1px solid #fed7aa;">
          <span style="font-size:12px;color:#9a3412;font-weight:700;">Payment Method</span><br/>
          <span style="font-size:14px;color:#111827;font-weight:600;">${order.paymentMethod === 'CHAPA' ? 'Online (Chapa)' : 'Cash on Delivery'}</span>
        </td>
        <td style="padding:8px 12px;background:#fff7ed;border-radius:0 8px 8px 0;border:1px solid #fed7aa;">
          <span style="font-size:12px;color:#9a3412;font-weight:700;">Status</span><br/>
          <span style="font-size:14px;color:#111827;font-weight:600;">${order.orderStatus || 'Pending'}</span>
        </td>
      </tr>
    </table>

    ${itemsHtml}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Delivery Address:</td>
        <td style="padding:6px 0;font-size:13px;color:#111827;text-align:right;font-weight:500;">${order.deliveryAddress || '—'}</td>
      </tr>
      ${order.deliveryFee ? `
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#6b7280;">Delivery Fee:</td>
        <td style="padding:6px 0;font-size:13px;color:#111827;text-align:right;">ETB ${Number(order.deliveryFee).toLocaleString()}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 0 0;font-size:14px;color:#111827;font-weight:800;border-top:2px solid #e5e7eb;">Total Amount:</td>
        <td style="padding:10px 0 0;font-size:16px;color:#ea580c;font-weight:800;text-align:right;border-top:2px solid #e5e7eb;">ETB ${Number(order.totalAmount).toLocaleString()}</td>
      </tr>
    </table>

    <p style="margin-top:20px;font-size:13px;color:#6b7280;">You will receive another email once your payment is confirmed or your order status changes.</p>
  `;

  return sendEmail({
    to: order.email,
    subject: `Order Confirmed — ${order.orderCode}`,
    html: baseLayout('Order Confirmed', body),
  });
}

// ── Payment Confirmed (Chapa success) ─────────────────────────────────────────

async function sendPaymentConfirmation(order) {
  const body = `
    <p style="font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${order.customerName || 'Customer'}</strong>,</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;">Your online payment has been confirmed. Thank you!</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
          <span style="font-size:12px;color:#166534;font-weight:700;">Payment Status</span><br/>
          <span style="font-size:16px;color:#16a34a;font-weight:800;">Paid</span>
        </td>
        <td style="padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
          <span style="font-size:12px;color:#166534;font-weight:700;">Order Code</span><br/>
          <span style="font-size:16px;color:#111827;font-weight:800;font-family:monospace;">${order.orderCode}</span>
        </td>
        <td style="padding:12px 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
          <span style="font-size:12px;color:#166534;font-weight:700;">Amount Paid</span><br/>
          <span style="font-size:16px;color:#111827;font-weight:800;">ETB ${Number(order.totalAmount).toLocaleString()}</span>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#6b7280;">Your order is now being processed. We will notify you when it ships.</p>
  `;

  return sendEmail({
    to: order.email,
    subject: `Payment Confirmed — ${order.orderCode}`,
    html: baseLayout('Payment Confirmed', body),
  });
}

// ── Order Status Update ───────────────────────────────────────────────────────

const STATUS_MESSAGES = {
  Processing: 'Your order is now being prepared.',
  Shipped: 'Your order has been shipped and is on its way!',
  Delivered: 'Your order has been delivered. We hope you enjoy your purchase!',
};

async function sendStatusUpdate(order, previousStatus) {
  const message = STATUS_MESSAGES[order.orderStatus] || `Your order status has been updated to ${order.orderStatus}.`;
  const body = `
    <p style="font-size:14px;color:#374151;line-height:1.6;">Hi <strong>${order.customerName || 'Customer'}</strong>,</p>
    <p style="font-size:14px;color:#374151;line-height:1.6;">${message}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:12px 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
          <span style="font-size:12px;color:#0369a1;font-weight:700;">Order Code</span><br/>
          <span style="font-size:15px;color:#111827;font-weight:800;font-family:monospace;">${order.orderCode}</span>
        </td>
        <td style="padding:12px 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
          <span style="font-size:12px;color:#0369a1;font-weight:700;">Previous Status</span><br/>
          <span style="font-size:15px;color:#6b7280;">${previousStatus || '—'}</span>
        </td>
        <td style="padding:12px 16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;">
          <span style="font-size:12px;color:#0369a1;font-weight:700;">New Status</span><br/>
          <span style="font-size:15px;color:#2563eb;font-weight:800;">${order.orderStatus}</span>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#6b7280;">If you have any questions, please contact our support team.</p>
  `;

  return sendEmail({
    to: order.email,
    subject: `Order Update — ${order.orderCode} is now ${order.orderStatus}`,
    html: baseLayout('Order Status Updated', body),
  });
}

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendStatusUpdate,
};
