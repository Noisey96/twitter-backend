import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

function createSendEmailCommand(toAddress: string, fromAddress: string, message: string) {
	return new SendEmailCommand({
		Destination: {
			ToAddresses: [toAddress],
		},
		Source: fromAddress,
		Message: {
			Subject: {
				Charset: 'UTF-8',
				Data: 'Your one-time password',
			},
			Body: {
				Text: {
					Charset: 'UTF-8',
					Data: message,
				},
			},
		},
	});
}

export async function sendEmailToken(email: string, token: string) {
	const message = `Your one-time password: ${token}`;
	const command = createSendEmailCommand(email, 'fresh.dusk3190@fastmail.com', message);

	try {
		return await ses.send(command);
	} catch (err) {
		console.log('Error sending email: ', err);
		return err;
	}
}
