'use client'

import { ClientApiForm } from '@/features/clients-api/ui/forms/ClientApiForm'
import { inject } from '@/libraries/nextjs/injection'
import { CREER_UN_CLIENT_API_ACTION_KEY } from '../../action/creer-un-client-api.key'

export const CreerUnClientApi = ({ aujourdHui }: { aujourdHui: string }) => (
  <ClientApiForm
    valeursInitiales={{ nom: '', debut: aujourdHui, fin: '', portees: [] }}
    enregistrer={inject(CREER_UN_CLIENT_API_ACTION_KEY)}
    libelleDuBouton="Créer"
    messageDeSucces={(nom) => `Le client API "${nom}" a bien été créé.`}
  />
)
