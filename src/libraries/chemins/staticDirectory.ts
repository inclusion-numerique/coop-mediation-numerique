import path from 'node:path'

const staticDirectory = () => path.resolve(process.cwd(), 'private-static')

export const staticFile = (filename: string) =>
  path.resolve(staticDirectory(), filename)
