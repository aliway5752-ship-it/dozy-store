import makeWASocket, { DisconnectReason, WASocket, initAuthCreds } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';

// Singleton WhatsApp Client
let whatsappClient: WASocket | null = null;
let isInitializing = false;
let connectionOpenPromise: Promise<void> | null = null;
let resolveConnectionOpen: (() => void) | null = null;

const logger = pino({ level: 'silent' });

// Simple file-based auth state for serverless compatibility
// Use /tmp directory for Vercel compatibility (only writable directory)
const authPath = path.join('/tmp', 'whatsapp_auth');

// Safe write wrapper to ensure data is always stringified
const safeWrite = (filePath: string, data: any) => {
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  fs.writeFileSync(filePath, stringData);
  console.log(`[FILE-SYSTEM] Successfully wrote to ${filePath}. Type: ${typeof stringData}`);
};

async function useAuthState() {
  const credsPath = path.join(authPath, 'creds.json');

  // Clean start: Remove any corrupted cache
  try {
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
      console.log('[FILE-SYSTEM] Cleaned /tmp/whatsapp_auth directory');
    }
  } catch (cleanupError) {
    console.log('[FILE-SYSTEM] No existing auth directory to clean (or cleanup failed):', cleanupError);
  }

  let creds: any;
  let isNewSession = false;

  // Check for pre-authenticated session data from environment variable
  const sessionDataEnv = process.env.WHATSAPP_SESSION_DATA;

  if (sessionDataEnv) {
    try {
      console.log('[WhatsApp] Using pre-authenticated session from environment variable');
      const sessionData = JSON.parse(sessionDataEnv);
      creds = sessionData.creds || sessionData;
      isNewSession = false;

      // Create auth directory
      if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
      }

      // Write creds using safeWrite
      safeWrite(credsPath, creds);

      // If the session data includes keys, we need to handle them
      if (sessionData.keys) {
        const keys: { [key: string]: any } = {};
        for (const [key, value] of Object.entries(sessionData.keys)) {
          const keyPath = path.join(authPath, key);
          const keyDir = path.dirname(keyPath);
          if (!fs.existsSync(keyDir)) {
            fs.mkdirSync(keyDir, { recursive: true });
          }
          safeWrite(keyPath, value);
          keys[key] = value;
        }
      }
    } catch (error) {
      console.error('[WhatsApp] Failed to parse WHATSAPP_SESSION_DATA:', error);
      console.error('[WhatsApp] Error type:', typeof error);
      console.error('[WhatsApp] Error details:', error instanceof Error ? error.message : error);
      // Fall back to file-based auth
      try {
        creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
      } catch {
        creds = initAuthCreds();
        isNewSession = true;
        if (!fs.existsSync(authPath)) {
          fs.mkdirSync(authPath, { recursive: true });
        }
        safeWrite(credsPath, creds);
      }
    }
  } else {
    // No environment variable, use file-based auth
    try {
      creds = JSON.parse(fs.readFileSync(credsPath, 'utf-8'));
    } catch {
      creds = initAuthCreds();
      isNewSession = true;
      if (!fs.existsSync(authPath)) {
        fs.mkdirSync(authPath, { recursive: true });
      }
      safeWrite(credsPath, creds);
    }
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
          const keyDir = path.dirname(keyPath);
          if (!fs.existsSync(keyDir)) {
            fs.mkdirSync(keyDir, { recursive: true });
          }
          safeWrite(keyPath, value);
        }
      }
    },
    saveCreds: () => {
      try {
        safeWrite(credsPath, creds);
      } catch (error) {
        console.error('[WhatsApp] Failed to save creds:', error);
      }
    },
    isNewSession,
  };
}

export async function getWhatsAppClient(): Promise<WASocket> {
  console.log('[WhatsApp] Client initialization started...');

  // Fast-path: Return existing client if already initialized
  if (whatsappClient) {
    console.log('[WhatsApp] Fast-path: Using existing client');
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
    const { state, saveCreds, isNewSession } = await useAuthState();

    whatsappClient = makeWASocket({
      // @ts-ignore
      auth: state as any,
      printQRInTerminal: false,
      logger,
      browser: ['DozyFashion', 'Chrome', '1.0.0'],
      // Disable history sync for faster connection (crucial for Vercel)
      shouldSyncHistoryMessage: () => false,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      // Socket tuning for maximum speed
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: undefined,
      keepAliveIntervalMs: 10000,
    });

    // Create connection promise with 5-second timeout
    connectionOpenPromise = Promise.race([
      new Promise<void>((resolve) => {
        resolveConnectionOpen = resolve;
      }),
      new Promise<void>((_, reject) => {
        setTimeout(() => {
          console.log('[WhatsApp] Connection wait timeout (5s), throwing CONNECTION_TIMEOUT');
          reject(new Error('CONNECTION_TIMEOUT'));
        }, 5000);
      })
    ]);

    // Request pairing code if this is a new session
    if (isNewSession && whatsappClient) {
      try {
        const phoneNumber = '201505914324';
        console.log('[WhatsApp] Requesting pairing code for:', phoneNumber);
        const pairingCode = await whatsappClient.requestPairingCode(phoneNumber);

        // Log the pairing code type and value for debugging
        console.log('[WhatsApp] Pairing code type:', typeof pairingCode);
        console.log('[WhatsApp] Pairing code value:', pairingCode);
        console.log('--- PAIRING CODE:', pairingCode, '---');
      } catch (error) {
        console.error('[WhatsApp] Failed to request pairing code:', error);
        console.error('[WhatsApp] Error type:', typeof error);
        console.error('[WhatsApp] Error details:', error instanceof Error ? error.message : error);
        console.error('[WhatsApp] Full error object:', JSON.stringify(error, null, 2));
      }
    }

    // Handle connection events
    whatsappClient.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error ? (lastDisconnect.error as Boom)?.output?.statusCode : undefined;

        // Log 401 Unauthorized for expired sessions
        if (statusCode === 401) {
          console.error('[WhatsApp] !!! CRITICAL: Session expired (401 Unauthorized) !!!');
          console.error('[WhatsApp] The WHATSAPP_SESSION_DATA environment variable may need to be updated');
        }

        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log('[WhatsApp] Connection closed, reconnecting...');
          whatsappClient = null;
          isInitializing = false;
          connectionOpenPromise = null;
          resolveConnectionOpen = null;
          getWhatsAppClient();
        } else {
          console.log('[WhatsApp] Connection closed, logged out');
          whatsappClient = null;
          isInitializing = false;
          connectionOpenPromise = null;
          resolveConnectionOpen = null;
        }
      } else if (connection === 'open') {
        console.log('[WhatsApp] Connection opened');
        isInitializing = false;

        // Resolve the connection promise if it exists
        if (resolveConnectionOpen) {
          resolveConnectionOpen();
          resolveConnectionOpen = null;
          connectionOpenPromise = null;
        }

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

    // Wait for connection to be open (with 5-second timeout)
    console.log('[WhatsApp] Waiting for connection to open (max 5s)...');
    await connectionOpenPromise;
    console.log('[WhatsApp] Proceeding with client initialization');

    return whatsappClient;
  } catch (error) {
    console.error('[WhatsApp] Initialization error:', error);
    isInitializing = false;
    if (error instanceof Error && error.message === 'CONNECTION_TIMEOUT') {
      throw error;
    }
    throw error;
  }
}

export async function sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
  try {
    const client = await getWhatsAppClient();

    // Wait for socket to stabilize before sending
    console.log('[WhatsApp] Waiting for socket to stabilize (1500ms)...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('[WhatsApp] Socket stabilized, sending message...');

    // Format phone number (remove +, add country code if needed)
    const formattedPhone = phone.replace(/\D/g, '');

    await client.sendMessage(`${formattedPhone}@s.whatsapp.net`, { text: message });

    console.log(`[WhatsApp] Message sent to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Send message error:', error);

    // Check if error is related to connection closed
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
    if (errorMessage.includes('connection') || errorMessage.includes('closed') || errorMessage.includes('timeout')) {
      console.log('[WhatsApp] Connection error detected, nullifying client for fresh connection');
      whatsappClient = null;
      isInitializing = false;
    }

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
