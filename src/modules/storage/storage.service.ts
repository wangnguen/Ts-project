import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { env } from '@common/config'
import { BadRequestError, ConflictError, NotFoundError } from '@common/errors'

import {
  CreateFolderBody,
  DeleteFileBody,
  DeleteFolderBody,
  RenameFileBody,
  UploadFileBody
} from '@modules/storage/dto'

class StorageService {
  static uploadFiles(files: Express.Multer.File[], body: UploadFileBody) {
    const storageDir = this.resolveStorageDir(body.folderPath)

    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true })

    return files.map((file) => {
      const ext = path.extname(file.originalname)
      const filename = `${crypto.randomUUID()}${ext}`
      fs.writeFileSync(path.join(storageDir, filename), file.buffer)
      return {
        url: `/uploads${body.folderPath ? `/${body.folderPath}` : ''}/${filename}`,
        filename,
        mimetype: file.mimetype,
        size: file.size
      }
    })
  }

  static renameFile(body: RenameFileBody) {
    const dir = this.resolveStorageDir(body.folderPath)
    const oldPath = path.join(dir, path.basename(body.oldFileName))
    const newPath = path.join(dir, path.basename(body.newFileName))

    if (!fs.existsSync(oldPath)) throw new NotFoundError('File not found')
    if (fs.existsSync(newPath)) throw new ConflictError('New file name already exists')
    fs.renameSync(oldPath, newPath)
  }

  static deleteFile(body: DeleteFileBody) {
    const dir = this.resolveStorageDir(body.folderPath)
    const filePath = path.join(dir, path.basename(body.fileName))

    if (!fs.existsSync(filePath)) throw new NotFoundError('File not found')
    fs.unlinkSync(filePath)
  }

  static createFolder(body: CreateFolderBody) {
    const targetPath = path.join(this.resolveStorageDir(body.folderPath), body.folderName)
    if (fs.existsSync(targetPath)) throw new ConflictError('Folder already exists')
    fs.mkdirSync(targetPath, { recursive: true })
  }

  static listFolders(folderPath?: string) {
    const dir = this.resolveStorageDir(folderPath)

    if (!fs.existsSync(dir)) throw new NotFoundError('Folder not found')

    return fs
      .readdirSync(dir)
      .map((item) => {
        const stat = fs.statSync(path.join(dir, item))
        return { name: item, createdAt: stat.birthtime, isDirectory: stat.isDirectory() }
      })
      .filter((item) => item.isDirectory)
      .map(({ name, createdAt }) => ({ name, createdAt }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static listFiles(folderPath?: string) {
    const dir = this.resolveStorageDir(folderPath)

    if (!fs.existsSync(dir)) throw new NotFoundError('Folder not found')

    return fs
      .readdirSync(dir)
      .map((item) => {
        const stat = fs.statSync(path.join(dir, item))
        return { name: item, size: stat.size, createdAt: stat.birthtime, isDirectory: stat.isDirectory() }
      })
      .filter((item) => !item.isDirectory)
      .map(({ name, size, createdAt }) => ({
        filename: name,
        url: `/uploads${folderPath ? `/${folderPath}` : ''}/${name}`,
        size,
        createdAt
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  static deleteFolder(body: DeleteFolderBody) {
    if (!body.folderPath) throw new BadRequestError('Cannot delete the root storage directory')

    const base = path.resolve(env.STORAGE_DIR)
    const dir = this.resolveStorageDir(body.folderPath)

    if (dir === base) throw new BadRequestError('Cannot delete the root storage directory')
    if (!fs.existsSync(dir)) throw new NotFoundError('Folder not found')

    fs.rmSync(dir, { recursive: true })
  }

  private static resolveStorageDir(subPath?: string): string {
    const base = path.resolve(env.STORAGE_DIR)

    if (!subPath) return base

    const target = path.resolve(base, subPath)

    if (!target.startsWith(base + path.sep) && target !== base) {
      throw new BadRequestError('Invalid folder path')
    }

    return target
  }
}

export default StorageService
