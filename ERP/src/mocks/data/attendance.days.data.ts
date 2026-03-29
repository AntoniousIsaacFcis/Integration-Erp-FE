import { IAttendanceLog } from "@features/shifts/models/iattendance";

export const MOCK_ATTENDANCE_LOGS: IAttendanceLog[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'محمد علي',
    department: 'الموارد البشرية',
    date: '2026-03-25',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'أحمد محمود',
    department: 'التطوير',
    date: '2026-02-25',
    checkIn: '09:15',
    checkOut: '17:30',
    status: 'late'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'سارة حسن',
    department: 'المحاسبة',
    date: '2026-07-26',
    checkIn: '00:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'كريم ضيف',
    department: 'الإدارة',
    date: '2026-03-24',
    checkIn: '08:30',
    checkOut: '16:30',
    status: 'present'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    employeeName: 'فاطمة محمد',
    department: 'البرمجة',
    date: '2026-03-23',
    checkIn: '09:30',
    checkOut: '17:15',
    status: 'present'
  },
  {
    id: '6',
    employeeId: 'EMP006',
    employeeName: 'علي خليل',
    department: 'المبيعات',
    date: '2026-03-22',
    checkIn: '10:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '7',
    employeeId: 'EMP007',
    employeeName: 'نور الدين',
    department: 'التسويق',
    date: '2026-03-21',
    checkIn: '08:45',
    checkOut: '16:45',
    status: 'present'
  },
  {
    id: '8',
    employeeId: 'EMP008',
    employeeName: 'ليلى إبراهيم',
    department: 'الموارد البشرية',
    date: '2026-03-20',
    checkIn: '09:20',
    checkOut: '17:20',
    status: 'present'
  },
  {
    id: '9',
    employeeId: 'EMP009',
    employeeName: 'عماد السعيد',
    department: 'التطوير',
    date: '2026-03-19',
    checkIn: '09:45',
    checkOut: '17:45',
    status: 'late'
  },
  {
    id: '10',
    employeeId: 'EMP010',
    employeeName: 'نجلاء أحمد',
    department: 'المحاسبة',
    date: '2026-03-18',
    checkIn: '09:10',
    checkOut: '17:10',
    status: 'present'
  },
  {
    id: '11',
    employeeId: 'EMP011',
    employeeName: 'حسام علي',
    department: 'الإدارة',
    date: '2026-03-17',
    checkIn: '00:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '12',
    employeeId: 'EMP012',
    employeeName: 'مريم فتحي',
    department: 'البرمجة',
    date: '2026-03-16',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '13',
    employeeId: 'EMP013',
    employeeName: 'سامي ياسين',
    department: 'المبيعات',
    date: '2026-03-15',
    checkIn: '09:30',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '14',
    employeeId: 'EMP014',
    employeeName: 'هند رشيد',
    department: 'التسويق',
    date: '2026-03-14',
    checkIn: '10:30',
    checkOut: '17:30',
    status: 'late'
  },
  {
    id: '15',
    employeeId: 'EMP015',
    employeeName: 'خالد سالم',
    department: 'الموارد البشرية',
    date: '2026-03-13',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '16',
    employeeId: 'EMP016',
    employeeName: 'سمية محمود',
    department: 'التطوير',
    date: '2026-03-12',
    checkIn: '00:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '17',
    employeeId: 'EMP017',
    employeeName: 'ياسر زكي',
    department: 'المحاسبة',
    date: '2026-03-11',
    checkIn: '08:50',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '18',
    employeeId: 'EMP018',
    employeeName: 'هناء جمال',
    department: 'الإدارة',
    date: '2026-03-10',
    checkIn: '09:15',
    checkOut: '17:15',
    status: 'present'
  },
  {
    id: '19',
    employeeId: 'EMP019',
    employeeName: 'محمود ناصر',
    department: 'البرمجة',
    date: '2026-03-09',
    checkIn: '10:00',
    checkOut: '18:00',
    status: 'late'
  },
  {
    id: '20',
    employeeId: 'EMP020',
    employeeName: 'دينا محمد',
    department: 'المبيعات',
    date: '2026-03-08',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '21',
    employeeId: 'EMP021',
    employeeName: 'طارق إسماعيل',
    department: 'التسويق',
    date: '2026-03-07',
    checkIn: '00:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '22',
    employeeId: 'EMP022',
    employeeName: 'ريم سامي',
    department: 'الموارد البشرية',
    date: '2026-03-06',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '23',
    employeeId: 'EMP023',
    employeeName: 'جمال أحمد',
    department: 'التطوير',
    date: '2026-03-05',
    checkIn: '09:20',
    checkOut: '17:20',
    status: 'present'
  },
  {
    id: '24',
    employeeId: 'EMP024',
    employeeName: 'لميس علي',
    department: 'المحاسبة',
    date: '2026-03-04',
    checkIn: '10:15',
    checkOut: '18:00',
    status: 'late'
  },
  {
    id: '25',
    employeeId: 'EMP025',
    employeeName: 'سمير محمود',
    department: 'الإدارة',
    date: '2026-03-03',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '26',
    employeeId: 'EMP026',
    employeeName: 'شيماء أسامة',
    department: 'البرمجة',
    date: '2026-03-02',
    checkIn: '00:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '27',
    employeeId: 'EMP027',
    employeeName: 'رضا حسين',
    department: 'المبيعات',
    date: '2026-03-01',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '28',
    employeeId: 'EMP028',
    employeeName: 'آمنة راشد',
    department: 'التسويق',
    date: '2026-02-28',
    checkIn: '09:30',
    checkOut: '17:30',
    status: 'present'
  },
  {
    id: '29',
    employeeId: 'EMP029',
    employeeName: 'نزار كمال',
    department: 'الموارد البشرية',
    date: '2026-02-27',
    checkIn: '10:00',
    checkOut: '17:45',
    status: 'late'
  },
  {
    id: '30',
    employeeId: 'EMP030',
    employeeName: 'اسراء محمد',
    department: 'التطوير',
    date: '2026-02-26',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '31',
    employeeId: 'EMP031',
    employeeName: 'عمرو فاروق',
    department: 'المحاسبة',
    date: '2026-02-24',
    checkIn: '00:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '32',
    employeeId: 'EMP032',
    employeeName: 'غادة مختار',
    department: 'الإدارة',
    date: '2026-02-23',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '33',
    employeeId: 'EMP033',
    employeeName: 'ياسين حسن',
    department: 'البرمجة',
    date: '2026-02-22',
    checkIn: '09:15',
    checkOut: '17:15',
    status: 'present'
  },
  {
    id: '34',
    employeeId: 'EMP034',
    employeeName: 'هيفاء نواف',
    department: 'المبيعات',
    date: '2026-02-21',
    checkIn: '10:30',
    checkOut: '18:30',
    status: 'late'
  },
  {
    id: '35',
    employeeId: 'EMP035',
    employeeName: 'ياسر محمد',
    department: 'التسويق',
    date: '2026-02-20',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  },
  {
    id: '36',
    employeeId: 'EMP036',
    employeeName: 'نهى فاروق',
    department: 'الموارد البشرية',
    date: '2026-02-19',
    checkIn: '00:00',
    checkOut: '00:00',
    status: 'absent'
  },
  {
    id: '37',
    employeeId: 'EMP037',
    employeeName: 'هشام علي',
    department: 'التطوير',
    date: '2026-02-18',
    checkIn: '09:00',
    checkOut: '17:00',
    status: 'present'
  }
];

