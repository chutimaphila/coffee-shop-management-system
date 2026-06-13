export class EmployeeInfoDto {
  employee_id: number;
  employee_name: string;
  position: string;
  branch_name: string | null;
}

export class SalaryResponseDto {
  id: number;
  is_paid: boolean;
  wage: number;
  total_amount: number;
  working_hours: number;
  salary_date: Date;
  employee: EmployeeInfoDto;
}
