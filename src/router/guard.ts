import type { Router } from 'vue-router'
import { useUserStore } from '@/store/user'
import * as NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

export function createRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    NProgress.start()
    const userStore = useUserStore()
    document.title = to.meta.title ? `${to.meta.title} - 物联网系统` : '物联网系统'
    if (to.path === '/login') {
      if (userStore.token) {
        next({ path: '/' })
        NProgress.done()
        return
      }
      next()
      return
    }
    if (!userStore.token) {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
      return
    }
    if (!userStore.roles || !userStore.roles.length) {
      try {
        await userStore.fetchUserInfo()
        if (to.meta.roles) {
          const roles = to.meta.roles as string[]
          const hasRole = userStore.roles && userStore.roles.some((role: string) => roles.includes(role))
          if (!hasRole) {
            next('/401')
            NProgress.done()
            return
          }
        }
        next()
      } catch (error) {
        userStore.resetToken()
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    } else {
      next()
    }
  })
  router.afterEach(() => {
    NProgress.done()
  })
}
