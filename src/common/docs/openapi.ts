import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'

import { registry } from './registry'
import './extend-zod'

import './schemas/auth.schema'
import './schemas/user.schema'

export function buildOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'REST API documentation for the E-Commerce platform.'
    },
    servers: [{ url: '/api/v1', description: 'API v1' }]
  })
}
