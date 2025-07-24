import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft, 
  X, 
  CheckCircle, 
  Truck, 
  DollarSign, 
  Users, 
  Settings,
  Play,
  Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  icon?: React.ReactNode;
  route?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FreightOps!',
    description: 'Let\'s take a quick tour to help you get started with your transportation management platform.',
    targetSelector: '.dashboard-header',
    position: 'center',
    icon: <Truck className="w-6 h-6 text-blue-500" />
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'This is your command center. Monitor loads, drivers, and fleet performance at a glance.',
    targetSelector: '.dashboard-stats',
    position: 'bottom',
    icon: <CheckCircle className="w-5 h-5 text-green-500" />
  },
  {
    id: 'dispatch',
    title: 'Dispatch Center',
    description: 'Manage loads, assign drivers, and track deliveries in real-time.',
    targetSelector: '[data-nav="dispatch"]',
    position: 'right',
    route: '/dispatch',
    icon: <Truck className="w-5 h-5 text-orange-500" />
  },
  {
    id: 'fleet',
    title: 'Fleet Management',
    description: 'Track vehicles, manage maintenance schedules, and monitor driver performance.',
    targetSelector: '[data-nav="fleet"]',
    position: 'right',
    route: '/fleet',
    icon: <Users className="w-5 h-5 text-purple-500" />
  },
  {
    id: 'banking',
    title: 'Banking & Payments',
    description: 'Handle payments, manage accounts, and track financial transactions securely.',
    targetSelector: '[data-nav="banking"]',
    position: 'right',
    route: '/banking',
    icon: <DollarSign className="w-5 h-5 text-green-500" />
  },
  {
    id: 'settings',
    title: 'Company Settings',
    description: 'Configure your company profile, user permissions, and system preferences.',
    targetSelector: '[data-nav="settings"]',
    position: 'right',
    route: '/settings',
    icon: <Settings className="w-5 h-5 text-gray-500" />
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You\'ve completed the tour! Start exploring your new transportation management platform.',
    targetSelector: '.dashboard-header',
    position: 'center',
    icon: <CheckCircle className="w-6 h-6 text-green-500" />
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkipForever?: () => void;
}

export default function OnboardingTour({ isOpen, onClose, onComplete, onSkipForever }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [, setLocation] = useLocation();

  // Auto-advance tour when playing
  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    
    const timer = setTimeout(() => {
      if (currentStep < tourSteps.length - 1) {
        handleNext();
      }
    }, 4000); // 4 seconds per step
    
    return () => clearTimeout(timer);
  }, [currentStep, isPlaying, isOpen]);

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = tourSteps[currentStep + 1];
      if (nextStep.route) {
        setLocation(nextStep.route);
      }
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentStep, setLocation, onComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = tourSteps[currentStep - 1];
      if (prevStep.route) {
        setLocation(prevStep.route);
      }
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, setLocation]);

  const handleStepClick = useCallback((stepIndex: number) => {
    const step = tourSteps[stepIndex];
    if (step.route) {
      setLocation(step.route);
    }
    setCurrentStep(stepIndex);
  }, [setLocation]);

  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const step = tourSteps[currentStep];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Interactive Tour Card - No gray overlay, users can see and use the page */}
      <motion.div
        key={`tour-${step.id}`}
        initial={{ y: 50, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -50, opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed z-50 pointer-events-auto ${
          step.position === 'center' 
            ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
            : 'top-20 right-6'
        }`}
      >
        <Card className="w-96 bg-white/95 backdrop-blur-lg border-0 shadow-2xl">
          <CardHeader className="relative pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {step.icon}
                </motion.div>
                <div>
                  <CardTitle className="text-lg font-semibold">{step.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Step {currentStep + 1} of {tourSteps.length}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progress)}% complete
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-gray-600 leading-relaxed">{step.description}</p>

            {/* Mini Step Navigator */}
            <div className="flex gap-1 justify-center">
              {tourSteps.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleStepClick(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-500'
                      : index < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-8"
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {isPlaying ? 'Auto-playing' : 'Paused'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="h-8"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="h-8 bg-blue-500 hover:bg-blue-600"
                >
                  {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep !== tourSteps.length - 1 && (
                    <ArrowRight className="w-3 h-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Don't show again option */}
            {onSkipForever && (
              <div className="flex justify-center pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkipForever}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Don't show me this again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}