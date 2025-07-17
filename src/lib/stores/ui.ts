import { writable } from 'svelte/store';

// UI State Management
export const showSettings = writable(false);
export const uiReset = writable(false);

// Planning Mode System
export type PlanningMode = 
  | 'Policy' 
  | 'Site' 
  | 'Scenario' 
  | 'Goal' 
  | 'Document' 
  | 'DMOverview';

export type WorkspaceType = 'PlanMaking' | 'DevelopmentManagement';

export interface Panel {
  id: string;
  title: string;
  type: 'list' | 'form' | 'map' | 'text' | 'chart' | 'custom';
  position: 'left' | 'center' | 'right';
  content?: any;
  schema?: any;
  isCloseable?: boolean;
  isResizable?: boolean;
}

// Core UI Stores
export const currentMode = writable<PlanningMode>('Policy');
export const currentWorkspace = writable<WorkspaceType>('PlanMaking');
export const panels = writable<Panel[]>([]);
export const activePanel = writable<string | null>(null);

// Mode-specific stores
export const selectedPolicy = writable<string | null>(null);
export const selectedSite = writable<string | null>(null);
export const selectedScenario = writable<string | null>(null);
export const selectedGoal = writable<string | null>(null);

// UI Layout
export const sidebarCollapsed = writable(false);
export const isDarkMode = writable(false);

// Helper functions
export function switchMode(mode: PlanningMode) {
  currentMode.set(mode);
  // Clear dynamic panels when switching modes
  panels.set([]);
  activePanel.set(null);
}

export function createPanel(panel: Panel) {
  panels.update(current => [...current, panel]);
}

export function removePanel(id: string) {
  panels.update(current => current.filter(p => p.id !== id));
}

export function updatePanel(id: string, updates: Partial<Panel>) {
  panels.update(current => 
    current.map(p => p.id === id ? { ...p, ...updates } : p)
  );
}

export function resetUI() {
  panels.set([]);
  activePanel.set(null);
  selectedPolicy.set(null);
  selectedSite.set(null);
  selectedScenario.set(null);
  selectedGoal.set(null);
  currentMode.set('Policy');
  currentWorkspace.set('PlanMaking');
}
