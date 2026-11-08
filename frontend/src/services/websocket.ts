import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessage, LiveCampaignEvent } from '../types';

export class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  constructor() {
    this.initClient();
  }

  private initClient() {
    const token = localStorage.getItem('autodeal_token');

    this.client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.isConnected = true;
        this.notifyConnectionState(true);
      },
      onDisconnect: () => {
        this.isConnected = false;
        this.notifyConnectionState(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP Error:', frame.headers['message']);
        this.isConnected = false;
        this.notifyConnectionState(false);
      },
      onWebSocketClose: () => {
        this.isConnected = false;
        this.notifyConnectionState(false);
      }
    });

    if (token) {
      this.client.activate();
    }
  }

  public updateToken(token: string | null) {
    if (this.client) {
      this.client.deactivate();
    }
    if (token) {
      this.initClient();
    } else {
      this.isConnected = false;
      this.notifyConnectionState(false);
    }
  }

  public onConnectionChange(cb: (connected: boolean) => void) {
    this.connectionCallbacks.push(cb);
    cb(this.isConnected);
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter(c => c !== cb);
    };
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionCallbacks.forEach(cb => cb(connected));
  }

  public subscribeToCampaignChat(campaignId: string, onMessage: (msg: ChatMessage) => void) {
    if (!this.client || !this.isConnected) {
      // Retry once connected
      const checkAndSub = (connected: boolean) => {
        if (connected && this.client) {
          return this.client.subscribe(`/topic/campaigns/${campaignId}/chat`, (message) => {
            try {
              const body = JSON.parse(message.body);
              onMessage(body);
            } catch (err) {
              console.error('Failed to parse chat message', err);
            }
          });
        }
      };
      return this.onConnectionChange(checkAndSub);
    }

    const sub = this.client.subscribe(`/topic/campaigns/${campaignId}/chat`, (message) => {
      try {
        const body = JSON.parse(message.body);
        onMessage(body);
      } catch (err) {
        console.error('Failed to parse chat message', err);
      }
    });

    return () => sub.unsubscribe();
  }

  public subscribeToCampaignEvents(campaignId: string, onEvent: (event: LiveCampaignEvent) => void) {
    if (!this.client || !this.isConnected) {
      const checkAndSub = (connected: boolean) => {
        if (connected && this.client) {
          return this.client.subscribe(`/topic/campaigns/${campaignId}/events`, (msg) => {
            try {
              const body = JSON.parse(msg.body);
              onEvent(body);
            } catch (err) {
              console.error('Failed to parse campaign event', err);
            }
          });
        }
      };
      return this.onConnectionChange(checkAndSub);
    }

    const sub = this.client.subscribe(`/topic/campaigns/${campaignId}/events`, (msg) => {
      try {
        const body = JSON.parse(msg.body);
        onEvent(body);
      } catch (err) {
        console.error('Failed to parse campaign event', err);
      }
    });

    return () => sub.unsubscribe();
  }

  public sendChatMessage(campaignId: string, content: string) {
    if (!this.client || !this.isConnected) {
      throw new Error('Chat service is reconnecting. Please wait...');
    }

    this.client.publish({
      destination: `/app/campaigns/${campaignId}/chat`,
      body: JSON.stringify({ content }),
    });
  }

  public getIsConnected() {
    return this.isConnected;
  }
}

export const wsService = new WebSocketService();
