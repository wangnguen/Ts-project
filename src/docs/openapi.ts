import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

import { registry } from './registry'
import './extend-zod'

import './schemas/auth.schema'
import './schemas/user.schema'
import './schemas/monitor.schema'
import './schemas/storage.schema'

export function buildOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'REST API documentation.'
    },
    servers: [{ url: '/api/v1', description: 'API v1' }]
  })
}
