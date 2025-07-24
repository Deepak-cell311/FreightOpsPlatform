import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, FileText, Download, Calendar } from 'lucide-react';

export function ReportPanel() {
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!reportType) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });
      
      const response = await fetch(`/api/accounting/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Financial Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Generation Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                <SelectItem value="invoice_status">Invoice Status</SelectItem>
                <SelectItem value="cash_flow">Cash Flow</SelectItem>
                <SelectItem value="customer_aging">Customer Aging</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button 
              onClick={generateReport} 
              disabled={!reportType || loading}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {reportData.type === 'profit_loss' && 'Profit & Loss Statement'}
                {reportData.type === 'invoice_status' && 'Invoice Status Report'}
                {reportData.type === 'cash_flow' && 'Cash Flow Report'}
                {reportData.type === 'customer_aging' && 'Customer Aging Report'}
              </h3>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>

            {reportData.type === 'profit_loss' && (
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Period</p>
                    <p className="font-medium">
                      {reportData.period.startDate ? 
                        `${new Date(reportData.period.startDate).toLocaleDateString()} - ${new Date(reportData.period.endDate).toLocaleDateString()}` :
                        'All Time'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Loads</p>
                    <p className="font-medium">{reportData.loads}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Revenue</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(reportData.revenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(reportData.expenses)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Net Income</span>
                    <span className={reportData.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(reportData.netIncome)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {reportData.type === 'invoice_status' && (
              <div className="border rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Invoices</p>
                    <p className="font-medium">{reportData.totalInvoices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">{formatCurrency(reportData.totalAmount)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(reportData.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="capitalize">{status}</span>
                      <span className="font-medium">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Monthly P&L</p>
                  <p className="text-2xl font-bold">$24,580</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Outstanding AR</p>
                  <p className="text-2xl font-bold">$15,240</p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cash Flow</p>
                  <p className="text-2xl font-bold text-green-600">+$8,920</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}