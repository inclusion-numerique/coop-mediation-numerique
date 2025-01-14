// eslint-disable-next-line unicorn/prevent-abbreviations
import fs from 'node:fs'
import path from 'node:path'
import { varFile } from '@app/config/varDirectory'
import slugify from 'slugify'
import { prismaClient } from '@app/web/prismaClient'
import { Command } from '@commander-js/extra-typings'
import { insertMarkdownRagChunks } from '@app/web/assistant/rag/insertMarkdownRagChunks'
import { configureDeploymentTarget, DeploymentTargetOption } from '@app/cli/deploymentTarget'
import { output } from '@app/cli/output'

/**
 * How to export and ingest the markdown files from the help center
 *
 * Go to https://www.notion.so/incubateurdesterritoires/Centre-d-aide-de-La-Coop-de-la-m-diation-num-rique-e2db421ac63249769c1a9aa155af5f2f?pvs=4
 * Log in
 * Go to the "Export" button in the top right corner
 * Select "Markdown", Current view, Everything, Include sub-pages and Create folder for subpages
 * Download the zip file
 * Unzip the file in this repo /var/centre-aide-notion
 * Run the command with `pnpm cli rag:ingest-notion-help-center-exported-markdown`
 */

const markdownExportDirectory = varFile('centre-aide-notion')

const getMarkdownFiles = (
  directory: string,
): { filename: string; absolutePath: string }[] => {
  const result: { filename: string; absolutePath: string }[] = []

  const filesAndDirectories = fs.readdirSync(directory)

  for (const item of filesAndDirectories) {
    const fullPath = path.join(directory, item)
    const stats = fs.statSync(fullPath)

    if (stats.isDirectory()) {
      result.push(...getMarkdownFiles(fullPath))
    } else if (stats.isFile() && fullPath.endsWith('.md')) {
      result.push({ filename: item, absolutePath: fullPath })
    }
  }

  return result
}

const type = 'page'

/**
 * 'Enregistrer une activité le compte rendu d’activi c8fdfe72e55846cca557f270fdae8ac9.md'
 * => https://incubateurdesterritoires.notion.site/Enregistrer-une-activit-le-compte-rendu-d-activit-CRA-c8fdfe72e55846cca557f270fdae8ac9
 *
 * @param filename
 */
const absoluteNotionUrlFromFilename = (filename: string): string => {
  const baseUrl = 'https://incubateurdesterritoires.notion.site/'

  const filenameWithoutExtension = filename.replace(/\.md$/, '')

  // use slugify to change all special chars with a -
  const slugForUrl = slugify(filenameWithoutExtension, {
    lower: false,
    strict: true,
  })

  return `${baseUrl}${slugForUrl}`
}

// eslint-disable-next-line unicorn/prevent-abbreviations
export const ingestNotionHelpCenterExportedMarkdown = new Command()
  .command('rag:ingest-notion-help-center-exported-markdown')
  .addOption(DeploymentTargetOption)
  .action(async (options) => {
    await configureDeploymentTarget(options)

    const markdownFiles = getMarkdownFiles(markdownExportDirectory).map(
      ({ filename, absolutePath }) => ({
        filename,
        absolutePath,
        url: absoluteNotionUrlFromFilename(filename),
        content: fs.readFileSync(absolutePath, 'utf8'),
      }),
    )

    if (markdownFiles.length < 5) {
      throw new Error(
        `Not enough markdown files to ingest, check that you have exported all the help center files in ${
          markdownExportDirectory
        }`,
      )
    }

    output(
      'Markdown Files Found:',
      markdownFiles.map(({ url }) => url),
    )

    // Remove all chunks that are no more existing in the markdown files
    const deleted = await prismaClient.ragDocumentChunk.deleteMany({
      where: {
        source,
        sourceId: {
          notIn: markdownFiles.map((file) => file.filename),
        },
      },
    })

    output(
      `Deleted ${deleted.count} existing chunks for documents that no longer exist`,
    )

    await Promise.all(
      markdownFiles.map((file) =>
        insertMarkdownRagChunks({
          type,
          content: file.content,
          source,
          sourceId: file.filename,
          url: file.url,
        }),
      ),
    )
  })
