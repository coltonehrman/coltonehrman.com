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
  return Promise.all([
    transporter.sendMail({
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
    }),
    transporter.sendMail({
      from: '"Colton Ehrman" <coltonje95@gmail.com>', // sender address
      to: mail.email, // list of receivers
      subject: "Thank you for contacting me, will be in touch soon!", // Subject line
      text: `
            Thank you for contacting me on my website http://coltonehrman.com.
            I have recieved your email and will be in contact with you ASAP!
        `, // plain text body
      // html: "<b>There is a new article. It's about sending emails, check it out!</b>", // html body
    }),
  ]);
};
