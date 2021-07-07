import { Context, HttpRequest } from '@azure/functions';
import { verifyWebhook } from '../core/rapyd/verifyWebhook';
import { onPaymentCompleted } from '../core/webhooks/onPaymentCompleted';

interface Webhook {
  id: `wh_${string}`;
  type: 'PAYMENT_COMPLETED';
  data: any;
  trigger_operation_id: string;
  status: 'NEW' | unknown;
  created_at: string;
}

export default async function (context: Context, req: HttpRequest) {
  await verifyWebhook(req);

  const webhook = req.body as Webhook;

  switch (webhook.type) {
    case 'PAYMENT_COMPLETED': {
      await onPaymentCompleted(webhook.data);
      break;
    }
    default: {
      return { status: 400, body: `Unknown webhook type "${webhook.type}".` };
    }
  }

  return { status: 200, body: 'OK' };
};
