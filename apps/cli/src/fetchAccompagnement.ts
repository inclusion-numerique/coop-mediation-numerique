import { createWriteStream } from 'node:fs'
import { output } from '@app/cli/output'
import { varFile } from '@app/config/varDirectory'
import { compterLesAccompagnements } from '@app/web/features/activites/abilities/compter-les-accompagnements'
import {
  criteresDesStatistiques,
  PERIMETRE_NATIONAL,
} from '@app/web/features/activites/domain'
import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { rendezVousAuxStatutsSql } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { Command } from '@commander-js/extra-typings'

// const BASE_URL = 'http://localhost:3000/api/v1/statistiques'
const departements: string[] = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '2A',
  '2B',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '70',
  '71',
  '72',
  '73',
  '74',
  '75',
  '76',
  '77',
  '78',
  '79',
  '80',
  '81',
  '82',
  '83',
  '84',
  '85',
  '86',
  '87',
  '88',
  '89',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  // DOM-TOM
  '971', // Guadeloupe
  '972', // Martinique
  '973', // Guyane
  '974', // La Réunion
  '976', // Mayotte
]

export const fetchAccompagnements = new Command()
  .command('stats:fetch-accompagnements')
  .description("Récupère les totaux d'accompagnements pour chaque département")
  .argument('<conum>', '0 = mediateur 1 = conum ')
  .argument('<date>', 'date limite')
  .action(async (conum, date) => {
    const results = await Promise.all(
      departements.map(async (departement) => {
        const totaux = await compterLesAccompagnements({
          perimetre: PERIMETRE_NATIONAL,
          criteres: criteresDesStatistiques({
            departements: departement,
            conseiller_numerique: conum,
            au: date,
          }),
          conseillersNumeriques: conseillerNumeriqueSql,
          rendezVousAuxStatuts: rendezVousAuxStatutsSql,
        })
        return { departement, total: totaux.accompagnements.total }
      }),
    )

    const destination = varFile(
      `accompagnements-departements-${conum === '0' ? 'mediateur' : 'conum'}-jusquau${date}-${new Date().toISOString()}.csv`,
    )

    // Création du fichier CSV en assurant l'écrasement du contenu existant
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(destination)
      writeStream.on('finish', () => resolve())
      writeStream.on('error', reject)
      // En-tête du fichier CSV
      writeStream.write('Département,Total Accompagnements\n')
      for (const { departement, total } of results) {
        writeStream.write(`${departement},${total}\n`)
      }
      writeStream.end()
      // Note : writeStream.close() n'est pas toujours nécessaire.
    })

    output(`Fichier de sortie : ${destination}`)
  })
