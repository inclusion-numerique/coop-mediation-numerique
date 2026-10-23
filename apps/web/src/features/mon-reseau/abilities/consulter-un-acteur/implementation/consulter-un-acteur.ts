import { failure, type Result, success } from '@app/web/libraries/result'
import {
  type Acteur,
  ActeurId,
  ActeurIntrouvable,
  CoordinateurId,
} from '../../../domain'
import {
  type FicheActeur,
  type Lecteur,
  type LireLaDerniereActivite,
  lienDEquipe,
  type RegardDuLecteur,
  type RelationDEquipe,
  statutDActivitePublic,
} from '../domain'
import { lireLeContrat } from './conseiller-numerique'
import { lireLActeur, lireLesLiensDEquipe } from './prisma'
import { lireLesStatistiquesSur30Jours } from './statistiques'

export type QuiConsulte = {
  readonly id: string
  readonly coordinateur: { readonly id: string } | null
}

const lecteurDe = ({ id, coordinateur }: QuiConsulte): Lecteur => {
  const acteurId = ActeurId(id)
  return coordinateur === null
    ? { _tag: 'Mediateur', acteurId }
    : {
        _tag: 'Coordinateur',
        acteurId,
        coordinateurId: CoordinateurId(coordinateur.id),
      }
}

const relationAvec = async (
  lecteur: Extract<Lecteur, { _tag: 'Coordinateur' }>,
  acteur: Acteur,
): Promise<RelationDEquipe> => {
  const mediation = acteur.profil.mediation
  const liens =
    mediation === null
      ? { adhesions: [], invitationEnCours: null }
      : await lireLesLiensDEquipe(lecteur.coordinateurId, mediation.mediateurId)
  const lien = lienDEquipe({ lecteur, acteur, ...liens })

  if (lien._tag !== 'Membre') return lien
  if (mediation === null) return { _tag: 'NonCoordonnable' }

  const [statistiques, contrat] = await Promise.all([
    lireLesStatistiquesSur30Jours(
      lecteur.coordinateurId,
      mediation.mediateurId,
    ),
    acteur.profil.dispositif === 'ConseillerNumerique'
      ? lireLeContrat(acteur.acteurId)
      : null,
  ])
  return { _tag: 'Membre', statistiques, contrat }
}

const regardDe = async (
  lecteur: Lecteur,
  acteur: Acteur,
): Promise<RegardDuLecteur> =>
  lecteur._tag === 'Mediateur'
    ? { _tag: 'Mediateur' }
    : {
        _tag: 'Coordinateur',
        coordinateurId: lecteur.coordinateurId,
        relation: await relationAvec(lecteur, acteur),
      }

export const consulterUnActeur = async ({
  quiConsulte,
  acteurId,
  lireLaDerniereActivite,
  maintenant,
}: {
  quiConsulte: QuiConsulte
  acteurId: string
  lireLaDerniereActivite: LireLaDerniereActivite
  maintenant: Date
}): Promise<Result<FicheActeur, ActeurIntrouvable>> => {
  const id = ActeurId.safe(acteurId)
  const lu = id === null ? null : await lireLActeur(id)

  if (id === null || lu === null) return failure(ActeurIntrouvable(acteurId))

  const [derniereActivite, regard] = await Promise.all([
    lireLaDerniereActivite(id),
    regardDe(lecteurDe(quiConsulte), lu.acteur),
  ])

  return success({
    acteur: lu.acteur,
    profilCreeLe: lu.profilCreeLe,
    statut: statutDActivitePublic(derniereActivite, maintenant),
    regard,
  })
}
