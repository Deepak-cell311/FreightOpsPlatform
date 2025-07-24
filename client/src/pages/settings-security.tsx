import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Lock, AlertTriangle, CheckCircle, Smartphone } from "lucide-react";

export default function SettingsSecurity() {
  const securitySettings = [
    {
      title: "Two-Factor Authentication",
      description: "Require 2FA for all user accounts",
      enabled: true,
      critical: true
    },
    {
      title: "Password Requirements",
      description: "Enforce strong password policies",
      enabled: true,
      critical: true
    },
    {
      title: "Session Timeout",
      description: "Auto-logout after 30 minutes of inactivity",
      enabled: true,
      critical: false
    },
    {
      title: "Login Notifications",
      description: "Email notifications for new device logins",
      enabled: false,
      critical: false
    },
    {
      title: "API Rate Limiting",
      description: "Limit API requests to prevent abuse",
      enabled: true,
      critical: true
    }
  ];

  const recentActivity = [
    {
      action: "Password changed",
      user: "john.smith@company.com",
      timestamp: "2024-01-15 14:30",
      status: "success"
    },
    {
      action: "Failed login attempt",
      user: "unknown@example.com",
      timestamp: "2024-01-15 12:15",
      status: "warning"
    },
    {
      action: "2FA enabled",
      user: "sarah.johnson@company.com",
      timestamp: "2024-01-15 09:22",
      status: "success"
    },
    {
      action: "API key generated",
      user: "admin@company.com",
      timestamp: "2024-01-14 16:45",
      status: "info"
    }
  ];

  return (
    <div className="w-full min-h-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
          <p className="text-gray-600 mt-2">Configure security policies and access controls</p>
        </div>
        <Button>Security Audit</Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Security Score</p>
                <p className="text-3xl font-bold text-green-600">85%</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Sessions</p>
                <p className="text-3xl font-bold text-blue-600">12</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed Logins (24h)</p>
                <p className="text-3xl font-bold text-red-600">3</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">2FA Enabled</p>
                <p className="text-3xl font-bold text-green-600">18/24</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Smartphone className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {securitySettings.map((setting, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{setting.title}</h3>
                      {setting.critical && (
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                  </div>
                  <Switch checked={setting.enabled} />
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <Button variant="outline" className="w-full">
                Configure Advanced Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Security Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Security Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'info' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                  <div className={`p-1 rounded-full ${
                    activity.status === 'success' ? 'bg-green-50' :
                    activity.status === 'warning' ? 'bg-yellow-50' :
                    activity.status === 'info' ? 'bg-blue-50' :
                    'bg-red-50'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" className="w-full">
                View Security Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}