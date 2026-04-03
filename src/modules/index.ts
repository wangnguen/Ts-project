import { Router } from 'express'
import HealthRoute from './health/health.route'
import UserRoute from './users/user.route'
import AuthRoute from './auth/auth.route'

const router = Router()

router.use('/auth', AuthRoute)
router.use('/health', HealthRoute)
router.use('/users', UserRoute)

export default router
