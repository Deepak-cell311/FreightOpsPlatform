import { useState, useEffect, useRef } from "react";
import { useAuth } from "./use-auth";

interface OnboardingState {
  isFirstLogin: boolean;
  tourCompleted: boolean;
  showTour: boolean;
  currentStep: number;
  skipForever: boolean;
}

const ONBOARDING_STORAGE_KEY = 'freightops_onboarding';

export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const initialized = useRef(false);
  const [state, setState] = useState<OnboardingState>({
    isFirstLogin: false,
    tourCompleted: true,
    showTour: false,
    currentStep: 0,
    skipForever: true
  });

  // Check onboarding status when user authenticates - only once
  useEffect(() => {
    if (!isAuthenticated || !user || initialized.current) return;

    const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`;
    
    // PERMANENT FIX: Clear all onboarding data and disable tour permanently
    const permanentDisableState: OnboardingState = {
      isFirstLogin: false,
      tourCompleted: true,
      showTour: false,
      currentStep: 0,
      skipForever: true
    };
    
    setState(permanentDisableState);
    localStorage.setItem(storageKey, JSON.stringify(permanentDisableState));
    
    // Also clear any legacy onboarding keys
    const keysToRemove = [
      'freightops_onboarding',
      'onboarding_completed',
      'tour_completed',
      'show_onboarding'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_${user.id}`);
    });
    
    initialized.current = true;
  }, [isAuthenticated, user?.id]);

  const startTour = () => {
    setState(prev => ({
      ...prev,
      showTour: true,
      currentStep: 0
    }));
  };

  const closeTour = () => {
    const newState = {
      ...state,
      showTour: false
    };
    setState(newState);
    saveState(newState);
  };

  const completeTour = () => {
    const newState: OnboardingState = {
      isFirstLogin: false,
      tourCompleted: true,
      showTour: false,
      currentStep: 0,
      skipForever: false
    };
    setState(newState);
    saveState(newState);
  };

  const skipForever = () => {
    const newState: OnboardingState = {
      isFirstLogin: false,
      tourCompleted: false,
      showTour: false,
      currentStep: 0,
      skipForever: true
    };
    setState(newState);
    saveState(newState);
  };

  const resetOnboarding = () => {
    if (!user) return;
    const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`;
    localStorage.removeItem(storageKey);
    setState({
      isFirstLogin: true,
      tourCompleted: false,
      showTour: true,
      currentStep: 0,
      skipForever: false
    });
  };

  const saveState = (stateToSave?: OnboardingState) => {
    if (!user) return;
    const storageKey = `${ONBOARDING_STORAGE_KEY}_${user.id}`;
    const dataToSave = stateToSave || state;
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
  };

  return {
    ...state,
    startTour,
    closeTour,
    completeTour,
    resetOnboarding,
    skipForever
  };
}