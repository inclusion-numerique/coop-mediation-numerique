import { pluriel } from '@app/web/libraries/pluriel'

export type CompteAffiche = {
  readonly nombre: string
  readonly phrase: string
}

const nombre = (compte: number): string =>
  compte === 0 ? 'Aucun' : String(compte)

const phrase = (compte: number): string =>
  `${compte === 0 ? 'n’est visible' : pluriel(compte, 'est visible', 'sont visibles')} sur la cartographie.`

export const compteAffiche = (compte: number): CompteAffiche => ({
  nombre: nombre(compte),
  phrase: phrase(compte),
})

export const lieuxDuDepartementAffiches = (compte: number): string =>
  `${pluriel(compte, 'lieu d’activité', 'lieux d’activité')} de votre département`
