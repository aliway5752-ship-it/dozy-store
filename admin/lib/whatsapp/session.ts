import mongoose from 'mongoose';
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';

// MongoDB Schema for WhatsApp Session Storage
const WhatsAppSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  sessionData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const WhatsAppSession = mongoose.models.WhatsAppSession || mongoose.model('WhatsAppSession', WhatsAppSessionSchema);

// MongoDB Adapter for Baileys Session Storage
export class MongoDBSessionStore {
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async save(id: string, data: any) {
    try {
      await WhatsAppSession.findOneAndUpdate(
        { sessionId: this.sessionId },
        { sessionData: { id, data }, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('[WhatsApp Session] Save error:', error);
    }
  }

  async delete(id: string) {
    try {
      await WhatsAppSession.deleteOne({ sessionId: this.sessionId });
    } catch (error) {
      console.error('[WhatsApp Session] Delete error:', error);
    }
  }

  async get(id: string) {
    try {
      const session = await WhatsAppSession.findOne({ sessionId: this.sessionId });
      return session?.sessionData?.data;
    } catch (error) {
      console.error('[WhatsApp Session] Get error:', error);
      return null;
    }
  }
}

export { WhatsAppSession };
