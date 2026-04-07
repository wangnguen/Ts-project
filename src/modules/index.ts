import { Router } from 'express'
import AuthRoute from '@modules/auth/auth.route'
import HealthRoute from '@modules/health/health.route'
import AuthenticateMiddleware from '@common/middlewares/auth.middleware'

const router = Router()

router.use('/auth', AuthRoute)
router.use('/health', HealthRoute)
router.use(AuthenticateMiddleware.authenticate)

export default router
