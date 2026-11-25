import { creerBeneficiaireAction } from '@/app/_actions/beneficiaire/creer-beneficiaire.action'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user.middleware'
import {
  CreerBeneficiairePage,
  type SaisieDuCraEncodee,
} from '@/features/beneficiaire/abilities/creer-beneficiaire/ui/pages/CreerBeneficiairePage'
import { decodeSerializableState } from '@/libraries/etat-encode'

const PageCreerBeneficiaire = async ({
  searchParams,
}: {
  searchParams: Promise<{
    cra?: SaisieDuCraEncodee
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
