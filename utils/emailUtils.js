const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerificationCode(email, code) {
    const mailOptions = {
        from: "kuromiqo@x.zxc.sx",
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`,
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationCode };