import * as nodemailer from "nodemailer";
import * as handlebars from "handlebars";
import fs from "fs";
import path from "path";

type EmailActivity = "resetPassword" | "verifyUser";

export async function sendEmail(
  user: string,
  pass: string,
  to: string,
  token?: string,
  activity?: EmailActivity
) {
  if (activity == "resetPassword") {
    const template = fs.readFileSync(
      path.join(process.cwd(), "src/templates/reset.password.hbs"),
      "utf8"
    );
    const compiledTemplate = handlebars.compile(template);
    const html = compiledTemplate({
      username: to,
      token,
      resetLink: `http://localhost:8080/auth/reset-password/${token}`,
      expiry: 1,
      appName: "TixSnap",
      supportEmail: "support@tixsnap.com",
    });

    const mailOptions = {
      from: "tixsnap@gmail.com",
      to,
      subject: "Reset Password",
      html,
    };

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user,
        pass,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        throw new Error("Error sending mail");
      } else {
        console.log(`Email sent: ${info.response}`);
        throw new Error("Check your email for resetting your password");
      }
    });
  } else if (activity == "verifyUser") {
    const template = fs.readFileSync(
      path.join(process.cwd(), "src/templates/verify.user.hbs"),
      "utf8"
    );
    const compiledTemplate = handlebars.compile(template);
    const html = compiledTemplate({
      username: to,
      token,
      verifyLink: `http://localhost:8080/auth/verify/${token}`,
      expiry: 1,
      appName: "TixSnap",
      supportEmail: "support@tixsnap.com",
    });

    const mailOptions = {
      from: "tixsnap@gmail.com",
      to,
      subject: "Verify Email",
      html,
    };

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user,
        pass,
      },
    });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        throw new Error("Error sending mail");
      } else {
        console.log(`Email sent: ${info.response}`);
        throw new Error("Check your email for Verify your account");
      }
    });
  }
}
