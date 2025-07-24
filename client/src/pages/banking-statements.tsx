import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, Search, FileText, Filter, Eye } from "lucide-react";

export default function BankingStatements() {
  const statements = [
    {
      id: "stmt-202412",
      period: "December 2024",
      startDate: "Dec 01, 2024",
      endDate: "Dec 31, 2024",
      status: "current",
      openingBalance: 15420.75,
      closingBalance: 18932.50,
      totalDeposits: 12500.00,
      totalWithdrawals: 8988.25,
      transactionCount: 47
    },
    {
      id: "stmt-202411",
      period: "November 2024",
      startDate: "Nov 01, 2024",
      endDate: "Nov 30, 2024",
      status: "available",
      openingBalance: 12350.25,
      closingBalance: 15420.75,
      totalDeposits: 18750.00,
      totalWithdrawals: 15679.50,
      transactionCount: 62
    },
    {
      id: "stmt-202410",
      period: "October 2024",
      startDate: "Oct 01, 2024",
      endDate: "Oct 31, 2024",
      status: "available",
      openingBalance: 9875.50,
      closingBalance: 12350.25,
      totalDeposits: 22100.00,
      totalWithdrawals: 19625.25,
      transactionCount: 58
    },
    {
      id: "stmt-202409",
      period: "September 2024",
      startDate: "Sep 01, 2024",
      endDate: "Sep 30, 2024",
      status: "available",
      openingBalance: 8932.75,
      closingBalance: 9875.50,
      totalDeposits: 15650.00,
      totalWithdrawals: 14707.25,
      transactionCount: 43
    },
    {
      id: "stmt-202408",
      period: "August 2024",
      startDate: "Aug 01, 2024",
      endDate: "Aug 31, 2024",
      status: "available",
      openingBalance: 7421.00,
      closingBalance: 8932.75,
      totalDeposits: 19800.00,
      totalWithdrawals: 18288.25,
      transactionCount: 51
    }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Statements</h1>
          <p className="text-gray-600">View and download your monthly account statements</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Statements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Select defaultValue="2024">
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quarter">Quarter</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All quarters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q4">Q4 (Oct-Dec)</SelectItem>
                    <SelectItem value="q3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="q2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="q1">Q1 (Jan-Mar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search statements..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statements List */}
        <div className="space-y-4">
          {statements.map((statement) => (
            <Card key={statement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{statement.period}</h3>
                        <Badge 
                          variant={statement.status === 'current' ? 'default' : 'secondary'}
                          className={statement.status === 'current' ? 'bg-blue-100 text-blue-800' : ''}
                        >
                          {statement.status === 'current' ? 'Current Period' : 'Available'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {statement.startDate} - {statement.endDate}
                      </div>
                      <div className="text-sm text-gray-500">
                        {statement.transactionCount} transactions
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <div className="text-center lg:text-left">
                      <div className="text-xs text-gray-500 mb-1">Opening Balance</div>
                      <div className="font-semibold text-gray-900">${statement.openingBalance.toFixed(2)}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-xs text-gray-500 mb-1">Closing Balance</div>
                      <div className="font-semibold text-gray-900">${statement.closingBalance.toFixed(2)}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-xs text-gray-500 mb-1">Total Deposits</div>
                      <div className="font-semibold text-green-600">+${statement.totalDeposits.toFixed(2)}</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-xs text-gray-500 mb-1">Total Withdrawals</div>
                      <div className="font-semibold text-red-600">-${statement.totalWithdrawals.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statement Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Statement Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  <div className="font-medium">Bulk Download</div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Download multiple statements at once
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Select Multiple
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div className="font-medium">Auto-Delivery</div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Get statements emailed automatically
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Setup Email
                </Button>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="font-medium">Custom Reports</div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  Generate custom date range reports
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Create Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statement Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Statement Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <strong>Statement Generation:</strong> Monthly statements are generated on the 1st business day of each month for the previous month's activity.
              </div>
              <div>
                <strong>Statement Retention:</strong> Statements are available online for 7 years. Older statements can be requested through customer support.
              </div>
              <div>
                <strong>File Formats:</strong> Statements are available in PDF format for viewing and printing. CSV exports are available for accounting software integration.
              </div>
              <div>
                <strong>Email Delivery:</strong> Enable auto-delivery to receive statements via email as soon as they're available. Multiple email addresses can be configured.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}