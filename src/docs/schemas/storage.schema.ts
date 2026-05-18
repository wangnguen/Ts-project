import { z } from 'zod/v4'

import { registry } from '@docs/registry'

import {
  CreateFolderBodySchema,
  DeleteFileBodySchema,
  DeleteFolderBodySchema,
  ListFolderQuerySchema,
  RenameFileBodySchema,
  UploadFileBodySchema
} from '@modules/storage/dto'

import {
  successWrapper,
  jsonBody,
  unauthorizedResponse,
  validationErrorResponse,
  badRequestResponse,
  conflictResponse,
  notFoundResponse
} from './shared'

const storageAuth = [{ bearerAuth: [] }]

const UploadedFileSchema = z.object({
  url: z.string().meta({ example: '/uploads/user-uploads/images/3f2a1b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c.jpg' }),
  filename: z.string().meta({ example: '3f2a1b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c.jpg' }),
  mimetype: z.string().meta({ example: 'image/jpeg' }),
  size: z.number().meta({ example: 204800 })
})

const FolderItemSchema = z.object({
  name: z.string().meta({ example: 'images' }),
  createdAt: z.string().datetime().meta({ example: '2024-01-15T10:30:00.000Z' })
})

registry.registerPath({
  method: 'post',
  path: '/storage/upload',
  tags: ['Storage'],
  summary: 'Upload files',
  description: `Uploads one or more files into the storage directory.

Files are stored under \`STORAGE_DIR\` (configured via env). The \`folderPath\` parameter specifies a subdirectory relative to the storage root.

Each file is saved with a UUID-based name to prevent collisions. Returns a URL, filename, MIME type, and size for each uploaded file.

File size is limited to **10 MB** per file. Path traversal is blocked — \`folderPath\` values that escape the storage root are rejected.`,
  security: storageAuth,
  request: {
    body: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: z.object({
            files: z
              .array(z.string().meta({ format: 'binary' }))
              .meta({ description: 'One or more files to upload (max 10 MB each)' }),
            folderPath: UploadFileBodySchema.shape.folderPath
          })
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Files uploaded successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ saveLinks: z.array(UploadedFileSchema) }),
            '/storage/upload',
            201,
            'Uploaded successfully'
          )
        }
      }
    },
    400: badRequestResponse('Invalid folder path (path traversal attempt)'),
    401: unauthorizedResponse('Missing or invalid access token'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'patch',
  path: '/storage/change-file-name',
  tags: ['Storage'],
  summary: 'Rename a file',
  description: `Renames a file within a folder.

Both \`oldFileName\` and \`newFileName\` are sanitized with \`path.basename()\` — directory components are stripped.

Returns 404 if the file does not exist, 409 if the new name is already taken.`,
  security: storageAuth,
  request: jsonBody(RenameFileBodySchema),
  responses: {
    200: {
      description: 'File renamed successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/storage/change-file-name', 200, 'File renamed successfully')
        }
      }
    },
    400: badRequestResponse('Invalid folder path (path traversal attempt)'),
    401: unauthorizedResponse('Missing or invalid access token'),
    404: notFoundResponse('File not found'),
    409: conflictResponse('New file name already exists'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'patch',
  path: '/storage/delete-file',
  tags: ['Storage'],
  summary: 'Delete a file',
  description: `Permanently deletes a file from the storage directory.

\`fileName\` is sanitized with \`path.basename()\` — directory components are stripped to prevent path traversal.`,
  security: storageAuth,
  request: jsonBody(DeleteFileBodySchema),
  responses: {
    200: {
      description: 'File deleted successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/storage/delete-file', 200, 'File deleted successfully')
        }
      }
    },
    400: badRequestResponse('Invalid folder path (path traversal attempt)'),
    401: unauthorizedResponse('Missing or invalid access token'),
    404: notFoundResponse('File not found'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'post',
  path: '/storage/folder/create',
  tags: ['Storage'],
  summary: 'Create a folder',
  description: `Creates a new subfolder under \`folderPath\` within the storage root.

Returns 409 if the folder already exists. Path traversal via \`folderPath\` is blocked.`,
  security: storageAuth,
  request: jsonBody(CreateFolderBodySchema),
  responses: {
    201: {
      description: 'Folder created successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/storage/folder/create', 201, 'Folder created successfully')
        }
      }
    },
    400: badRequestResponse('Invalid folder path (path traversal attempt)'),
    401: unauthorizedResponse('Missing or invalid access token'),
    409: conflictResponse('Folder already exists'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'get',
  path: '/storage/folder/list',
  tags: ['Storage'],
  summary: 'List subfolders',
  description: `Returns all immediate subdirectories of \`folderPath\`, sorted by creation time (newest first).

Only direct children are listed — not recursive. Files are excluded from the result.`,
  security: storageAuth,
  request: {
    query: ListFolderQuerySchema
  },
  responses: {
    200: {
      description: 'Folder list returned successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({ folderList: z.array(FolderItemSchema) }),
            '/storage/folder/list',
            200,
            'Success'
          )
        }
      }
    },
    400: badRequestResponse('Invalid folder path (path traversal attempt)'),
    401: unauthorizedResponse('Missing or invalid access token'),
    404: notFoundResponse('Folder not found'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'get',
  path: '/storage/files/list',
  tags: ['Storage'],
  summary: 'List files in a folder',
  description: `Returns all files (excluding subdirectories) inside \`folderPath\`, sorted by creation time (newest first).

Each entry includes the filename, public URL, size in bytes, and creation timestamp.`,
  security: storageAuth,
  request: {
    query: ListFolderQuerySchema
  },
  responses: {
    200: {
      description: 'File list returned successfully',
      content: {
        'application/json': {
          schema: successWrapper(
            z.object({
              fileList: z.array(
                z.object({
                  filename: z.string().meta({ example: '3f2a1b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c.jpg' }),
                  url: z
                    .string()
                    .meta({ example: '/uploads/user-uploads/images/3f2a1b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c.jpg' }),
                  size: z.number().meta({ example: 204800 }),
                  createdAt: z.string().datetime().meta({ example: '2024-01-15T10:30:00.000Z' })
                })
              )
            }),
            '/storage/files/list',
            200,
            'Success'
          )
        }
      }
    },
    400: badRequestResponse('Invalid folder path (path traversal attempt)'),
    401: unauthorizedResponse('Missing or invalid access token'),
    404: notFoundResponse('Folder not found'),
    422: validationErrorResponse()
  }
})

registry.registerPath({
  method: 'patch',
  path: '/storage/folder/delete',
  tags: ['Storage'],
  summary: 'Delete a folder',
  description: `Recursively deletes a folder and all its contents.

Deleting the storage root directory is blocked. Path traversal is also blocked — \`folderPath\` must resolve to a path inside \`STORAGE_DIR\`.`,
  security: storageAuth,
  request: jsonBody(DeleteFolderBodySchema),
  responses: {
    200: {
      description: 'Folder deleted successfully',
      content: {
        'application/json': {
          schema: successWrapper(z.null(), '/storage/folder/delete', 200, 'Folder deleted successfully')
        }
      }
    },
    400: badRequestResponse('Cannot delete the root storage directory, or invalid path'),
    401: unauthorizedResponse('Missing or invalid access token'),
    404: notFoundResponse('Folder not found'),
    422: validationErrorResponse()
  }
})
