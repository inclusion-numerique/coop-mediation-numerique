import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const SEPARATEUR = '__'

const IdSource = z.string().trim().min(1)

export const IdsCartographieNationale = defineModel(
  z
    .string()
    .transform((valeur) => valeur.split(SEPARATEUR))
    .pipe(z.array(IdSource).nonempty())
    .brand('IdsCartographieNationale'),
)

export type IdsCartographieNationale = Model.TypeOf<
  typeof IdsCartographieNationale
>

export const IdentifiantCartographie = defineModel(
  z.string().trim().min(1).brand('IdentifiantCartographie'),
)

export type IdentifiantCartographie = Model.TypeOf<
  typeof IdentifiantCartographie
>

export const serialiserIdsCartographieNationale = (
  ids: IdsCartographieNationale,
): IdentifiantCartographie => IdentifiantCartographie(ids.join(SEPARATEUR))
