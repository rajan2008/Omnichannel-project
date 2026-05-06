import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // ALWAYS LOG THE MESSAGE CONTENT FIRST (In case SMTP fails)
  console.log("\n" + "=".repeat(40));
  console.log("OUTGOING EMAIL DISPATCH LOG");
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.message}`);
  console.log("=".repeat(40) + "\n");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return;
  }

  console.log(`Attempting real SMTP delivery to: ${options.email}...`);

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
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
