import type { ChartData } from 'chart.js'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { api } from 'src/boot/axios'
import type { Attendance } from 'src/models'
import { ref } from 'vue'

export const useAttendanceStore = defineStore('attendance', () => {
  const attendance = ref<Attendance[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let currentId = 0

  async function getAllAttendance() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/attendance')
      console.log('Get att:', res.data)
      attendance.value = res.data.map((att: Attendance) => ({
        ...att,
        employee_name: `${att.employee?.name ?? ''} ${att.employee?.surname ?? ''}`.trim(),
        branch_name: att.branch?.name ?? '-',
      }))
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Failed to fetch attendance data'
      }
      console.error('Failed to fetch attendance:', err)
    } finally {
      loading.value = false
    }
  }

  async function checkIn(employeeId: number) {
    loading.value = true
    error.value = null
    try {
      const payload = {
        employee_id: employeeId,
      }
      console.log('[Check-In] Sending payload:', payload)
      const res = await api.post('/attendance/check-in', payload)
      console.log('[Check-In] Response:', res.data)
      currentId = res.data.id
      console.log('Set currentId to:', currentId)
      await getAllAttendance()
      return res.data
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Check-in failed'
      }
      console.error('Check-in failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkOut() {
    loading.value = true
    error.value = null
    try {
      console.log('[Check-Out] Sending id:', currentId)
      // Aligning with user suggestion: use POST /attendance/checkout/:id
      const res = await api.post(`/attendance/checkout/${currentId}`)
      console.log('[Check-Out] Response:', res.data)
      await getAllAttendance()
      return res.data
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      } else {
        error.value = 'Check-out failed'
      }
      console.error('Check-out failed:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAtts() {
    try {
      const response = await api.get('/attendance')
      console.log('📦 Response from /attendance:', response)

      if (Array.isArray(response.data)) {
        // ทำการดึงข้อมูลลูกค้าและโปรโมชันสำหรับแต่ละคำสั่ง
        attendance.value = await Promise.all(
          response.data.map(async (attendance) => {
            if (attendance.customerId) {
              // ดึงข้อมูลลูกค้า
              const customerResponse = await api.get(`/customers/${attendance.customerId}`)
              attendance.customer = customerResponse.data
            }

            if (attendance.promotionId) {
              // ดึงข้อมูลโปรโมชัน
              const promotionResponse = await api.get(`/promotions/${attendance.promotionId}`)
              attendance.promotion = promotionResponse.data
            }

            return attendance
          }),
        )
      } else {
        console.error('Expected an array, but got:', response.data)
        attendance.value = []
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      attendance.value = []
    }
  }
  async function fetchAttById(attendanceId: number) {
    try {
      const response = await api.get(`/attendance/${attendanceId}`)
      console.log('📦 Response from /attendance/:id', response)

      const att = response.data

      if (att.customerId) {
        const customerResponse = await api.get(`/customers/${att.customerId}`)
        att.customer = customerResponse.data
      }

      if (att.promotionId) {
        const promotionResponse = await api.get(`/promotions/${att.promotionId}`)
        att.promotion = promotionResponse.data
      }

      return att
    } catch (error) {
      console.error('❌ Failed to fetch attendance by ID:', error)
      return null
    }
  }

  function branchNameFromId(id?: number) {
    if (id === 1) return 'สาขา 1'
    if (id === 2) return 'สาขา 2'
    return 'ไม่ทราบสาขา'
  }
  function normalizeDate(date: string | Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  async function filteredAttendance(options: {
    role: string
    userId: number
    branchId?: number
    filterType?: string
    search?: string
    dateRange?: { from: string; to: string }
  }) {
    if (!attendance.value || attendance.value.length === 0) {
      return []
    }

    let result = [...attendance.value]
    const { role, userId, branchId, filterType, search, dateRange } = options

    // 🔐 กรองตามบทบาทผู้ใช้
    if (role === 'Admin' && branchId) {
      result = result.filter((item) => item.branch?.id === branchId)
    } else if (role === 'User') {
      result = result.filter((item) => item.employee?.user_id === userId)
    } else if (role === 'Owner') {
      // Owner เห็นทั้งหมด
      result = [...result]
    }

    // 🏢 กรองตามสาขาที่เลือก
    if (filterType && filterType !== 'ทั้งหมด') {
      const branchName = filterType
      result = result.filter((item) => {
        const itemBranchName = branchNameFromId(item.branch?.id)
        return itemBranchName === branchName
      })
    }

    // 📅 กรองตามช่วงวันที่
    if (dateRange?.from && dateRange?.to) {
      const fromDate = normalizeDate(dateRange.from)
      const toDate = normalizeDate(dateRange.to)

      result = result.filter((item) => {
        if (!item.work_date) return false
        try {
          const itemDate = normalizeDate(item.work_date)
          return itemDate >= fromDate && itemDate <= toDate
        } catch {
          return false
        }
      })
    }

    // 🔍 กรองตามคำค้นหา
    if (search) {
      const searchTerm = search.toLowerCase()
      result = result.filter((item) => {
        const employeeName =
          `${item.employee?.name || ''} ${item.employee?.surname || ''}`.toLowerCase()
        const branchName = item.branch_id === 1 ? 'สาขา 1' : 'สาขา 2'
        return employeeName.includes(searchTerm) || branchName.toLowerCase().includes(searchTerm)
      })
    }

    // 📝 แปลง branch_id เป็นชื่อสาขา
    return result.map((item) => ({
      ...item,
      branch: {
        ...item.branch,
        name: branchNameFromId(item.branch?.id),
      },
    }))
  }

  // ฟังก์ชันแปลงเวลาเป็นชั่วโมง (08:30 = 8.5)
  function toHourFloat(dateStr: string): number {
    const date = new Date(dateStr)
    return date.getHours() + date.getMinutes() / 60
  }

  // เตรียมกราฟ
  const dailyTimeChartData = ref<ChartData<'line'>>({
    labels: [],
    datasets: [],
  })
  async function loadChartData(employeeId: number) {
    const filterOptions = {
      role: 'User',
      userId: employeeId,
      filterType: 'ทั้งหมด',
      dateRange: {
        from: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`,
        to: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-31`,
      },
    }

    const result = await filteredAttendance(filterOptions)
    console.log('Employee ID ที่ใช้ filter:', employeeId)
    console.log('result', result)

    const labels: string[] = []
    const checkInData: (number | null)[] = []
    const checkOutData: (number | null)[] = []

    result.forEach((att) => {
      const date = new Date(att.check_in_time || att.check_out_time)
      const day = date.getDate().toString()
      labels.push(day)

      checkInData.push(att.check_in_time ? toHourFloat(att.check_in_time) : null)
      checkOutData.push(att.check_out_time ? toHourFloat(att.check_out_time) : null)
    })

    dailyTimeChartData.value = {
      labels,
      datasets: [
        {
          label: 'เวลาเช็คอิน',
          data: checkInData,
          borderColor: '#42a5f5',
          backgroundColor: '#90caf9',
          tension: 0.3,
          spanGaps: true,
        },
        {
          label: 'เวลาเช็คเอาท์',
          data: checkOutData,
          borderColor: '#66bb6a',
          backgroundColor: '#a5d6a7',
          tension: 0.3,
          spanGaps: true,
        },
      ],
    }
  }

  return {
    attendance,
    loading,
    error,
    getAllAttendance,
    checkIn,
    checkOut,
    currentId,
    fetchAtts,
    filteredAttendance,
    loadChartData,
    fetchAttById,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAttendanceStore, import.meta.hot))
}
