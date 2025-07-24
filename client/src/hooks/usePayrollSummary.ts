import { useQuery } from '@tanstack/react-query';

export function usePayrollSummary() {
  return useQuery({
    queryKey: ['payrollSummary'],
    queryFn: async () => {
      const res = await fetch('/api/payroll/summary');
      if (!res.ok) throw new Error('Failed to fetch payroll summary');
      return res.json();
    }
  });
}

export function usePayrollEmployees() {
  return useQuery({
    queryKey: ['payrollEmployees'],
    queryFn: async () => {
      const res = await fetch('/api/payroll/employees');
      if (!res.ok) throw new Error('Failed to fetch payroll employees');
      return res.json();
    }
  });
}

export function usePayrollRuns() {
  return useQuery({
    queryKey: ['payrollRuns'],
    queryFn: async () => {
      const res = await fetch('/api/payroll/runs');
      if (!res.ok) throw new Error('Failed to fetch payroll runs');
      const data = await res.json();
      return data.payrollRuns || [];
    }
  });
}