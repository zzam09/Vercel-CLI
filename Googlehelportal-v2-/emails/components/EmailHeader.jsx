import React from 'react';
import { Section, Text } from '@react-email/components';
import { theme } from '../theme.js';

export const EmailHeader = () => (
  <Section style={{ padding: '40px 0' }}>
    <Text style={{
      fontSize: '20px',
      fontWeight: '900',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      fontFamily: theme.fonts.heading,
      color: theme.colors.text,
      margin: '0',
    }}>
      {theme.company.name}
    </Text>
  </Section>
);
