import Button from '@codegouvfr/react-dsfr/Button'
import { notFound } from 'next/navigation'
import { compterLesThematiquesAbordees } from '@/features/activites/abilities/compter-les-thematiques-abordees/implementations/prisma/thematiques-abordees.query'
import { thematiquesAbordeesPresentees } from '@/features/activites/abilities/compter-les-thematiques-abordees/ui/thematiques-abordees.presenter'
import { listerLHistoriqueDUnBeneficiaire } from '@/features/activites/abilities/lister-mes-activites/implementations/prisma/historique-d-un-beneficiaire.query'
import { LignesParPage, NumeroDePage } from '@/features/activites/domain'
import {
  BeneficiaireId as BeneficiaireDesActivites,
  MediateurId as MediateurDesActivites,
} from '@/features/activites/domain/index'
import { authenticateMediateur } from '@/features/authentification/implementations/session/authenticate-user'
import { consulterBeneficiaire } from '@/features/beneficiaire/abilities/consulter-beneficiaire/implementations/prisma/consulter-beneficiaire.query'
import ViewBeneficiaireInformationsPage from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireInformationsPage'
import { DeleteBeneficiaireModal } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/ui/components/DeleteBeneficiaireModal'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import {
  rendezVousDesUsagersAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites/implementations/prisma/rdvs-des-activites.query'

const BeneficiaireInformationsPage = async (props: {
  params: Promise<{ beneficiaireId: string }>
}) => {
  const { beneficiaireId } = await props.params
  const user = await authenticateMediateur()
  const mediateurId = user.mediateur.id

  const beneficiaire = await consulterBeneficiaire({
    beneficiaireId: BeneficiaireId(beneficiaireId),
    mediateurId: MediateurId(mediateurId),
  })

  if (!beneficiaire) {
    notFound()
  }

  const [thematiquesAbordees, chronologie] = await Promise.all([
    compterLesThematiquesAbordees({
      mediateurId: MediateurDesActivites(mediateurId),
      beneficiaireId: BeneficiaireDesActivites(beneficiaireId),
    }),
    listerLHistoriqueDUnBeneficiaire({
      mediateurId: MediateurDesActivites(user.mediateur.id),
      beneficiaireId: BeneficiaireDesActivites(beneficiaire.id),
      pagination: { page: NumeroDePage(1), lignesParPage: LignesParPage(10) },
      compte: user.rdvAccount?.hasOauthTokens
        ? { _tag: 'Connecte', affichesDansLaListe: true }
        : { _tag: 'NonConnecte' },
      rendezVous:
        user.rdvAccount === null
          ? null
          : {
              comptes: [user.rdvAccount.id],
              selection: rendezVousDesUsagersAListerSql(
                beneficiaire.rdvUserId === null ? [] : [beneficiaire.rdvUserId],
              ),
              parIds: rendezVousParIds,
            },
      rendezVousLies,
    }),
  ])

  return (
    <ViewBeneficiaireInformationsPage
      data={{
        beneficiaire,
        thematiquesAbordees: thematiquesAbordeesPresentees(thematiquesAbordees),
        totalActivitesCount:
          chronologie.total.activites + chronologie.total.rendezVous,
      }}
      actions={
        <div>
          <Button
            iconId="fr-icon-edit-line"
            iconPosition="right"
            size="small"
            priority="tertiary no outline"
            linkProps={{
              href: `/coop/mes-beneficiaires/${beneficiaire.id}/modifier`,
            }}
          >
            Modifier
          </Button>
          <Button
            iconId="fr-icon-delete-bin-line"
            className="fr-ml-1v"
            iconPosition="right"
            size="small"
            priority="tertiary no outline"
            type="button"
            {...DeleteBeneficiaireModal.buttonProps}
          >
            Supprimer
          </Button>
        </div>
      }
    />
  )
}

export default BeneficiaireInformationsPage
