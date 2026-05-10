export interface IHolidayListDay {
  id: string;
  date: string;
  title: string;
}

export interface IHolidayList {
  id: string;
  name: string;
  calculateAttendanceOnOffDays: boolean;
  totalDays: number;
  days: IHolidayListDay[];
  creationTime?: string;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
  deletionTime?: string | null;
  deleterId?: string | null;
  isDeleted?: boolean;
}

export interface IHolidayListApiDayItem {
  id: string;
  date: string;
  title: string;
}

export interface IHolidayListApiItem {
  id: string;
  name: string;
  calculateAttendanceOnOffDays: boolean;
  totalDays: number;
  days: IHolidayListApiDayItem[];
  creationTime: string;
  creatorId: string | null;
  lastModificationTime: string | null;
  lastModifierId: string | null;
  deletionTime: string | null;
  deleterId: string | null;
  isDeleted?: boolean;
}

export interface IHolidayListApiResponse {
  totalCount: number;
  items: IHolidayListApiItem[];
}

export interface IHolidayListListResponse {
  data: IHolidayList[];
  total: number;
  page: number;
  limit: number;
}

export interface IGetHolidayListListInput {
  page: number;
  limit: number;
  search?: string;
  sorting?: string;
}

export interface ICreateHolidayListDay {
  date: string;
  title: string;
}

export interface ICreateHolidayList {
  name: string;
  calculateAttendanceOnOffDays: boolean;
  days: ICreateHolidayListDay[];
}

export interface IUpdateHolidayList extends ICreateHolidayList {}
