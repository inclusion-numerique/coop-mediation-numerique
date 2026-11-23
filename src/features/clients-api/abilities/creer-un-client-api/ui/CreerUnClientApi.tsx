'use client'

import { FormulaireDuClientApi } from '@/features/clients-api/ui/FormulaireDuClientApi'
import { inject } from '@/libraries/nextjs/injection/client'
import { CREER_UN_CLIENT_API_ACTION_KEY } from '../action/creer-un-client-api.key'

export const CreerUnClientApi = ({ aujourdHui }: { aujourdHui: string }) => (
  <FormulaireDuClientApi
    valeursInitiales={{ nom: '', debut: aujourdHui, fin: '', portees: [] }}
    enregistrer={inject(CREER_UN_CLIENT_API_ACTION_KEY)}
    libelleDuBouton="Créer"
    messageDeSucces={(nom) => `Le client API "${nom}" a bien été créé.`}
  />
)
