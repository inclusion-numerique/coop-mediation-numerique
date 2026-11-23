import { Suspense } from 'react'
import type { OptionsDeLaBarre } from '../../../../ui/components/filtres/BarreDeFiltres'
import type { FiltresDeLaListe } from '../../../../ui/presenters/filtres/filtres-de-la-liste.search-params'
import { BoutonDExport } from '../components/BoutonDExport'
import { BoutonDExportDesactive } from '../components/BoutonDExportDesactive'
import {
  libellesDeLExport,
  requeteDeLExport,
} from '../presenters/export.presenter'

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
