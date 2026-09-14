// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Realtime Socket Client Service
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

type EventCallback = (data: any) => void;

export class SocketService {
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private ws: WebSocket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectIntervalMs: number = 3000;
  private heartbeatTimer: any = null;

  constructor() {
    this.init();
  }

  private init() {
    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:5000').replace(/^http/, 'ws');
    
    // In browser environment, attempt connection
    if (typeof window !== 'undefined') {
      try {
        this.connect(wsUrl);
      } catch {
        // Fallback to in-memory event bus
        this.isConnected = false;
      }
    }
  }

  private connect(url: string) {
    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected', { timestamp: new Date().toISOString() });
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event && parsed.data) {
            this.notifyListeners(parsed.event, parsed.data);
          }
        } catch {
          // Non-json message
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.scheduleReconnect(url);
      };

      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch {
      this.isConnected = false;
    }
  }

  private scheduleReconnect(url: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(url), this.reconnectIntervalMs * this.reconnectAttempts);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  public on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unbind function
    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
      }
    };
  }

  public off(event: string, callback: EventCallback): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  public emit(event: string, data: any): void {
    // Notify local in-memory subscribers
    this.notifyListeners(event, data);

    // If connected, send over socket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }

  public getStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

export const socketService = new SocketService();
