import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  Users, 
  MessageCircle 
} from "lucide-react";

export function SupportAnalytics() {
  const ticketTrends = [
    { month: 'Jan', created: 45, resolved: 42, pending: 3 },
    { month: 'Feb', created: 52, resolved: 48, pending: 7 },
    { month: 'Mar', created: 38, resolved: 41, pending: 4 },
    { month: 'Apr', created: 61, resolved: 58, pending: 7 },
    { month: 'May', created: 47, resolved: 45, pending: 9 },
    { month: 'Jun', created: 54, resolved: 52, pending: 11 },
  ];

  const responseTimeData = [
    { hour: '9AM', avgResponse: 12, target: 15 },
    { hour: '10AM', avgResponse: 8, target: 15 },
    { hour: '11AM', avgResponse: 15, target: 15 },
    { hour: '12PM', avgResponse: 22, target: 15 },
    { hour: '1PM', avgResponse: 18, target: 15 },
    { hour: '2PM', avgResponse: 10, target: 15 },
    { hour: '3PM', avgResponse: 14, target: 15 },
    { hour: '4PM', avgResponse: 16, target: 15 },
    { hour: '5PM', avgResponse: 11, target: 15 },
  ];

  const categoryDistribution = [
    { name: 'Technical Issues', value: 35, color: '#3B82F6' },
    { name: 'Billing Questions', value: 28, color: '#10B981' },
    { name: 'Feature Requests', value: 20, color: '#8B5CF6' },
    { name: 'Account Issues', value: 17, color: '#F59E0B' },
  ];

  const satisfactionData = [
    { rating: '5 Stars', count: 145, percentage: 58 },
    { rating: '4 Stars', count: 78, percentage: 31 },
    { rating: '3 Stars', count: 18, percentage: 7 },
    { rating: '2 Stars', count: 7, percentage: 3 },
    { rating: '1 Star', count: 2, percentage: 1 },
  ];

  const topAgents = [
    { name: 'Sarah Johnson', ticketsResolved: 89, avgRating: 4.8, responseTime: '8 min' },
    { name: 'Mike Wilson', ticketsResolved: 76, avgRating: 4.6, responseTime: '12 min' },
    { name: 'Lisa Davis', ticketsResolved: 65, avgRating: 4.7, responseTime: '10 min' },
    { name: 'John Smith', ticketsResolved: 58, avgRating: 4.5, responseTime: '15 min' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Analytics</h1>
          <p className="text-gray-600">Track support performance and customer satisfaction</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            Export Report
          </Button>
          <Button>
            Generate Dashboard
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Response Time</p>
                <p className="text-2xl font-bold text-blue-600">12 min</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -2 min from last month
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">94%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3% from last month
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-purple-600">4.7/5</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +0.2 from last month
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tickets</p>
                <p className="text-2xl font-bold text-yellow-600">23</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5 from yesterday
                </p>
              </div>
              <MessageCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" fill="#3B82F6" name="Created" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgResponse" stroke="#3B82F6" name="Avg Response (min)" />
                <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" name="Target (15 min)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution and Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {satisfactionData.map((item) => (
                <div key={item.rating} className="flex items-center space-x-3">
                  <div className="w-16 text-sm font-medium">{item.rating}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-left py-3 px-4">Tickets Resolved</th>
                  <th className="text-left py-3 px-4">Avg. Rating</th>
                  <th className="text-left py-3 px-4">Avg. Response Time</th>
                  <th className="text-left py-3 px-4">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topAgents.map((agent, index) => (
                  <tr key={agent.name} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {index + 1}
                        </div>
                        <span className="font-medium">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-green-600">{agent.ticketsResolved}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{agent.avgRating}</span>
                        <span className="text-gray-500">/ 5.0</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600">{agent.responseTime}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-green-100 text-green-800">
                        Excellent
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}