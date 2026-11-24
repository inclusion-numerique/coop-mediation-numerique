'use client'

import type { SideMenuProps } from '@codegouvfr/react-dsfr/SideMenu'
import SideMenu from '@codegouvfr/react-dsfr/SideMenu'
import { usePathname } from 'next/navigation'

const AdministrationSideMenu = () => {
  const pathname = usePathname()

  const items = [
    {
      text: (
        <>
          <span
            className="fr-icon-team-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Utilisateurs
        </>
      ),
      linkProps: {
        href: '/administration/utilisateurs',
      },
      isActive: pathname?.startsWith('/administration/utilisateurs'),
    },
    {
      text: (
        <>
          <span
            className="fr-icon-home-4-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Lieux d’activité
        </>
      ),
      linkProps: {
        href: '/administration/lieux-activite',
      },
      isActive: pathname?.startsWith('/administration/lieux-activite'),
    },
    {
      text: (
        <>
          <span
            className="fr-icon-building-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Structures employeuses
        </>
      ),
      linkProps: {
        href: '/administration/structures-employeuses',
      },
      isActive: pathname?.startsWith('/administration/structures-employeuses'),
    },
    {
      text: (
        <>
          <span className="ri-spy-line fr-mr-1w fr-text--regular" />
          Usurpation
        </>
      ),
      linkProps: {
        href: '/administration/usurpation',
      },
      isActive: pathname?.startsWith('/administration/usurpation'),
    },
    {
      text: (
        <>
          <span className="ri-key-2-line fr-mr-1w fr-text--regular" />
          Clients API
        </>
      ),
      linkProps: {
        href: '/administration/clients-api',
      },
      isActive: pathname?.startsWith('/administration/clients-api'),
    },
    {
      text: (
        <>
          <span
            className="fr-icon-line-chart-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Statistiques
        </>
      ),
      linkProps: {
        href: '/administration/statistiques',
      },
      isActive: pathname?.startsWith('/administration/statistiques'),
    },
    {
      text: (
        <>
          <span
            className="ri-list-check-3 fr-mr-2v fr-text--regular"
            style={{ marginLeft: '-4px' }}
            aria-hidden
          />
          Fonctionnalités
        </>
      ),
      isActive: pathname?.startsWith('/administration/fonctionnalites'),
      expandedByDefault: pathname?.startsWith(
        '/administration/fonctionnalites',
      ),
      items: [
        {
          text: (
            <>
              <span className="ri-calendar-check-line fr-mr-1w fr-text--regular" />
              RDVSP
            </>
          ),
          linkProps: {
            href: '/administration/fonctionnalites/rdvsp',
          },
          isActive: pathname?.startsWith(
            '/administration/fonctionnalites/rdvsp',
          ),
        },
        {
          text: (
            <>
              <span className="ri-price-tag-3-line fr-mr-1w fr-text--regular" />
              Tags
            </>
          ),
          linkProps: {
            href: '/administration/fonctionnalites/tags',
          },
          isActive: pathname?.startsWith(
            '/administration/fonctionnalites/tags',
          ),
        },
      ],
    },
    {
      text: (
        <>
          <span
            className="fr-icon-settings-5-line fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Outils
        </>
      ),
      linkProps: {
        href: '/administration/outils',
      },
      isActive: pathname?.startsWith('/administration/outils'),
    },
  ] satisfies SideMenuProps.Item[]

  return (
    <SideMenu
      title={
        <p className="fr-text-title--blue-france fr-h5 fr-mb-0">
          Administration
        </p>
      }
      classes={{
        item: 'menu-lateral-coop__element',
        root: 'menu-lateral-coop',
      }}
      items={items}
      burgerMenuButtonText="Menu Administration"
      sticky
      fullHeight
    />
  )
}

export default AdministrationSideMenu
