import { pluriel } from '@app/web/libraries/pluriel'
import type { MediateurAInviter, MediateursAInviter } from '../implementation'
import type { MediateurToAddOption } from './MediateurToAddOption'

const RECHERCHE_MINIMALE = 3

const indisponible = (label: string): MediateurToAddOption => ({
  label,
  value: null,
  isDisabled: true,
})

const optionDe = ({
  mediateurId,
  nom,
  email,
  conseillerNumerique,
}: MediateurAInviter): MediateurToAddOption => ({
  label: nom,
  value: { mediateurId, email, isConseillerNumerique: conseillerNumerique },
})

const texteLibre = (recherche: string): MediateurToAddOption => ({
  label: recherche,
  value: { email: recherche, mediateurId: recherche },
})

const nonAffiches = (nombre: number): MediateurToAddOption[] =>
  nombre > 0
    ? [
        indisponible(
          `Veuillez préciser votre recherche - ${nombre} ${pluriel(nombre, 'médiateur n’est pas affiché', 'médiateurs ne sont pas affichés')}`,
        ),
      ]
    : []

export const rechercheTropCourte = (recherche: string): boolean =>
  recherche.trim().length < RECHERCHE_MINIMALE

export const optionsRechercheTropCourte = (): MediateurToAddOption[] => [
  indisponible(
    `La recherche doit contenir au moins ${RECHERCHE_MINIMALE} caractères`,
  ),
]

export const optionsDeRecherche = (
  recherche: string,
  trouves: MediateursAInviter | null,
): MediateurToAddOption[] =>
  trouves === null
    ? [
        indisponible('La recherche est indisponible, veuillez réessayer'),
        texteLibre(recherche),
      ]
    : [
        indisponible(
          `${trouves.total} ${pluriel(trouves.total, 'résultat', 'résultats')}`,
        ),
        ...trouves.mediateurs.map(optionDe),
        texteLibre(recherche),
        ...nonAffiches(trouves.total - trouves.mediateurs.length),
      ]
