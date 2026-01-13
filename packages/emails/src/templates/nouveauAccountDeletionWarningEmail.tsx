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

type InactiveAccountDeletionWarningEmailProps = {
  firstname: string | null
  deletionDate: string
  daysRemaining: number
  matomoCampaignId: string
  isMediateur: boolean
  isCoordinateur: boolean
}

const getInactivityReason = ({
  isMediateur,
  isCoordinateur,
}: Pick<
  InactiveAccountDeletionWarningEmailProps,
  'isMediateur' | 'isCoordinateur'
>): string => {
  if (isMediateur && isCoordinateur) {
    return "vous n'avez pas créé votre équipe, ni enregistré d'activité"
  }

  if (isCoordinateur) {
    return "aucun membre n'a été ajouté à votre équipe"
  }

  return "vous n'avez enregistré aucune activité"
}

export const nouveauAccountDeletionWarningEmail = {
  text: ({
    firstname,
    deletionDate,
    daysRemaining,
    matomoCampaignId,
    isMediateur,
    isCoordinateur,
  }: InactiveAccountDeletionWarningEmailProps): string => {
    const inactivityReason = getInactivityReason({
      isMediateur,
      isCoordinateur,
    })

    const ctaUrl = isMediateur
      ? emailAssetUrl(FIRST_ACTIVITY_PATH + matomoCampaignId)
      : emailAssetUrl(TEAM_PATH + matomoCampaignId)

    const ctaText = isMediateur
      ? 'Pour enregistrer votre première activité'
      : 'Pour envoyer votre première invitation'

    return `Bonjour ${firstname ?? ''},

Vous recevez ce message car vous avez créé un compte sur La Coop de la médiation numérique mais ${inactivityReason}. Sans action de votre part, votre compte sera définitivement supprimé le ${deletionDate} - J+${daysRemaining}.

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
    deletionDate,
    daysRemaining,
    matomoCampaignId,
    isMediateur,
    isCoordinateur,
  }: InactiveAccountDeletionWarningEmailProps): string => {
    const inactivityReason = getInactivityReason({
      isMediateur,
      isCoordinateur,
    })

    const ctaUrl = isMediateur
      ? emailAssetUrl(FIRST_ACTIVITY_PATH + matomoCampaignId)
      : emailAssetUrl(TEAM_PATH + matomoCampaignId)

    const ctaLabel = isMediateur
      ? "J'enregistre ma 1ère activité"
      : "J'envoie ma première invitation"

    return renderToMjml(
      <LayoutWithFooter
        title="Votre compte va bientôt être supprimé"
        preview="Votre compte La Coop va bientôt être supprimé pour inactivité."
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
              Votre compte va bientôt être supprimé
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
              Vous recevez ce message car vous avez créé un compte sur La Coop
              de la médiation numérique mais {inactivityReason}. Sans action de
              votre part, votre compte sera définitivement supprimé le{' '}
              <span style={{ color: '#000091', fontWeight: 700 }}>
                {deletionDate} - J+{daysRemaining}
              </span>
              .
            </MjmlText>
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
