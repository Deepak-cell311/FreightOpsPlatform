import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollaboration } from '@/hooks/use-collaboration';
import { AnnotationOverlay } from './AnnotationOverlay';
import { 
  Users, 
  Play, 
  UserPlus, 
  MessageCircle, 
  Clock,
  Highlighter,
  Settings 
} from 'lucide-react';

interface CollaborationButtonProps {
  resourceType: string;
  resourceId: string;
  resourceName: string;
  className?: string;
}

export function CollaborationButton({ 
  resourceType, 
  resourceId, 
  resourceName,
  className = ""
}: CollaborationButtonProps) {
  const {
    activeSession,
    sessions,
    participants,
    annotations,
    isConnected,
    startSession,
    joinSession,
    leaveSession,
    isCreatingSession,
    isJoiningSession
  } = useCollaboration(resourceType, resourceId);

  const [showDialog, setShowDialog] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  const handleStartSession = () => {
    if (!newSessionName.trim()) return;
    startSession(newSessionName);
    setNewSessionName('');
    setShowDialog(false);
    setShowAnnotations(true);
  };

  const handleJoinSession = (sessionId: string) => {
    joinSession(sessionId);
    setShowDialog(false);
    setShowAnnotations(true);
  };

  const handleToggleAnnotations = () => {
    setShowAnnotations(!showAnnotations);
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const hasActiveSession = activeSession !== null;

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button 
            variant={hasActiveSession ? "default" : "outline"} 
            size="sm" 
            className={`relative ${className}`}
          >
            <Users size={16} className="mr-2" />
            Collaborate
            {hasActiveSession && (
              <Badge className="ml-2 px-1 py-0 text-xs">
                {participants.length}
              </Badge>
            )}
            {isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Collaboration for {resourceName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Session Status */}
            {hasActiveSession && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span>Active Session: {activeSession.sessionName}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Users size={16} />
                        <span className="text-sm">{participants.length} participants</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageCircle size={16} />
                        <span className="text-sm">{annotations.length} annotations</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleToggleAnnotations}
                      >
                        <Highlighter size={16} className="mr-2" />
                        {showAnnotations ? 'Hide' : 'Show'} Annotations
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={leaveSession}
                      >
                        Leave Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Sessions */}
            {activeSessions.length > 0 && !hasActiveSession && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Active Collaboration Sessions</h3>
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{session.sessionName}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <Users size={14} />
                                <span>{session.participantCount} participants</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock size={14} />
                                <span>Started {new Date(session.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleJoinSession(session.id)}
                            disabled={isJoiningSession}
                          >
                            <UserPlus size={16} className="mr-2" />
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Start New Session */}
            {!hasActiveSession && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Start New Collaboration Session</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Session Name
                    </label>
                    <Input
                      placeholder={`Collaboration on ${resourceName}`}
                      value={newSessionName}
                      onChange={(e) => setNewSessionName(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleStartSession();
                        }
                      }}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleStartSession}
                    disabled={!newSessionName.trim() || isCreatingSession}
                  >
                    <Play size={16} className="mr-2" />
                    {isCreatingSession ? 'Starting...' : 'Start Collaboration Session'}
                  </Button>
                </div>
              </div>
            )}

            {/* Collaboration Features Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-medium text-blue-900 mb-2">Collaboration Features</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Real-time annotations and comments</li>
                  <li>• Live cursor tracking and presence</li>
                  <li>• Highlight important sections</li>
                  <li>• Draw arrows and shapes for clarity</li>
                  <li>• Instant notifications and updates</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Annotation Overlay */}
      <AnnotationOverlay
        resourceType={resourceType}
        resourceId={resourceId}
        isActive={showAnnotations}
        onToggle={handleToggleAnnotations}
      />
    </>
  );
}