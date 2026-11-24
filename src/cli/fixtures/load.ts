import { Command } from '@commander-js/extra-typings'
import { assertDatabaseIsNotProduction } from '@/cli/fixtures/assert-database-target'
import { deleteAll, seed } from '@/cli/fixtures/seeds'
import { environnementOutillage } from '@/configuration/environnement/outillage'
import { environnementServeur } from '@/configuration/environnement/serveur'
import { prismaClient } from '@/configuration/prisma/prisma-client'
import { output } from '@/libraries/fixtures/output'

const main = async (eraseAllData: boolean, confirmProduction?: string) => {
  // Garde-fou : `fixtures:load` injecte des données de test (et TRUNCATE tout avec `-e`).
  // Il ne doit JAMAIS s'exécuter contre la production par erreur (cf. incident 2026-07-08).
  assertDatabaseIsNotProduction({
    databaseUrl: environnementServeur.DATABASE_URL,
    productionDatabaseName:
      environnementOutillage.DATASPACE_BACKUP_DATABASE_NAME,
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
