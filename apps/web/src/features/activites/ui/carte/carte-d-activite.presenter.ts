import { pluriel } from '@app/web/libraries/pluriel'
import { dureeAsString } from '@app/web/utils/dureeAsString'
import type { ActiviteConsultee, ActiviteDeMediation } from '../../domain'
import {
  type DetailDActivite,
  detailDeLActivite,
} from '../detail/detail-de-l-activite.presenter'
import { thematiqueLabels } from '../libelles/thematique'
import { typeActiviteLabels } from '../libelles/type-activite'
import { valeurDe } from '../libelles/valeur-de'

const THEMATIQUES_AFFICHEES = 2

export type CarteDActivite = {
  readonly id: string
  readonly type: ActiviteDeMediation['_tag']
  readonly libelleDuType: string
  readonly titreDAtelier: string | null
  readonly duree: string
  readonly thematiques: readonly string[]
  readonly autresThematiques: number
  readonly personnes:
    | { readonly _tag: 'Participants'; readonly texte: string }
    | { readonly _tag: 'Beneficiaire'; readonly nom: string }
  readonly issueDUnRendezVous: boolean
  readonly detail: DetailDActivite
}

const thematiques = (activite: ActiviteDeMediation): readonly string[] =>
  [
    ...activite.thematiques.mediation,
    ...(activite.thematiques.demarche === null
      ? []
      : [
          'AideAuxDemarchesAdministratives' as const,
          ...activite.thematiques.demarche.thematiques,
        ]),
  ].map(valeurDe(thematiqueLabels))

export const nombreDeParticipants = ({
  activite,
}: ActiviteConsultee): number =>
  activite._tag === 'Collectif'
    ? activite.participants.suivis.length + activite.participants.anonymes.total
    : 1

export const nomDuBeneficiaire = ({
  activite,
  affichage,
}: ActiviteConsultee): string => {
  if (activite._tag !== 'Individuel' || activite.beneficiaire._tag !== 'Suivi')
    return 'Bénéficiaire anonyme'
  const { id } = activite.beneficiaire
  const suivi = affichage.suivis.find((candidat) => candidat.id === id)
  return suivi === undefined
    ? 'Bénéficiaire anonyme'
    : [suivi.prenom, suivi.nom].filter(Boolean).join(' ')
}

export const carteDActivite = (
  consultee: ActiviteConsultee,
  fuseau: string,
): CarteDActivite => {
  const { activite } = consultee
  const toutes = thematiques(activite)
  const participants = nombreDeParticipants(consultee)
  return {
    id: activite.id,
    type: activite._tag,
    libelleDuType: valeurDe(typeActiviteLabels)(activite._tag),
    titreDAtelier: activite._tag === 'Collectif' ? activite.titre : null,
    duree: dureeAsString(activite.duree),
    thematiques: toutes.slice(0, THEMATIQUES_AFFICHEES),
    autresThematiques: Math.max(toutes.length - THEMATIQUES_AFFICHEES, 0),
    personnes:
      activite._tag === 'Collectif'
        ? {
            _tag: 'Participants',
            texte: `${participants} ${pluriel(participants, 'participant', 'participants')}`,
          }
        : { _tag: 'Beneficiaire', nom: nomDuBeneficiaire(consultee) },
    issueDUnRendezVous: activite.origine._tag === 'RendezVous',
    detail: detailDeLActivite(consultee, fuseau),
  }
}
