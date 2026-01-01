
import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { createRouterGuard } from './guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

createRouterGuard(router)

export default router