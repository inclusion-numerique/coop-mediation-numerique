import { Suspense } from 'react'
import { BoutonDExport } from '../components/BoutonDExport'
import { BoutonDExportDesactive } from '../components/BoutonDExportDesactive'

type Proprietes = {
  libelles: readonly string[]
  requete: string
  nombreDAccompagnements: Promise<number>
}

const ExportSelonLeNombre = async ({
  libelles,
  requete,
  nombreDAccompagnements,
}: Proprietes) => {
  const nombre = await nombreDAccompagnements
  return nombre > 0 ? (
    <BoutonDExport
      libelles={libelles}
      requete={requete}
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
