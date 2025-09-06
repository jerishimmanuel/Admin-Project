import nodemailer from "nodemailer";
export function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}
export async function sendCongratsEmail(to, name) {
  const transporter = createTransport();
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || "no-reply@kongu.edu",
    to, subject: "Welcome to the Alumni Network 🎉",
    text: `Hi ${name},\n\nCongrats! You have been added to the Kongu Alumni Network.\n\nRegards,\nAlumni Office`,
    html: `<p>Hi <b>${name}</b>,</p><p>Congrats! You have been added to the <b>Kongu Alumni Network</b>.</p><p>Regards,<br/>Alumni Office</p>`
  });
  return info;
}
