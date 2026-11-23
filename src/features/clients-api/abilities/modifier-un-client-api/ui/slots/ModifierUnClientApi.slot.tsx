'use client'

import type { ClientApi } from '@/features/clients-api/domain'
import { FormulaireDuClientApi } from '@/features/clients-api/ui/forms/FormulaireDuClientApi'
import { inject } from '@/libraries/nextjs/injection/client'
import { MODIFIER_UN_CLIENT_API_ACTION_KEY } from '../../action/modifier-un-client-api.key'
import { valeursDuClientApi } from './valeurs-du-client-api.presenter'

export const ModifierUnClientApi = ({ client }: { client: ClientApi }) => (
  <FormulaireDuClientApi
    valeursInitiales={valeursDuClientApi(client)}
    enregistrer={(valeurs) =>
      inject(MODIFIER_UN_CLIENT_API_ACTION_KEY)({
        ...valeurs,
        clientApiId: client.id,
      })
    }
    libelleDuBouton="Modifier"
    messageDeSucces={(nom) => `Le client API "${nom}" a bien été modifié.`}
  />
)
