// import { CNGStation } from '@/constants/stations';
// price updates functionlity
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
  private readonly MAX_HISTORY_LENGTH = 100; // Keep last 100 updates
  private readonly MAX_PRICE_CHANGE = 0.5; // Maximum 50 paise change
  private readonly UPDATE_BATCH_SIZE = 3; // Update 3 stations at a time

  constructor() {
    this.initializeStations();
  }

  private async initializeStations() {
    try {
      const { stations } = await import('@/constants/stations');
      stations.forEach(station => {
        this.priceHistory[station.id] = {
          currentPrice: station.price,
          history: []
        };
      });
    } catch (error) {
      console.error('Error initializing price history:', error);
    }
  }

  setUpdateInterval(minutes: number) {
    if (minutes < 1) {
      console.warn('Update interval cannot be less than 1 minute');
      minutes = 1;
    }
    this.updateInterval = minutes * 60 * 1000;
    if (this.isConnected) {
      this.reconnect();
    }
  }

  private reconnect() {
    this.disconnect();
    this.connect();
  }

  connect() {
    if (this.intervalId) {
      console.warn('Price update service is already connected');
      return;
    }

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
    if (typeof callback !== 'function') {
      console.error('Invalid callback provided to price update service');
      return () => {};
    }

    this.listeners.push(callback);
    
    // Send current prices to new subscriber
    const currentPrices = this.getCurrentPrices();
    callback(currentPrices);

    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private getCurrentPrices(): PriceUpdate[] {
    return Object.entries(this.priceHistory).map(([stationId, data]) => ({
      stationId,
      newPrice: data.currentPrice,
      timestamp: this.lastUpdate,
      change: 0
    }));
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
        const station = this.priceHistory[update.stationId];
        if (!station) {
          this.priceHistory[update.stationId] = {
            currentPrice: update.newPrice,
            history: [update]
          };
          return;
        }

        station.currentPrice = update.newPrice;
        station.history.unshift(update);

        // Limit history length
        if (station.history.length > this.MAX_HISTORY_LENGTH) {
          station.history = station.history.slice(0, this.MAX_HISTORY_LENGTH);
        }
      });

      if (updates.length > 0) {
        this.notifyListeners(updates);
      }
    } catch (error) {
      console.error('Error generating price updates:', error);
    }
  }

  private generatePriceUpdates(): PriceUpdate[] {
    const updates: PriceUpdate[] = [];
    const timestamp = Date.now();
    const stationIds = Object.keys(this.priceHistory);
    
    // Randomly select stations to update
    const selectedStations = this.getRandomStations(stationIds, this.UPDATE_BATCH_SIZE);
    
    selectedStations.forEach(stationId => {
      const currentPrice = this.getCurrentPrice(stationId) || 85;
      const priceChange = this.calculatePriceChange(timestamp);
      const newPrice = Math.max(0, Math.round((currentPrice + priceChange) * 100) / 100);
      
      updates.push({
        stationId,
        newPrice,
        timestamp,
        change: priceChange
      });
    });

    return updates;
  }

  private getRandomStations(stationIds: string[], count: number): string[] {
    const shuffled = [...stationIds].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private calculatePriceChange(timestamp: number): number {
    // Market trend based on time of day (24-hour cycle)
    const hourOfDay = new Date(timestamp).getHours();
    const marketTrend = Math.sin((hourOfDay / 24) * Math.PI * 2) * 0.1;
    
    // Random fluctuation
    const randomChange = (Math.random() * 2 - 1) * this.MAX_PRICE_CHANGE;
    
    return marketTrend + randomChange;
  }
}

export const priceUpdateService = new PriceUpdateService();
