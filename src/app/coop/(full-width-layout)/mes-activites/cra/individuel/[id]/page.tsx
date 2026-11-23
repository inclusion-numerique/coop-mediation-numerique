import { notFound } from 'next/navigation'
import { enregistrerUnAccompagnementIndividuelAction } from '@/app/_actions/activites/enregistrer-un-accompagnement-individuel.action'
import { rechercherBeneficiairesAction } from '@/app/_actions/beneficiaire/rechercher-beneficiaires.action'
import { rechercherUnLieuActiviteAction } from '@/app/_actions/lieux-activite/rechercher-un-lieu-activite.action'
import { creerUnTagAction } from '@/app/_actions/tags/creer-un-tag.action'
import { rechercherDesTagsAction } from '@/app/_actions/tags/rechercher-des-tags.action'
import { saisieIndividuelleAModifier } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel'
import { ENREGISTRER_UN_ACCOMPAGNEMENT_INDIVIDUEL_ACTION_KEY } from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/action/enregistrer-un-accompagnement-individuel.key'
import CraIndividuelPage from '@/features/activites/abilities/enregistrer-un-accompagnement-individuel/ui/CraIndividuelPage'
import { RECHERCHER_DES_BENEFICIAIRES_DU_CRA_KEY } from '@/features/activites/ui/saisie/beneficiaire/rechercher-des-beneficiaires.key'
import { RECHERCHER_DES_COMMUNES_DU_CRA_KEY } from '@/features/activites/ui/saisie/commune/rechercher-des-communes.key'
import { RECHERCHER_DES_LIEUX_DU_CRA_KEY } from '@/features/activites/ui/saisie/lieu/rechercher-des-lieux.key'
import { CREER_UN_TAG_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/creer-un-tag.key'
import { RECHERCHER_DES_TAGS_DU_CRA_KEY } from '@/features/activites/ui/saisie/tags/rechercher-des-tags.key'
import { profilDeLaSession } from '@/features/authentification'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticateUser'
import { beneficiairesLesPlusSuivis } from '@/features/beneficiaire/abilities/rechercher-beneficiaires/implementations'
import RattacherEmployeusePage from '@/features/employeuse/abilities/rattacher-a-une-employeuse/ui/pages/RattacherEmployeusePage'
import { consulterEmployeuseAUneDate } from '@/features/employeuse/server'
import { lieuxDuMediateur } from '@/features/lieux-activite'
import { rendezVousLies } from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'
import { visibilitesProposeesA } from '@/features/tags/abilities/creer-un-tag'
import { tagsInitiauxPar } from '@/features/tags/abilities/rechercher-des-tags'
import { acteurDe } from '@/features/tags/domain'
import { rechercherDesCommunes } from '@/libraries/ban/rechercher-des-communes'
import { ClientBinder } from '@/libraries/nextjs/injection/client-binder'

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
    return <RattacherEmployeusePage motif="Enregistrer une activité" />
  }

  const acteur = acteurDe(profilDeLaSession(user))

  const saisie = await saisieIndividuelleAModifier({
    id,
    mediateurId: user.mediateur.id,
    rendezVousLies,
    fournisseurs: {
      lieuxDuMediateur,
      beneficiairesLesPlusSuivis,
      tagsInitiaux: tagsInitiauxPar(acteur),
      visibilitesProposees: visibilitesProposeesA(acteur),
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

export default UpdateCraIndividuelPage
