import { pluriel } from '@app/web/libraries/pluriel'
import { EmailInvitation } from '../../../domain'
import type { InvitationsEnvoyees, MediateursAInviter } from '../domain'
import { horsDe, libelleDe, type PersonneAInviter } from './personne-a-inviter'

const RECHERCHE_MINIMALE = 3

export type EtatDeLaRecherche = {
  readonly recherche: string
  readonly enCours: boolean
  readonly enEchec: boolean
  readonly total: number
  readonly affiches: number
}

export const rechercheTropCourte = (recherche: string): boolean =>
  recherche.trim().length < RECHERCHE_MINIMALE

const saisieLibre = (recherche: string): PersonneAInviter[] => {
  const email = EmailInvitation.safe(recherche)
  return email === null ? [] : [{ _tag: 'Email', email }]
}

const mediateursDe = (trouves: MediateursAInviter | null): PersonneAInviter[] =>
  (trouves?.mediateurs ?? []).map((mediateur) => ({
    _tag: 'Mediateur',
    ...mediateur,
  }))

export const suggestionsDe = ({
  recherche,
  trouves,
  dejaChoisis,
}: {
  recherche: string
  trouves: MediateursAInviter | null
  dejaChoisis: readonly PersonneAInviter[]
}): { items: PersonneAInviter[] } & EtatDeLaRecherche => {
  const mediateurs = mediateursDe(trouves)
  const aProposer = mediateurs.filter(horsDe(dejaChoisis))
  return {
    items: [
      ...aProposer,
      ...saisieLibre(recherche)
        .filter(horsDe(mediateurs))
        .filter(horsDe(dejaChoisis)),
    ],
    recherche,
    enCours: false,
    enEchec: trouves === null && !rechercheTropCourte(recherche),
    total: (trouves?.total ?? 0) - (mediateurs.length - aProposer.length),
    affiches: aProposer.length,
  }
}

export const messagesDe = ({
  recherche,
  enCours,
  enEchec,
  total,
  affiches,
}: EtatDeLaRecherche): readonly string[] => {
  if (enCours) return []
  if (rechercheTropCourte(recherche))
    return [
      `La recherche doit contenir au moins ${RECHERCHE_MINIMALE} caractères`,
    ]
  if (enEchec) return ['La recherche est indisponible, veuillez réessayer']
  const nonAffiches = total - affiches
  return [
    `${total} ${pluriel(total, 'médiateur trouvé', 'médiateurs trouvés')}`,
    ...(nonAffiches > 0
      ? [
          `Veuillez préciser votre recherche - ${nonAffiches} ${pluriel(nonAffiches, 'médiateur n’est pas affiché', 'médiateurs ne sont pas affichés')}`,
        ]
      : []),
  ]
}

export const issueDeLInvitation = (
  membres: readonly PersonneAInviter[],
  { echecs }: InvitationsEnvoyees,
): { priority: 'success' | 'warning'; message: string } => {
  if (echecs.length > 0)
    return {
      priority: 'warning',
      message: `L’invitation est enregistrée, mais l’email n’a pas pu être envoyé à ${echecs.join(', ')} : vous pourrez la relancer depuis votre équipe.`,
    }
  if (membres.length === 1)
    return {
      priority: 'success',
      message: `Un email d’invitation a été envoyé à ${libelleDe(membres[0])}`,
    }
  return {
    priority: 'success',
    message:
      'Un email d’invitation a été envoyé aux membres que vous souhaitez ajouter à votre équipe',
  }
}
