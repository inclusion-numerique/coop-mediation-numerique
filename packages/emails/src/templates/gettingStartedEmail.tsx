import LayoutWithFooter from '@app/emails/components/LayoutWithFooter'
import { emailAssetUrl } from '@app/emails/emailAssetUrl'
import {
  MjmlButton,
  MjmlColumn,
  MjmlSection,
  MjmlText,
} from '@faire/mjml-react'
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml'
import React from 'react'

const STANDARD_TEXT = {
  fontWeight: '400',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#3A3A3A',
  paddingTop: 0,
  paddingBottom: 0,
}

const STANDARD_PARAGRAPH = {
  ...STANDARD_TEXT,
  paddingBottom: '16px',
}

const FIRST_ACTIVITY_PATH = '/coop/mes-activites?mtm_campaign='
const TEAM_PATH = '/coop/mon-equipe?mtm_campaign='

const HELP_URL =
  'https://docs.numerique.gouv.fr/docs/09e84488-ad22-4495-abcc-dd813a20ddd5/'

type GettingStartedEmailProps = {
  firstname: string | null
  matomoCampaignId: string
  isMediateur: boolean
  isCoordinateur: boolean
}

const getTextActions = ({
  isMediateur,
  isCoordinateur,
}: Pick<
  GettingStartedEmailProps,
  'isMediateur' | 'isCoordinateur'
>): string => {
  if (isMediateur && isCoordinateur) {
    return `- Enregistrer votre premier accompagnement
- Ajouter un bénéficiaire pour suivre les accompagnements réalisés
- Visualiser vos premiers résultats en un clic dans les statistiques
- Créer une équipe et voir les statistiques de chaque membre`
  }

  if (isCoordinateur) {
    return `- Ajouter un membre à votre équipe

Vous pouvez inviter des personnes qui disposent déjà d'un compte sur la Coop, mais aussi des personnes qui ne sont pas encore inscrites.`
  }

  return `- Enregistrer votre premier accompagnement
- Ajouter un bénéficiaire pour suivre les accompagnements réalisés
- Visualiser vos premiers résultats en un clic dans les statistiques`
}

const getActionsCount = ({
  isMediateur,
  isCoordinateur,
}: Pick<
  GettingStartedEmailProps,
  'isMediateur' | 'isCoordinateur'
>): string => {
  if (isMediateur && isCoordinateur) return '4 premières actions'
  if (isCoordinateur) return 'une première action'
  return '3 premières actions'
}

const MjmlActions = ({
  isMediateur,
  isCoordinateur,
}: Pick<GettingStartedEmailProps, 'isMediateur' | 'isCoordinateur'>) => {
  if (isMediateur && isCoordinateur) {
    return (
      <MjmlText {...STANDARD_PARAGRAPH}>
        📝 Enregistrer votre premier accompagnement
        <br />
        <br />👤 Ajouter un bénéficiaire pour suivre les accompagnements
        réalisés
        <br />
        <br />📊 Visualiser vos premiers résultats en un clic dans les
        statistiques
        <br />
        <br />🤝 Créer une équipe et voir les statistiques de chaque membre
      </MjmlText>
    )
  }

  if (isCoordinateur) {
    return (
      <>
        <MjmlText {...STANDARD_PARAGRAPH}>
          👤 Ajouter un membre à votre équipe
        </MjmlText>
        <MjmlText {...STANDARD_PARAGRAPH} fontStyle="italic">
          Vous pouvez inviter des personnes qui disposent déjà d'un compte sur
          la Coop, mais aussi des personnes qui ne sont pas encore inscrites.
        </MjmlText>
      </>
    )
  }

  return (
    <MjmlText {...STANDARD_PARAGRAPH}>
      📝 Enregistrer votre premier accompagnement
      <br />
      <br />👤 Ajouter un bénéficiaire pour suivre les accompagnements réalisés
      <br />
      <br />📊 Visualiser vos premiers résultats en un clic dans les
      statistiques
    </MjmlText>
  )
}

export const gettingStartedEmail = {
  text: ({
    firstname,
    matomoCampaignId,
    isMediateur,
    isCoordinateur,
  }: GettingStartedEmailProps): string => {
    const actionsCount = getActionsCount({ isMediateur, isCoordinateur })

    const actions = getTextActions({ isMediateur, isCoordinateur })

    const ctaUrl = isMediateur
      ? emailAssetUrl(FIRST_ACTIVITY_PATH + matomoCampaignId)
      : emailAssetUrl(TEAM_PATH + matomoCampaignId)

    const ctaText = isMediateur
      ? 'Pour enregistrer votre première activité'
      : 'Pour envoyer votre première invitation'

    return `Bonjour ${firstname ?? ''},

Vous êtes inscrit·e depuis quelques jours sur La Coop de la médiation numérique, mais il semblerait que vous n'ayez pas encore eu l'occasion de tester la plateforme. Voici ${actionsCount} à réaliser pour vous lancer rapidement :

${actions}

${ctaText} :
${ctaUrl}

Besoin d'aide ? Contactez notre équipe en répondant à cet email ou consultez le centre d'aide :
${HELP_URL}

À bientôt,
L'équipe de La Coop de la médiation numérique
`
  },

  mjml: ({
    firstname,
    matomoCampaignId,
    isMediateur,
    isCoordinateur,
  }: GettingStartedEmailProps): string => {
    const actionsCount = getActionsCount({ isMediateur, isCoordinateur })

    const ctaUrl = isMediateur
      ? emailAssetUrl(FIRST_ACTIVITY_PATH + matomoCampaignId)
      : emailAssetUrl(TEAM_PATH + matomoCampaignId)

    const ctaLabel = isMediateur
      ? "J'enregistre ma 1ère activité"
      : 'J’envoie ma première invitation'

    return renderToMjml(
      <LayoutWithFooter
        title="Bien commencer sur La Coop"
        preview={`Voici ${actionsCount} à réaliser pour vous lancer rapidement sur La Coop de la médiation numérique.`}
        showDivider={false}
      >
        <MjmlSection paddingLeft={15} paddingRight={15}>
          <MjmlColumn>
            <MjmlText
              fontWeight="700"
              fontSize="28px"
              lineHeight="36px"
              color="#000091"
              paddingBottom="16px"
            >
              Bien commencer sur La Coop
            </MjmlText>
            <MjmlText
              fontWeight="700"
              fontSize="20px"
              lineHeight="32px"
              color="#3A3A3A"
              paddingBottom="16px"
            >
              Bonjour{firstname ? ` ${firstname}` : ''},
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              Vous êtes inscrit·e depuis quelques jours sur La Coop de la
              médiation numérique, mais il semblerait que vous n'ayez pas encore
              eu l'occasion de tester la plateforme. Voici {actionsCount} à
              réaliser pour vous lancer rapidement&nbsp;:
            </MjmlText>
            <MjmlActions
              isMediateur={isMediateur}
              isCoordinateur={isCoordinateur}
            />
            <MjmlButton fontWeight="500" fontSize="16px" href={ctaUrl}>
              {ctaLabel}
            </MjmlButton>
            <MjmlText {...STANDARD_PARAGRAPH} paddingTop="16px">
              Besoin d'aide&nbsp;? Contactez notre équipe en répondant à cet
              email ou consultez <a href={HELP_URL}>le centre d'aide</a>.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>À bientôt,</MjmlText>
            <MjmlText {...STANDARD_TEXT}>
              L'équipe de <b>La Coop de la médiation numérique</b>
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </LayoutWithFooter>,
    )
  },
}
