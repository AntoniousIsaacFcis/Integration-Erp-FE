// @core/mocks/data/salary.data.ts
import { ISalaryResponse } from "@features/core-hr/models/isalary";

export const MOCK_SALARY_STORE: Record<string, Record<string, Record<string, ISalaryResponse>>> = {
  "1": { // Employee 1 - Project Manager
    "2025": {
      "01": {
        summary: { monthlySalary: 22550, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "02": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "03": {
        summary: { monthlySalary: 10600, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة مشروع', value: 250 }
        ],
        total: 4, page: 1, limit: 10
      },
      "04": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "05": {
        summary: { monthlySalary: 10600, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة أداء', value: 250 }
        ],
        total: 4, page: 1, limit: 10
      },
      "06": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "07": {
        summary: { monthlySalary: 10850, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'بدل أجازة', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "10": {
        summary: { monthlySalary: 10500, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة الأداء', value: 800 }
        ],
        total: 4, page: 1, limit: 10
      },
      "11": {
        summary: { monthlySalary: 10350, status: 'PENDING', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "12": {
        summary: { monthlySalary: 11050, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'مكافأة نهاية السنة', value: 700 }
        ],
        total: 4, page: 1, limit: 10
      }
    },
    "2026": {
      "01": {
        summary: { monthlySalary: 20260, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة سنوية', value: 150 }
        ],
        total: 4, page: 1, limit: 10
      },
      "02": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "03": {
        summary: { monthlySalary: 10600, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة مشروع', value: 250 }
        ],
        total: 4, page: 1, limit: 10
      },
      "04": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "05": {
        summary: { monthlySalary: 10650, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة أداء متقدمة', value: 300 }
        ],
        total: 4, page: 1, limit: 10
      },
      "06": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "07": {
        summary: { monthlySalary: 10900, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'بدل أجازة صيفية', value: 550 }
        ],
        total: 4, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 10400, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة محاسبية', value: 50 }
        ],
        total: 4, page: 1, limit: 10
      },
      "10": {
        summary: { monthlySalary: 10600, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 175, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة الأداء', value: 250 }
        ],
        total: 4, page: 1, limit: 10
      },
      "11": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "12": {
        summary: { monthlySalary: 11200, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'مكافأة نهاية السنة', value: 850 }
        ],
        total: 4, page: 1, limit: 10
      }
    },
    "2027": {
      "01": {
        summary: { monthlySalary: 20270, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة سنوية موسعة', value: 300 }
        ],
        total: 4, page: 1, limit: 10
      },
      "02": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "03": {
        summary: { monthlySalary: 10700, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة قيادة مشروع', value: 350 }
        ],
        total: 4, page: 1, limit: 10
      },
      "04": {
        summary: { monthlySalary: 10350, status: 'PENDING', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "05": {
        summary: { monthlySalary: 10700, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة أداء متميز', value: 350 }
        ],
        total: 4, page: 1, limit: 10
      },
      "06": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "07": {
        summary: { monthlySalary: 11000, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'بدل أجازة صيفية موسعة', value: 650 }
        ],
        total: 4, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 10350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 10450, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة إدارية', value: 100 }
        ],
        total: 4, page: 1, limit: 10
      },
      "10": {
        summary: { monthlySalary: 10700, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة الأداء', value: 350 }
        ],
        total: 4, page: 1, limit: 10
      },
      "11": {
        summary: { monthlySalary: 10400, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة محاسبية', value: 50 }
        ],
        total: 4, page: 1, limit: 10
      },
      "12": {
        summary: { monthlySalary: 11350, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'مكافأة نهاية السنة', value: 1000 }
        ],
        total: 4, page: 1, limit: 10
      }
    },
    "2028": {
      "01": {
        summary: { monthlySalary: 10750, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8350 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة سنوية 2028', value: 400 }
        ],
        total: 4, page: 1, limit: 10
      }
    }
  },
  "2": { // Employee 2 - Software Developer
    "2025": {
      "10": {
        summary: { monthlySalary: 11100, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8700 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة مشروع', value: 400 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 10700, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8700 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 10700, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 8700 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 10900, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 8700 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 700 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "3": { // Employee 3 - General Accountant
    "2025": {
      "10": {
        summary: { monthlySalary: 11550, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 9050 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة فئة', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 11050, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 9050 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 11050, status: 'PENDING', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 9050 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 10750, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 9050 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 200 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "4": { // Employee 4 - HR Specialist
    "2025": {
      "10": {
        summary: { monthlySalary: 11900, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 9400 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة التدريب', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 11400, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 9400 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 11400, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 9400 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 11400, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 9400 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "5": { // Employee 5 - Sales Manager
    "2025": {
      "10": {
        summary: { monthlySalary: 12250, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 9750 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'عمولة المبيعات', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 11750, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 9750 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 11750, status: 'PENDING', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 9750 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 12000, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 9750 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 750 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "6": { // Employee 6 - Project Manager
    "2025": {
      "10": {
        summary: { monthlySalary: 12600, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 10100 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة الإدارة', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 12100, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 10100 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 12100, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 10100 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 12100, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 10100 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "7": { // Employee 7 - Software Developer
    "2025": {
      "10": {
        summary: { monthlySalary: 12950, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 10450 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة تطوير', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 12450, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 10450 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 12450, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 10450 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 12450, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 10450 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "8": { // Employee 8 - General Accountant
    "2025": {
      "10": {
        summary: { monthlySalary: 13300, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 10800 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة محاسبة', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 12800, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 10800 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 12800, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 10800 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 12800, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 10800 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "9": { // Employee 9 - HR Specialist
    "2025": {
      "10": {
        summary: { monthlySalary: 13650, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 11150 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'علاوة موارد بشرية', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 13150, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 11150 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 13150, status: 'PENDING', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 11150 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 13150, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 11150 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  },
  "10": { // Employee 10 - Sales Manager
    "2025": {
      "10": {
        summary: { monthlySalary: 14000, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 11500 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 },
          { nameAr: 'عمولة مبيعات', value: 500 }
        ],
        total: 4, page: 1, limit: 10
      },
      "09": {
        summary: { monthlySalary: 13500, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 11500 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      },
      "08": {
        summary: { monthlySalary: 13500, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 20, hours: 160, value: 11500 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'بدل المواصلات', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    },
    "2026": {
      "12": {
        summary: { monthlySalary: 13500, status: 'PAID', currency: 'ريال' },
        elements: [
          { nameAr: 'راتب شهري أساسي', days: 22, hours: 176, value: 11500 },
          { nameAr: 'بدل السكن', value: 1500 },
          { nameAr: 'مكافأة نهاية السنة', value: 500 }
        ],
        total: 3, page: 1, limit: 10
      }
    }
  }
};
