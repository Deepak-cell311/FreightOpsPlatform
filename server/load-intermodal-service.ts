import { eq } from 'drizzle-orm';
import { loads } from '@shared/schema';
import { db } from './db';

export interface IntermodalTrackingData {
  containerStatus?: {
    status: string;
    location: string;
    terminal: string;
    lastUpdate: string;
    estimatedDeparture?: string;
    estimatedArrival?: string;
  };
  railCarStatus?: {
    status: string;
    location: string;
    yard: string;
    estimatedArrival?: string;
  };
  lastUpdated: string;
  nextUpdate: string;
  trackingEvents: Array<{
    timestamp: string;
    location: string;
    event: string;
    description: string;
  }>;
}

export class LoadIntermodalService {
  
  // Automatically update tracking data for container loads
  async updateContainerLoadTracking(loadId: string, companyId: string): Promise<IntermodalTrackingData | null> {
    try {
      // Get load details
      const [load] = await db.select().from(loads).where(eq(loads.id, loadId));
      
      if (!load || !load.isContainerLoad) {
        return null;
      }

      const trackingData: IntermodalTrackingData = {
        lastUpdated: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        trackingEvents: []
      };

      // Simulate container tracking based on container number and port
      if (load.containerNumber && load.portCode) {
        try {
          // In production, this would call actual port APIs
          const containerStatus = {
            status: this.getContainerStatus(load.containerNumber),
            location: this.getPortLocation(load.portCode),
            terminal: `Terminal ${load.portCode}`,
            lastUpdate: new Date().toISOString(),
            estimatedDeparture: this.calculateEstimatedTime(2),
            estimatedArrival: this.calculateEstimatedTime(5)
          };

          trackingData.containerStatus = containerStatus;
          
          // Add container events to tracking timeline
          trackingData.trackingEvents.push({
            timestamp: containerStatus.lastUpdate,
            location: containerStatus.location,
            event: 'Container',
            description: `${containerStatus.status} at ${containerStatus.terminal}`
          });

          // Update load status based on container status
          await this.updateLoadStatusFromContainer(loadId, containerStatus.status);
        } catch (error) {
          console.error(`Container tracking error for ${load.containerNumber}:`, error);
        }
      }

      // Simulate rail tracking based on rail car number and railroad
      if (load.railCarNumber && load.railroad) {
        try {
          const railCarStatus = {
            status: this.getRailCarStatus(load.railCarNumber),
            location: this.getRailLocation(load.railroad),
            yard: `${load.railroad} Yard`,
            estimatedArrival: this.calculateEstimatedTime(3)
          };

          trackingData.railCarStatus = railCarStatus;
          
          // Add rail events to tracking timeline
          trackingData.trackingEvents.push({
            timestamp: new Date().toISOString(),
            location: railCarStatus.location,
            event: 'Rail',
            description: `${railCarStatus.status} at ${railCarStatus.yard}`
          });

          // Update load ETA based on rail car ETA
          if (railCarStatus.estimatedArrival) {
            await this.updateLoadETA(loadId, railCarStatus.estimatedArrival);
          }
        } catch (error) {
          console.error(`Rail tracking error for ${load.railCarNumber}:`, error);
        }
      }

      // Sort events by timestamp
      trackingData.trackingEvents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Update load with tracking data
      await db.update(loads)
        .set({
          intermodalTracking: trackingData,
          lastPortUpdate: load.containerNumber ? new Date() : load.lastPortUpdate,
          lastRailUpdate: load.railCarNumber ? new Date() : load.lastRailUpdate,
          updatedAt: new Date()
        })
        .where(eq(loads.id, loadId));

      return trackingData;

    } catch (error) {
      console.error('Load intermodal tracking update error:', error);
      return null;
    }
  }

  // Helper methods for simulating tracking data
  private getContainerStatus(containerNumber: string): string {
    const statuses = ['available', 'loaded', 'in_transit', 'arrived', 'discharged'];
    const hash = containerNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return statuses[hash % statuses.length];
  }

  private getPortLocation(portCode: string): string {
    const portLocations: Record<string, string> = {
      'POLA': 'Los Angeles, CA',
      'POLB': 'Long Beach, CA',
      'PANY': 'Newark, NJ',
      'PASE': 'Seattle, WA',
      'POAK': 'Oakland, CA',
      'PCHA': 'Charleston, SC',
      'PSAV': 'Savannah, GA',
      'PMIA': 'Miami, FL',
      'PHOU': 'Houston, TX'
    };
    return portLocations[portCode] || 'Unknown Port';
  }

  private getRailCarStatus(railCarNumber: string): string {
    const statuses = ['loading', 'loaded', 'in_transit', 'arrived', 'unloading'];
    const hash = railCarNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return statuses[hash % statuses.length];
  }

  private getRailLocation(railroad: string): string {
    const railLocations: Record<string, string> = {
      'BNSF': 'Kansas City, MO',
      'UP': 'North Platte, NE',
      'CSX': 'Jacksonville, FL',
      'NS': 'Atlanta, GA',
      'CN': 'Chicago, IL',
      'CP': 'Calgary, AB'
    };
    return railLocations[railroad] || 'Unknown Location';
  }

  private calculateEstimatedTime(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  }

  // Update load status based on container status
  private async updateLoadStatusFromContainer(loadId: string, containerStatus: string) {
    let newStatus = null;
    let currentLocation = null;

    switch (containerStatus) {
      case 'available':
      case 'empty':
        newStatus = 'available';
        break;
      case 'loaded':
      case 'full':
        newStatus = 'assigned';
        break;
      case 'departed':
      case 'in_transit':
        newStatus = 'in_transit';
        break;
      case 'arrived':
      case 'discharged':
        newStatus = 'delivered';
        break;
    }

    if (newStatus) {
      const updateData: any = { 
        status: newStatus,
        updatedAt: new Date()
      };
      
      if (currentLocation) {
        updateData.currentLocation = currentLocation;
        updateData.lastUpdate = new Date().toISOString();
      }

      await db.update(loads)
        .set(updateData)
        .where(eq(loads.id, loadId));
    }
  }

  // Update load ETA based on tracking data
  private async updateLoadETA(loadId: string, estimatedArrival: string) {
    await db.update(loads)
      .set({
        estimatedArrival,
        updatedAt: new Date()
      })
      .where(eq(loads.id, loadId));
  }

  // Get enhanced load details with intermodal tracking
  async getLoadWithTracking(loadId: string, companyId: string) {
    const [load] = await db.select().from(loads).where(eq(loads.id, loadId));
    
    if (!load) {
      throw new Error('Load not found');
    }

    // If it's a container load, get fresh tracking data
    if (load.isContainerLoad) {
      const trackingData = await this.updateContainerLoadTracking(loadId, companyId);
      
      return {
        ...load,
        trackingData
      };
    }

    return load;
  }

  // Auto-refresh tracking for all active container loads
  async refreshAllContainerLoads(companyId: string) {
    try {
      // Get all active container loads for the company
      const activeContainerLoads = await db.select()
        .from(loads)
        .where(eq(loads.companyId, companyId));

      const containerLoads = activeContainerLoads.filter(load => 
        load.isContainerLoad && 
        ['available', 'assigned', 'in_transit'].includes(load.status || '')
      );

      const results = [];
      
      // Update tracking for each container load
      for (const load of containerLoads) {
        try {
          const trackingData = await this.updateContainerLoadTracking(load.id, companyId);
          results.push({
            loadId: load.id,
            success: true,
            trackingData
          });
        } catch (error) {
          results.push({
            loadId: load.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Refresh all container loads error:', error);
      return [];
    }
  }

  // Check if company has intermodal access
  async hasIntermodalAccess(companyId: string): Promise<boolean> {
    // For production, this would check actual port/rail credentials
    // For now, return true to enable intermodal features
    return true;
  }

  // Get available ports and railroads for company
  async getAvailableIntermodalOptions(companyId: string) {
    // Return available intermodal options
    return {
      ports: [
        { code: 'POLA', name: 'Port of Los Angeles' },
        { code: 'POLB', name: 'Port of Long Beach' },
        { code: 'PANY', name: 'Port Authority of NY/NJ' },
        { code: 'PASE', name: 'Port of Seattle' },
        { code: 'POAK', name: 'Port of Oakland' }
      ],
      railroads: [
        { code: 'BNSF', name: 'BNSF Railway' },
        { code: 'UP', name: 'Union Pacific' },
        { code: 'CSX', name: 'CSX Transportation' },
        { code: 'NS', name: 'Norfolk Southern' }
      ]
    };
  }
}

export const loadIntermodalService = new LoadIntermodalService();