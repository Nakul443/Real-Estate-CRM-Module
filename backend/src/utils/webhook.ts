// this file is responsible for triggering the n8n webhook when a new lead is created
// it uses axios to send a POST request to the n8n webhook URL with the lead data

import axios from 'axios';

const N8N_WEBHOOK_URL = 'https://agnayi2026.app.n8n.cloud/webhook/lead-notification';

export const triggerLeadWebhook = async (leadData: any) => {
  try {
    // Using Basic Auth as per your credentials
    await axios.post(N8N_WEBHOOK_URL, leadData, {
      auth: {
        username: 'ankitjoom.agnayi@gmail.com',
        password: 'agnayi@2026'
      }
    });
    console.log('n8n Webhook triggered successfully');
  } catch (error) {
    // We log the error but don't crash the main app if the notification fails
    console.error('Failed to trigger n8n notification', error);
  }
};