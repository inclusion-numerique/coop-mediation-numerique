import Button from '@codegouvfr/react-dsfr/Button'
import { notFound } from 'next/navigation'
import {
  BeneficiaireId as BeneficiaireDesActivites,
  compterLesThematiquesAbordees,
  MediateurId as MediateurDesActivites,
} from '@/features/activites/abilities/compter-les-thematiques-abordees'
import { thematiquesAbordeesPresentees } from '@/features/activites/abilities/compter-les-thematiques-abordees/ui'
import { listerLHistoriqueDUnBeneficiaire } from '@/features/activites/abilities/lister-mes-activites'
import { LignesParPage, NumeroDePage } from '@/features/activites/domain'
import { authenticateMediateur } from '@/features/authentification/implementation/session/authenticateUser'
import { consulterBeneficiaire } from '@/features/beneficiaire/abilities/consulter-beneficiaire/implementation'
import ViewBeneficiaireInformationsPage from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireInformationsPage'
import { DeleteBeneficiaireModal } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/ui/components/DeleteBeneficiaireModal'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { conseillerNumeriqueSql } from '@/features/employeuse/server'
import {
  rendezVousDesUsagersAListerSql,
  rendezVousLies,
  rendezVousParIds,
} from '@/features/rdvsp/abilities/lister-les-rdvs-des-activites'

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
      conseillersNumeriques: conseillerNumeriqueSql,
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
