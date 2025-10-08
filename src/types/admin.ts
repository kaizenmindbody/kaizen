// Admin related interfaces
import { User, Specialty, Stats } from './user';

export interface OverviewProps {
  stats: Stats;
  onTabChange: (tab: string) => void;
  loading?: boolean;
}

export interface SpecialtiesProps {
  specialties: Specialty[];
  onRefreshData: () => void;
}

export interface SettingsProps {
  users: User[];
  specialties: Specialty[];
  stats: Stats;
  onRefreshData: () => void;
}