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
  { label: 'Keystone', href: 'https://gokeystone.org', external: true, icon: LaunchIcon },
  { label: 'AnteaterFind', href: 'https://anteaterfind.com', external: true, icon: LaunchIcon },
];

export const moreNavigationItems: NavigationItem[] = [
  { label: 'Expense Report', href: '/expensereport' },
  { label: 'calcBasic', href: '/calcbasic-web' },
  { label: 'YTThumb', href: '/ytthumb' },
];
