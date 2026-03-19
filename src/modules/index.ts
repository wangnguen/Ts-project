import { Router } from 'express'
import HealthRoute from './health/health.route'
import UserRoute from './users/user.route'

const router = Router()

router.use('/health', HealthRoute)
router.use('/users', UserRoute)

export default router
