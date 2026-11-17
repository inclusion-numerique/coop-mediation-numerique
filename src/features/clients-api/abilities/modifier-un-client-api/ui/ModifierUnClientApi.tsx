'use client'

import type { ClientApi } from '@app/web/features/clients-api/domain'
import { FormulaireDuClientApi } from '@app/web/features/clients-api/formulaire/FormulaireDuClientApi'
import { inject } from '@app/web/libs/injection/client'
import { MODIFIER_UN_CLIENT_API_ACTION_KEY } from '../action/modifier-un-client-api.key'
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
