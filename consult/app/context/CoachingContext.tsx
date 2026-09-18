'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { NicheId, NICHES_DATA, NicheProfile, ChecklistItem } from '../data/nicheData';

export interface FunnelCounts {
  applications: number;
  screenings: number;
  trials: number;
  offers: number;
}

interface CoachingContextType {
  selectedNiche: NicheId;
  currentProfile: NicheProfile;
  hasCompletedOnboarding: boolean;
  checkedItems: Record<string, boolean>;
  funnelCounts: FunnelCounts;
  activePillarTab: 'overview' | 'milestones' | 'checklist' | 'linkedin' | 'async_interview' | 'job_funnel';
  showNicheModal: boolean;
  activePhaseFilter: 1 | 2 | 3 | 'all';
  setNiche: (nicheId: NicheId) => void;
  toggleChecklistItem: (itemId: string) => void;
  setAllChecklistItemsForPhase: (phase: 1 | 2 | 3, completed: boolean) => void;
  resetChecklist: () => void;
  updateFunnelCount: (key: keyof FunnelCounts, value: number) => void;
  setActivePillarTab: (tab: 'overview' | 'milestones' | 'checklist' | 'linkedin' | 'async_interview' | 'job_funnel') => void;
  setShowNicheModal: (show: boolean) => void;
  setActivePhaseFilter: (phase: 1 | 2 | 3 | 'all') => void;
  calculateOverallProgress: () => number;
  calculatePhaseProgress: (phase: 1 | 2 | 3) => number;
  completedChecklistCount: number;
  totalChecklistCount: number;
}

const CoachingContext = createContext<CoachingContextType | null>(null);

const STORAGE_KEY = 'remote_coaching_platform_state_v1';

export function CoachingProvider({ children }: { children: React.ReactNode }) {
  const [selectedNiche, setSelectedNicheState] = useState<NicheId>('tech_pro');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [funnelCounts, setFunnelCounts] = useState<FunnelCounts>({
    applications: 18,
    screenings: 5,
    trials: 2,
    offers: 0,
  });
  const [activePillarTab, setActivePillarTab] = useState<'overview' | 'milestones' | 'checklist' | 'linkedin' | 'async_interview' | 'job_funnel'>('overview');
  const [showNicheModal, setShowNicheModal] = useState(false);
  const [activePhaseFilter, setActivePhaseFilter] = useState<1 | 2 | 3 | 'all'>('all');
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage safely after mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.selectedNiche && NICHES_DATA[parsed.selectedNiche as NicheId]) {
          setSelectedNicheState(parsed.selectedNiche);
        }
        if (typeof parsed.hasCompletedOnboarding === 'boolean') {
          setHasCompletedOnboarding(parsed.hasCompletedOnboarding);
        }
        if (parsed.checkedItems) {
          setCheckedItems(parsed.checkedItems);
        }
        if (parsed.funnelCounts) {
          setFunnelCounts(parsed.funnelCounts);
        }
      } else {
        // First time visitor - open onboarding selector
        setShowNicheModal(true);
      }
    } catch (e) {
      console.warn('Failed to parse coaching state from localStorage', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on state changes
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = {
        selectedNiche,
        hasCompletedOnboarding,
        checkedItems,
        funnelCounts,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save coaching state to localStorage', e);
    }
  }, [selectedNiche, hasCompletedOnboarding, checkedItems, funnelCounts, isHydrated]);

  const currentProfile = useMemo(() => {
    return NICHES_DATA[selectedNiche] || NICHES_DATA.tech_pro;
  }, [selectedNiche]);

  const setNiche = (nicheId: NicheId) => {
    setSelectedNicheState(nicheId);
    setHasCompletedOnboarding(true);
    setShowNicheModal(false);
  };

  const toggleChecklistItem = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const setAllChecklistItemsForPhase = (phase: 1 | 2 | 3, completed: boolean) => {
    const itemsInPhase = currentProfile.checklist.filter((item) => item.phase === phase);
    setCheckedItems((prev) => {
      const updated = { ...prev };
      itemsInPhase.forEach((item) => {
        updated[item.id] = completed;
      });
      return updated;
    });
  };

  const resetChecklist = () => {
    setCheckedItems({});
  };

  const updateFunnelCount = (key: keyof FunnelCounts, value: number) => {
    setFunnelCounts((prev) => ({
      ...prev,
      [key]: Math.max(0, value),
    }));
  };

  const completedChecklistCount = useMemo(() => {
    return currentProfile.checklist.filter((item) => !!checkedItems[item.id]).length;
  }, [currentProfile.checklist, checkedItems]);

  const totalChecklistCount = useMemo(() => {
    return currentProfile.checklist.length;
  }, [currentProfile.checklist]);

  const calculatePhaseProgress = (phase: 1 | 2 | 3): number => {
    const items = currentProfile.checklist.filter((item) => item.phase === phase);
    if (items.length === 0) return 0;
    const completed = items.filter((item) => !!checkedItems[item.id]).length;
    return Math.round((completed / items.length) * 100);
  };

  const calculateOverallProgress = (): number => {
    if (totalChecklistCount === 0) return 0;
    return Math.round((completedChecklistCount / totalChecklistCount) * 100);
  };

  return (
    <CoachingContext.Provider
      value={{
        selectedNiche,
        currentProfile,
        hasCompletedOnboarding,
        checkedItems,
        funnelCounts,
        activePillarTab,
        showNicheModal,
        activePhaseFilter,
        setNiche,
        toggleChecklistItem,
        setAllChecklistItemsForPhase,
        resetChecklist,
        updateFunnelCount,
        setActivePillarTab,
        setShowNicheModal,
        setActivePhaseFilter,
        calculateOverallProgress,
        calculatePhaseProgress,
        completedChecklistCount,
        totalChecklistCount,
      }}
    >
      {children}
    </CoachingContext.Provider>
  );
}

export function useCoaching() {
  const ctx = useContext(CoachingContext);
  if (!ctx) {
    throw new Error('useCoaching must be used within a CoachingProvider');
  }
  return ctx;
}
