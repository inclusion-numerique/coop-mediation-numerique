'use client'

import type { ClientApi } from '@/features/clients-api/domain'
import { ClientApiForm } from '@/features/clients-api/ui/forms/ClientApiForm'
import { inject } from '@/libraries/nextjs/injection'
import { MODIFIER_UN_CLIENT_API_ACTION_KEY } from '../../action/modifier-un-client-api.key'
import { valeursDuClientApi } from '../presenters/valeurs-du-client-api.presenter'

export const ModifierUnClientApi = ({ client }: { client: ClientApi }) => (
  <ClientApiForm
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
