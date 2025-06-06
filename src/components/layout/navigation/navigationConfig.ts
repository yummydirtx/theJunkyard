import LaunchIcon from '@mui/icons-material/Launch';

export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: React.ComponentType;
}

export const mainNavigationItems: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Manual Budget', href: '/manualbudget' },
  { label: 'Expense Report', href: '/expensereport' },
  { label: 'AnteaterFind', href: 'https://anteaterfind.com', external: true, icon: LaunchIcon },
];

export const moreNavigationItems: NavigationItem[] = [
  { label: 'calcBasic', href: '/calcbasic-web' },
  { label: 'YTThumb', href: '/ytthumb' },
];
