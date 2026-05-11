import '@angular/compiler';
import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator } from './date-range.validator';
import { describe, expect, it } from 'vitest';

describe('dateRangeValidator', () => {
  it('should allow same-day ranges for half leave and single-day leave', () => {
    const group = new FormGroup({
      fromDate: new FormControl('2026-05-11'),
      toDate: new FormControl('2026-05-11'),
    }, { validators: [dateRangeValidator('fromDate', 'toDate')] });

    expect(group.valid).toBe(true);
    expect(group.errors).toBeNull();
    expect(group.get('toDate')?.errors).toBeNull();
  });

  it('should reject when the end date is before the start date', () => {
    const group = new FormGroup({
      fromDate: new FormControl('2026-05-11'),
      toDate: new FormControl('2026-05-10'),
    }, { validators: [dateRangeValidator('fromDate', 'toDate')] });

    expect(group.valid).toBe(false);
    expect(group.errors?.['dateRangeInvalid']).toBe(true);
    expect(group.get('toDate')?.errors?.['dateRangeInvalid']).toBe(true);
  });

  it('should stay valid when either date is missing', () => {
    const group = new FormGroup({
      fromDate: new FormControl('2026-05-11'),
      toDate: new FormControl(''),
    }, { validators: [dateRangeValidator('fromDate', 'toDate')] });

    expect(group.valid).toBe(true);
    expect(group.errors).toBeNull();
  });
});
