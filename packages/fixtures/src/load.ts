import { output } from '@app/fixtures/output'
import { deleteAll, seed } from '@app/fixtures/seeds'
import { assertDatabaseIsNotProduction } from '@app/web/assertDatabaseTarget'
import { prismaClient } from '@app/web/prismaClient'
import { Command } from '@commander-js/extra-typings'

const main = async (eraseAllData: boolean, confirmProduction?: string) => {
  // Garde-fou : `fixtures:load` injecte des données de test (et TRUNCATE tout avec `-e`).
  // Il ne doit JAMAIS s'exécuter contre la production par erreur (cf. incident 2026-07-08).
  assertDatabaseIsNotProduction({
    databaseUrl: process.env.DATABASE_URL ?? '',
    productionDatabaseName: process.env.DATASPACE_BACKUP_DATABASE_NAME,
    confirmProduction,
    action: 'Chargement de fixtures',
  })

  if (eraseAllData) {
    output.log('Erasing all data...')
    await deleteAll(prismaClient)
  }

  output.log(`Generating fixtures data`)
  await seed(prismaClient)
  output.log(`Fixtures loaded successfully`)
}

const program = new Command()
  .option(
    '-e, --erase-all-data',
    'Erase all data from the database before seeding',
    false,
  )
  .option(
    '--confirm-production <database>',
    'Confirme explicitement un chargement de fixtures ciblant la production (valeur = nom exact de la base cible)',
  )

program.parse()

const { eraseAllData, confirmProduction } = program.opts()

main(eraseAllData, confirmProduction)
  .then(() => prismaClient.$disconnect())
  .catch(async (error) => {
    output.error(error)
    await prismaClient.$disconnect()
    process.exit(1)
  })
