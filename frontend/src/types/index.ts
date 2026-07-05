/**
 * CarbonTrack TypeScript Type Definitions
 * ─────────────────────────────────────────────────────────────
 * Central place for all TypeScript types used across the app
 */

// ═══════════════════════════════════════════════════════════════
// USER & AUTH TYPES
// ═══════════════════════════════════════════════════════════════

export interface User {
  userId: number;
  username: string;
  email: string;
  role: UserRole;
  organisationId?: number;
  totalEmissions?: number;
  createdAt?: string;
}

export type UserRole = 'USER' | 'ADMIN' | 'ORG_ADMIN';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  username: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY TYPES
// ═══════════════════════════════════════════════════════════════

export interface Activity {
  id: number;
  userId: number;
  category: ActivityCategory;
  activityType: string;
  amount: number;
  unit: string;
  calculatedEmissions: number;
  logDate: string;
  createdAt: string;
}

export type ActivityCategory = 'Transportation' | 'Energy' | 'Waste' | 'Food' | 'Other';

export interface CreateActivityRequest {
  category: ActivityCategory;
  activityType: string;
  amount: number;
  unit: string;
  calculatedEmissions: number;
  logDate: string;
}

export interface ActivityListResponse {
  activities: Activity[];
  total: number;
  limit: number;
  offset: number;
}

// ═══════════════════════════════════════════════════════════════
// GOAL TYPES
// ═══════════════════════════════════════════════════════════════

export interface Goal {
  id: number;
  userId: number;
  title: string;
  targetEmissions: number;
  currentEmissions: number;
  progress: number;
  startDate: string;
  targetDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  createdAt: string;
}

export interface CreateGoalRequest {
  title: string;
  targetEmissions: number;
  startDate: string;
  targetDate: string;
}

export interface GoalProgress {
  goalId: number;
  progress: number;
  currentEmissions: number;
  targetEmissions: number;
  daysRemaining: number;
}

// ═══════════════════════════════════════════════════════════════
// LEADERBOARD TYPES
// ═══════════════════════════════════════════════════════════════

export interface LeaderboardUser {
  rank: number;
  userId: number;
  username: string;
  totalEmissionsSaved: number;
  badge?: string;
  percentile?: number;
}

export interface LeaderboardResponse {
  topThree: LeaderboardUser[];
  all: LeaderboardUser[];
  currentUser?: LeaderboardUser;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// ORGANIZATION TYPES
// ═══════════════════════════════════════════════════════════════

export interface Organisation {
  organisationId: number;
  organisationName: string;
  totalEmployees: number;
  totalEmissionsCO2: number;
  averageEmissionsPerEmployee: number;
  targetEmissions: number;
  targetProgress: number;
}

export interface MonthlyEmission {
  month: string;
  totalEmissions: number;
}

export interface DepartmentComparison {
  department: string;
  emissions: number;
  employees?: number;
}

export interface EmployeeSummary {
  rank: number;
  userId: number;
  username: string;
  emissions: number;
  emissionsSaved: number;
  department?: string;
}

export interface OrganisationDashboard extends Organisation {
  monthlyData: MonthlyEmission[];
  departmentComparison: DepartmentComparison[];
  topEmployees: EmployeeSummary[];
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD TYPES
// ═══════════════════════════════════════════════════════════════

export interface DashboardOverview {
  totalActivities: number;
  totalEmissions: number;
  currentMonth: {
    activities: number;
    emissions: number;
  };
  monthlyTrend: MonthlyEmission[];
  recentActivities: Activity[];
}

export interface DashboardStats {
  totalEmissions: number;
  averageEmissionsPerActivity: number;
  topCategory: ActivityCategory;
  goalsCompleted: number;
  streakDays: number;
}

// ═══════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT PROP TYPES
// ═══════════════════════════════════════════════════════════════

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success' | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  hint?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
}

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  hidden?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  isSorting?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  title?: string;
  caption?: string;
  zebra?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════════════════

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface Pagination {
  limit: number;
  offset: number;
  total: number;
}

export interface FilterOptions {
  category?: ActivityCategory;
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'COMPLETED';
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT TYPES
// ═══════════════════════════════════════════════════════════════

export interface AuthContextType {
  user: Nullable<User>;
  token: Nullable<string>;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Nullable<Error>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

export interface ActivityContextType {
  activities: Activity[];
  isLoading: boolean;
  error: Nullable<Error>;
  total: number;
  fetchActivities: (filters?: FilterOptions) => Promise<void>;
  createActivity: (activity: CreateActivityRequest) => Promise<Activity>;
  deleteActivity: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export interface GoalContextType {
  goals: Goal[];
  isLoading: boolean;
  error: Nullable<Error>;
  fetchGoals: () => Promise<void>;
  createGoal: (goal: CreateGoalRequest) => Promise<Goal>;
  deleteGoal: (id: number) => Promise<void>;
  getProgress: (id: number) => Promise<GoalProgress>;
}
