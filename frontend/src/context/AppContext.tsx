import React, { createContext, useContext, useReducer, type ReactNode } from 'react';

interface UserInfo {
  name: string;
  type?: string;
}

interface AppState {
  user: UserInfo | null;
  projects: any[];
  numberTypes: any[];
  applications: any[];
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

type AppAction = 
  | { type: 'SET_USER'; payload: UserInfo | null }
  | { type: 'SET_PROJECTS'; payload: any[] }
  | { type: 'SET_NUMBER_TYPES'; payload: any[] }
  | { type: 'SET_APPLICATIONS'; payload: any[] }
  | { type: 'SET_ADMIN'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  user: null,
  projects: [],
  numberTypes: [],
  applications: [],
  isAdmin: localStorage.getItem('isAdmin') === 'true',
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };
    case 'SET_NUMBER_TYPES':
      return { ...state, numberTypes: action.payload };
    case 'SET_APPLICATIONS':
      return { ...state, applications: action.payload };
    case 'SET_ADMIN':
      return { ...state, isAdmin: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
