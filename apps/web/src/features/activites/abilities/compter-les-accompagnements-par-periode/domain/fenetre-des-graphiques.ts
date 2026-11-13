import { format, parseISO, startOfMonth, subDays, subMonths } from 'date-fns'
import { Jour } from '../../../domain'

export type FenetreDesGraphiques =
  | { readonly type: 'Glissante'; readonly fin: Jour }
  | { readonly type: 'Bornee'; readonly debut: Jour; readonly fin: Jour }

export type BornesDeLaSerie = { readonly du: Jour; readonly au: Jour }

export const JOURS_D_UNE_FENETRE_GLISSANTE = 30

export const MOIS_D_UNE_FENETRE_GLISSANTE = 12

const jour = (date: Date): Jour => Jour(format(date, 'yyyy-MM-dd'))

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
      : jour(subDays(parseISO(fenetre.fin), JOURS_D_UNE_FENETRE_GLISSANTE - 1)),
  au: fenetre.fin,
})

export const moisDeLaFenetre = (
  fenetre: FenetreDesGraphiques,
): BornesDeLaSerie => ({
  du: jour(
    startOfMonth(
      fenetre.type === 'Bornee'
        ? parseISO(fenetre.debut)
        : subMonths(parseISO(fenetre.fin), MOIS_D_UNE_FENETRE_GLISSANTE - 1),
    ),
  ),
  au: fenetre.fin,
})
