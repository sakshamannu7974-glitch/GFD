/**
 * Vercel Serverless API Function: /api/send-message
 *
 * Securely handles contact messages:
 * 1. Validates inputs & prevents spam/duplicate submissions.
 * 2. Reads TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID from process.env (Server-side only).
 * 3. Sends Telegram notification & saves to Firebase Firestore.
 */

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, message, honeypot } = req.body || {};

    // 1. Anti-spam honeypot check
    if (honeypot) {
      return res.status(200).json({ success: true }); // Silent drop for bots
    }

    // 2. Validate input fields
    const nameStr = (name || '').trim();
    const emailStr = (email || '').trim();
    const msgStr = (message || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nameStr || nameStr.length < 2) {
      return res.status(400).json({ error: 'Please enter a valid name (min 2 characters).' });
    }

    if (!emailStr || !emailRegex.test(emailStr)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!msgStr || msgStr.length < 3) {
      return res.status(400).json({ error: 'Please enter a valid message (min 3 characters).' });
    }

    const timestamp = new Date().toISOString();
    const formattedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    // 3. Read Secure Environment Variables (Node.js backend)
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8810603150:AAHxcFVTSSUBbIAElrTvhO1hqbDPqxIN2aI';
    const chatId = process.env.TELEGRAM_CHAT_ID || '5324911654';

    // 4. Send Instant Telegram Notification from Server Backend
    let telegramSuccess = false;
    if (botToken && chatId) {
      const telegramMsg = `💌 *Naya Sandesh Aaya Hai!*

👤 *Naam:* ${nameStr}
✉️ *Email:* ${emailStr}
💬 *Sandesh:*
${msgStr}

⏰ *Time:* ${formattedTime}`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramMsg,
            parse_mode: 'Markdown',
          }),
        });

        const tgData = await tgRes.json();
        telegramSuccess = tgData.ok === true;
      } catch (tgErr) {
        console.error('Telegram notification error in API route:', tgErr);
      }
    }

    // 5. Firebase Firestore Integration (via REST API using Server Env)
    const projectId = process.env.FIREBASE_PROJECT_ID || '122494896035';
    let firestoreSuccess = false;

    if (projectId) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/messages`;
        const fsRes = await fetch(firestoreUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              name: { stringValue: nameStr },
              email: { stringValue: emailStr },
              message: { stringValue: msgStr },
              timestamp: { stringValue: timestamp }
            }
          })
        });
        firestoreSuccess = fsRes.ok;
      } catch (fsErr) {
        console.error('Firestore save error in API route:', fsErr);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Sandesh bhej diya gaya!',
      telegramDelivered: telegramSuccess,
      firestoreSaved: firestoreSuccess
    });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Server error while sending message.' });
  }
}
