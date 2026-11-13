import { allocatePercentagesFromRecords } from '@app/web/libraries/proportions'
import { libelleDeLaCommune } from '../../../ui/statistiques/parts-presentees'
import type { AccompagnementsParCommune } from '../domain'

export const parCommunePresentes = (parCommune: AccompagnementsParCommune) =>
  allocatePercentagesFromRecords(
    parCommune.map(
      ({
        commune,
        nombre,
      }): {
        commune: string | null
        codePostal: string | null
        codeInsee: string | null
        count: number
        label: string
      } => ({
        commune: commune.type === 'Renseignee' ? commune.commune.nom : null,
        codePostal:
          commune.type === 'Renseignee' ? commune.commune.codePostal : null,
        codeInsee:
          commune.type === 'Renseignee' ? commune.commune.codeInsee : null,
        count: nombre,
        label: libelleDeLaCommune(commune),
      }),
    ),
    'count',
    'proportion',
  )
