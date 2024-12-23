import { CNGStation } from '@/constants/stations';

interface PriceUpdate {
  stationId: string;
  newPrice: number;
  timestamp: number;
  change: number;
}

interface PriceHistory {
  [stationId: string]: {
    currentPrice: number;
    history: PriceUpdate[];
  };
}

class PriceUpdateService {
  private listeners: ((updates: PriceUpdate[]) => void)[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private priceHistory: PriceHistory = {};
  private updateInterval: number = 5 * 60 * 1000; // 5 minutes default
  private lastUpdate: number = Date.now();
  private isConnected: boolean = false;

  constructor() {
    // Initialize price history for all stations
    import('@/constants/stations').then(({ stations }) => {
      stations.forEach(station => {
        this.priceHistory[station.id] = {
          currentPrice: station.price,
          history: []
        };
      });
    });
  }

  setUpdateInterval(minutes: number) {
    this.updateInterval = minutes * 60 * 1000;
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }

  connect() {
    if (this.intervalId) return;

    this.isConnected = true;
    this.intervalId = setInterval(() => {
      this.generateAndNotifyUpdates();
    }, this.updateInterval);

    // Generate initial update
    this.generateAndNotifyUpdates();
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
  }

  subscribe(callback: (updates: PriceUpdate[]) => void) {
    this.listeners.push(callback);
    
    // Immediately send current prices to new subscriber
    const currentPrices = Object.entries(this.priceHistory).map(([stationId, data]) => ({
      stationId,
      newPrice: data.currentPrice,
      timestamp: this.lastUpdate,
      change: 0
    }));
    callback(currentPrices);

    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  getPriceHistory(stationId: string) {
    return this.priceHistory[stationId]?.history || [];
  }

  getCurrentPrice(stationId: string) {
    return this.priceHistory[stationId]?.currentPrice;
  }

  private notifyListeners(updates: PriceUpdate[]) {
    this.listeners.forEach(listener => {
      try {
        listener(updates);
      } catch (error) {
        console.error('Error notifying price update listener:', error);
      }
    });
  }

  private generateAndNotifyUpdates() {
    try {
      const updates = this.generatePriceUpdates();
      this.lastUpdate = Date.now();

      // Update price history
      updates.forEach(update => {
        if (!this.priceHistory[update.stationId]) {
          this.priceHistory[update.stationId] = {
            currentPrice: update.newPrice,
            history: []
          };
        }

        const station = this.priceHistory[update.stationId];
        station.history.push(update);
        station.currentPrice = update.newPrice;

        // Keep only last 24 hours of history
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        station.history = station.history.filter(update => update.timestamp >= oneDayAgo);
      });

      this.notifyListeners(updates);
    } catch (error) {
      console.error('Error generating price updates:', error);
    }
  }

  private generatePriceUpdates(): PriceUpdate[] {
    const updates: PriceUpdate[] = [];
    const numberOfUpdates = Math.floor(Math.random() * 3) + 1; // 1-3 updates
    const timestamp = Date.now();

    for (let i = 0; i < numberOfUpdates; i++) {
      const stationId = String(Math.floor(Math.random() * 4) + 1);
      const currentPrice = this.getCurrentPrice(stationId) || 85;
      
      // More realistic price changes: smaller, market-driven fluctuations
      const maxChange = 0.2; // Maximum 20 paise change
      const marketTrend = Math.sin(timestamp / (24 * 60 * 60 * 1000)) * 0.1; // Daily price trend
      const randomFactor = (Math.random() * 2 - 1) * maxChange;
      const priceChange = marketTrend + randomFactor;
      
      const newPrice = Math.round((currentPrice + priceChange) * 100) / 100;
      
      updates.push({
        stationId,
        newPrice,
        timestamp,
        change: priceChange
      });
    }

    return updates;
  }
}

export const priceUpdateService = new PriceUpdateService();
