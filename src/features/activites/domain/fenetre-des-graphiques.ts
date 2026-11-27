import { parseISO, startOfMonth, subDays, subMonths } from '@/libraries/date'
import { type Jour, jourDe } from './jour'

export type FenetreDesGraphiques =
  | { readonly type: 'Glissante'; readonly fin: Jour }
  | { readonly type: 'Bornee'; readonly debut: Jour; readonly fin: Jour }

export type BornesDeLaSerie = { readonly du: Jour; readonly au: Jour }

const JOURS_D_UNE_FENETRE_GLISSANTE = 30

const MOIS_D_UNE_FENETRE_GLISSANTE = 12

export const fenetreDe = ({
  debut,
  fin,
}: {
  readonly debut: Jour | null
  readonly fin: Jour
}): FenetreDesGraphiques =>
  debut === null ? { type: 'Glissante', fin } : { type: 'Bornee', debut, fin }

export const joursDeLaFenetre = (
  fenetre: FenetreDesGraphiques,
): BornesDeLaSerie => ({
  du:
    fenetre.type === 'Bornee'
      ? fenetre.debut
      : jourDe(
          subDays(parseISO(fenetre.fin), JOURS_D_UNE_FENETRE_GLISSANTE - 1),
        ),
  au: fenetre.fin,
})

export const moisDeLaFenetre = (
  fenetre: FenetreDesGraphiques,
): BornesDeLaSerie => ({
  du: jourDe(
    startOfMonth(
      fenetre.type === 'Bornee'
        ? parseISO(fenetre.debut)
        : subMonths(parseISO(fenetre.fin), MOIS_D_UNE_FENETRE_GLISSANTE - 1),
    ),
  ),
  au: fenetre.fin,
})

export const fenetresDuPerimetre = ({
  du,
  fin,
}: {
  readonly du: Jour | null
  readonly fin: Jour
}) => {
  const fenetre = fenetreDe({ debut: du, fin })

  return { parJour: fenetre, parMois: fenetre }
}

export const fenetresNationales = ({
  du,
  au,
  aujourdhui,
}: {
  readonly du: Jour | null
  readonly au: Jour | null
  readonly aujourdhui: Jour
}) => ({
  parJour: fenetreDe({ debut: du, fin: au ?? aujourdhui }),
  parMois: fenetreDe({ debut: null, fin: aujourdhui }),
})
