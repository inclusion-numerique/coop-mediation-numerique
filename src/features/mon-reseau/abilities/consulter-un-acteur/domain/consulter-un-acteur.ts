import { format, subDays } from '@/libraries/date'
import { failure, type Result, success } from '@/libraries/result'
import { type Acteur, type ActeurId, ActeurIntrouvable } from '../../../domain'
import type { EchecDeConsulterUnActeur } from './errors'
import {
  FENETRE_DES_STATISTIQUES_EN_JOURS,
  type FicheActeur,
  type RegardDuLecteur,
  type RelationDEquipe,
} from './fiche-acteur'
import type { Lecteur } from './lecteur'
import type { ConsulterUnActeurPorts, LecturesDuRegard } from './ports'
import { lienDEquipe } from './relation-d-equipe'
import { statutDActivitePublic } from './statut-d-activite-public'

const jour = (date: Date): string => format(date, 'yyyy-MM-dd')

const relationAvec = async (
  lecteur: Extract<Lecteur, { _tag: 'Coordinateur' }>,
  acteur: Acteur,
  maintenant: Date,
  { lireLesLiensDEquipe, lireLesStatistiquesSur30Jours }: LecturesDuRegard,
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
  lectures: LecturesDuRegard,
): Promise<RegardDuLecteur> =>
  lecteur._tag === 'Mediateur'
    ? { _tag: 'Mediateur' }
    : {
        _tag: 'Coordinateur',
        coordinateurId: lecteur.coordinateurId,
        relation: await relationAvec(lecteur, acteur, maintenant, lectures),
      }

export const consulterUnActeur =
  ({
    lireLActeur,
    lireLesLiensDEquipe,
    lireLaDerniereActivite,
    lireLesStatistiquesSur30Jours,
  }: ConsulterUnActeurPorts) =>
  async ({
    lecteur,
    acteurId,
    maintenant,
  }: {
    readonly lecteur: Lecteur
    readonly acteurId: ActeurId | null
    readonly maintenant: Date
  }): Promise<Result<FicheActeur, EchecDeConsulterUnActeur>> => {
    const lu = acteurId === null ? null : await lireLActeur(acteurId)

    if (acteurId === null || lu === null) return failure(ActeurIntrouvable())

    const [derniereActivite, regard] = await Promise.all([
      lireLaDerniereActivite(acteurId),
      regardDe(lecteur, lu.acteur, maintenant, {
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
