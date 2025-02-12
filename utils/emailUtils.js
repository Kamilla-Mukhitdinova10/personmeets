const nodemailer = require('nodemailer');
require('dotenv').config();

console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_PASS:", process.env.GMAIL_PASS);

const transporter = nodemailer.createTransport({
    host: "smtp.yandex.ru",
    port: 465,
    secure: true,
    auth: {
        user: "kuromiqo@x.zxc.sx",
        pass: "JNfdsuy87g",
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