import { criteresDesActivites } from '../../../../domain'
import { tagsUtilisablesDepuis } from '../../../../domain/fournisseurs-de-la-saisie'
import { filtresDeLaListe } from '../../../../ui/presenters/filtres/filtres-de-la-liste.search-params'
import { demandeurDe } from '../../domain'
import { libellesDuClasseur } from '../../ui/presenters/export.presenter'
import { exporterMesAccompagnements } from '../prisma/accompagnements-a-exporter.query'
import { nomsDesFiltresExportes } from '../prisma/noms-des-filtres-exportes.query'
import { classeurDesAccompagnements } from './classeur-des-accompagnements'

type Fournisseurs = Pick<
  Parameters<typeof nomsDesFiltresExportes>[0],
  'lieuxDesActivites' | 'communesEtDepartements' | 'beneficiaires'
> & {
  readonly tagsVisibles: Parameters<typeof tagsUtilisablesDepuis>[0]
}

export const classeurDeMesAccompagnements = async ({
  parametres,
  demandeur: demande,
  auteur,
  fuseau,
  fournisseurs,
}: {
  readonly parametres: Readonly<Record<string, string>>
  readonly demandeur: Parameters<typeof demandeurDe>[0]
  readonly auteur: Parameters<typeof classeurDesAccompagnements>[0]['demandeur']
  readonly fuseau: string
  readonly fournisseurs: Fournisseurs
}) => {
  const criteres = criteresDesActivites(parametres)
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
    filtres: libellesDuClasseur(
      filtresDeLaListe(criteres),
      noms,
      exportDes.colonnes.source,
    ),
    exportDes,
    fuseau,
  })
}
