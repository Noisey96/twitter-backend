import { SESClient, SendTemplatedEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});

function createTokenEmailCommand(toAddress: string, fromAddress: string, token: string) {
	return new SendTemplatedEmailCommand({
		Destination: {
			ToAddresses: [toAddress],
		},
		Source: fromAddress,
		Template: 'tokenEmail',
		TemplateData: JSON.stringify({ token: token }),
	});
}

export async function sendEmailToken(email: string, token: string) {
	const command = createTokenEmailCommand(email, 'fresh.dusk3190@fastmail.com', token);

	try {
		return await ses.send(command);
	} catch (err) {
		console.log('Error sending email: ', err);
		return err;
	}
}
