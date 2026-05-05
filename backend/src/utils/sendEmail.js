import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("--- DEVELOPMENT EMAIL LOG ---");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log("------------------------------");
    return;
  }

  console.log(`Attempting to send real email to: ${options.email}...`);

  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Infinity POS" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent. Please check your credentials.", { cause: error });
  }
};

export default sendEmail;
