import { defineStore } from 'pinia'
import type { Salary } from 'src/models'
import type { SalaryResponse } from 'src/services/salaryService'
import {
  fetchSalaries,
  getMySalaries,
  paySalary as paySalaryService,
} from 'src/services/salaryService'

function mapSalaryResponseToSalary(salaryResponse: SalaryResponse): Salary {
  return {
    id: salaryResponse.id,
    working_hours: Math.round(salaryResponse.working_hours),
    wage: salaryResponse.wage,
    total_amount: Math.round(salaryResponse.working_hours) * salaryResponse.wage, // or 0 if calculation not desired
    is_paid: salaryResponse.is_paid,
    salary_date: salaryResponse.salary_date,
    employee: {
      employee_id: salaryResponse.employee.employee_id,
      employee_name: salaryResponse.employee.employee_name,
      position: salaryResponse.employee.position,
      branch_name: salaryResponse.employee.branch_name || '',
    },
  }
}

export const useSalariesStore = defineStore('salaries', {
  state: () => ({
    salaries: [] as Salary[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchSalaries() {
      this.loading = true
      this.error = null
      try {
        const data: SalaryResponse[] = await fetchSalaries()
        this.salaries = data.map(mapSalaryResponseToSalary)
        return this.salaries
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.error = error.message
          console.error('Error fetching salaries:', error)
          throw error
        }
        this.error = 'Failed to fetch salaries'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMySalaries() {
      this.loading = true
      this.error = null
      try {
        const data: SalaryResponse[] = await getMySalaries()
        this.salaries = data.map(mapSalaryResponseToSalary)
        return this.salaries
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.error = error.message
          console.error('Error fetching my salaries:', error)
          throw error
        }
        this.error = 'Failed to fetch my salaries'
        throw error
      } finally {
        this.loading = false
      }
    },

    async paySalary(salaryId: number) {
      this.loading = true
      this.error = null
      try {
        const data: SalaryResponse = await paySalaryService(salaryId)
        const updatedSalary = mapSalaryResponseToSalary(data)
        const index = this.salaries.findIndex((s) => s.id === salaryId)
        if (index !== -1) {
          this.salaries[index] = updatedSalary
        }
        return updatedSalary
      } catch (error: unknown) {
        if (error instanceof Error) {
          this.error = error.message
          console.error('Error paying salary:', error)
          throw error
        }
        this.error = 'Failed to pay salary'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
