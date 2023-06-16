import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Tailwind, Text } from '@react-email/components';
import * as React from 'react';

interface TokenEmailProps {
	token: string;
}

export const TokenEmail = ({ token }: TokenEmailProps) => {
	return (
		<Html>
			<Head />
			<Preview>Your code is {token}</Preview>
			<Tailwind>
				<Body className="bg-white my-auto mx-auto font-sans">
					<Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
						<Section style={codeContainer}>
							<Text style={temp}>{token}</Text>
						</Section>
						<Heading style={secondary}>
							This is your single-use, six-digit code for TwitterClone. It will expire 10 minutes from
							when it was requested.
						</Heading>
						<Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
						<Text className="text-[#666666] text-[12px] leading-[24px]">©2023 TwitterClone</Text>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	);
};

const codeContainer = {
	background: 'rgba(0,0,0,.05)',
	borderRadius: '4px',
	margin: '16px auto 14px',
	verticalAlign: 'middle',
	width: '280px',
};

const temp = {
	color: '#000',
	display: 'inline-block',
	fontFamily: 'HelveticaNeue-Bold',
	fontSize: '32px',
	fontWeight: 700,
	letterSpacing: '6px',
	lineHeight: '40px',
	paddingBottom: '8px',
	paddingTop: '8px',
	margin: '0 auto',
	width: '100%',
	textAlign: 'center' as const,
};

const secondary = {
	color: '#000',
	display: 'inline-block',
	fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
	fontSize: '20px',
	fontWeight: 500,
	lineHeight: '24px',
	marginBottom: '0',
	marginTop: '0',
	textAlign: 'center' as const,
};

export default TokenEmail;
