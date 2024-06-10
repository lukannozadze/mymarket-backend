import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  console.log(process.env.SMTP_PASS);
  console.log(process.env.EMAIL_USER)
  try {
    const mailOptions = {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      from: process.env.EMAIL_USER,
      to,
      subject: "Email Verification",
      html: '<p>Click <a href="http://localhost:3000/auth/verify-email?token=' + token + '">here</a> to reset your password</p>'
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};