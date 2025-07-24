import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Fuel, TrendingUp, Truck, BarChart3 } from 'lucide-react';

interface FuelData {
  totalSpending: number;
  avgCostPerMile: number;
  avgMPG: number;
  byDriver: {
    driverId: string;
    driverName: string;
    totalSpent: number;
    totalMiles: number;
    avgMPG: number;
    totalGallons: number;
    lastTransaction: string;
  }[];
}

export function FuelSpending() {
  const [fuelData, setFuelData] = useState<FuelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFuelData();
  }, []);

  const fetchFuelData = async () => {
    try {
      const response = await fetch('/api/accounting/fuel');
      if (response.ok) {
        const data = await response.json();
        setFuelData(data);
      }
    } catch (error) {
      console.error('Failed to fetch fuel data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 1) => {
    return num.toFixed(decimals);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Fuel Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!fuelData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Fuel Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Fuel className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No fuel data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Fuel Management & Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <Fuel className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">Total Spending</p>
              <p className="text-xl font-bold">{formatCurrency(fuelData.totalSpending)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Cost per Mile</p>
              <p className="text-xl font-bold">${formatNumber(fuelData.avgCostPerMile, 2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Average MPG</p>
              <p className="text-xl font-bold">{formatNumber(fuelData.avgMPG)} mpg</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <Truck className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Drivers</p>
              <p className="text-xl font-bold">{fuelData.byDriver.length}</p>
            </div>
          </div>
        </div>

        {/* Driver Breakdown */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Fuel Spending by Driver</h3>
          {fuelData.byDriver.length === 0 ? (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No driver fuel data available</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Miles Driven</TableHead>
                  <TableHead>Gallons Used</TableHead>
                  <TableHead>Avg MPG</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Last Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelData.byDriver.map((driver) => {
                  const efficiency = driver.avgMPG >= fuelData.avgMPG ? 'good' : 
                                   driver.avgMPG >= fuelData.avgMPG * 0.9 ? 'average' : 'poor';
                  
                  return (
                    <TableRow key={driver.driverId}>
                      <TableCell className="font-medium">{driver.driverName}</TableCell>
                      <TableCell>{formatCurrency(driver.totalSpent)}</TableCell>
                      <TableCell>{driver.totalMiles.toLocaleString()} mi</TableCell>
                      <TableCell>{formatNumber(driver.totalGallons)} gal</TableCell>
                      <TableCell>{formatNumber(driver.avgMPG)} mpg</TableCell>
                      <TableCell>
                        <Badge variant={
                          efficiency === 'good' ? 'default' :
                          efficiency === 'average' ? 'secondary' : 'destructive'
                        }>
                          {efficiency.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(driver.lastTransaction).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Fuel Efficiency Insights */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Fuel Efficiency Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">
                <strong>Best Performer:</strong> {
                  fuelData.byDriver.length > 0 
                    ? fuelData.byDriver.reduce((best, driver) => 
                        driver.avgMPG > best.avgMPG ? driver : best
                      ).driverName
                    : 'No data'
                } ({
                  fuelData.byDriver.length > 0 
                    ? formatNumber(Math.max(...fuelData.byDriver.map(d => d.avgMPG)))
                    : '0'
                } mpg)
              </p>
            </div>
            <div>
              <p className="text-blue-700">
                <strong>Fleet Average:</strong> {formatNumber(fuelData.avgMPG)} mpg
              </p>
            </div>
            <div>
              <p className="text-blue-700">
                <strong>Potential Savings:</strong> Improving fleet efficiency by 1 mpg could save approximately {
                  formatCurrency(fuelData.totalSpending * 0.15)
                } monthly
              </p>
            </div>
            <div>
              <p className="text-blue-700">
                <strong>Cost Analysis:</strong> Current fuel spending represents {
                  formatNumber((fuelData.totalSpending / (fuelData.totalSpending * 1.33)) * 100)
                }% of estimated total operating costs
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}