import React from 'react';
import { Html, Head, Body, Container, Preview } from '@react-email/components';
import { EmailHeader } from './EmailHeader.jsx';
import { EmailFooter } from './EmailFooter.jsx';
import { theme } from '../theme.js';

export const EmailLayout = ({ children, previewText }) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={{
      backgroundColor: theme.colors.bg,
      color: theme.colors.text,
      fontFamily: theme.fonts.body,
      margin: '0',
      padding: '0',
    }}>
      <Container style={{ width: '600px', margin: '0 auto', padding: '0 40px' }}>
        <EmailHeader />
        {children}
        <EmailFooter />
      </Container>
    </Body>
  </Html>
);
