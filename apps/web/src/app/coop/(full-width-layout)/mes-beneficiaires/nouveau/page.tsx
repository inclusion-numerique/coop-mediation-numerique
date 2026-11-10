import { creerBeneficiaireAction } from '@app/web/app/_actions/beneficiaire/creer-beneficiaire.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import { CreerBeneficiairePage } from '@app/web/features/beneficiaire/abilities/creer-beneficiaire/ui/pages/CreerBeneficiairePage'
import type { SaisieEnCours } from '@app/web/features/beneficiaire/forms/saisie-en-cours'
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'

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
