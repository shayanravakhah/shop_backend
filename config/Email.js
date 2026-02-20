import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const EmailSender = async (
  toEmail,
  productName,
  productImageUrl,
  productDescription,
  productPrice,
  amount
) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: toEmail,
    subject: `🛒 Your Purchase of ${productName} is Confirmed!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:10px; background-color:#f9f9f9;">
        <h1 style="color:#27ae60; text-align:center;">Purchase Confirmed!</h1>
        <p style="text-align:center;">Thank you for shopping with <strong>Web Shop</strong> 🛒</p>

        <h2 style="text-align:center; color:#333;">${productName}</h2>
        <img src="${productImageUrl}" alt="${productName}" style="width:100%; max-width:300px; display:block; margin:0 auto 20px; border-radius:8px;" />

        <p style="color:#555; font-size:16px; text-align:center;">${productDescription}</p>
        <p style="color:#555; font-size:16px; text-align:center;">
          Quantity: <b>${amount}</b>
        </p>
        <p style="color:#E74C3C; font-size:18px; text-align:center; font-weight:bold;">Price: $${productPrice.toFixed(2)} 🪙</p>

        <p style="text-align:center; margin-top:30px; color:#777;">
          We hope you enjoy your purchase! 🛍️
        </p>

        <p style="text-align:center; font-size:12px; color:#aaa; margin-top:40px;">
          This is an automated email from Super Web Shop. Please do not reply.
        </p>
      </div>
    `,
  });
};