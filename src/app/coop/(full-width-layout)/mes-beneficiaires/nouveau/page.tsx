import { creerBeneficiaireAction } from '@/app/_actions/beneficiaire/creer-beneficiaire.action'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticateUser'
import { CreerBeneficiairePage } from '@/features/beneficiaire/abilities/creer-beneficiaire/ui/pages/CreerBeneficiairePage'
import type { SaisieEnCours } from '@/features/beneficiaire/ui/formulaire/saisie-en-cours'
import {
  decodeSerializableState,
  type EncodedState,
} from '@/libraries/parametres-d-url/encodeSerializableState'

const PageCreerBeneficiaire = async ({
  searchParams,
}: {
  searchParams: Promise<{
    cra?: EncodedState<SaisieEnCours>
    retour?: string
  }>
}) => {
  const { retour, cra } = await searchParams
  const user = await authenticateMediateur()

  const parsedCra = cra ? decodeSerializableState(cra, {}) : undefined

  return (
    <CreerBeneficiairePage
      mediateurId={user.mediateur.id}
      save={creerBeneficiaireAction}
      retour={retour}
      cra={parsedCra}
    />
  )
}

export default PageCreerBeneficiaire
