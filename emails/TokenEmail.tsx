import { Body, Container, Head, Hr, Html, Preview, Section, Tailwind, Text } from '@react-email/components';
import * as React from 'react';

interface TokenEmailProps {
	token: string;
}

export const TokenEmail = ({ token }: TokenEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Your code is {token}</Preview>
			<Tailwind
				config={{
					theme: {
						fontFamily: {
							sans: 'Arial, Helvetica, sans-serif',
							mono: 'Consolas, Courier New, monospace',
						},
					},
				}}
			>
				<Body className="bg-white font-sans">
					<Container className="rounded border-2 border-solid border-gray-500 px-6 py-3">
						<Section className="my-4 w-2/3 rounded bg-gray-200 text-center">
							<Text className="font-mono text-5xl tracking-[.25em]">{token}</Text>
						</Section>
						<Section>
							<Text className="my-0 text-lg">
								This is your single-use, six-digit code for TwitterClone. It will expire 10 minutes from
								when it was requested.
							</Text>
						</Section>
						<Hr className="my-6 border border-solid border-gray-300" />
						<Text className="text-xs text-gray-500">©2023 TwitterClone</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default TokenEmail;
