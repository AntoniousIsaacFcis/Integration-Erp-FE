export interface IStaffApiItem {
  id: string;
  staffCode?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  mobileNumber?: string | null;
}

export interface IStaffApiResponse {
  totalCount: number;
  items: IStaffApiItem[];
}
