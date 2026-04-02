import { IPermission } from "@features/shifts/models/iattendance";

export const MOCK_PERMISSIONS: IPermission[] = [
  // Approved (11 items)
  { id: '1', employeeId: 'EMP001', type: 'holiday', date: '2026-04-10', reason: 'Annual Leave', status: 'approved' },
  { id: '2', employeeId: 'EMP002', type: 'holiday', date: '2026-04-11', reason: 'Summer Vacation', status: 'approved' },
  { id: '3', employeeId: 'EMP003', type: 'holiday', date: '2026-04-12', reason: 'Sick Leave', status: 'approved' },
  { id: '4', employeeId: 'EMP004', type: 'holiday', date: '2026-04-13', reason: 'Personal Leave', status: 'approved' },
  { id: '5', employeeId: 'EMP005', type: 'permission', date: '2026-04-14', reason: 'Doctor Appointment', status: 'approved' },
  { id: '6', employeeId: 'EMP006', type: 'permission', date: '2026-04-15', reason: 'Work from Home', status: 'approved' },
  { id: '7', employeeId: 'EMP007', type: 'permission', date: '2026-04-16', reason: 'Training Session', status: 'approved' },
  { id: '8', employeeId: 'EMP008', type: 'permission', date: '2026-04-17', reason: 'Legal Work', status: 'approved' },
  { id: '9', employeeId: 'EMP009', type: 'excuse', date: '2026-04-18', reason: 'Traffic Jam', status: 'approved' },
  { id: '10', employeeId: 'EMP010', type: 'excuse', date: '2026-04-19', reason: 'Car Breakdown', status: 'approved' },
  { id: '11', employeeId: 'EMP011', type: 'excuse', date: '2026-04-20', reason: 'Hospital Visit', status: 'approved' },

  // Pending (11 items)
  { id: '12', employeeId: 'EMP012', type: 'holiday', date: '2026-04-21', reason: 'Eid Holiday', status: 'pending' },
  { id: '13', employeeId: 'EMP013', type: 'holiday', date: '2026-04-22', reason: 'National Holiday', status: 'pending' },
  { id: '14', employeeId: 'EMP014', type: 'holiday', date: '2026-04-23', reason: 'Religious Holiday', status: 'pending' },
  { id: '15', employeeId: 'EMP015', type: 'holiday', date: '2026-04-24', reason: 'Maternity Leave', status: 'pending' },
  { id: '16', employeeId: 'EMP016', type: 'holiday', date: '2026-04-25', reason: 'Paternity Leave', status: 'pending' },
  { id: '17', employeeId: 'EMP017', type: 'permission', date: '2026-04-26', reason: 'Half Day Leave', status: 'pending' },
  { id: '18', employeeId: 'EMP018', type: 'permission', date: '2026-04-27', reason: 'Client Meeting', status: 'pending' },
  { id: '19', employeeId: 'EMP019', type: 'permission', date: '2026-04-28', reason: 'Bank Work', status: 'pending' },
  { id: '20', employeeId: 'EMP020', type: 'excuse', date: '2026-04-29', reason: 'Late Bus', status: 'pending' },
  { id: '21', employeeId: 'EMP021', type: 'excuse', date: '2026-05-01', reason: 'Child Illness', status: 'pending' },
  { id: '22', employeeId: 'EMP022', type: 'excuse', date: '2026-05-02', reason: 'Power Outage', status: 'pending' },

  // Rejected (11 items)
  { id: '23', employeeId: 'EMP023', type: 'holiday', date: '2026-05-03', reason: 'Wedding Anniversary', status: 'rejected' },
  { id: '24', employeeId: 'EMP024', type: 'holiday', date: '2026-05-04', reason: 'Not Approved', status: 'rejected' },
  { id: '25', employeeId: 'EMP025', type: 'holiday', date: '2026-05-05', reason: 'Policy Violation', status: 'rejected' },
  { id: '26', employeeId: 'EMP026', type: 'permission', date: '2026-05-06', reason: 'Family Emergency', status: 'rejected' },
  { id: '27', employeeId: 'EMP027', type: 'permission', date: '2026-05-07', reason: 'Car Maintenance', status: 'rejected' },
  { id: '28', employeeId: 'EMP028', type: 'permission', date: '2026-05-08', reason: 'Government Work', status: 'rejected' },
  { id: '29', employeeId: 'EMP029', type: 'permission', date: '2026-05-09', reason: 'School Meeting', status: 'rejected' },
  { id: '30', employeeId: 'EMP030', type: 'excuse', date: '2026-05-10', reason: 'Weather Conditions', status: 'rejected' },
  { id: '31', employeeId: 'EMP031', type: 'excuse', date: '2026-05-11', reason: 'Accident on Road', status: 'rejected' },
  { id: '32', employeeId: 'EMP032', type: 'excuse', date: '2026-05-12', reason: 'Internet Failure', status: 'rejected' },
  { id: '33', employeeId: 'EMP033', type: 'excuse', date: '2026-05-13', reason: 'System Issue', status: 'rejected' }
];
