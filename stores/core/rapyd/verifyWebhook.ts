import crypto from 'crypto';
import { HttpRequest } from '@azure/functions';
import { getRapydClient } from './client';
import { getPublicUrl } from '../getPublicUrl';

export async function verifyWebhook(req: HttpRequest) {
  const rapydClient = await getRapydClient();

  // The service is behind a Cloudflare Worker, so the actual request being made is direct to the "azurewebsites.net" address, not the one provided to Rapyd.
  const publicWebhookUrl = getPublicUrl(new URL(req.url).pathname);

  if (
    !crypto.timingSafeEqual(
      Buffer.from(req.headers.signature),
      Buffer.from(rapydClient.getWebhookSignature(
        publicWebhookUrl,
        req.headers.salt,
        req.headers.timestamp,
        req.rawBody,
      )),
    )
  ) {
    throw new Error('Bad webhook signature.');
  }
}
