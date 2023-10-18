import nodemailer from "nodemailer";

const sendMail = async (email: string, text: string) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "Calebduniya45@gmail.com",
      pass: "kwxpklnwedeqkfpz",
    },
  });

  var mailOptions = {
    from: "no reply@Twitter Clone",
    to: email,
    subject: "Verify your account;",
    text: text,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
export default sendMail;
