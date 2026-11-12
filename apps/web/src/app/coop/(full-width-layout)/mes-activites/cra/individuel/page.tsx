import { enregistrerUnAccompagnementIndividuelAction } from '@app/web/app/_actions/activites/enregistrer-un-accompagnement-individuel.action'
import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@app/web/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@app/web/app/_actions/tags/rechercher-des-tags.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import {
  tagsInitiauxDuCra,
  visibilitesDeTagDuCra,
} from '@app/web/composition/activites/tags-du-cra'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.key'
import CraIndividuelPage from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/CraIndividuelPage'
import { craIndividuelDefaultValues } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/craIndividuelDefaultValues'
import { CraIndividuelData } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/validation/CraIndividuelValidation'
import { MediateurId } from '@app/web/features/activites/domain'
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
import {
  decodeSerializableState,
  type EncodedState,
} from '@app/web/utils/encodeSerializableState'
import type { DefaultValues } from 'react-hook-form'

const CreateCraIndividuelPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: EncodedState<DefaultValues<CraIndividuelData>>
    retour?: string
  }>
}) => {
  const { retour, v } = await searchParams

  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  if (!employeuse) {
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const stateFromUrl = v ? decodeSerializableState(v, {}) : {}

  const [lieuxProposes, dureesFrequentes, initialBeneficiairesOptions] =
    await Promise.all([
      lieuxDuMediateur(mediateurId),
      dureesFrequentesDuMediateur(MediateurId(mediateurId)),
      getInitialBeneficiairesOptionsForSearch({ mediateurId }),
    ])

  const craPageData = await donneesDeLaSaisieDeMediation<CraIndividuelData>(
    craIndividuelDefaultValues,
  )({
    mediateurId,
    stateFromUrl: stateFromUrl,
    lieuxProposes,
    dureesFrequentes,
    tagsInitiaux: tagsInitiauxDuCra(user),
  })

  return (
    <ClientBinder
      bind={ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY}
      to={enregistrerUnAccompagnementIndividuelAction}
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
              <CraIndividuelPage
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

export default CreateCraIndividuelPage
