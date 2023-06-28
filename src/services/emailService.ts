import { render } from '@react-email/render';
import { SES } from '@aws-sdk/client-ses';

import { TokenEmail } from '../../emails/TokenEmail';

export async function sendEmailToken(
	email: string,
	token: string,
	accessKeyId: string,
	secretAccessKey: string,
	region: string,
) {
	const ses = new SES({ credentials: { accessKeyId, secretAccessKey }, region });
	const html = render(TokenEmail({ token }));
	const text = render(TokenEmail({ token }), { plainText: true });

	const params = {
		Source: 'fresh.dusk3190@fastmail.com',
		Destination: {
			ToAddresses: [email],
		},
		Message: {
			Subject: {
				Charset: 'UTF-8',
				Data: 'Here is Your One-Time Password',
			},
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: html,
				},
				Text: {
					Charset: 'UTF-8',
					Data: text,
				},
			},
		},
	};

	try {
		return await ses.sendEmail(params);
	} catch (err) {
		console.log('Error sending email: ', err);
		return err;
	}
}
