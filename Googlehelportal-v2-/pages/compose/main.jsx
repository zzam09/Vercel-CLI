import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MailComposer from './MailComposer.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MailComposer />
  </StrictMode>
);
