import type { Model } from '@app/web/libraries/model'
import type { FiltreRole, FiltreStatut } from '../../../../../domain'

export type RoleFiltre = Model.InputOf<typeof FiltreRole>

export type FilterParam = Model.InputOf<typeof FiltreStatut>
