import type { VariablesDuClient } from './client'
import type { VariablesDeLOutillage } from './outillage'
import type { VariablesDuServeur } from './serveur'

type VariablesBrutes<Nom extends string> = {
  readonly [Variable in Exclude<Nom, 'NODE_ENV'>]?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv
      extends VariablesBrutes<
        VariablesDuClient | VariablesDuServeur | VariablesDeLOutillage
      > {}
  }
}
