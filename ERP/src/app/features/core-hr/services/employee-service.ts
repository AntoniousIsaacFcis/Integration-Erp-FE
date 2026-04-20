import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment.development';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { IEmployeeForm, IEmployeeResponse } from '../models/iemployee';
import { ICreateStaffPayload, IStaffApiItem, IStaffApiResponse } from '../models/istaff';
import { EmployeeDocumentService } from './employee-document-service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly employeeDocumentService = inject(EmployeeDocumentService);
  private readonly API_URL = `${environment.baseUrl}/api/core-hR/staff`;

  createEmployee(employeeData: IEmployeeForm): Observable<IEmployeeForm> {
    const payload = this.toCreateStaffPayload(employeeData);

    return this.http.post<IStaffApiItem>(this.API_URL, payload).pipe(
      concatMap((staff) =>
        this.employeeDocumentService
          .createDocumentsForStaff(
            staff.id,
            employeeData.documents ?? [],
            employeeData.documentTypeId,
            employeeData.documentTypeName,
          )
          .pipe(
            catchError((error) => {
              console.warn('Employee created, but document upload failed:', error);
              return of([]);
            }),
            map((documents) => ({
              ...this.mapStaffToEmployee(staff),
              documents,
              documentTypeId: employeeData.documentTypeId,
              documentTypeName: employeeData.documentTypeName,
              documentExpiryDate: employeeData.documentExpiryDate,
            })),
          ),
      ),
    );
  }

  updateEmployee(id: string, employeeData: IEmployeeForm): Observable<IEmployeeForm> {
    const payload = this.toCreateStaffPayload(employeeData);

    return this.http.put<IStaffApiItem>(`${this.API_URL}/${id}`, payload).pipe(
      concatMap((staff) =>
        this.employeeDocumentService
          .createDocumentsForStaff(
            staff.id,
            employeeData.documents ?? [],
            employeeData.documentTypeId,
            employeeData.documentTypeName,
          )
          .pipe(
            catchError((error) => {
              console.warn('Employee updated, but document upload failed:', error);
              return of([]);
            }),
            map((documents) => ({
              ...this.mapStaffToEmployee(staff),
              documents,
              documentTypeId: employeeData.documentTypeId,
              documentTypeName: employeeData.documentTypeName,
              documentExpiryDate: employeeData.documentExpiryDate,
            })),
          ),
      ),
    );
  }

  getEmployeeById(id: string): Observable<IEmployeeForm> {
    return this.http
      .get<IStaffApiItem>(`${this.API_URL}/${id}`)
      .pipe(map((response) => this.mapStaffToEmployee(response)));
  }

  getEmployees(params: {
    page: number;
    limit: number;
    search?: string;
    hireDate?: string;
  }): Observable<IEmployeeResponse> {
    const normalizedSearch = params.search?.trim();
    const normalizedHireDate = params.hireDate?.trim();

    return this.http
      .get<IStaffApiResponse>(this.API_URL, {
        params: {
          skipCount: (params.page - 1) * params.limit,
          maxResultCount: params.limit,
          ...(normalizedSearch && {
            filter: normalizedSearch,
            search: normalizedSearch,
            searchTerm: normalizedSearch,
            q: normalizedSearch,
          }),
          ...(normalizedHireDate && {
            hireDate: normalizedHireDate,
          }),
        },
      })
      .pipe(
        map((response) => ({
          data: response.items.map((item) => this.mapStaffToEmployee(item)),
          total: response.totalCount,
          page: params.page,
          limit: params.limit,
        })),
      );
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  private mapStaffToEmployee(staff: IStaffApiItem): IEmployeeForm {
    const customData = this.parseCustomData(staff.customData);
    const salary = (customData['salary'] as Record<string, unknown> | undefined) ?? {};
    const basicSalary = this.toNumberOrNull(staff.basicSalary);
    const allowanceAmount = this.toNumberOrNull(staff.allowanceAmount);
    const deductionAmount = this.toNumberOrNull(staff.deductionAmount);
    const totalSalary =
      this.toNumberOrNull(staff.totalSalary) ??
      (basicSalary != null || allowanceAmount != null || deductionAmount != null
        ? (basicSalary ?? 0) + (allowanceAmount ?? 0) - (deductionAmount ?? 0)
        : null);
    const fullNameAr = this.composeName(
      (customData['fullNameAr'] as string | undefined) ?? staff.fullNameAr,
      staff.fullName,
      staff.firstName,
      staff.middleName,
      staff.lastName,
    );
    const fullNameEn = this.composeName(
      (customData['fullNameEn'] as string | undefined) ?? staff.fullNameEn,
      undefined,
      staff.firstNameEn,
      staff.middleNameEn,
      staff.lastNameEn,
    );

    return {
      id: staff.id,
      staffCode: staff.staffCode ?? staff.id,
      fullNameAr,
      fullNameEn: fullNameEn || fullNameAr,
      nationalId: staff.nationalId?.trim() || '',
      gender: this.mapGenderForUi(staff.gender),
      nationality:
        staff.nationalityId ??
        (customData['nationalityId'] as string | undefined) ??
        staff.nationalityCode ??
        '',
      birthDate: this.normalizeDate(staff.birthDate),
      maritalStatus: this.mapMaritalStatusForUi(staff.maritalStatus),
      phone: staff.phone?.trim() || staff.mobileNumber?.trim() || '',
      email: staff.email?.trim() || '',
      address:
        staff.presentAddressLine1?.trim() ||
        staff.address?.trim() ||
        (customData['address'] as string | undefined) ||
        '',
      emergencyContact:
        staff.emergencyContactPhone?.trim() ||
        (customData['emergencyPhone'] as string | undefined) ||
        '',
      emergencyPhone:
        staff.emergencyContactPhone?.trim() ||
        (customData['emergencyPhone'] as string | undefined) ||
        '',
      fingerPrintNumber: (customData['fingerPrintNumber'] as string | undefined) || '',
      jobTitleId: staff.designationId?.trim() || '',
      departmentId: staff.departmentId?.trim() || '',
      employmentType: staff.employmentTypeId?.trim() || '',
      employmentStatus: staff.employmentStatusId?.trim() || (customData['employmentStatusId'] as string | undefined) || '',
      employmentStatusName: (customData['employmentStatusName'] as string | undefined) || '',
      joiningDate: this.normalizeDate(staff.hireDate),
      probationPeriod: this.normalizeProbationDate(
        staff.probationEndDate ||
        (customData['probationEndDate'] as string | undefined) ||
        (customData['probationPeriod'] as string | undefined),
        staff.hireDate,
      ),
      basicSalary: basicSalary ?? Number(salary['basicSalary'] ?? 0),
      allowances: allowanceAmount ?? Number(salary['allowances'] ?? 0),
      deductions: deductionAmount ?? Number(salary['deductions'] ?? 0),
      totalSalary: totalSalary ?? Number(salary['totalSalary'] ?? salary['basicSalary'] ?? 0),
      documentTypeId: (customData['documentTypeId'] as string | undefined) || undefined,
      documentTypeName: (customData['documentTypeName'] as string | undefined) || undefined,
      documentExpiryDate: this.normalizeDate(
        (customData['documentExpiryDate'] as string | undefined) || undefined,
      ) || undefined,
      isActive: staff.isActive ?? true,
      customData: staff.customData ?? null,
      documents: [],
    };
  }

  private toCreateStaffPayload(employeeData: IEmployeeForm): ICreateStaffPayload {
    const arabicName = this.splitFullName(employeeData.fullNameAr);
    const englishName = this.splitFullName(employeeData.fullNameEn);

    return {
      staffCode: employeeData.staffCode?.trim() || null,
      firstName: arabicName.firstName,
      middleName: arabicName.middleName,
      lastName: arabicName.lastName,
      firstNameEn: englishName.firstName,
      middleNameEn: englishName.middleName,
      lastNameEn: englishName.lastName,
      email: employeeData.email?.trim() || null,
      phone: employeeData.phone?.trim() || null,
      emergencyContactPhone:
        employeeData.emergencyPhone?.trim() || employeeData.emergencyContact?.trim() || null,
      nationalId: employeeData.nationalId?.trim() || null,
      birthDate: employeeData.birthDate || null,
      gender: this.mapGenderForApi(employeeData.gender),
      maritalStatus: this.mapMaritalStatusForApi(employeeData.maritalStatus),
      departmentId: employeeData.departmentId?.trim() || null,
      designationId: employeeData.jobTitleId?.trim() || null,
      employmentTypeId: employeeData.employmentType?.trim() || null,
      employmentStatusId: employeeData.employmentStatus?.trim() || null,
      probationEndDate: employeeData.probationPeriod || null,
      nationalityId: employeeData.nationality?.trim() || null,
      hireDate: employeeData.joiningDate || null,
      presentAddressLine1: employeeData.address?.trim() || null,
      isActive: !/inactive/i.test(employeeData.employmentStatusName || ''),
      customData: JSON.stringify({
        fullNameAr: employeeData.fullNameAr?.trim() || null,
        fullNameEn: employeeData.fullNameEn?.trim() || null,
        nationalityId: employeeData.nationality || null,
        address: employeeData.address || null,
        emergencyPhone: employeeData.emergencyPhone || employeeData.emergencyContact || null,
        employmentStatusId: employeeData.employmentStatus || null,
        employmentStatusName: employeeData.employmentStatusName || null,
        probationEndDate: employeeData.probationPeriod || null,
        fingerPrintNumber: employeeData.fingerPrintNumber || null,
        documentTypeId: employeeData.documentTypeId || null,
        documentTypeName: employeeData.documentTypeName || null,
        documentExpiryDate: employeeData.documentExpiryDate || null,
        salary: {
          basicSalary: Number(employeeData.basicSalary || 0),
          allowances: Number(employeeData.allowances || 0),
          deductions: Number(employeeData.deductions || 0),
          totalSalary: Number(
            employeeData.totalSalary ??
              Number(employeeData.basicSalary || 0) +
                Number(employeeData.allowances || 0) -
                Number(employeeData.deductions || 0),
          ),
        },
      }),
    };
  }

  private splitFullName(fullName: string | undefined) {
    const cleanedName = fullName?.trim() || '';
    const parts = cleanedName.split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      return {
        firstName: '',
        middleName: null as string | null,
        lastName: '',
      };
    }

    if (parts.length === 1) {
      return {
        firstName: parts[0],
        middleName: null as string | null,
        lastName: parts[0],
      };
    }

    return {
      firstName: parts[0],
      middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : null,
      lastName: parts[parts.length - 1],
    };
  }

  private composeName(
    preferredFullName?: string | null,
    fallbackFullName?: string | null,
    firstName?: string | null,
    middleName?: string | null,
    lastName?: string | null,
  ): string {
    const composedName = [firstName, middleName, lastName].filter(Boolean).join(' ').trim();
    return preferredFullName?.trim() || fallbackFullName?.trim() || composedName || '';
  }

  private parseCustomData(customData?: string | null): Record<string, any> {
    if (!customData) {
      return {};
    }

    try {
      return JSON.parse(customData);
    } catch {
      return {};
    }
  }

  private normalizeDate(value?: string | null): string {
    const normalizedValue = value?.trim() || '';

    if (!normalizedValue) {
      return '';
    }

    const isoDateMatch = normalizedValue.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoDateMatch) {
      return isoDateMatch[0];
    }

    return normalizedValue;
  }

  private normalizeProbationDate(value?: string | null, hireDate?: string | null): string {
    const normalizedValue = this.normalizeDate(value);

    if (!normalizedValue) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
      return normalizedValue;
    }

    const normalizedHireDate = this.normalizeDate(hireDate);
    if (!normalizedHireDate) {
      return '';
    }

    const durationMatch = normalizedValue.match(/(\d+)\s*(day|days|week|weeks|month|months|year|years)/i);
    if (!durationMatch) {
      return '';
    }

    const amount = Number(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    const probationDate = new Date(`${normalizedHireDate}T00:00:00`);

    if (Number.isNaN(probationDate.getTime())) {
      return '';
    }

    if (unit.startsWith('day')) {
      probationDate.setDate(probationDate.getDate() + amount);
    } else if (unit.startsWith('week')) {
      probationDate.setDate(probationDate.getDate() + (amount * 7));
    } else if (unit.startsWith('month')) {
      probationDate.setMonth(probationDate.getMonth() + amount);
    } else if (unit.startsWith('year')) {
      probationDate.setFullYear(probationDate.getFullYear() + amount);
    }

    return probationDate.toISOString().slice(0, 10);
  }

  private toNumberOrNull(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsedValue = Number(value);
      return Number.isFinite(parsedValue) ? parsedValue : null;
    }

    return null;
  }

  private mapGenderForApi(value: IEmployeeForm['gender']): string | null {
    return this.toBackendEnumValue(value);
  }

  private mapGenderForUi(value?: string | number | null): IEmployeeForm['gender'] {
    return this.toUiEnumValue(value, {
      1: 'male',
      2: 'female',
      3: 'not-to-say',
    }) || 'male';
  }

  private mapMaritalStatusForApi(value: string): string | null {
    return this.toBackendEnumValue(value);
  }

  private mapMaritalStatusForUi(value?: string | number | null): string {
    return this.toUiEnumValue(value, {
      1: 'single',
      2: 'married',
      3: 'divorced',
      4: 'widowed',
    }) || 'single';
  }

  private toBackendEnumValue(value?: string | null): string | null {
    const normalizedValue = this.toUiEnumValue(value);

    if (!normalizedValue) {
      return null;
    }

    return normalizedValue
      .split(/[_-]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  private toUiEnumValue(
    value?: string | number | null,
    numericMap?: Record<number, string>,
  ): string {
    if (value == null || value === '') {
      return '';
    }

    if (typeof value === 'number') {
      return numericMap?.[value] ?? '';
    }

    return value
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }
}
