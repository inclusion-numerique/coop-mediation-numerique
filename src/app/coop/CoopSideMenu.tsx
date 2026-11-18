'use client'

import type { SideMenuProps } from '@codegouvfr/react-dsfr/SideMenu'
import SideMenu from '@codegouvfr/react-dsfr/SideMenu'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'
import { SessionUser } from '@/auth/sessionUser'
import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { CreateCraModalDefinition } from '@/features/activites/ui/saisie/CreateCraModal/CreateCraModalDefinition'
import { statistiquesPageTitle } from '@/features/statistiques/ui/pages/titre-des-statistiques'
import styles from './CoopSideMenu.module.css'

const onlyFor =
  (user: SessionUser) =>
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
  isActive: pathname?.startsWith(href),
})

const coordinationItem = (
  user: SessionUser,
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

const CoopSideMenu = ({ user }: { user: SessionUser }) => {
  const pathname = usePathname()

  const firstDayOfThisYear = `${new Date().getFullYear()}-01-01`
  const today = new Date().toISOString().split('T')[0]

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
          {statistiquesPageTitle(user)}
        </>
      ),
      linkProps: {
        href: `/coop/mes-statistiques?du=${firstDayOfThisYear}&au=${today}`,
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
        onClick: () => CreateCraModalDefinition.open(),
        className:
          'fr-btn fr-icon-add-line fr-btn--icon-left fr-width-full fr-my-7v',
      },
      isActive: false,
    },
    {
      text: 'Contacter le support',
      linkProps: {
        href: `mailto:${PublicWebAppConfig.contactEmail}`,
        className:
          'fr-btn fr-btn--tertiary fr-icon-question-answer-line fr-btn--icon-left fr-width-full',
      },
      isActive: false,
    },
  )

  return (
    <SideMenu
      classes={{
        item: classNames(styles.item, styles.lastItemAtTheBottom),
        root: styles.sideMenu,
      }}
      items={items.filter(onlyFor(user))}
      burgerMenuButtonText="Menu"
      sticky
      fullHeight
    />
  )
}

export default CoopSideMenu
