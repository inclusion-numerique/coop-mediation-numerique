import { enregistrerUnAccompagnementIndividuelAction } from '@app/web/app/_actions/activites/enregistrer-un-accompagnement-individuel.action'
import { rechercherBeneficiairesAction } from '@app/web/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import { rechercherUnLieuActiviteAction } from '@app/web/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@app/web/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@app/web/app/_actions/tags/rechercher-des-tags.action'
import { authenticateMediateur } from '@app/web/auth/authenticateUser'
import {
  tagsInitiauxDuCra,
  visibilitesDeTagDuCra,
} from '@app/web/composition/activites/tags-du-cra'
import { lireUneActiviteDeMediation } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.key'
import CraIndividuelPage from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/CraIndividuelPage'
import { formulaireDeLAccompagnementIndividuel } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/formulaire-de-l-accompagnement-individuel.presenter'
import type { CraIndividuelData } from '@app/web/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/validation/CraIndividuelValidation'
import { ActiviteId, MediateurId } from '@app/web/features/activites/domain'
import { dureesFrequentesDuMediateur } from '@app/web/features/activites/implementation/durees-frequentes'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/beneficiaire/rechercher-des-beneficiaires.key'
import { RECHERCHER_DES_COMMUNES_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/commune/rechercher-des-communes.key'
import { donneesDeLaSaisieDeMediation } from '@app/web/features/activites/ui/saisie/donnees-de-la-saisie-de-mediation'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/lieu/rechercher-des-lieux.key'
import { CREER_UN_TAG_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@app/web/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { rechercherDesCommunes } from '@app/web/features/adresse/abilities/rechercher-des-communes/implementation/api-adresse/rechercher-des-communes'
import { beneficiairesLesPlusSuivis } from '@app/web/features/beneficiaire/abilities/rechercher-beneficiaires/implementation'
import RattacherEmployeusePage from '@app/web/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@app/web/features/employeuse/server'
import { lieuxDuMediateur } from '@app/web/features/lieux-activite'
import { rendezVousLies } from '@app/web/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { ClientBinder } from '@app/web/libs/injection/client-binder'
import { notFound } from 'next/navigation'

const UpdateCraIndividuelPage = async ({
  params,
  searchParams,
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
          rendezVousLies,
        })

  if (aModifier?.activite._tag !== 'Individuel') return notFound()

  const defaultValues = formulaireDeLAccompagnementIndividuel(
    aModifier.activite,
    aModifier.affichage,
  )

  const [lieuxProposes, dureesFrequentes, beneficiairesProposes] =
    await Promise.all([
      lieuxDuMediateur(mediateurId),
      dureesFrequentesDuMediateur(MediateurId(mediateurId)),
      beneficiairesLesPlusSuivis(mediateurId),
    ])

  const craPageData = await donneesDeLaSaisieDeMediation<CraIndividuelData>()({
    mediateurId,
    stateFromUrl: defaultValues,
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
              <ClientBinder
                bind={RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY}
                to={rechercherBeneficiairesAction}
              >
                <CraIndividuelPage
                  {...craPageData}
                  beneficiairesProposes={beneficiairesProposes}
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
    </ClientBinder>
  )
}

export default UpdateCraIndividuelPage
