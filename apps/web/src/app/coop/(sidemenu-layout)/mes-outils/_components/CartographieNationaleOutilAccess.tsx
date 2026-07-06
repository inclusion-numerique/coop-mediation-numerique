import { getLieuxActiviteForCartographie } from '@app/web/app/coop/(sidemenu-layout)/mes-outils/_data/getLieuxActiviteForCartographie'
import { getSessionUser } from '@app/web/auth/getSessionUser'
import { departementsRegionByCode } from '@app/web/data/collectivites-territoriales/departementsRegion'
import { getDepartementCodeForActeur } from '@app/web/features/mon-reseau/getDepartementCodeForActeur'
import { getMonReseauPageData } from '@app/web/features/mon-reseau/getMonReseauPageData'
import { getCartographieDepartementLink } from '@app/web/features/mon-reseau/use-cases/lieux/getStructureLink'
import Link from 'next/link'
import React from 'react'

const onlyVisibleForCartographieNationale = ({
  lieuInclusion: { visiblePourCartographieNationale },
}: {
  lieuInclusion: { visiblePourCartographieNationale: boolean }
}) => visiblePourCartographieNationale

const pluralizeLieuxActiviteUser = (count: number): string => {
  switch (count) {
    case 0:
      return 'n’est visible sur la cartographie.'
    case 1:
      return 'est visible sur la cartographie.'
    default:
      return 'sont visibles sur la cartographie.'
  }
}

const pluralizeLieuxActiviteDepartement = (count: number) => {
  const label = count > 1 ? 'lieux d’activité' : 'lieu d’activité'
  const verb =
    count === 0
      ? 'n’est visible'
      : count === 1
        ? 'est visible'
        : 'sont visibles'

  return (
    <>
      <span className="fr-text--bold">{label} de votre département</span>
      <br />
      {verb} sur la cartographie.
    </>
  )
}

const CartographieNationaleOutilAccess = async () => {
  const user = await getSessionUser()

  const lieuxActivite = user?.mediateur
    ? await getLieuxActiviteForCartographie(user.mediateur.id)
    : null

  const departementCode = getDepartementCodeForActeur({
    emplois: user?.emplois,
    mediateur: lieuxActivite
      ? {
          enActivite: lieuxActivite.map((l) => ({
            lieuInclusion: l.lieuInclusion,
          })),
        }
      : null,
  })

  const departementRegion = departementsRegionByCode.get(departementCode)
  const { lieuxCount } = await getMonReseauPageData({ departementCode })

  const cartographieLink = departementRegion
    ? getCartographieDepartementLink({
        region: departementRegion.region,
        departement: departementRegion.nom,
      })
    : 'https://cartographie.societenumerique.gouv.fr/cartographie'

  const userLieuxVisiblesCount =
    lieuxActivite?.filter(onlyVisibleForCartographieNationale).length ?? 0

  return (
    <div className="fr-flex fr-direction-column fr-flex-gap-6v">
      <div className="fr-text-label--blue-france fr-background-alt--blue-france fr-p-8v fr-border-radius--8">
        <div className="fr-mb-4v fr-flex fr-justify-content-space-between fr-align-items-center">
          <span className="fr-h1 fr-mb-0 fr-text-title--blue-france">
            {userLieuxVisiblesCount === 0 ? 'Aucun' : userLieuxVisiblesCount}
          </span>
          <span aria-hidden>
            <span className="ri-home-office-line fr-background-default--grey fr-p-3v fr-border-radius--8 ri-lg fr-line-height-1" />
          </span>
        </div>
        <p className="fr-mb-4v">
          <span className="fr-text--bold">de vos lieux d’activité</span>
          <br />
          {pluralizeLieuxActiviteUser(userLieuxVisiblesCount)}
        </p>
        <Link className="fr-btn fr-btn--secondary" href="/coop/lieux-activite">
          Voir mes lieux d’activité&ensp;
          <span className="ri-arrow-right-line" aria-hidden />
        </Link>
      </div>
      <div className="fr-text-label--blue-france fr-background-alt--blue-france fr-p-8v fr-border-radius--8">
        <div className="fr-mb-4v fr-flex fr-justify-content-space-between fr-align-items-center">
          <span className="fr-h1 fr-mb-0 fr-text-title--blue-france">
            {lieuxCount === 0 ? 'Aucun' : lieuxCount}
          </span>
          <span aria-hidden>
            <span className="fr-icon-france-line fr-background-default--grey fr-p-3v fr-border-radius--8 ri-lg fr-line-height-1" />
          </span>
        </div>
        <p className="fr-mb-4v">
          {pluralizeLieuxActiviteDepartement(lieuxCount)}
        </p>
        <Link href={cartographieLink} target="_blank" rel="noreferrer">
          Voir sur la cartographie
        </Link>
      </div>
    </div>
  )
}

export default CartographieNationaleOutilAccess
