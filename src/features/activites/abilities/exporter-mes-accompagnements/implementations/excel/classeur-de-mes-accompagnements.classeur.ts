import type { CriteresDesActivites } from '../../../../domain'
import { tagsUtilisablesDepuis } from '../../../../domain/fournisseurs-de-la-saisie'
import { demandeurDe, type ExportDesAccompagnements } from '../../domain'
import { exporterMesAccompagnements } from '../prisma/accompagnements-a-exporter.query'
import { nomsDesFiltresExportes } from '../prisma/noms-des-filtres-exportes.query'
import { classeurDesAccompagnements } from './classeur-des-accompagnements.classeur'

type Fournisseurs = Pick<
  Parameters<typeof nomsDesFiltresExportes>[0],
  'lieuxDesActivites' | 'communesEtDepartements' | 'beneficiaires'
> & {
  readonly tagsVisibles: Parameters<typeof tagsUtilisablesDepuis>[0]
}

type Presenter = (donnees: {
  readonly criteres: CriteresDesActivites
  readonly noms: Awaited<ReturnType<typeof nomsDesFiltresExportes>>
  readonly exportDes: ExportDesAccompagnements
  readonly fuseau: string
}) => Pick<
  Parameters<typeof classeurDesAccompagnements>[0],
  'filtres' | 'entetes' | 'lignes' | 'total'
>

export const classeurDeMesAccompagnements = async ({
  criteres,
  demandeur: demande,
  auteur,
  fuseau,
  fournisseurs,
  presenter,
}: {
  readonly criteres: CriteresDesActivites
  readonly demandeur: Parameters<typeof demandeurDe>[0]
  readonly auteur: Parameters<typeof classeurDesAccompagnements>[0]['demandeur']
  readonly fuseau: string
  readonly fournisseurs: Fournisseurs
  readonly presenter: Presenter
}) => {
  const demandeur = demandeurDe(demande)

  const [exportDes, noms] = await Promise.all([
    exporterMesAccompagnements({
      demandeur,
      criteres,
    }),
    nomsDesFiltresExportes({
      demandeur,
      criteres,
      lieuxDesActivites: fournisseurs.lieuxDesActivites,
      communesEtDepartements: fournisseurs.communesEtDepartements,
      tagsUtilisables: tagsUtilisablesDepuis(fournisseurs.tagsVisibles),
      beneficiaires: fournisseurs.beneficiaires,
    }),
  ])

  return classeurDesAccompagnements({
    demandeur: auteur,
    ...presenter({ criteres, noms, exportDes, fuseau }),
    fuseau,
  })
}
