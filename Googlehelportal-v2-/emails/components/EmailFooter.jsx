import React from 'react';
import { Section, Text, Link, Hr } from '@react-email/components';
import { theme } from '../theme.js';

export const EmailFooter = () => (
  <Section style={{ padding: '60px 0 40px 0' }}>
    <Hr style={{ borderColor: theme.colors.divider, margin: '0 0 60px 0' }} />
    <Text style={{
      fontSize: '11px',
      fontFamily: theme.fonts.heading,
      color: theme.colors.secondary,
      textAlign: 'center',
      textTransform: 'uppercase',
      margin: '0 0 12px 0',
    }}>
      {theme.company.copyright}
    </Text>
    <Text style={{
      fontSize: '11px',
      fontFamily: theme.fonts.heading,
      textAlign: 'center',
      margin: '0 0 12px 0',
    }}>
      <Link href={theme.company.unsubscribeUrl} style={{ color: theme.colors.text, textDecoration: 'none' }}>UNSUBSCRIBE</Link>
      <span style={{ padding: '0 8px', color: theme.colors.secondary }}>•</span>
      <Link href={theme.company.privacyUrl} style={{ color: theme.colors.text, textDecoration: 'none' }}>PRIVACY</Link>
    </Text>
    <Text style={{
      fontSize: '11px',
      fontFamily: theme.fonts.heading,
      color: theme.colors.secondary,
      textAlign: 'center',
      textTransform: 'uppercase',
      margin: '0',
    }}>
      {theme.company.address}
    </Text>
  </Section>
);
