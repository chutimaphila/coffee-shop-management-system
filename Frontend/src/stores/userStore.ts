import { defineStore, acceptHMRUpdate } from 'pinia'
import { Loading, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { type User } from 'src/models'
import { computed, ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([
    // {
    //   id: 1,
    //   name: 'Justin',
    //   surname: 'Bieber',
    //   age: 31,
    //   email: 'admin@mail.com',
    //   password: 'Pass@1234',
    //   roles: ['admin'],
    //   gender: 'female',
    // },
    // {
    //   id: 2,
    //   name: 'Peter',
    //   surname: 'Barbie',
    //   age: 25,
    //   email: 'user@mail.com',
    //   password: 'Pass@1234',
    //   roles: ['user'],
    //   gender: 'male',
    // },
  ])

  async function addUser(u: User, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', u.name)
      formData.append('surname', u.surname)
      formData.append('email', u.email)
      formData.append('password', u.password)
      formData.append('age', u.age.toString())
      formData.append('gender', u.gender)
      if (u.roleId) {
        formData.append('roleId', u.roleId.toString())
      }
      if (u.branchId) {
        formData.append('branchId', u.branchId.toString()) // Include branchId
      }
      if (file) {
        formData.append('file', file)
      }
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }

      const res = await api.post('/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Add User Response:', res.data)
      await getUsers()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Add failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  async function delUser(u: User) {
    try {
      Loading.show()
      const res = await api.delete('/users/' + u.id)
      console.log(res.data)
      await getUsers()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Delete failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  async function updateUser(u: User, file: File | null) {
    try {
      Loading.show()
      const formData = new FormData()
      formData.append('name', u.name)
      formData.append('surname', u.surname)
      formData.append('email', u.email)
      formData.append('password', u.password)
      formData.append('age', u.age.toString())
      formData.append('gender', u.gender)
      if (u.roleId !== null && u.roleId !== undefined) {
        formData.append('roleId', u.roleId.toString())
      }
      if (u.branchId !== null && u.branchId !== undefined) {
        formData.append('branchId', u.branchId.toString()) // Include branchId
      }
      if (file) {
        formData.append('file', file)
      }
      const res = await api.patch('/users/' + u.id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log(res.data)
      await getUsers()
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Update failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }
  function getUserByEmail(login: string): User | undefined {
    return users.value.find((item) => item.email === login)
  }

  async function getUsers() {
    try {
      Loading.show()
      const res = await api.get('/users')
      console.log(res.data)
      users.value = res.data
      users.value = res.data.sort((a: User, b: User) => b.id - a.id)
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        position: 'top',
        message: 'Loading failed',
        icon: 'report_problem',
      })
    } finally {
      console.log('finally')
      Loading.hide()
    }
  }

  const currentUser = ref<User | null>(null)

  const isLoggedIn = computed(() => !!currentUser.value)
  const roleId = computed(() => currentUser.value?.roleName ?? null)

  async function loginUser(email: string, password: string) {
    try {
      Loading.show()
      const res = await api.post('/auth/login', { email, password })
      currentUser.value = res.data.user
      Notify.create({
        color: 'positive',
        message: 'Login success',
        icon: 'check_circle',
      })
    } catch (err) {
      console.error(err)
      Notify.create({
        color: 'negative',
        message: 'Login failed',
        icon: 'error',
      })
      throw err
    } finally {
      Loading.hide()
    }
  }

  function logoutUser() {
    currentUser.value = null
    Notify.create({
      color: 'info',
      message: 'Logged out',
      icon: 'logout',
    })
  }

  return {
    users,
    addUser,
    delUser,
    updateUser,
    getUserByEmail,
    getUsers,
    loginUser,
    logoutUser,
    isLoggedIn,
    roleId,
    currentUser,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
