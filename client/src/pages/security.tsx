import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, Users, Lock } from "lucide-react";

interface SecurityData {
  overview: {
    threatLevel: string;
    activeAlerts: number;
    resolvedToday: number;
    systemHealth: number;
  };
  authentication: {
    activeUsers: number;
    failedLogins: number;
    passwordExpiring: number;
    mfaEnabled: number;
  };
  compliance: {
    dotCompliance: number;
    dataProtection: number;
    auditScore: number;
    certifications: string[];
  };
  incidents: Array<{
    id: number;
    type: string;
    severity: string;
    status: string;
    time: string;
  }>;
}

export default function Security() {
  const { data: securityData, isLoading } = useQuery<SecurityData>({
    queryKey: ["/api/dashboard/security"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const getThreatLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'critical':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">{severity}</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{severity}</Badge>;
      case 'high':
        return <Badge variant="destructive">{severity}</Badge>;
      case 'critical':
        return <Badge variant="destructive" className="bg-red-800">{severity}</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return <Badge variant="default" className="bg-green-500">Resolved</Badge>;
      case 'investigating':
        return <Badge variant="secondary" className="bg-yellow-500">Investigating</Badge>;
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Security Overview</h1>
      </div>

      {/* Security Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold px-3 py-1 rounded-lg inline-block ${getThreatLevelColor(securityData?.overview.threatLevel || 'Unknown')}`}>
              {securityData?.overview.threatLevel || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Current security status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData?.overview.activeAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {securityData?.overview.resolvedToday || 0} resolved today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData?.overview.systemHealth || 0}%</div>
            <Progress value={securityData?.overview.systemHealth || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MFA Coverage</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityData?.authentication.mfaEnabled || 0}%</div>
            <Progress value={securityData?.authentication.mfaEnabled || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Authentication & Access Management */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>User access and authentication metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Active Users</span>
              <span className="font-semibold">{securityData?.authentication.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Failed Login Attempts</span>
              <span className="font-semibold text-red-600">{securityData?.authentication.failedLogins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Passwords Expiring Soon</span>
              <span className="font-semibold text-yellow-600">{securityData?.authentication.passwordExpiring || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>MFA Enabled</span>
              <span className="font-semibold">{securityData?.authentication.mfaEnabled || 0}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Regulatory compliance and audit scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>DOT Compliance</span>
                <span>{securityData?.compliance.dotCompliance || 0}%</span>
              </div>
              <Progress value={securityData?.compliance.dotCompliance || 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Protection</span>
                <span>{securityData?.compliance.dataProtection || 0}%</span>
              </div>
              <Progress value={securityData?.compliance.dataProtection || 0} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Audit Score</span>
                <span>{securityData?.compliance.auditScore || 0}%</span>
              </div>
              <Progress value={securityData?.compliance.auditScore || 0} />
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">Certifications</h4>
              <div className="flex gap-2 flex-wrap">
                {securityData?.compliance.certifications.map((cert) => (
                  <Badge key={cert} variant="outline">{cert}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Incidents */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Incidents</CardTitle>
          <CardDescription>Latest security events and their resolution status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {securityData?.incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">{incident.type}</TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell>{incident.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
          <CardDescription>Suggested actions to improve security posture</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">High Priority</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Enable MFA for all remaining users</li>
                <li>• Review and update password policies</li>
                <li>• Schedule security awareness training</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Medium Priority</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Update firewall rules</li>
                <li>• Review access permissions quarterly</li>
                <li>• Implement automated security scanning</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Low Priority</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Document incident response procedures</li>
                <li>• Regular security audit scheduling</li>
                <li>• Employee security handbook updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}