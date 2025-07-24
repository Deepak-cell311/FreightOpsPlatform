import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './use-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface CollaborationSession {
  id: string;
  resourceType: string;
  resourceId: string;
  sessionName: string;
  hostUserId: string;
  status: string;
  participantCount: number;
  createdAt: string;
}

interface Annotation {
  id: string;
  sessionId: string;
  userId: string;
  annotationType: 'highlight' | 'comment' | 'arrow' | 'circle' | 'text';
  targetElement: string;
  position: { x: number; y: number; width?: number; height?: number };
  content?: string;
  color: string;
  isVisible: boolean;
  isResolved: boolean;
  createdAt: string;
}

interface CollaborationMessage {
  type: 'annotation_created' | 'annotation_updated' | 'annotation_deleted' | 'comment_created' | 'status_changed' | 'cursor_moved' | 'user_joined' | 'user_left';
  data?: any;
  userId?: string;
  timestamp: number;
}

export function useCollaboration(resourceType: string, resourceId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Get active collaboration sessions for resource
  const { data: sessions } = useQuery({
    queryKey: ['/api/collaboration/sessions', resourceType, resourceId],
    queryParams: { resourceType, resourceId },
    enabled: !!user
  });

  // Create collaboration session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionName: string) => {
      return apiRequest('/api/collaboration/sessions', {
        method: 'POST',
        body: JSON.stringify({
          resourceType,
          resourceId,
          sessionName
        })
      });
    },
    onSuccess: (data) => {
      setActiveSession(data.session);
      connectToSession(data.session.id);
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/sessions'] });
    }
  });

  // Join session mutation
  const joinSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest(`/api/collaboration/sessions/${sessionId}/join`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      setActiveSession(data.session);
      connectToSession(data.session.id);
    }
  });

  // Create annotation mutation
  const createAnnotationMutation = useMutation({
    mutationFn: async (annotation: Omit<Annotation, 'id' | 'userId' | 'createdAt'>) => {
      return apiRequest('/api/collaboration/annotations', {
        method: 'POST',
        body: JSON.stringify(annotation)
      });
    },
    onSuccess: (data) => {
      const newAnnotation = data.annotation;
      setAnnotations(prev => [...prev, newAnnotation]);
      
      // Broadcast to other participants
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'annotation_created',
          data: newAnnotation,
          timestamp: Date.now()
        }));
      }
    }
  });

  // Connect to WebSocket for real-time collaboration
  const connectToSession = useCallback((sessionId: string) => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/collaboration?sessionId=${sessionId}&userId=${user.id}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('Connected to collaboration session:', sessionId);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const message: CollaborationMessage = JSON.parse(event.data);
        handleCollaborationMessage(message);
      } catch (error) {
        console.error('Error parsing collaboration message:', error);
      }
    };

    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('Disconnected from collaboration session');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [user]);

  // Handle incoming collaboration messages
  const handleCollaborationMessage = useCallback((message: CollaborationMessage) => {
    switch (message.type) {
      case 'annotation_created':
        setAnnotations(prev => [...prev, message.data]);
        break;
      case 'annotation_updated':
        setAnnotations(prev => prev.map(ann => 
          ann.id === message.data.id ? { ...ann, ...message.data } : ann
        ));
        break;
      case 'annotation_deleted':
        setAnnotations(prev => prev.filter(ann => ann.id !== message.data.id));
        break;
      case 'user_joined':
        if (message.userId && !participants.includes(message.userId)) {
          setParticipants(prev => [...prev, message.userId!]);
        }
        break;
      case 'user_left':
        if (message.userId) {
          setParticipants(prev => prev.filter(id => id !== message.userId));
        }
        break;
      default:
        console.log('Unknown collaboration message type:', message.type);
    }
  }, [participants]);

  // Load annotations for active session
  useEffect(() => {
    if (activeSession) {
      fetch(`/api/collaboration/sessions/${activeSession.id}/annotations`)
        .then(res => res.json())
        .then(data => setAnnotations(data.annotations || []))
        .catch(console.error);
    }
  }, [activeSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Create annotation function
  const createAnnotation = useCallback((annotation: {
    annotationType: Annotation['annotationType'];
    targetElement: string;
    position: { x: number; y: number; width?: number; height?: number };
    content?: string;
    color?: string;
  }) => {
    if (!activeSession) return;

    createAnnotationMutation.mutate({
      sessionId: activeSession.id,
      ...annotation,
      color: annotation.color || '#FF6B6B',
      isVisible: true,
      isResolved: false
    });
  }, [activeSession, createAnnotationMutation]);

  // Start collaboration session
  const startSession = useCallback((sessionName: string) => {
    createSessionMutation.mutate(sessionName);
  }, [createSessionMutation]);

  // Join existing session
  const joinSession = useCallback((sessionId: string) => {
    joinSessionMutation.mutate(sessionId);
  }, [joinSessionMutation]);

  // Leave session
  const leaveSession = useCallback(() => {
    if (activeSession && wsRef.current) {
      wsRef.current.close();
      setActiveSession(null);
      setAnnotations([]);
      setParticipants([]);
      setIsConnected(false);
    }
  }, [activeSession]);

  return {
    // State
    activeSession,
    annotations,
    participants,
    isConnected,
    sessions: sessions?.sessions || [],
    
    // Actions
    startSession,
    joinSession,
    leaveSession,
    createAnnotation,
    
    // Loading states
    isCreatingSession: createSessionMutation.isPending,
    isJoiningSession: joinSessionMutation.isPending,
    isCreatingAnnotation: createAnnotationMutation.isPending
  };
}