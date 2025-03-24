import nodemailer from "nodemailer";
import config from "../config";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail", 
    auth: {
      user: config.email.user,
      pass: config.email.pass, 
    },
  });

  const mailOptions = {
    from: "Team Webio",
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};
