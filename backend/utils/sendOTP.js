import nodemailer from "nodemailer";

export const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your gmail
      pass: process.env.EMAIL_PASS, // your app password (16 chars)
    },
  });

  try {
    await transporter.sendMail({
      from: `"Security Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your One-Time Password</h2>
        <p>Your OTP is:</p>
        <h1 style="letter-spacing:4px;">${otp}</h1>
        <p>This code expires in <b>5 minutes</b>.</p>
      `,
    });

    console.log("📨 Email sent!");
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    throw err;
  }
};
