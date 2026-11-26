import { format, subDays } from '@/libraries/date'
import { failure, type Result, success } from '@/libraries/result'
import {
  type Acteur,
  ActeurId,
  ActeurIntrouvable,
  CoordinateurId,
} from '../../../domain'
import type { EchecDeConsulterUnActeur } from './errors'
import {
  FENETRE_DES_STATISTIQUES_EN_JOURS,
  type FicheActeur,
  type RegardDuLecteur,
  type RelationDEquipe,
} from './fiche-acteur'
import type { Lecteur, QuiConsulte } from './lecteur'
import type {
  ConsulterUnActeurPorts,
  LireLesLiensDEquipe,
  LireLesStatistiquesSur30Jours,
} from './ports'
import { lienDEquipe } from './relation-d-equipe'
import { statutDActivitePublic } from './statut-d-activite-public'

type PortsDuRegard = {
  readonly lireLesLiensDEquipe: LireLesLiensDEquipe
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
  { lireLesLiensDEquipe, lireLesStatistiquesSur30Jours }: PortsDuRegard,
): Promise<RelationDEquipe> => {
  const mediation = acteur.profil.mediation
  if (mediation === null) return { _tag: 'NonCoordonnable' }

  const lien = lienDEquipe({
    lecteur,
    acteur,
    ...(await lireLesLiensDEquipe(
      lecteur.coordinateurId,
      mediation.mediateurId,
    )),
  })
  if (lien._tag !== 'Membre') return lien

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
  ports: PortsDuRegard,
): Promise<RegardDuLecteur> =>
  lecteur._tag === 'Mediateur'
    ? { _tag: 'Mediateur' }
    : {
        _tag: 'Coordinateur',
        coordinateurId: lecteur.coordinateurId,
        relation: await relationAvec(lecteur, acteur, maintenant, ports),
      }

export const consulterUnActeur =
  ({
    lireLActeur,
    lireLesLiensDEquipe,
    lireLaDerniereActivite,
    lireLesStatistiquesSur30Jours,
  }: ConsulterUnActeurPorts) =>
  async ({
    quiConsulte,
    acteurId,
    maintenant,
  }: {
    readonly quiConsulte: QuiConsulte
    readonly acteurId: string
    readonly maintenant: Date
  }): Promise<Result<FicheActeur, EchecDeConsulterUnActeur>> => {
    const id = ActeurId.safe(acteurId)
    const lu = id === null ? null : await lireLActeur(id)

    if (id === null || lu === null) return failure(ActeurIntrouvable(acteurId))

    const [derniereActivite, regard] = await Promise.all([
      lireLaDerniereActivite(id),
      regardDe(lecteurDe(quiConsulte), lu.acteur, maintenant, {
        lireLesLiensDEquipe,
        lireLesStatistiquesSur30Jours,
      }),
    ])

    return success({
      acteur: lu.acteur,
      profilCreeLe: lu.profilCreeLe,
      statut: statutDActivitePublic(derniereActivite, maintenant),
      regard,
    })
  }
