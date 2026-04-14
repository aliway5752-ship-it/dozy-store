import makeWASocket, { DisconnectReason, WASocket, initAuthCreds } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';

// Singleton WhatsApp Client
let whatsappClient: WASocket | null = null;
let isInitializing = false;

const logger = pino({ level: 'silent' });

// Simple file-based auth state for serverless compatibility
const authPath = path.join(process.cwd(), 'whatsapp_auth');

async function useAuthState() {
  const credsPath = path.join(authPath, 'creds.json');

  let creds: any;
  try {
    creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
  } catch {
    creds = initAuthCreds();
    if (!fs.existsSync(authPath)) {
      fs.mkdirSync(authPath, { recursive: true });
    }
    fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
  }

  return {
    state: {
      creds,
      keys: {
        get: (key: string) => {
          const keyPath = path.join(authPath, key);
          try {
            return JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
          } catch {
            return null;
          }
        },
        set: (key: string, value: any) => {
          const keyPath = path.join(authPath, key);
          if (!fs.existsSync(path.dirname(keyPath))) {
            fs.mkdirSync(path.dirname(keyPath), { recursive: true });
          }
          fs.writeFileSync(keyPath, JSON.stringify(value, null, 2));
        }
      }
    },
    saveCreds: () => {
      fs.writeFileSync(credsPath, JSON.stringify(creds, null, 2));
    },
  };
}

export async function getWhatsAppClient(): Promise<WASocket> {
  // Return existing client if already initialized
  if (whatsappClient) {
    return whatsappClient;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getWhatsAppClient();
  }

  isInitializing = true;

  try {
    // Use file-based auth state for serverless compatibility
    const { state, saveCreds } = await useAuthState();

    whatsappClient = makeWASocket({
      // @ts-ignore
      auth: state as any,
      printQRInTerminal: false,
      logger,
      browser: ['DozyFashion', 'Chrome', '1.0.0'],
    });

    // Handle connection events
    whatsappClient.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error ? (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut : true;

        if (shouldReconnect) {
          console.log('[WhatsApp] Connection closed, reconnecting...');
          whatsappClient = null;
          isInitializing = false;
          getWhatsAppClient();
        } else {
          console.log('[WhatsApp] Connection closed, logged out');
          whatsappClient = null;
          isInitializing = false;
        }
      } else if (connection === 'open') {
        console.log('[WhatsApp] Connection opened');
        isInitializing = false;

        // Log group invite info for the specified group
        try {
          if (whatsappClient) {
            console.log('--- !!! CRITICAL GROUP ID !!! ---', await whatsappClient.groupGetInviteInfo('IyLaKyOb9dd4XykEuFxy4K'));
          }
        } catch (error) {
          console.log('[WhatsApp] Failed to fetch group invite info:', error);
        }
      }
    });

    whatsappClient.ev.on('creds.update', saveCreds);

    return whatsappClient;
  } catch (error) {
    console.error('[WhatsApp] Initialization error:', error);
    isInitializing = false;
    throw error;
  }
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const client = await getWhatsAppClient();

    // Format phone number (remove +, add country code if needed)
    const formattedPhone = phone.replace(/\D/g, '');

    await client.sendMessage(`${formattedPhone}@s.whatsapp.net`, { text: message });

    console.log(`[WhatsApp] Message sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Send message error:', error);
    return false;
  }
}

export async function disconnectWhatsAppClient(): Promise<void> {
  if (whatsappClient) {
    await whatsappClient.end(undefined);
    whatsappClient = null;
    isInitializing = false;
    console.log('[WhatsApp] Client disconnected');
  }
}
