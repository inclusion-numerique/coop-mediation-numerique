import { format, subDays } from '@/libraries/date'
import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActeurId,
  ActeurIntrouvable,
  CoordinateurId,
  type MediateurId,
} from '../../../domain'
import {
  FENETRE_DES_STATISTIQUES_EN_JOURS,
  type FicheActeur,
  type LireLActeur,
  type LireLaDerniereActivite,
  type LireLesStatistiquesSur30Jours,
  type RegardDuLecteur,
  type RelationDEquipe,
} from './fiche-acteur'
import type { Lecteur } from './lecteur'
import { type AdhesionLue, lienDEquipe } from './relation-d-equipe'
import { statutDActivitePublic } from './statut-d-activite-public'

export type QuiConsulte = {
  readonly id: string
  readonly coordinateur: { readonly id: string } | null
}

export type LireLesLiensDEquipe = (
  coordinateurId: CoordinateurId,
  mediateurId: MediateurId,
) => Promise<{
  readonly adhesions: readonly AdhesionLue[]
  readonly invitationEnCours: Date | null
}>

export type ConsulterUnActeurPorts = {
  readonly lireLActeur: LireLActeur
  readonly lireLesLiensDEquipe: LireLesLiensDEquipe
  readonly lireLaDerniereActivite: LireLaDerniereActivite
  readonly lireLesStatistiquesSur30Jours: LireLesStatistiquesSur30Jours
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
  ports: ConsulterUnActeurPorts,
): Promise<RelationDEquipe> => {
  const mediation = acteur.profil.mediation
  if (mediation === null) return { _tag: 'NonCoordonnable' }

  const lien = lienDEquipe({
    lecteur,
    acteur,
    ...(await ports.lireLesLiensDEquipe(
      lecteur.coordinateurId,
      mediation.mediateurId,
    )),
  })
  if (lien._tag !== 'Membre') return lien

  const statistiques = await ports.lireLesStatistiquesSur30Jours(
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
  ports: ConsulterUnActeurPorts,
): Promise<RegardDuLecteur> =>
  lecteur._tag === 'Mediateur'
    ? { _tag: 'Mediateur' }
    : {
        _tag: 'Coordinateur',
        coordinateurId: lecteur.coordinateurId,
        relation: await relationAvec(lecteur, acteur, maintenant, ports),
      }

export const consulterUnActeur =
  (ports: ConsulterUnActeurPorts) =>
  async ({
    quiConsulte,
    acteurId,
    maintenant,
  }: {
    readonly quiConsulte: QuiConsulte
    readonly acteurId: string
    readonly maintenant: Date
  }): Promise<Result<FicheActeur, ActeurIntrouvable>> => {
    const id = ActeurId.safe(acteurId)
    const lu = id === null ? null : await ports.lireLActeur(id)

    if (id === null || lu === null) return failure(ActeurIntrouvable(acteurId))

    const [derniereActivite, regard] = await Promise.all([
      ports.lireLaDerniereActivite(id),
      regardDe(lecteurDe(quiConsulte), lu.acteur, maintenant, ports),
    ])

    return success({
      acteur: lu.acteur,
      profilCreeLe: lu.profilCreeLe,
      statut: statutDActivitePublic(derniereActivite, maintenant),
      regard,
    })
  }
