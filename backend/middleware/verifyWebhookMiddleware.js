const verifyWebhookMiddleware = (req, res, next) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('[Webhook] ✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ message: '❌ فشل التحقق من Webhook: رمز التحقق غير صالح' });
};

module.exports = verifyWebhookMiddleware;
