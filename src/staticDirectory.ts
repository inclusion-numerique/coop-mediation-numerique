import path from 'node:path'

export const staticDirectory = () =>
  path.resolve(process.cwd(), 'private-static')

export const staticFile = (filename: string) =>
  path.resolve(staticDirectory(), filename)
