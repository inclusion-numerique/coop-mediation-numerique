import { allocatePercentagesFromRecords } from '@app/web/libraries/proportions'
import { libelleDeLaCommune } from '../../../ui/statistiques/parts-presentees'
import type { PersonnesParCommune } from '../domain'

export const personnesParCommunePresentees = (
  parCommune: PersonnesParCommune,
) =>
  allocatePercentagesFromRecords(
    parCommune
      .filter(({ nombre }) => nombre > 0)
      .map(({ commune, nombre }) => ({
        nom: commune.type === 'Renseignee' ? commune.commune.nom : null,
        codeInsee:
          commune.type === 'Renseignee' ? commune.commune.codeInsee : null,
        codePostal:
          commune.type === 'Renseignee' ? commune.commune.codePostal : null,
        count: nombre,
        label: libelleDeLaCommune(commune, '\u00a0'),
      })),
    'count',
    'proportion',
  )
