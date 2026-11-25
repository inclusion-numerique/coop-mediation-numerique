import { enregistrerUnAtelierCollectifAction } from '@/app/_actions/activites/enregistrer-un-atelier-collectif.action'
import { rechercherBeneficiairesAction } from '@/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { ENREGISTRER_UN_ATELIER_COLLECTIF_ACTION_KEY } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/action/enregistrer-un-atelier-collectif.key'
import CraCollectifPage from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/pages/CraCollectifPage'
import type { SaisieCollectiveEncodee } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/presenters/page-de-saisie.presenter'
import { nouvelleSaisieCollective } from '@/features/activites/abilities/enregistrer-un-atelier-collectif/ui/presenters/page-de-saisie.presenter'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/action/creer-un-tag.key'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-beneficiaires.key'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-lieux.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { dureesFrequentesDuMediateur } from '@/features/activites/implementations/prisma/durees-frequentes.query'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { beneficiairesLesPlusSuivis } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/prisma/beneficiaires-les-plus-suivis.query'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/slots/RattacherEmployeuseForm.slot'
import { lieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-du-mediateur.query'
import { visibilitesProposees } from '@/features/tags/abilities/creer-un-tag/ui/presenters/visibilites.presenter'
import { tagsInitiauxAvec } from '@/features/tags/abilities/rechercher-des-tags/implementations/prisma/tags-initiaux-par.query'
import { acteurDe } from '@/features/tags/domain'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

const CreateCraCollectifPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    v?: SaisieCollectiveEncodee
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
    return (
      <RattacherEmployeusePage
        motif="Enregistrer une activité"
        formulaire={<RattacherEmployeuseForm nextStepPath={null} />}
      />
    )
  }

  const acteur = acteurDe(profilDeLaSession(user))

  const saisie = await nouvelleSaisieCollective({
    mediateurId: user.mediateur.id,
    v,
    fournisseurs: {
      lieuxDuMediateur,
      beneficiairesLesPlusSuivis,
      dureesFrequentes: dureesFrequentesDuMediateur,
      tagsInitiaux: tagsInitiauxAvec(tagAffiche)(acteur),
      visibilitesProposees: visibilitesProposees(acteur),
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
              bind={RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY}
              to={rechercherBeneficiairesAction}
            >
              <CraCollectifPage {...saisie} retour={retour} />
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default CreateCraCollectifPage
