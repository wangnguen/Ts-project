import { Router } from 'express'
import HealthRoute from './health/health.route'

const router = Router()

router.use('/health', HealthRoute)

export default router
