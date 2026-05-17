import { Request, Response } from 'express'

import StorageService from '@modules/storage/storage.service'

import {
  CreateFolderBodySchema,
  DeleteFileBodySchema,
  DeleteFolderBodySchema,
  ListFolderQuerySchema,
  RenameFileBodySchema,
  UploadFileBodySchema
} from './dto'

class StorageController {
  static async upload(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[]
    const body = UploadFileBodySchema.parse(req.body)
    const saveLinks = StorageService.uploadFiles(files, body)

    return res.created({ saveLinks }, { message: 'Uploaded successfully' })
  }

  static async renameFile(req: Request, res: Response) {
    const body = RenameFileBodySchema.parse(req.body)
    StorageService.renameFile(body)
    return res.ok(null, { message: 'File renamed successfully' })
  }

  static async deleteFile(req: Request, res: Response) {
    const body = DeleteFileBodySchema.parse(req.body)
    StorageService.deleteFile(body)
    return res.ok(null, { message: 'File deleted successfully' })
  }

  static async createFolder(req: Request, res: Response) {
    const body = CreateFolderBodySchema.parse(req.body)
    StorageService.createFolder(body)
    return res.created(null, { message: 'Folder created successfully' })
  }

  static async listFolders(req: Request, res: Response) {
    const query = ListFolderQuerySchema.parse(req.query)
    const folderList = StorageService.listFolders(query.folderPath)
    return res.ok({ folderList }, { message: 'Success' })
  }

  static async listFiles(req: Request, res: Response) {
    const query = ListFolderQuerySchema.parse(req.query)
    const fileList = StorageService.listFiles(query.folderPath)
    return res.ok({ fileList }, { message: 'Success' })
  }

  static async deleteFolder(req: Request, res: Response) {
    const body = DeleteFolderBodySchema.parse(req.body)
    StorageService.deleteFolder(body)
    return res.ok(null, { message: 'Folder deleted successfully' })
  }
}

export default StorageController
