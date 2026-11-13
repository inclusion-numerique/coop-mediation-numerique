import { allocatePercentagesFromRecords } from '@app/web/libraries/proportions'
import type { AccompagnementsParLieu } from '../domain'

export const parLieuPresentes = (parLieu: AccompagnementsParLieu) =>
  allocatePercentagesFromRecords(
    parLieu.map(({ lieu, nombre }) => ({
      id: lieu.id,
      label: lieu.nom,
      count: nombre,
    })),
    'count',
    'proportion',
  )
