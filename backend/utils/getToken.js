import { google } from "googleapis";
import "dotenv/config";
import nodemailer from "nodemailer";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL 
);

console.log(
  "Authorize this app:",
  oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://mail.google.com/"],
  })
);
