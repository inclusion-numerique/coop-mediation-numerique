'use client'

import { createModal } from '@codegouvfr/react-dsfr/Modal'
import type { SideMenuProps } from '@codegouvfr/react-dsfr/SideMenu'
import SideMenu from '@codegouvfr/react-dsfr/SideMenu'
import { usePathname } from 'next/navigation'
import { contactEmail } from '@/configuration/projet'
import { hrefDesStatistiquesDeLaPeriode } from '@/features/navigation/ui/presenters/liens.presenter'
import type { UtilisateurDeLaNavigation } from '../layouts/CoopShellLayout'

const onlyFor =
  (user: UtilisateurDeLaNavigation) =>
  ({ mediateurOnly }: { mediateurOnly?: true }) =>
    (mediateurOnly && user.mediateur?.id != null) || !mediateurOnly

const mesActivitesItemTitle = (
  <>
    <span className="ri-service-line fr-mr-1w fr-text--regular" aria-hidden />
    Mes activités
  </>
)

const activiteLink = (pathname?: string) => (href: string) => ({
  linkProps: { href },
  ...(pathname === undefined ? {} : { isActive: pathname.startsWith(href) }),
})

const coordinationItem = (
  user: UtilisateurDeLaNavigation,
  pathname?: string,
): SideMenuProps.Item => {
  if (user.coordinateur?.id == null) {
    return {
      text: mesActivitesItemTitle,
      ...activiteLink(pathname)('/coop/mes-activites'),
    }
  }

  if (user.mediateur?.id == null) {
    return {
      text: mesActivitesItemTitle,
      ...activiteLink(pathname)('/coop/mes-coordinations'),
    }
  }

  return {
    text: mesActivitesItemTitle,
    expandedByDefault: true,
    items: [
      {
        text: 'Médiation numérique',
        ...activiteLink(pathname)('/coop/mes-activites'),
      },
      {
        text: 'Coordination',
        ...activiteLink(pathname)('/coop/mes-coordinations'),
      },
    ],
  }
}

const CoopSideMenu = ({
  user,
  titreDesStatistiques,
  saisieDUneActivite,
}: {
  user: UtilisateurDeLaNavigation
  titreDesStatistiques: string
  saisieDUneActivite: string
}) => {
  const pathname = usePathname()

  const firstDayOfThisYear = `${new Date().getFullYear()}-01-01`
  const today = new Date().toISOString().slice(0, 10)

  const items: (SideMenuProps.Item & { mediateurOnly?: true })[] = [
    {
      text: (
        <>
          <span
            className="ri-home-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Accueil
        </>
      ),
      linkProps: { href: '/coop' },
      isActive: pathname === '/coop',
    },
    {
      text: (
        <>
          <span
            className="ri-chat-poll-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          {titreDesStatistiques}
        </>
      ),
      linkProps: {
        href: hrefDesStatistiquesDeLaPeriode(firstDayOfThisYear, today),
      },
      isActive: pathname?.startsWith('/coop/mes-statistiques'),
    },
    coordinationItem(user, pathname),
    {
      text: (
        <>
          <span
            className="ri-user-heart-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Mes bénéficiaires
        </>
      ),
      linkProps: { href: '/coop/mes-beneficiaires' },
      isActive: pathname?.startsWith('/coop/mes-beneficiaires'),
      mediateurOnly: true,
    },
    {
      text: (
        <>
          <span
            className="ri-apps-2-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Mes outils
        </>
      ),
      linkProps: { href: '/coop/mes-outils' },
      isActive: pathname?.startsWith('/coop/mes-outils'),
    },
    {
      text: (
        <>
          <span
            className="ri-team-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Mon réseau
        </>
      ),
      linkProps: { href: '/coop/mon-reseau' },
      isActive: pathname?.startsWith('/coop/mon-reseau'),
    },
  ]

  items.push(
    {
      text: 'Enregistrer une activité',
      linkProps: {
        href: '#',
        onClick: () =>
          createModal({
            id: saisieDUneActivite,
            isOpenedByDefault: false,
          }).open(),
        className:
          'fr-btn fr-icon-add-line fr-btn--icon-left fr-width-full fr-my-7v',
      },
      isActive: false,
    },
    {
      text: 'Contacter le support',
      linkProps: {
        href: `mailto:${contactEmail()}`,
        className:
          'fr-btn fr-btn--tertiary fr-icon-question-answer-line fr-btn--icon-left fr-width-full',
      },
      isActive: false,
    },
  )

  return (
    <SideMenu
      classes={{
        item: 'menu-lateral-coop__element menu-lateral-coop__element--en-bas',
        root: 'menu-lateral-coop',
      }}
      items={items.filter(onlyFor(user))}
      burgerMenuButtonText="Menu"
      sticky
      fullHeight
    />
  )
}

export default CoopSideMenu
