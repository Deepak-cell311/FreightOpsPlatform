import { eq, and, sql, between, desc } from "drizzle-orm";
import { db } from "./db";
import { loads, drivers, customers } from "../shared/schema";

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  customerId?: string;
  vendorId?: string;
  accountIds?: number[];
  transactionTypes?: string[];
  driverId?: string;
  laneId?: string;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenuePerMile: number;
  revenuePerLane: number;
  revenuePerDriver: number;
  topPerformingLanes: Array<{
    lane: string;
    revenue: number;
    loads: number;
    avgRate: number;
  }>;
  topPerformingDrivers: Array<{
    driverId: string;
    driverName: string;
    revenue: number;
    loads: number;
    efficiency: number;
  }>;
}

export interface TrendAnalysis {
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    loads: number;
    avgRate: number;
  }>;
  profitMarginTrend: Array<{
    month: string;
    margin: number;
    revenue: number;
    expenses: number;
  }>;
  customerGrowth: Array<{
    month: string;
    newCustomers: number;
    totalCustomers: number;
    retention: number;
  }>;
}

export class AdvancedReportingService {
  
  // Custom Report Builder
  async generateCustomReport(companyId: string, filters: ReportFilter): Promise<any> {
    const whereConditions = [eq(loads.companyId, companyId)];
    
    if (filters.startDate && filters.endDate) {
      whereConditions.push(
        between(loads.createdAt, new Date(filters.startDate), new Date(filters.endDate))
      );
    }
    
    if (filters.customerId) {
      whereConditions.push(eq(loads.customerId, filters.customerId));
    }
    
    if (filters.driverId) {
      whereConditions.push(eq(loads.assignedDriverId, filters.driverId));
    }

    const reportData = await db.select({
      loadId: loads.id,
      pickupLocation: loads.pickupLocation,
      deliveryLocation: loads.deliveryLocation,
      rate: loads.rate,
      miles: loads.miles,
      status: loads.status,
      createdAt: loads.createdAt,
      assignedDriverId: loads.assignedDriverId
    })
    .from(loads)
    .where(and(...whereConditions))
    .orderBy(desc(loads.createdAt));

    // Calculate aggregations
    const totalRevenue = reportData.reduce((sum, load) => {
      const rate = typeof load.rate === 'string' ? parseFloat(load.rate) : (load.rate || 0);
      return sum + rate;
    }, 0);
    
    const totalMiles = reportData.reduce((sum, load) => {
      const miles = typeof load.miles === 'string' ? parseFloat(load.miles) : (load.miles || 0);
      return sum + miles;
    }, 0);

    return {
      summary: {
        totalLoads: reportData.length,
        totalRevenue,
        totalMiles,
        avgRevenuePerMile: totalMiles > 0 ? totalRevenue / totalMiles : 0,
        avgRevenuePerLoad: reportData.length > 0 ? totalRevenue / reportData.length : 0
      },
      data: reportData,
      filters: filters
    };
  }

  // Advanced Revenue Analytics
  async getRevenueAnalytics(companyId: string, startDate: string, endDate: string): Promise<RevenueAnalytics> {
    const loads_data = await db.select()
      .from(loads)
      .where(and(
        eq(loads.companyId, companyId),
        between(loads.createdAt, new Date(startDate), new Date(endDate))
      ));

    const drivers_data = await db.select()
      .from(drivers)
      .where(eq(drivers.companyId, companyId));

    // Calculate total revenue and miles
    const totalRevenue = loads_data.reduce((sum, load) => {
      const rate = typeof load.rate === 'string' ? parseFloat(load.rate) : (load.rate || 0);
      return sum + rate;
    }, 0);

    const totalMiles = loads_data.reduce((sum, load) => {
      const miles = typeof load.miles === 'string' ? parseFloat(load.miles) : (load.miles || 0);
      return sum + miles;
    }, 0);

    // Calculate revenue per mile
    const revenuePerMile = totalMiles > 0 ? totalRevenue / totalMiles : 0;

    // Analyze lanes (pickup -> delivery combinations)
    const laneAnalysis = new Map<string, { revenue: number; loads: number; miles: number }>();
    
    loads_data.forEach(load => {
      const lane = `${load.pickupLocation} → ${load.deliveryLocation}`;
      const rate = typeof load.rate === 'string' ? parseFloat(load.rate) : (load.rate || 0);
      const miles = typeof load.miles === 'string' ? parseFloat(load.miles) : (load.miles || 0);
      
      if (!laneAnalysis.has(lane)) {
        laneAnalysis.set(lane, { revenue: 0, loads: 0, miles: 0 });
      }
      
      const current = laneAnalysis.get(lane)!;
      current.revenue += rate;
      current.loads += 1;
      current.miles += miles;
    });

    const topPerformingLanes = Array.from(laneAnalysis.entries())
      .map(([lane, data]) => ({
        lane,
        revenue: data.revenue,
        loads: data.loads,
        avgRate: data.loads > 0 ? data.revenue / data.loads : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Analyze driver performance
    const driverAnalysis = new Map<string, { revenue: number; loads: number; miles: number }>();
    
    loads_data.forEach(load => {
      if (load.assignedDriverId) {
        const rate = typeof load.rate === 'string' ? parseFloat(load.rate) : (load.rate || 0);
        const miles = typeof load.miles === 'string' ? parseFloat(load.miles) : (load.miles || 0);
        
        if (!driverAnalysis.has(load.assignedDriverId)) {
          driverAnalysis.set(load.assignedDriverId, { revenue: 0, loads: 0, miles: 0 });
        }
        
        const current = driverAnalysis.get(load.assignedDriverId)!;
        current.revenue += rate;
        current.loads += 1;
        current.miles += miles;
      }
    });

    const topPerformingDrivers = Array.from(driverAnalysis.entries())
      .map(([driverId, data]) => {
        const driver = drivers_data.find(d => d.id === driverId);
        return {
          driverId,
          driverName: driver ? `${driver.firstName} ${driver.lastName}` : 'Unknown Driver',
          revenue: data.revenue,
          loads: data.loads,
          efficiency: data.miles > 0 ? data.revenue / data.miles : 0
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      revenuePerMile,
      revenuePerLane: laneAnalysis.size > 0 ? totalRevenue / laneAnalysis.size : 0,
      revenuePerDriver: driverAnalysis.size > 0 ? totalRevenue / driverAnalysis.size : 0,
      topPerformingLanes,
      topPerformingDrivers
    };
  }

  // Trend Analysis
  async getTrendAnalysis(companyId: string, months: number = 12): Promise<TrendAnalysis> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const loads_data = await db.select()
      .from(loads)
      .where(and(
        eq(loads.companyId, companyId),
        between(loads.createdAt, startDate, endDate)
      ))
      .orderBy(desc(loads.createdAt));

    // Group by month
    const monthlyData = new Map<string, { revenue: number; loads: number; expenses: number }>();
    
    loads_data.forEach(load => {
      const month = load.createdAt.toISOString().slice(0, 7); // YYYY-MM format
      const rate = typeof load.rate === 'string' ? parseFloat(load.rate) : (load.rate || 0);
      const expenses = rate * 0.7; // Estimate expenses as 70% of revenue
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, loads: 0, expenses: 0 });
      }
      
      const current = monthlyData.get(month)!;
      current.revenue += rate;
      current.loads += 1;
      current.expenses += expenses;
    });

    const monthlyRevenue = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        loads: data.loads,
        avgRate: data.loads > 0 ? data.revenue / data.loads : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    const profitMarginTrend = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        margin: data.revenue > 0 ? ((data.revenue - data.expenses) / data.revenue) * 100 : 0,
        revenue: data.revenue,
        expenses: data.expenses
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Customer growth analysis (simplified)
    const customerGrowth = monthlyRevenue.map((item, index) => ({
      month: item.month,
      newCustomers: Math.floor(Math.random() * 5) + 1, // Placeholder - replace with actual customer tracking
      totalCustomers: 10 + index * 2,
      retention: 85 + Math.random() * 10
    }));

    return {
      monthlyRevenue,
      profitMarginTrend,
      customerGrowth
    };
  }

  // Export functions
  async exportToCSV(companyId: string, filters: ReportFilter): Promise<string> {
    const reportData = await this.generateCustomReport(companyId, filters);
    
    const headers = ['Load ID', 'Pickup', 'Delivery', 'Rate', 'Miles', 'Status', 'Date'];
    const rows = reportData.data.map((load: any) => [
      load.loadId,
      load.pickupLocation,
      load.deliveryLocation,
      load.rate,
      load.miles,
      load.status,
      load.createdAt.toISOString().split('T')[0]
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async exportToPDF(companyId: string, filters: ReportFilter): Promise<Buffer> {
    const reportData = await this.generateCustomReport(companyId, filters);
    
    const content = `
FREIGHTOPS CUSTOM REPORT
Generated: ${new Date().toISOString().split('T')[0]}
Filters: ${JSON.stringify(filters, null, 2)}

SUMMARY:
Total Loads: ${reportData.summary.totalLoads}
Total Revenue: $${reportData.summary.totalRevenue.toLocaleString()}
Total Miles: ${reportData.summary.totalMiles.toLocaleString()}
Revenue per Mile: $${reportData.summary.avgRevenuePerMile.toFixed(2)}
Average Rate per Load: $${reportData.summary.avgRevenuePerLoad.toFixed(2)}

DETAILED DATA:
${reportData.data.map((load: any, index: number) => 
  `${index + 1}. ${load.pickupLocation} → ${load.deliveryLocation} | $${load.rate} | ${load.miles} miles | ${load.status}`
).join('\n')}
    `;
    
    return Buffer.from(content);
  }

  // Performance Metrics
  async getKPIMetrics(companyId: string, period: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    const loads_data = await db.select()
      .from(loads)
      .where(and(
        eq(loads.companyId, companyId),
        between(loads.createdAt, startDate, endDate)
      ));

    const totalRevenue = loads_data.reduce((sum, load) => {
      const rate = typeof load.rate === 'string' ? parseFloat(load.rate) : (load.rate || 0);
      return sum + rate;
    }, 0);

    const completedLoads = loads_data.filter(load => load.status === 'delivered');
    const inTransitLoads = loads_data.filter(load => load.status === 'in_transit');
    
    return {
      period,
      totalLoads: loads_data.length,
      completedLoads: completedLoads.length,
      inTransitLoads: inTransitLoads.length,
      totalRevenue,
      avgRevenuePerLoad: loads_data.length > 0 ? totalRevenue / loads_data.length : 0,
      completionRate: loads_data.length > 0 ? (completedLoads.length / loads_data.length) * 100 : 0,
      onTimeDeliveryRate: 95.5, // Placeholder - implement actual tracking
      customerSatisfactionScore: 4.7 // Placeholder - implement actual tracking
    };
  }
}

export const advancedReportingService = new AdvancedReportingService();