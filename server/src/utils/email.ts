import nodemailer from "nodemailer";

/**
 * Sends an email using the configured SMTP transport.
 */
export const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  // 1) Create a transporter
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    auth: {
      user: process.env.EMAIL_USER || "rohit995379@gmail.com",
      pass: process.env.EMAIL_PASS || "mwrn dlql sdfi luen",
    },
  });

  // Verify connection configuration
  try {
    await transport.verify();
    console.log("SMTP server connection established successfully");
  } catch (error: any) {
    console.error("Transporter verification failed:", error.message);
    throw new Error(`Email transporter setup failed: ${error.message}`);
  }

  // 2) Define the email options
  const mailOptions = {
    from: "Bexex Global <noreply@bexex.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h2 style="color: #333;">${options.subject}</h2>
            <p>${options.message}</p>
           </div>`,
  };

  // 3) Actually send the email
  try {
    const info = await transport.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    return info;
  } catch (error: any) {
    console.error("Error actually sending email:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};