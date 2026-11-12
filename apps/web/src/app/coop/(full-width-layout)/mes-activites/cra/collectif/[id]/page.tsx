import { enregistrerUnAtelierCollectifAction } from '@app/web/app/_actions/activites/enregistrer-un-atelier-collectif.action'
import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@app/web/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@app/web/app/_actions/tags/rechercher-des-tags.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import {
  tagsInitiauxDuCra,
  visibilitesDeTagDuCra,
} from '@app/web/composition/activites/tags-du-cra'
import { lireUneActiviteDeMediation } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.key'
import CraCollectifPage from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/CraCollectifPage'
import { formulaireDeLAtelierCollectif } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/formulaire-de-l-atelier-collectif.presenter'
import type { CraCollectifData } from '@app/web/features/activites/abilities/enregistrer-un-atelier-collectif/ui/validation/CraCollectifValidation'
import { ActiviteId, MediateurId } from '@app/web/features/activites/domain'
import { dureesFrequentesDuMediateur } from '@app/web/features/activites/implementation/durees-frequentes'
import { RECHERCHER_DES_COMMUNES_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/commune/rechercher-des-communes.key'
import { donneesDeLaSaisieDeMediation } from '@app/web/features/activites/ui/saisie/donnees-de-la-saisie-de-mediation'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/lieu/rechercher-des-lieux.key'
import { CREER_UN_TAG_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { rechercherDesCommunes } from '@app/web/features/adresse/abilities/rechercher-des-communes/implementation/api-adresse/rechercher-des-communes'
import { getInitialBeneficiairesOptionsForSearch } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/ui/get-initial-beneficiaires-options-for-search'
import RattacherEmployeusePage from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
import { lieuxDuMediateur } from '@app/web/features/lieux-activite'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

const UpdateCraCollectifPage = async ({
  searchParams,
  params,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ retour?: string }>
}) => {
  const { id } = await params
  const { retour } = await searchParams

  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  if (!employeuse) {
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const activiteId = ActiviteId.safe(id)
  const aModifier =
    activiteId === null
      ? null
      : await lireUneActiviteDeMediation({
          id: activiteId,
          mediateurId: MediateurId(user.mediateur.id),
        })

  if (aModifier?.activite._tag !== 'Collectif') return notFound()

  const defaultValues = formulaireDeLAtelierCollectif(
    aModifier.activite,
    aModifier.affichage,
  )

  const [lieuxProposes, dureesFrequentes, initialBeneficiairesOptions] =
    await Promise.all([
      lieuxDuMediateur(mediateurId),
      dureesFrequentesDuMediateur(MediateurId(mediateurId)),
      getInitialBeneficiairesOptionsForSearch({ mediateurId }),
    ])

  const craPageData = await donneesDeLaSaisieDeMediation<CraCollectifData>()({
    mediateurId,
    stateFromUrl: defaultValues,
    lieuxProposes,
    dureesFrequentes,
    tagsInitiaux: tagsInitiauxDuCra(user),
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
              <CraCollectifPage
                {...craPageData}
                initialBeneficiairesOptions={initialBeneficiairesOptions}
                mediateurId={mediateurId}
                visibilitesDeTag={visibilitesDeTagDuCra(user, {
                  departemental: false,
                })}
                retour={retour}
              />
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default UpdateCraCollectifPage
