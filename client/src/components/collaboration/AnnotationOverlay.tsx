import React, { useState, useRef, useEffect } from 'react';
import { useCollaboration } from '@/hooks/use-collaboration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  Highlighter, 
  ArrowRight, 
  Circle, 
  Type,
  X,
  Palette
} from 'lucide-react';

interface AnnotationOverlayProps {
  resourceType: string;
  resourceId: string;
  isActive: boolean;
  onToggle: () => void;
}

interface Position {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

const ANNOTATION_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'
];

export function AnnotationOverlay({ 
  resourceType, 
  resourceId, 
  isActive, 
  onToggle 
}: AnnotationOverlayProps) {
  const {
    annotations,
    createAnnotation,
    participants,
    isConnected
  } = useCollaboration(resourceType, resourceId);

  const [selectedTool, setSelectedTool] = useState<'highlight' | 'comment' | 'arrow' | 'circle' | 'text'>('comment');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<{
    startPos: Position;
    currentPos: Position;
  } | null>(null);
  const [showCommentDialog, setShowCommentDialog] = useState<{
    position: Position;
    targetElement: string;
  } | null>(null);
  const [commentText, setCommentText] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle mouse events for creating annotations
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const targetElement = e.target instanceof Element ? 
      getElementSelector(e.target as Element) : '';

    if (selectedTool === 'comment') {
      setShowCommentDialog({
        position: { x, y },
        targetElement
      });
    } else {
      setIsDrawing(true);
      setCurrentAnnotation({
        startPos: { x, y },
        currentPos: { x, y }
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentAnnotation) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentAnnotation(prev => prev ? {
      ...prev,
      currentPos: { x, y }
    } : null);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !currentAnnotation) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const targetElement = e.target instanceof Element ? 
      getElementSelector(e.target as Element) : '';

    const annotation = {
      annotationType: selectedTool,
      targetElement,
      position: {
        x: Math.min(currentAnnotation.startPos.x, currentAnnotation.currentPos.x),
        y: Math.min(currentAnnotation.startPos.y, currentAnnotation.currentPos.y),
        width: Math.abs(currentAnnotation.currentPos.x - currentAnnotation.startPos.x),
        height: Math.abs(currentAnnotation.currentPos.y - currentAnnotation.startPos.y)
      },
      color: selectedColor
    };

    createAnnotation(annotation);

    setIsDrawing(false);
    setCurrentAnnotation(null);
  };

  // Create comment annotation
  const handleCreateComment = () => {
    if (!showCommentDialog || !commentText.trim()) return;

    createAnnotation({
      annotationType: 'comment',
      targetElement: showCommentDialog.targetElement,
      position: showCommentDialog.position,
      content: commentText,
      color: selectedColor
    });

    setShowCommentDialog(null);
    setCommentText('');
  };

  // Generate CSS selector for element
  const getElementSelector = (element: Element): string => {
    if (element.id) return `#${element.id}`;
    
    let selector = element.tagName.toLowerCase();
    
    if (element.className) {
      const classes = element.className.split(' ').filter(cls => cls.trim());
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    
    // Add position if needed
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === element.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(element);
        selector += `:nth-child(${index + 1})`;
      }
    }
    
    return selector;
  };

  // Render annotation based on type
  const renderAnnotation = (annotation: any) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: annotation.position.x,
      top: annotation.position.y,
      width: annotation.position.width,
      height: annotation.position.height,
      pointerEvents: 'none',
      zIndex: 1000
    };

    switch (annotation.annotationType) {
      case 'highlight':
        return (
          <div
            key={annotation.id}
            style={{
              ...style,
              backgroundColor: annotation.color,
              opacity: 0.3,
              borderRadius: '2px'
            }}
          />
        );
      
      case 'comment':
        return (
          <div key={annotation.id} style={style}>
            <div
              className="relative"
              style={{
                backgroundColor: annotation.color,
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                pointerEvents: 'auto'
              }}
            >
              <MessageCircle size={12} color="white" />
              {annotation.content && (
                <div className="absolute bottom-full left-0 mb-2 p-2 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap max-w-xs">
                  {annotation.content}
                </div>
              )}
            </div>
          </div>
        );
      
      case 'arrow':
        return (
          <svg
            key={annotation.id}
            style={style}
            className="pointer-events-none"
          >
            <defs>
              <marker
                id={`arrowhead-${annotation.id}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={annotation.color}
                />
              </marker>
            </defs>
            <line
              x1="0"
              y1="0"
              x2={annotation.position.width}
              y2={annotation.position.height}
              stroke={annotation.color}
              strokeWidth="2"
              markerEnd={`url(#arrowhead-${annotation.id})`}
            />
          </svg>
        );
      
      case 'circle':
        return (
          <div
            key={annotation.id}
            style={{
              ...style,
              border: `2px solid ${annotation.color}`,
              borderRadius: '50%',
              opacity: 0.8
            }}
          />
        );
      
      default:
        return null;
    }
  };

  if (!isActive) return null;

  return (
    <>
      {/* Annotation Toolbar */}
      <Card className="fixed top-4 right-4 z-50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {participants.length} collaborator{participants.length !== 1 ? 's' : ''}
              </span>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X size={16} />
              </Button>
            </div>

            {/* Annotation Tools */}
            <div className="flex space-x-2">
              <Button
                variant={selectedTool === 'comment' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTool('comment')}
              >
                <MessageCircle size={16} />
              </Button>
              <Button
                variant={selectedTool === 'highlight' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTool('highlight')}
              >
                <Highlighter size={16} />
              </Button>
              <Button
                variant={selectedTool === 'arrow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTool('arrow')}
              >
                <ArrowRight size={16} />
              </Button>
              <Button
                variant={selectedTool === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTool('circle')}
              >
                <Circle size={16} />
              </Button>
            </div>

            {/* Color Palette */}
            <div className="flex space-x-1">
              {ANNOTATION_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Annotation Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 pointer-events-auto"
        style={{ cursor: isActive ? 'crosshair' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Existing Annotations */}
        {annotations.map(renderAnnotation)}

        {/* Current Drawing Annotation */}
        {isDrawing && currentAnnotation && selectedTool !== 'comment' && (
          <div>
            {selectedTool === 'highlight' && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.min(currentAnnotation.startPos.x, currentAnnotation.currentPos.x),
                  top: Math.min(currentAnnotation.startPos.y, currentAnnotation.currentPos.y),
                  width: Math.abs(currentAnnotation.currentPos.x - currentAnnotation.startPos.x),
                  height: Math.abs(currentAnnotation.currentPos.y - currentAnnotation.startPos.y),
                  backgroundColor: selectedColor,
                  opacity: 0.3,
                  borderRadius: '2px',
                  pointerEvents: 'none'
                }}
              />
            )}
            {selectedTool === 'circle' && (
              <div
                style={{
                  position: 'absolute',
                  left: Math.min(currentAnnotation.startPos.x, currentAnnotation.currentPos.x),
                  top: Math.min(currentAnnotation.startPos.y, currentAnnotation.currentPos.y),
                  width: Math.abs(currentAnnotation.currentPos.x - currentAnnotation.startPos.x),
                  height: Math.abs(currentAnnotation.currentPos.y - currentAnnotation.startPos.y),
                  border: `2px solid ${selectedColor}`,
                  borderRadius: '50%',
                  opacity: 0.8,
                  pointerEvents: 'none'
                }}
              />
            )}
            {selectedTool === 'arrow' && (
              <svg
                style={{
                  position: 'absolute',
                  left: Math.min(currentAnnotation.startPos.x, currentAnnotation.currentPos.x),
                  top: Math.min(currentAnnotation.startPos.y, currentAnnotation.currentPos.y),
                  width: Math.abs(currentAnnotation.currentPos.x - currentAnnotation.startPos.x),
                  height: Math.abs(currentAnnotation.currentPos.y - currentAnnotation.startPos.y),
                  pointerEvents: 'none'
                }}
              >
                <defs>
                  <marker
                    id="preview-arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill={selectedColor}
                    />
                  </marker>
                </defs>
                <line
                  x1="0"
                  y1="0"
                  x2={Math.abs(currentAnnotation.currentPos.x - currentAnnotation.startPos.x)}
                  y2={Math.abs(currentAnnotation.currentPos.y - currentAnnotation.startPos.y)}
                  stroke={selectedColor}
                  strokeWidth="2"
                  markerEnd="url(#preview-arrowhead)"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {/* Comment Dialog */}
      {showCommentDialog && (
        <div
          className="fixed z-50 bg-white border rounded-lg shadow-lg p-4 min-w-[300px]"
          style={{
            left: showCommentDialog.position.x,
            top: showCommentDialog.position.y
          }}
        >
          <div className="space-y-3">
            <h4 className="font-medium">Add Comment</h4>
            <Input
              placeholder="Enter your comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              autoFocus
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleCreateComment}>
                Add Comment
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCommentDialog(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}