import { failure, type Result, success } from '@app/web/libraries/result'
import { format, subDays } from 'date-fns'
import {
  type Acteur,
  ActeurId,
  ActeurIntrouvable,
  CoordinateurId,
} from '../../../domain'
import {
  FENETRE_DES_STATISTIQUES_EN_JOURS,
  type FicheActeur,
  type Lecteur,
  type LireLaDerniereActivite,
  type LireLesStatistiquesSur30Jours,
  lienDEquipe,
  type RegardDuLecteur,
  type RelationDEquipe,
  statutDActivitePublic,
} from '../domain'
import { lireLActeur, lireLesLiensDEquipe } from './prisma'

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

const jour = (date: Date): string => format(date, 'yyyy-MM-dd')

const relationAvec = async (
  lecteur: Extract<Lecteur, { _tag: 'Coordinateur' }>,
  acteur: Acteur,
  maintenant: Date,
  lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours,
): Promise<RelationDEquipe> => {
  const mediation = acteur.profil.mediation
  const liens =
    mediation === null
      ? { adhesions: [], invitationEnCours: null }
      : await lireLesLiensDEquipe(lecteur.coordinateurId, mediation.mediateurId)
  const lien = lienDEquipe({ lecteur, acteur, ...liens })

  if (lien._tag !== 'Membre') return lien
  if (mediation === null) return { _tag: 'NonCoordonnable' }

  const statistiques = await lireLesStatistiquesSur30Jours(
    lecteur.coordinateurId,
    mediation.mediateurId,
    {
      du: jour(subDays(maintenant, FENETRE_DES_STATISTIQUES_EN_JOURS)),
      au: jour(maintenant),
    },
  )
  return { _tag: 'Membre', statistiques }
}

const regardDe = async (
  lecteur: Lecteur,
  acteur: Acteur,
  maintenant: Date,
  lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours,
): Promise<RegardDuLecteur> =>
  lecteur._tag === 'Mediateur'
    ? { _tag: 'Mediateur' }
    : {
        _tag: 'Coordinateur',
        coordinateurId: lecteur.coordinateurId,
        relation: await relationAvec(
          lecteur,
          acteur,
          maintenant,
          lireLesStatistiquesSur30Jours,
        ),
      }

export const consulterUnActeur = async ({
  quiConsulte,
  acteurId,
  lireLaDerniereActivite,
  lireLesStatistiquesSur30Jours,
  maintenant,
}: {
  quiConsulte: QuiConsulte
  acteurId: string
  lireLaDerniereActivite: LireLaDerniereActivite
  lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours
  maintenant: Date
}): Promise<Result<FicheActeur, ActeurIntrouvable>> => {
  const id = ActeurId.safe(acteurId)
  const lu = id === null ? null : await lireLActeur(id)

  if (id === null || lu === null) return failure(ActeurIntrouvable(acteurId))

  const [derniereActivite, regard] = await Promise.all([
    lireLaDerniereActivite(id),
    regardDe(
      lecteurDe(quiConsulte),
      lu.acteur,
      maintenant,
      lireLesStatistiquesSur30Jours,
    ),
  ])

  return success({
    acteur: lu.acteur,
    profilCreeLe: lu.profilCreeLe,
    statut: statutDActivitePublic(derniereActivite, maintenant),
    regard,
  })
}
