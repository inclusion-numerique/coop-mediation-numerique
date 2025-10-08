'use client'

import { statistiquesPageTitle } from '@app/web/app/coop/(sidemenu-layout)/mes-statistiques/statistiquesPageTitle'
import { canUseAssistant } from '@app/web/assistant/canUseAssistant'
import { SessionUser } from '@app/web/auth/sessionUser'
import { CreateCraModalDefinition } from '@app/web/features/activites/use-cases/cra/components/CreateCraModal/CreateCraModalDefinition'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import Button from '@codegouvfr/react-dsfr/Button'
import type { SideMenuProps } from '@codegouvfr/react-dsfr/SideMenu'
import SideMenu from '@codegouvfr/react-dsfr/SideMenu'
import classNames from 'classnames'
import { usePathname } from 'next/navigation'
import styles from './CoopSideMenu.module.css'

const onlyFor =
  (user: SessionUser) =>
  ({ mediateurOnly }: { mediateurOnly?: true }) =>
    (mediateurOnly && user.mediateur?.id != null) || !mediateurOnly

const CoopSideMenu = ({ user }: { user: SessionUser }) => {
  const pathname = usePathname()

  const firstDayOfThisYear = `${new Date().getFullYear()}-01-01`
  const today = new Date().toISOString().split('T')[0]

  const items: (SideMenuProps.Item & { mediateurOnly?: true })[] = [
    {
      text: (
        <>
          <span
            className="ri-home-line ri-xl fr-mr-1w fr-text--regular"
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
            className="ri-chat-poll-line ri-xl fr-mr-1w fr-text--regular"
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
    {
      text: (
        <>
          <span
            className="ri-service-line ri-xl fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Mes activités
        </>
      ),
      linkProps: { href: '/coop/mes-activites' },
      isActive: pathname?.startsWith('/coop/mes-activites'),
    },
    {
      text: (
        <>
          <span
            className="ri-user-heart-line ri-xl fr-mr-1w fr-text--regular"
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
            className="ri-apps-2-line ri-xl fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Mes outils
        </>
      ),
      linkProps: { href: '/coop/mes-outils' },
      isActive: pathname?.startsWith('/coop/mes-outils'),
    },
  ]

  if (canUseAssistant(user)) {
    items.push({
      text: (
        <>
          <span
            className="fr-icon-chat-check-line ri-xl fr-mr-1w fr-text--regular"
            aria-hidden
          />
          Assistant
        </>
      ),
      linkProps: { href: '/assistant/chat' },
      isActive: pathname?.startsWith('/assistant'),
    })
  }

  items.push(
    {
      text: (
        <Button
          type="button"
          {...CreateCraModalDefinition.buttonProps}
          iconId="fr-icon-add-line"
          className="fr-width-full fr-my-7v"
        >
          Enregistrer une activité
        </Button>
      ),
      linkProps: undefined as unknown as { href: string },
      isActive: false,
    },
    {
      text: (
        <Button
          type="button"
          iconId="fr-icon-question-answer-line"
          priority="tertiary"
          className="fr-width-full"
        >
          Contacter le support
        </Button>
      ),
      isActive: false,
      linkProps: {
        href: `mailto:${PublicWebAppConfig.contactEmail}`,
      },
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
