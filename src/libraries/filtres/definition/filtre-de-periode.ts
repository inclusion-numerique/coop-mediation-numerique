import { parseAsIsoDate } from 'nuqs/server'
import type { Filtre } from './filtre'

const parametres = { du: parseAsIsoDate, au: parseAsIsoDate }

const jour = new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC' })

export type FiltreDePeriode = Filtre<typeof parametres>

export const filtreDePeriode: FiltreDePeriode = {
  titre: 'Période',
  parametres,
  etiquettes: ({ du, au }) =>
    du === null || au === null
      ? []
      : [
          {
            libelle: `${jour.format(du)} - ${jour.format(au)}`,
            sans: { du: null, au: null },
          },
        ],
}
