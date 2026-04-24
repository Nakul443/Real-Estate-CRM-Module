// this file is responsible for triggering the n8n webhook when a new lead is created
// it uses axios to send a POST request to the n8n webhook URL with the lead data

// utility to trigger n8n workflows based on user-saved settings
import axios from 'axios';
import { prisma } from './prisma.js';

export const triggerLeadWebhook = async (lead: any) => {
  try {
    // 1. Fetch the user's saved webhook URL from their profile
    const user = await prisma.user.findUnique({
      where: { id: lead.agentId },
      select: { webhookUrl: true }
    });

    // 2. If the user hasn't set a URL yet, stop here
    if (!user?.webhookUrl) {
      console.log("No webhook URL configured for agent:", lead.agentId);
      return;
    }

    // 3. POST the lead data to n8n
    // This allows you to build workflows for auto-emails, WhatsApp alerts, etc.
    const response = await axios.post(user.webhookUrl, {
      event: 'LEAD_CREATED',
      data: lead
    });

    console.log("n8n Webhook Triggered Successfully:", response.status);
  } catch (error) {
    console.error("Critical Webhook Failure:", error instanceof Error ? error.message : error);
    // We don't throw the error here so that the lead creation itself doesn't fail
  }
};