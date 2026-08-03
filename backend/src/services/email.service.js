import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransporter = () => {
  return nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_PORT === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
};

export const sendForgotPasswordEmail = async ({ to, name, resetLink, expiryMinutes = 15 }) => {
  const templatePath = path.join(__dirname, "../templates/emails/forgotPassword.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  html = html
    .replace(/{{name}}/g, name || "User")
    .replace(/{{resetLink}}/g, resetLink)
    .replace(/{{expiryMinutes}}/g, expiryMinutes.toString())
    .replace(/{{year}}/g, new Date().getFullYear().toString());

  const transporter = createTransporter();

  const mailOptions = {
    from: ENV.EMAIL_FROM || ENV.SMTP_USER,
    to,
    subject: "Reset Your Password - Question Hub",
    html,
  };

  return transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async ({ to, name, verificationLink }) => {
  const templatePath = path.join(__dirname, "../templates/emails/verifyEmail.html");
  let html = fs.readFileSync(templatePath, "utf-8");

  html = html
    .replace(/{{name}}/g, name || "User")
    .replace(/{{verificationLink}}/g, verificationLink)
    .replace(/{{year}}/g, new Date().getFullYear().toString());

  const transporter = createTransporter();

  const mailOptions = {
    from: ENV.EMAIL_FROM || ENV.SMTP_USER,
    to,
    subject: "Verify Your Email Address - Question Hub",
    html,
  };

  return transporter.sendMail(mailOptions);
};
