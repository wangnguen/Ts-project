import { Router } from 'express'
import multer from 'multer'

import { validateBody, validateQuery } from '@common/middlewares'

import {
  CreateFolderBodySchema,
  DeleteFileBodySchema,
  DeleteFolderBodySchema,
  ListFolderQuerySchema,
  RenameFileBodySchema,
  UploadFileBodySchema
} from './dto'
import StorageController from './storage.controller'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, true)
  }
})

router.post('/upload', upload.array('files'), validateBody(UploadFileBodySchema), StorageController.upload)
router.patch('/change-file-name', upload.none(), validateBody(RenameFileBodySchema), StorageController.renameFile)
router.patch('/delete-file', upload.none(), validateBody(DeleteFileBodySchema), StorageController.deleteFile)
router.post('/folder/create', upload.none(), validateBody(CreateFolderBodySchema), StorageController.createFolder)
router.get('/folder/list', validateQuery(ListFolderQuerySchema), StorageController.listFolders)
router.get('/files/list', validateQuery(ListFolderQuerySchema), StorageController.listFiles)
router.patch('/folder/delete', upload.none(), validateBody(DeleteFolderBodySchema), StorageController.deleteFolder)

export default router
