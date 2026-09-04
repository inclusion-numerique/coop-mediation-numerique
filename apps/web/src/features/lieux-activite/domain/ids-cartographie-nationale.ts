import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

const SEPARATEUR = '__'

const IdSource = z.string().trim().min(1)

/**
 * La corrélation d'un lieu de la coop avec ses homologues de la cartographie
 * nationale, sous la forme `Source_uuid`. Une fusion conserve les tokens des
 * deux fiches, d'où une liste : en base, 1 703 lieux sur 7 821 en portent
 * plusieurs, jusqu'à six. Écraser la liste par un seul token perdrait la trace
 * des fiches absorbées, et avec elle la capacité à les reconnaître.
 */
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

/** La forme attendue par la colonne : les tokens recollés. */
export const serialiserIdsCartographieNationale = (
  ids: IdsCartographieNationale,
): string => ids.join(SEPARATEUR)
