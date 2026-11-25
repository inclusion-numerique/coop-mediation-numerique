import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { getDirname } from '@/libraries/chemins'
import { compileMjml } from './mjml'

const outputDirectory = () =>
  path.resolve(getDirname(import.meta.url), '../../../../var/email')

async function outputDirectoryIfItDoesNotExist(): Promise<void> {
  if (existsSync(outputDirectory())) {
    return
  }

  await fs.mkdir(outputDirectory(), { recursive: true })
}

async function outputHtmlTemplate(
  name: string,
  htmlContent: string,
): Promise<void> {
  await outputDirectoryIfItDoesNotExist()
  await fs.writeFile(`${outputDirectory()}/${name}.html`, htmlContent)
}

async function outputMjmlTemplate(
  name: string,
  mjmlTemplate: string,
): Promise<void> {
  const htmlContent = await compileMjml(mjmlTemplate)
  await outputHtmlTemplate(name, htmlContent)
  await fs.writeFile(`${outputDirectory()}/${name}.mjml`, mjmlTemplate)
}

/**
 * Outputs mjml AND compiled html version to test that mjml syntax is valid
 * It is then easy to debug templates in /var/email
 */
export function createMjmlTemplateOutput(
  templateName: string,
): (templateName: string) => Promise<void> {
  let index = 0
  return (mjmlTemplate: string): Promise<void> =>
    outputMjmlTemplate(`${templateName}_${index++}`, mjmlTemplate)
}
