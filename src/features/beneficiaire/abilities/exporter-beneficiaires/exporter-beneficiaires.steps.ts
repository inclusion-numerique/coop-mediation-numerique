import assert from 'node:assert'
import { type DataTable, Given, Then, When } from '@cucumber/cucumber'
import type { Workbook } from 'exceljs'
import { exporterBeneficiairesAvec } from '@/features/beneficiaire/abilities/exporter-beneficiaires/implementations/exporter-beneficiaires.binding'
import { listerBeneficiaires } from '@/features/beneficiaire/abilities/lister-beneficiaires/implementations/prisma/lister-beneficiaires.query'
import {
  seedBeneficiaire,
  testMediateurId,
} from '@/features/beneficiaire/beneficiaire.cucumber'
import type { AuteurDExport } from '@/libraries/tableur/add-export-metadata'

const user: AuteurDExport = {
  nom: 'Médiatrice',
  prenom: 'Marie',
  role: 'Médiateur',
}

let workbook: Workbook | undefined

// Lit la colonne « Nom » des lignes de données : ce sont les lignes situées
// sous l'en-tête du tableau. La cellule A de l'en-tête vaut "Nom", mais la
// section métadonnées contient aussi un libellé "Nom" (le nom de l'exportateur)
// en amont : on retient donc la DERNIÈRE occurrence, qui est l'en-tête du
// tableau des bénéficiaires.
const exportedNoms = (book: Workbook | undefined): string[] => {
  const worksheet = book?.getWorksheet('Bénéficiaires')
  if (!worksheet) return []

  const headerRowNumber = worksheet
    .getColumn(1)
    .values.reduce<number>(
      (last, value, index) => (String(value) === 'Nom' ? index : last),
      Number.POSITIVE_INFINITY,
    )

  const noms: string[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= headerRowNumber) return
    const nom = row.getCell(1).value
    if (nom != null && String(nom).trim() !== '') noms.push(String(nom))
  })
  return noms
}

Given(
  'des bénéficiaires à exporter pour ce médiateur',
  async (dataTable: DataTable) => {
    await Promise.all(
      dataTable.hashes().map(({ prenom, nom }) =>
        seedBeneficiaire({
          ...(prenom === undefined ? {} : { prenom }),
          ...(nom === undefined ? {} : { nom }),
        }),
      ),
    )
  },
)

When(
  'je génère le classeur des bénéficiaires avec la recherche {string}',
  async (recherche: string) => {
    workbook = await exporterBeneficiairesAvec(listerBeneficiaires)({
      mediateurId: testMediateurId,
      filters: { recherche },
      auteur: user,
    })
  },
)

Then('le classeur exporté contient {int} bénéficiaire(s)', (count: number) => {
  assert.strictEqual(exportedNoms(workbook).length, count)
})

Then('le classeur exporté contient {string}', (nom: string) => {
  assert.ok(exportedNoms(workbook).includes(nom))
})

Then('le classeur exporté ne contient pas {string}', (nom: string) => {
  assert.ok(!exportedNoms(workbook).includes(nom))
})
