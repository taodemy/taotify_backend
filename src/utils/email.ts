import nodemailer from "nodemailer";
type SendEmailProps = {
	subject: string;
	message: string;
	send_to?: string;
	send_from?: string;
	reply_to?: string;
};
const sendEmail = async (props: SendEmailProps) => {
	const { subject, message, send_to, send_from, reply_to } = props;
	// Create Email Transporter
	// console.log(props, "@props");
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: 587,
		auth: {
			user: process.env.SENDER,
			pass: process.env.SENDER_PASS
		},
		tls: {
			rejectUnauthorized: false
		}
	});

	// Option for sending email
	const options = {
		from: send_from,
		to: send_to,
		replyTo: reply_to,
		subject: subject,
		html: message
	};

	// send email
	transporter.sendMail(options, function (err, info) {
		if (err) {
			console.log(err);
		} else {
			console.log(info);
		}
	});
};

export default sendEmail;
