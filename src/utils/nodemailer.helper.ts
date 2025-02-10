import * as nodemailer from "nodemailer";
import * as handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { frontend_host } from "../config";

type EmailActivity = "resetPassword" | "verifyUser" | "accepted" | "rejected";

export async function sendEmail(
  user: string,
  pass: string,
  to: string,
  token?: string,
  activity?: EmailActivity,
  txId?: string,
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
      resetLink: `${frontend_host}/auth/reset-password?token=${token}`,
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
      verifyLink: `${frontend_host}/auth/verify?token=${token}`,
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
  }else if(activity == "accepted"){
    const template = fs.readFileSync(
      path.join(process.cwd(), "src/templates/accepted.tx.hbs"),
      "utf8"
    );
    const compiledTemplate = handlebars.compile(template);
    const html = compiledTemplate({
      username: to,
      txId,
      appName: "TixSnap",
      supportEmail: "support@tixsnap.com",
    });

    const mailOptions = {
      from: "tixsnap@gmail.com",
      to,
      subject: "Transaction Notification",
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
  }else if(activity == "rejected"){
    const template = fs.readFileSync(
      path.join(process.cwd(), "src/templates/rejected.tx.hbs"),
      "utf8"
    );
    const compiledTemplate = handlebars.compile(template);
    const html = compiledTemplate({
      username: to,
      txId,
      appName: "TixSnap",
      supportEmail: "support@tixsnap.com",
    });

    const mailOptions = {
      from: "tixsnap@gmail.com",
      to,
      subject: "Transaction Notification",
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
