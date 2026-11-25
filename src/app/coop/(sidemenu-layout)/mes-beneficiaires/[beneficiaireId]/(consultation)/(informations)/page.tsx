import { notFound } from 'next/navigation'
import { compterLesThematiquesAbordees } from '@/features/activites/abilities/compter-les-thematiques-abordees/implementations/prisma/thematiques-abordees.query'
import { thematiquesAbordeesPresentees } from '@/features/activites/abilities/compter-les-thematiques-abordees/ui/presenters/thematiques-abordees.presenter'
import { listerLHistoriqueDUnBeneficiaire } from '@/features/activites/abilities/lister-mes-activites/implementations/prisma/historique-d-un-beneficiaire.query'
import { paginationDeLHistorique } from '@/features/activites/abilities/lister-mes-activites/ui/filtres/historique-d-un-beneficiaire.filtre'
import {
  BeneficiaireId as BeneficiaireDesActivites,
  MediateurId as MediateurDesActivites,
} from '@/features/activites/domain/index'
import { authenticateMediateur } from '@/features/authentification/middlewares/with-utilisateur-authentifie'
import { consulterBeneficiaire } from '@/features/beneficiaire/abilities/consulter-beneficiaire/implementations/prisma/consulter-beneficiaire.query'
import ViewBeneficiaireInformationsPage from '@/features/beneficiaire/abilities/consulter-beneficiaire/ui/pages/ViewBeneficiaireInformationsPage'
import { BoutonModifierLeBeneficiaire } from '@/features/beneficiaire/abilities/modifier-beneficiaire/ui/slots/BoutonModifierLeBeneficiaire.slot'
import { BoutonSupprimerLeBeneficiaire } from '@/features/beneficiaire/abilities/supprimer-beneficiaires/ui/slots/BoutonSupprimerLeBeneficiaire.slot'
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
      pagination: paginationDeLHistorique,
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
        <>
          <BoutonModifierLeBeneficiaire beneficiaireId={beneficiaire.id} />
          <BoutonSupprimerLeBeneficiaire />
        </>
      }
    />
  )
}

export default BeneficiaireInformationsPage
