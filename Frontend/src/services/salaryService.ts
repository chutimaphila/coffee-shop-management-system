import axios from 'axios'

export interface SalaryResponse {
  id: number
  working_hours: number
  wage: number
  is_paid: boolean
  salary_date: string
  employee: {
    employee_id: number
    employee_name: string
    position: string
    imageUrl: string
    branch_name?: string
  }
}

export async function fetchSalaries(): Promise<SalaryResponse[]> {
  const response = await axios.get('http://localhost:3000/salaries')
  return response.data
}

export async function getMySalaries(): Promise<SalaryResponse[]> {
  const response = await axios.get('/api/salaries/my-salaries')
  return response.data
}

export async function paySalary(salaryId: number): Promise<SalaryResponse> {
  const response = await axios.patch(`http://localhost:3000/salaries/${salaryId}`, {
    is_paid: true,
  })
  return response.data
}
