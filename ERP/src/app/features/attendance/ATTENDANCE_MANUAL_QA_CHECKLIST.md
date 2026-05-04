# Attendance Manual QA Checklist

Use this checklist for quick UI verification after attendance changes. The goal is to confirm that the frontend displays backend values correctly and refreshes after user actions.

## 1. Present
- Open an attendance day marked as present.
- Confirm check-in and check-out are visible.
- Confirm worked time is displayed as hours and minutes.
- Confirm delay, early leave, and leave count are shown only if backend values exist.

## 2. Late
- Open a day where the employee arrived late.
- Confirm the delay minutes are displayed from backend data.
- Confirm no frontend recalculation changes the value.

## 3. Late With Permission
- Open a late day that has an attendance permission.
- Confirm the day still shows the backend delay minutes.
- Confirm the permission is visible as a separate display concern, not as a replacement for leave.

## 4. Early Leave
- Open a day where the employee left early.
- Confirm early leave minutes are displayed from backend data.
- Confirm the value is shown in a readable hours/minutes format.

## 5. Full Leave
- Open a full leave day.
- Confirm the leave label clearly shows full leave.
- Confirm leave count is displayed from backend data.
- Confirm attendance times are not shown as regular presence data.

## 6. Half Leave
- Open a half leave day.
- Confirm the leave label clearly shows half leave.
- Confirm leave count is visible and matches backend data.
- Confirm it does not render as a full leave day.

## 7. No Shift
- Open a day with no resolved shift.
- Confirm the UI still loads without breaking.
- Confirm the day shows whatever backend attendance data exists, even if shift info is missing.

## 8. No Logs
- Open a date or employee range with no attendance logs.
- Confirm the empty state appears.
- Confirm there is no fake attendance row or derived fallback calculation.

## 9. After Log Creation
- Create a new attendance log or day using the normal UI flow.
- Return to the attendance list or reload the page.
- Confirm the new day/log appears after refresh.
- Confirm the displayed minutes and leave values match backend data after reload.

## Quick Exit Criteria
- No frontend-calculated attendance values are introduced.
- Leave and permission data remain readable and separate.
- Refresh after create shows updated backend state.
