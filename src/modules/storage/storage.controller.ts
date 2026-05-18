import { Request, Response } from 'express'

import StorageService from '@modules/storage/storage.service'

import {
  CreateFolderBody,
  DeleteFileBody,
  DeleteFolderBody,
  ListFolderQuerySchema,
  RenameFileBody,
  UploadFileBody
} from './dto'

class StorageController {
  static async upload(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[]
    const saveLinks = StorageService.uploadFiles(files, req.body as UploadFileBody)
    return res.created({ saveLinks }, { message: 'Uploaded successfully' })
  }

  static async renameFile(req: Request, res: Response) {
    StorageService.renameFile(req.body as RenameFileBody)
    return res.ok(null, { message: 'File renamed successfully' })
  }

  static async deleteFile(req: Request, res: Response) {
    StorageService.deleteFile(req.body as DeleteFileBody)
    return res.ok(null, { message: 'File deleted successfully' })
  }

  static async createFolder(req: Request, res: Response) {
    StorageService.createFolder(req.body as CreateFolderBody)
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
    StorageService.deleteFolder(req.body as DeleteFolderBody)
    return res.ok(null, { message: 'Folder deleted successfully' })
  }
}

export default StorageController
