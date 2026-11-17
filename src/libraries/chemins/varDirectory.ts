import path from 'node:path'
import { getDirname } from '@app/web/libraries/chemins/dirname'

export const varDirectory = path.resolve(
  getDirname(import.meta.url),
  '../../../var',
)

export const varFile = (filename: string) =>
  path.resolve(varDirectory, filename)
