export interface INavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  isActive?: boolean;
  children?: INavItem[];
}
