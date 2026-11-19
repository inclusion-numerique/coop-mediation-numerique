import { enregistrerUnAtelierCollectifAction } from '@/app/_actions/activites/enregistrer-un-atelier-collectif.action'
import { rechercherBeneficiairesAction } from '@/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { nouvelleSaisieCollective } from '@/features/activites/abilities/enregistrer-un-atelier-collectif'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.key'
import CraCollectifPage from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/CraCollectifPage'
import type { CraCollectifData } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/CraCollectifValidation'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from '@/features/activites/ui/saisie/beneficiaire/rechercher-des-beneficiaires.key'
import { RECHERCHER_DES_COMMUNES_DU_CRA_KEY } from '@/features/activites/ui/saisie/commune/rechercher-des-communes.key'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '@/features/activites/ui/saisie/lieu/rechercher-des-lieux.key'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { rechercherDesCommunes } from '@/features/adresse/implementation/api-adresse/rechercher-des-communes'
import { authenticateMediateur } from '@/features/authentification/implementation/session/authenticateUser'
import { beneficiairesLesPlusSuivis } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementation'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/server'
import { lieuxDuMediateur } from '@/features/lieux-activite'
import { visibilitesProposeesA } from '@/features/tags/abilities/creer-un-tag'
import { tagsInitiauxPar } from '@/features/tags/abilities/rechercher-des-tags'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'
import type { EncodedState } from '@/libraries/parametres-d-url/encodeSerializableState'

const CreateCraCollectifPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraCollectifData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams
  const user = await authenticateMediateur()

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  if (!employeuse) {
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const saisie = await nouvelleSaisieCollective({
    mediateurId: user.mediateur.id,
    v,
    fournisseurs: {
      lieuxDuMediateur,
      beneficiairesLesPlusSuivis,
      tagsInitiaux: tagsInitiauxPar(user),
      visibilitesProposees: visibilitesProposeesA(user),
    },
  })

  return (
    <ClientBinder
      bind={ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY}
      to={enregistrerUnAtelierCollectifAction}
    >
      <ClientBinder
        bind={RECHERCHER_DES_TAGS_DU_CRA_KEY}
        to={rechercherDesTagsAction}
      >
        <ClientBinder bind={CREER_UN_TAG_DU_CRA_KEY} to={creerUnTagAction}>
          <ClientBinder
            bind={RECHERCHER_DES_LIEUX_DU_CRA_KEY}
            to={rechercherUnLieuActiviteAction}
          >
            <ClientBinder
              bind={RECHERCHER_DES_COMMUNES_DU_CRA_KEY}
              to={rechercherDesCommunes}
            >
              <ClientBinder
                bind={RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY}
                to={rechercherBeneficiairesAction}
              >
                <CraCollectifPage {...saisie} retour={retour} />
              </ClientBinder>
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraCollectifPage
