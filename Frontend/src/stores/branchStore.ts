import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type Branch } from 'src/models'
import { ref } from 'vue'

export const useBranchStore = defineStore('branch', () => {
  const branches = ref<Branch[]>([])

  async function getBranches() {
    try {
      Loading.show()
      const res = await api.get('/branches')
      console.log('Get Branches:', res.data)
      branches.value = res.data
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'โหลดสาขาไม่สำเร็จ',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function addBranch(branch: Branch) {
    try {
      Loading.show()
      const res = await api.post('/branches', branch)
      console.log('Add Branch:', res.data)
      await getBranches()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'เพิ่มสาขาไม่สำเร็จ',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function updateBranch(branch: Branch) {
    try {
      Loading.show()
      const res = await api.patch(`/branches/${branch.id}`, branch)
      console.log('Update Branch:', res.data)
      await getBranches()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'อัปเดตสาขาไม่สำเร็จ',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  async function delBranch(branchId: number) {
    try {
      Loading.show()
      const res = await api.delete(`/branches/${branchId}`)
      console.log('Delete Branch:', res.data)
      await getBranches()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'ลบสาขาไม่สำเร็จ',
        icon: 'report_problem',
      })
    } finally {
      Loading.hide()
    }
  }

  return {
    branches,
    getBranches,
    addBranch,
    updateBranch,
    delBranch,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBranchStore, import.meta.hot))
}
