import Nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";

import dotenv from "dotenv";
dotenv.config();


export const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

export const sender = {
  address: "hello@demomailtrap.com",
  name: "Drapeon",
};

