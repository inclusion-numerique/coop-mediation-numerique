import { Suspense } from 'react'
import type { OptionsDeLaBarre } from '../../../../ui/filtres/BarreDeFiltres'
import type { FiltresDeLaListe } from '../../../../ui/filtres/filtres-de-la-liste'
import { libellesDeLExport, requeteDeLExport } from '../export.presenter'
import { BoutonDExport } from './BoutonDExport'
import { BoutonDExportDesactive } from './BoutonDExportDesactive'

type Proprietes = {
  filtres: FiltresDeLaListe
  options: OptionsDeLaBarre
  nombreDAccompagnements: Promise<number>
}

const ExportSelonLeNombre = async ({
  filtres,
  options,
  nombreDAccompagnements,
}: Proprietes) => {
  const nombre = await nombreDAccompagnements
  return nombre > 0 ? (
    <BoutonDExport
      libelles={libellesDeLExport(filtres, options)}
      requete={requeteDeLExport(filtres)}
      nombreDAccompagnements={nombre}
    />
  ) : (
    <BoutonDExportDesactive />
  )
}

export const ExportDeMesAccompagnements = (proprietes: Proprietes) => (
  <Suspense fallback={<BoutonDExportDesactive />}>
    <ExportSelonLeNombre {...proprietes} />
  </Suspense>
)
