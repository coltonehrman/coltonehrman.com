import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export default (mail) => {
  return transporter.sendMail({
    from: `"${mail.name}" <${mail.email}>`, // sender address
    to: "coltonje95@gmail.com", // list of receivers
    subject: mail.subject, // Subject line
    text: `
            You have received an incoming mail from ${mail.name}.
            Name: ${mail.name}
            Phone: ${mail.phone}
            Email: ${mail.email}

            Message:
            ${mail.message}
        `, // plain text body
    // html: "<b>There is a new article. It's about sending emails, check it out!</b>", // html body
  });
};
