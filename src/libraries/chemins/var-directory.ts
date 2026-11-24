import path from 'node:path'
import { getDirname } from '@/libraries/chemins/dirname'

export const varDirectory = path.resolve(
  getDirname(import.meta.url),
  '../../../var',
)
