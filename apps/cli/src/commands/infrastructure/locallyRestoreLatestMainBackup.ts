import { exec as callbackExec } from 'node:child_process'
import { createWriteStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { output } from '@app/cli/output'
import { createVarDirectory } from '@app/config/createVarDirectory'
import { varDirectory } from '@app/config/varDirectory'
import { prismaClient } from '@app/web/prismaClient'
import { Command } from '@commander-js/extra-typings'
import axios from 'axios'
import axiosRetry from 'axios-retry'

const exec = promisify(callbackExec)

const dataspaceSchemas = ['admin', 'main', 'reference', 'audit']

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / k ** i
  return `${value.toFixed(2)} ${units[i]}`
}

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  }
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

const backupFileFor = (databaseName: string) =>
  path.resolve(varDirectory, `${databaseName}_backup.dump.sql`)

const mainBackupFile = backupFileFor(process.env.BACKUP_DATABASE_NAME ?? '')

type ScalewayDatabaseBackup = {
  id: string
  instance_id: string
  database_name: string
  name: string
  status:
    | 'unknown'
    | 'creating'
    | 'ready'
    | 'restoring'
    | 'deleting'
    | 'error'
    | 'exporting'
    | 'locked'
  size: number
  expires_at: string
  created_at: string
  updated_at: string
  instance_name: string
  download_url: string | null
  download_url_expires_at: string | null
  same_region: boolean
  region: string
}

const scalewayRdbClient = (secretKey: string) => {
  const client = axios.create({
    baseURL: 'https://api.scaleway.com/rdb/v1/regions/fr-par',
    headers: { 'X-Auth-Token': secretKey },
  })
  axiosRetry(client, {
    retries: 3,
    retryDelay: (retryCount) => retryCount * 3000,
  })
  return client
}

const fetchAllBackups = async (
  client: ReturnType<typeof axios.create>,
  databaseInstanceId: string,
  backupDatabaseName: string,
): Promise<ScalewayDatabaseBackup[]> => {
  const allBackups: ScalewayDatabaseBackup[] = []
  let page = 1
  const pageSize = 100

  while (true) {
    const response = await client.get<{
      database_backups: ScalewayDatabaseBackup[]
    }>('/backups', {
      params: {
        order_by: 'created_at_desc',
        page_size: pageSize,
        page,
        instance_id: databaseInstanceId,
        database_name: backupDatabaseName,
      },
    })

    allBackups.push(...response.data.database_backups)

    if (response.data.database_backups.length < pageSize) {
      break
    }
    page++
  }

  return allBackups
}

const selectBackup = (
  backups: ScalewayDatabaseBackup[],
  { date, type }: { date?: string; type?: string },
): ScalewayDatabaseBackup => {
  const typeFiltered = type
    ? backups.filter((backup) => backup.name.includes(`_${type}_`))
    : backups

  const elligibleBackups = typeFiltered.filter(
    ({ status }) => status === 'ready' || status === 'exporting',
  )

  if (elligibleBackups.length === 0) {
    throw new Error('No eligible backup found')
  }

  if (!date) {
    return elligibleBackups[0]
  }

  const targetDate = new Date(date)
  const matchingBackup = elligibleBackups.find((backup) => {
    const backupDate = new Date(backup.created_at)
    return (
      backupDate.getFullYear() === targetDate.getFullYear() &&
      backupDate.getMonth() === targetDate.getMonth() &&
      backupDate.getDate() === targetDate.getDate()
    )
  })

  if (!matchingBackup) {
    const availableDates = elligibleBackups
      .map((b) => b.created_at.split('T')[0])
      .join(', ')
    throw new Error(
      `No backup found for date ${date}. Available backups: ${availableDates}`,
    )
  }

  return matchingBackup
}

const exportAndDownloadBackup = async (
  client: ReturnType<typeof axios.create>,
  backup: ScalewayDatabaseBackup,
  targetFile: string,
): Promise<void> => {
  let selectedBackup = backup

  if (selectedBackup.download_url) {
    output('Backup already exported')
  } else {
    output('Exporting backup')
    const exportResponse = await client.post<ScalewayDatabaseBackup>(
      `/backups/${selectedBackup.id}/export`,
    )
    selectedBackup = exportResponse.data
  }

  let waitCount = 0
  while (!selectedBackup.download_url) {
    if (waitCount > 10) {
      throw new Error('Timeout waiting for backup export')
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 3000)
    })
    const statusResponse = await client.get<ScalewayDatabaseBackup>(
      `/backups/${selectedBackup.id}`,
    )
    selectedBackup = statusResponse.data
    waitCount += 1
  }

  if (!selectedBackup.download_url) {
    throw new Error('No download url available')
  }

  const totalSize = selectedBackup.size
  output(
    `Backup is ready for download: ${formatBytes(totalSize)} at ${selectedBackup.download_url}`,
  )
  output(`Downloading backup to ${targetFile}`)

  createVarDirectory()

  const downloadResponse = await axios.get<NodeJS.ReadableStream>(
    selectedBackup.download_url,
    { responseType: 'stream' },
  )

  const writeStream = createWriteStream(targetFile)

  let downloadedBytes = 0
  const startTime = Date.now()
  let lastProgressOutput = 0

  downloadResponse.data.on('data', (chunk: Buffer) => {
    downloadedBytes += chunk.length
    const now = Date.now()

    if (now - lastProgressOutput >= 500) {
      lastProgressOutput = now
      const elapsedSeconds = (now - startTime) / 1000
      const speed = downloadedBytes / elapsedSeconds
      const remainingBytes = totalSize - downloadedBytes
      const estimatedRemaining = remainingBytes / speed
      const percentage = ((downloadedBytes / totalSize) * 100).toFixed(1)

      process.stdout.write(
        `\r  ${formatBytes(downloadedBytes)} / ${formatBytes(totalSize)} (${percentage}%) - ${formatBytes(speed)}/s - ${formatDuration(estimatedRemaining)} remaining`,
      )
    }
  })

  downloadResponse.data.pipe(writeStream)

  await new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      const totalTime = (Date.now() - startTime) / 1000
      const avgSpeed = downloadedBytes / totalTime
      process.stdout.write('\n')
      output(
        `Download complete: ${formatBytes(downloadedBytes)} in ${formatDuration(totalTime)} (avg ${formatBytes(avgSpeed)}/s)`,
      )
      resolve(true)
    })
    writeStream.on('error', reject)
  })
}

const provisionBackupFile = async ({
  instanceId,
  databaseName,
  secretKey,
  targetFile,
  date,
  type,
  useLocal,
}: {
  instanceId: string
  databaseName: string
  secretKey: string
  targetFile: string
  date?: string
  type?: string
  useLocal?: boolean
}): Promise<void> => {
  if (useLocal) {
    output(`Using local backup file: ${targetFile}`)
    if (!existsSync(targetFile)) {
      throw new Error(
        `Local backup file not found at ${targetFile}. Please download the backup first by running without the --local flag.`,
      )
    }
    const stats = statSync(targetFile)
    output(
      `Local backup file found: ${formatBytes(stats.size)}, created ${stats.birthtime.toLocaleString()}`,
    )
    return
  }

  const client = scalewayRdbClient(secretKey)

  output(`Listing backups for ${databaseName} (fetching all pages)...`)
  const allBackups = await fetchAllBackups(client, instanceId, databaseName)
  output(`Found ${allBackups.length} backups total`)

  if (allBackups.length === 0) {
    throw new Error(`No backups found for ${databaseName}`)
  }

  const selectedBackup = selectBackup(allBackups, { date, type })
  output(
    `Selected backup: ${selectedBackup.name} - ${selectedBackup.created_at}`,
  )

  await exportAndDownloadBackup(client, selectedBackup, targetFile)
}

const restoreCoopBackup = async (databaseUrl: string): Promise<void> => {
  output(
    'Clearing coop schema and prisma migration history before loading data',
  )
  await prismaClient.$executeRawUnsafe('DROP SCHEMA IF EXISTS coop CASCADE')
  await prismaClient.$executeRawUnsafe(
    'DROP TABLE IF EXISTS public._prisma_migrations CASCADE',
  )

  output('Restoring coop schema from backup file')
  await exec(
    `pg_restore --no-owner --no-acl -d ${databaseUrl} < ${mainBackupFile}`,
    {
      maxBuffer: 5 * 1024 * 1024,
    },
  )
}

const restoreDataspaceBackup = async (
  databaseUrl: string,
  dataspaceBackupFile: string,
): Promise<void> => {
  output(`Recreating Dataspace schemas (${dataspaceSchemas.join(', ')})`)
  await prismaClient.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS ${dataspaceSchemas.join(', ')} CASCADE`,
  )

  for (const schema of dataspaceSchemas) {
    await prismaClient.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`)
  }

  output('Restoring Dataspace schemas from backup file')
  const schemaFlags = dataspaceSchemas.map((schema) => `-n ${schema}`).join(' ')
  await exec(
    `pg_restore --no-owner --no-acl ${schemaFlags} -d "${databaseUrl}" "${dataspaceBackupFile}"`,
    {
      maxBuffer: 10 * 1024 * 1024,
    },
  )
}

export const locallyRestoreLatestMainBackup = new Command(
  'backup:locally-restore-latest-main',
)
  .description(
    'Restore the latest main backup from Scaleway to the local (DATABASE_URL env var) database ',
  )
  .option(
    '-d, --date <date>',
    'Date of the backup to restore (format: YYYY-MM-DD). If not provided, restores the latest backup.',
  )
  .option(
    '-l, --local',
    'Restore from previously already downloaded backup file',
  )
  .option('--list', 'List all available backup dates and exit')
  .option(
    '-t, --type <type>',
    'Filter backups by type (weekly, daily, hourly). If not provided, all types are considered.',
  )
  .option(
    '--skip-dataspace',
    'Restore only the coop schema, skip the Dataspace schemas (admin/main/min/reference/audit)',
  )
  .action(async (options) => {
    const targetDate = options.date ? new Date(options.date) : null
    if (targetDate && Number.isNaN(targetDate.getTime())) {
      throw new Error(
        'Invalid date format. Please use YYYY-MM-DD format (e.g., 2025-12-09)',
      )
    }

    const databaseInstanceId = (process.env.DATABASE_INSTANCE_ID ?? '').split(
      '/',
    )[1]
    const backupDatabaseName = process.env.BACKUP_DATABASE_NAME ?? ''
    const secretKey = process.env.SCW_SECRET_KEY ?? ''
    const databaseUrl = process.env.DATABASE_URL ?? ''
    const databaseUrlObject = new URL(databaseUrl ?? '')
    const user = databaseUrlObject.username
    const database = databaseUrlObject.pathname.split('/')[1]
    const host = databaseUrlObject.hostname

    const variables = {
      databaseInstanceId,
      backupDatabaseName,
      secretKey,
      databaseUrl,
      user,
      database,
      host,
    }

    for (const [key, value] of Object.entries(variables)) {
      if (!value) {
        throw new Error(`Missing env var ${key}`)
      }
    }

    if (options.list) {
      const client = scalewayRdbClient(secretKey)
      const allBackups = await fetchAllBackups(
        client,
        databaseInstanceId,
        backupDatabaseName,
      )
      const elligibleBackups = (
        options.type
          ? allBackups.filter((backup) =>
              backup.name.includes(`_${options.type}_`),
            )
          : allBackups
      ).filter(({ status }) => status === 'ready' || status === 'exporting')

      output('\nAvailable backups:')
      const groupedByDate = new Map<string, string[]>()
      for (const backup of elligibleBackups) {
        const date = backup.created_at.split('T')[0]
        const type = backup.name.includes('_weekly_')
          ? 'weekly'
          : backup.name.includes('_daily_')
            ? 'daily'
            : 'hourly'
        if (!groupedByDate.has(date)) {
          groupedByDate.set(date, [])
        }
        groupedByDate.get(date)?.push(type)
      }
      const sortedDates = [...groupedByDate.keys()].sort().reverse()
      for (const date of sortedDates) {
        const types = [...new Set(groupedByDate.get(date))].join(', ')
        output(`  ${date} (${types})`)
      }
      output(
        `\nTotal: ${elligibleBackups.length} backups across ${sortedDates.length} dates`,
      )
      return
    }

    const dataspaceInstanceId = (
      process.env.DATASPACE_DATABASE_INSTANCE_ID ?? ''
    ).split('/')[1]
    const dataspaceBackupDatabaseName =
      process.env.DATASPACE_BACKUP_DATABASE_NAME ?? ''
    const restoreDataspace =
      !options.skipDataspace &&
      Boolean(dataspaceInstanceId) &&
      Boolean(dataspaceBackupDatabaseName)
    const dataspaceBackupFile = backupFileFor(dataspaceBackupDatabaseName)

    await provisionBackupFile({
      instanceId: databaseInstanceId,
      databaseName: backupDatabaseName,
      secretKey,
      targetFile: mainBackupFile,
      date: options.date,
      type: options.type,
      useLocal: options.local,
    })
    await restoreCoopBackup(databaseUrl)

    if (restoreDataspace) {
      await provisionBackupFile({
        instanceId: dataspaceInstanceId,
        databaseName: dataspaceBackupDatabaseName,
        secretKey,
        targetFile: dataspaceBackupFile,
        date: options.date,
        useLocal: options.local,
      })
      await restoreDataspaceBackup(databaseUrl, dataspaceBackupFile)
    }

    output(`Granting all privileges to "${user}" role`)
    await exec(
      `psql ${databaseUrl} -c 'GRANT ALL PRIVILEGES ON DATABASE "${database}" TO "${user}";'`,
    )

    output(
      `Restored database to ${host}/${database} for "${user}" role${
        restoreDataspace ? ' (coop + Dataspace schemas)' : ' (coop schema)'
      }`,
    )
  })
