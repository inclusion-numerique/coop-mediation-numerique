import { enregistrerUnAccompagnementIndividuelAction } from '@/app/_actions/activites/enregistrer-un-accompagnement-individuel.action'
import { rechercherBeneficiairesAction } from '@/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.key'
import { nouvelleSaisieIndividuelle } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/implementations/prisma/page-de-saisie.query'
import type { CraIndividuelData } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/forms/cra-individuel.validation'
import CraIndividuelPage from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/pages/CraIndividuelPage'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/action/creer-un-tag.key'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-beneficiaires.key'
import { RECHERCHER_DES_COMMUNES_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-communes.key'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-lieux.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user'
import { beneficiairesLesPlusSuivis } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/prisma/beneficiaires-les-plus-suivis'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { lieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-du-mediateur.query'
import { visibilitesProposeesA } from '@/features/tags/abilities/creer-un-tag/implementations/session/visibilites-proposees-a'
import { tagsInitiauxPar } from '@/features/tags/abilities/rechercher-des-tags/implementations/session/tags-initiaux-par'
import { acteurDe } from '@/features/tags/domain'
import { rechercherDesCommunes } from '@/libraries/ban/rechercher-des-communes'
import type { DefaultValues } from '@/libraries/formulaire/use-app-form'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'
import type { EncodedState } from '@/libraries/parametres-d-url/encodeSerializableState'

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

  const employeuse = await consulterEmployeuseAUneDate({
    userId: user.id,
    date: new Date(),
  })

  if (!employeuse) {
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const acteur = acteurDe(profilDeLaSession(user))

  const saisie = await nouvelleSaisieIndividuelle({
    mediateurId: user.mediateur.id,
    v,
    fournisseurs: {
      lieuxDuMediateur,
      beneficiairesLesPlusSuivis,
      tagsInitiaux: tagsInitiauxPar(acteur),
      visibilitesProposees: visibilitesProposeesA(acteur),
    },
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
                <CraIndividuelPage {...saisie} retour={retour} />
              </ClientBinder>
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraIndividuelPage
