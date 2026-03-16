export interface INavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  isActive?: boolean;
  children?: INavItem[];
  requiredPolicy?: string; //for showing and hidding the sidebar according authorization 
}
