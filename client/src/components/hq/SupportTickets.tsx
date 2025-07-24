import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Ticket, MessageSquare, Clock, AlertTriangle, Plus } from 'lucide-react';

interface SupportTicket {
  id: string;
  tenantId: string;
  ticketNumber: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  assignedTo: string;
  customerEmail: string;
  resolutionNotes: string;
  createdAt: string;
  resolvedAt: string;
  updatedAt: string;
}

export function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    tenantId: '',
    subject: '',
    description: '',
    priority: 'medium',
    customerEmail: ''
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/hq/support/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    try {
      const response = await fetch('/api/hq/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (response.ok) {
        await fetchTickets();
        setIsNewTicketOpen(false);
        setNewTicket({
          tenantId: '',
          subject: '',
          description: '',
          priority: 'medium',
          customerEmail: ''
        });
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'open': 'destructive',
      'in_progress': 'secondary',
      'waiting_customer': 'outline',
      'resolved': 'default',
      'closed': 'default'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'low': 'outline',
      'medium': 'secondary',
      'high': 'default',
      'urgent': 'destructive'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
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
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Support Tickets
          </CardTitle>
          <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tenantId">Tenant ID</Label>
                  <Input
                    id="tenantId"
                    value={newTicket.tenantId}
                    onChange={(e) => setNewTicket({...newTicket, tenantId: e.target.value})}
                    placeholder="Enter tenant ID"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    placeholder="Ticket subject"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    placeholder="Describe the issue"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={newTicket.customerEmail}
                    onChange={(e) => setNewTicket({...newTicket, customerEmail: e.target.value})}
                    placeholder="customer@email.com"
                  />
                </div>
                <Button onClick={createTicket} className="w-full">
                  Create Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No support tickets found</p>
            <Button className="mt-4" onClick={() => setIsNewTicketOpen(true)}>
              Create First Ticket
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate" title={ticket.subject}>
                        {ticket.subject}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.customerEmail}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{ticket.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Clock className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Ticket Summary */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-600">Open</p>
                <p className="text-2xl font-bold text-red-800">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-800">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-sm font-medium text-orange-600">Urgent</p>
                <p className="text-2xl font-bold text-orange-800">
                  {tickets.filter(t => t.priority === 'urgent').length}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Assign to Me
              </Button>
              <Button variant="outline" size="sm">
                Escalate Selected
              </Button>
              <Button variant="outline" size="sm">
                Mark as Resolved
              </Button>
              <Button variant="outline" size="sm">
                Send Update
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}