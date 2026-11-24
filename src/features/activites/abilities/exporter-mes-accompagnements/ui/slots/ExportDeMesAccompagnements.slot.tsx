import { Suspense } from 'react'
import type { OptionsDeLaBarre } from '../../../../ui/components/filtres/BarreDeFiltres'
import type { FiltresDeLaListe } from '../../../../ui/search-params/filtres-de-la-liste.search-params'
import { BoutonDExport } from '../components/BoutonDExport'
import { BoutonDExportDesactive } from '../components/BoutonDExportDesactive'
import { libellesDeLExport } from '../presenters/export.presenter'
import { requeteDeLExport } from '../search-params/requete-de-l-export.search-params'

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
