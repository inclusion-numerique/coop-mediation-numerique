import { notFound } from 'next/navigation'
import { enregistrerUnAccompagnementIndividuelAction } from '@/app/_actions/activites/enregistrer-un-accompagnement-individuel.action'
import { rechercherBeneficiairesAction } from '@/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.key'
import CraIndividuelPage from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/pages/CraIndividuelPage'
import { saisieIndividuelleAModifier } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/presenters/page-de-saisie.presenter'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/action/creer-un-tag.key'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-beneficiaires.key'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-lieux.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/action/rechercher-des-tags.key'
import { activiteDeMediationLue } from '@/features/activites/implementations/prisma/activite-de-mediation-lue.query'
import { dureesFrequentesDuMediateur } from '@/features/activites/implementations/prisma/durees-frequentes.query'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { beneficiairesLesPlusSuivis } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations/prisma/beneficiaires-les-plus-suivis.query'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/abilities/consulter-employeuse-a-une-date/implementations/prisma/consulter-employeuse-a-une-date.query'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import RattacherEmployeuseForm from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/slots/RattacherEmployeuseForm.slot'
import { lieuxDuMediateur } from '@/features/lieux-activite/abilities/lister-les-options-de-lieux/implementations/prisma/options-de-lieux-du-mediateur.query'
import { rendezVousLies } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'
import { visibilitesProposees } from '@/features/tags/abilities/creer-un-tag/ui/presenters/visibilites.presenter'
import { tagsInitiauxAvec } from '@/features/tags/abilities/rechercher-des-tags/implementations/prisma/tags-initiaux-par.query'
import { acteurDe } from '@/features/tags/domain'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
import { ClientBinder } from '@/libraries/nextjs/injection'

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

  const saisie = await saisieIndividuelleAModifier({
    id,
    mediateurId: user.mediateur.id,
    activiteLue: activiteDeMediationLue(rendezVousLies),
    fournisseurs: {
      lieuxDuMediateur,
      beneficiairesLesPlusSuivis,
      dureesFrequentes: dureesFrequentesDuMediateur,
      tagsInitiaux: tagsInitiauxAvec(tagAffiche)(acteur),
      visibilitesProposees: visibilitesProposees(acteur),
    },
  })

  if (saisie === null) return notFound()

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
              bind={RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY}
              to={rechercherBeneficiairesAction}
            >
              <CraIndividuelPage {...saisie} retour={retour} />
            </ClientBinder>
          </ClientBinder>
        </ClientBinder>
      </ClientBinder>
    </ClientBinder>
  )
}

export default UpdateCraIndividuelPage
