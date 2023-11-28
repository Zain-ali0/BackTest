import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const { OAuth2 } = google.auth;
const { MAILING_SERVIES_ID, MAILING_SERVIES_SECRET, MAILING_SERVIES_REFRESH_TOKEN, EMAIL } = process.env;
const authLink = "https://developers.google.com/oauthplayground";

const oauth = new OAuth2(MAILING_SERVIES_ID, MAILING_SERVIES_SECRET, MAILING_SERVIES_REFRESH_TOKEN, authLink);


const sendEmail = (to, url, btn, txt) => {

    oauth.setCredentials({
        refresh_token: MAILING_SERVIES_REFRESH_TOKEN
    });

    const accessToken = oauth.getAccessToken();

    const smtp = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: EMAIL,
            clientId: MAILING_SERVIES_ID,
            clientSecret: MAILING_SERVIES_SECRET,
            refreshToken: MAILING_SERVIES_REFRESH_TOKEN,
            accessToken,
        },
    });

    const mailOptions = {
        from: EMAIL,
        to: to,
        subject: "Activate account",
        html: `
            <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
                <h2 style="text-align: center; text-transform: uppercase;color: teal;">Share with me</h2>
                <p>${txt}</p>
                <a href=${url} style=" background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${btn}</a>
            </div>
        `
    };


    smtp.sendMail(mailOptions, (err, infor) => {
        if (err) return err;
        return infor
    });

};

export default sendEmail;