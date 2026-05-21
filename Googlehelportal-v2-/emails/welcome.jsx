import React from 'react';
import { Text, Section, Link, Img } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout.jsx';
import { theme } from './theme.js';

export const WelcomeEmail = ({ name = 'Space Voyager', subject, message, buttonText, buttonUrl }) => {
  const title = `${subject || theme.emails.welcome.subject}, ${name}`;
  const mainMessage = message || theme.emails.welcome.message;

  return (
    <EmailLayout previewText={title}>
      <Section style={{ padding: '0 0 40px 0' }}>
        <Img
          src={theme.company.logoUrl}
          alt={theme.company.name}
          width="520"
          style={{ width: '100%', display: 'block' }}
        />
      </Section>
      <Section>
        <Text style={{
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: theme.fonts.heading,
          color: theme.colors.text,
          margin: '0 0 16px 0',
          textTransform: 'uppercase',
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize: '15px',
          lineHeight: '24px',
          color: theme.colors.secondary,
          margin: '0 0 32px 0',
        }}>
          {mainMessage}
        </Text>
        <Link
          href={buttonUrl || theme.links.portal}
          style={{
            backgroundColor: theme.colors.buttonBg,
            color: theme.colors.buttonText,
            padding: '14px 30px',
            fontSize: '12px',
            fontWeight: 'bold',
            textDecoration: 'none',
            display: 'inline-block',
            fontFamily: theme.fonts.heading,
            border: `1px solid ${theme.colors.accent}`,
          }}
        >
          {buttonText || theme.emails.welcome.buttonText}
        </Link>
      </Section>
    </EmailLayout>
  );
};

export default WelcomeEmail;
