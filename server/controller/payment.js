import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import User from "../models/auth.js";
import Payment from "../models/payment.js";
import PDFDocument from "pdfkit";
import Invoice from "../models/invoice.js";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sendBrevoEmail = async ({ to, subject, html, text }) => {
  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME,
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to }],
    subject,
  };

  if (html) payload.htmlContent = html;
  if (text) payload.textContent = text;

  const response = await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    payload,
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        accept: "application/json",
      },
    }
  );

  return response.data;
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { planName, price, userId} = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: {
        userId,
        planName,
      },
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${planName} Subscription`,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      success_url:
        "https://stackoverflow-clone-pi.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url:
        "https://stackoverflow-clone-pi.vercel.app/pricing",
    });
    res.status(200).json({
      id: session.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Payment Session Failed",
    });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment not completed",
      });
    }

    const { userId, planName } = session.metadata;
    const amount = session.amount_total / 100;
    await User.findByIdAndUpdate(userId, {
      subscription: {
        plan: planName,
        status: "Active",
        badge: planName,
        startDate: new Date(),
        renewalDate: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ),
      },
    });
    const payment =await Payment.create({
      userId,
      planName,
      amount,
      stripeSessionId: session.id,
      paymentStatus: "Paid",
    });
  const invoice = await Invoice.create({
    userId,
    paymentId: payment._id,
    invoiceNumber: `INV-${Date.now()}`,
    planName,
    amount,
    status: "Paid",
  });
  const user = await User.findById(userId);

  try {
    const info = await sendBrevoEmail({
      to: user.email,
      subject: "Payment Confirmation - CodeQuest",
      html: `
        <h2>Payment Successful 🎉</h2>

        <p>Hello ${user.name},</p>

        <p>Your subscription has been activated successfully.</p>

        <hr>

        <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Status:</strong> Paid</p>
        <p><strong>Renewal Date:</strong> ${new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString()}</p>

        <br>

        <p>Thank you for purchasing the ${planName} plan.</p>

        <p><strong>Team CodeQuest</strong></p>
      `,
    });

    console.log("✅ Email Sent:", info);
  } catch (err) {
    console.log("❌ Email Error:", err);
  }
    res.status(200).json({
      message: "Subscription Updated Successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Payment Verification Failed",
    });
  }
};
export const downloadInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const invoice = await Invoice.findOne({ paymentId });
    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceNumber}.pdf`
    );
    doc.pipe(res);
    doc.fontSize(22).text("Stack Overflow Clone", {
      align: "center",
    });
    doc.moveDown();
    doc.fontSize(18).text("Invoice");
    doc.moveDown();
    doc.fontSize(14).text(`Invoice Number : ${invoice.invoiceNumber}`);
    doc.text(`Plan : ${invoice.planName}`);
    doc.text(`Amount : ₹${invoice.amount}`);
    doc.text(`Status : ${invoice.status}`);
    doc.text(
      `Date : ${new Date(invoice.invoiceDate).toLocaleDateString()}`
    );
    doc.end();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Invoice Download Failed",
    });
  }
};
export const getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await Payment.find({ userId }).sort({
      paymentDate: -1,
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
    });
  }
};
export const getInvoices = async (req, res) => {
  try {
    const { userId } = req.params;

    const invoices = await Invoice.find({ userId }).sort({
      invoiceDate: -1,
    });

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
    });
  }
};