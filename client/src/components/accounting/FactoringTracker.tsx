import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, TrendingUp, Clock } from 'lucide-react';

interface FactoringEntry {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  submittedDate: string;
  status: string;
  fundedAmount: number;
  fees: number;
  netAmount: number;
}

interface FactoringTrackerProps {
  limit?: number;
}

export function FactoringTracker({ limit }: FactoringTrackerProps) {
  const [factoring, setFactoring] = useState<FactoringEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFactoring();
  }, [limit]);

  const fetchFactoring = async () => {
    try {
      const url = limit ? `/api/accounting/factoring?limit=${limit}` : '/api/accounting/factoring';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFactoring(data);
      }
    } catch (error) {
      console.error('Failed to fetch factoring data:', error);
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

  const getStatusBadge = (status: string) => {
    const variants = {
      'funded': 'default',
      'pending': 'secondary',
      'submitted': 'outline',
      'rejected': 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const totalPending = factoring
    .filter(f => f.status === 'pending' || f.status === 'submitted')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalFunded = factoring
    .filter(f => f.status === 'funded')
    .reduce((sum, f) => sum + f.netAmount, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Factoring Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(limit || 5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {limit ? `Factoring Overview (${limit})` : 'Factoring Tracker'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-lg font-semibold">{formatCurrency(totalPending)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Funded</p>
              <p className="text-lg font-semibold">{formatCurrency(totalFunded)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <CreditCard className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Total Entries</p>
              <p className="text-lg font-semibold">{factoring.length}</p>
            </div>
          </div>
        </div>

        {factoring.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No factoring entries found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {factoring.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.invoiceNumber}</TableCell>
                  <TableCell>{entry.customerName}</TableCell>
                  <TableCell>{formatCurrency(entry.amount)}</TableCell>
                  <TableCell>{new Date(entry.submittedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(entry.status)}</TableCell>
                  <TableCell className="text-red-600">
                    -{formatCurrency(entry.fees)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.status === 'funded' ? formatCurrency(entry.netAmount) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}