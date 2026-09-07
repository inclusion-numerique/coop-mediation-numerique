import LayoutWithFooter from '@app/emails/components/LayoutWithFooter'
import { emailAssetUrl } from '@app/emails/emailAssetUrl'
import {
  MjmlButton,
  MjmlColumn,
  MjmlSection,
  MjmlText,
} from '@faire/mjml-react'
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml'

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

type AccountReadyEmailProps = {
  firstname: string | null
  totalUsers: number
  matomoCampaignId: string
  isMediateur: boolean
  isCoordinateur: boolean
  monthsCount: 1 | 2
}

const getMonthsLabel = (monthsCount: 1 | 2): string =>
  monthsCount === 1 ? 'un mois' : 'deux mois'

const getTextActions = ({
  isMediateur,
  isCoordinateur,
  totalUsers,
}: Pick<
  AccountReadyEmailProps,
  'isMediateur' | 'isCoordinateur' | 'totalUsers'
>): string => {
  if (isMediateur && isCoordinateur) {
    return `- Suivre vos accompagnements facilement au quotidien
- Simplifier votre suivi des publics accompagnés
- Visualiser graphiquement vos statistiques et les partager
- Créer une équipe et voir les statistiques de chaque membre
- Rejoindre la communauté de +${totalUsers} médiateur·rices numériques`
  }

  if (isCoordinateur) {
    return `- Ajouter un membre à votre équipe

Vous pouvez inviter des personnes qui disposent déjà d'un compte sur la Coop, mais aussi des personnes qui ne sont pas encore inscrites.`
  }

  return `- Suivre vos accompagnements facilement au quotidien
- Simplifier votre suivi des publics accompagnés
- Visualiser graphiquement vos statistiques et les partager
- Rejoindre la communauté de +${totalUsers} médiateur·rices numériques`
}

const MjmlActions = ({
  isMediateur,
  isCoordinateur,
  totalUsers,
}: Pick<
  AccountReadyEmailProps,
  'isMediateur' | 'isCoordinateur' | 'totalUsers'
>) => {
  if (isMediateur && isCoordinateur) {
    return (
      <MjmlText {...STANDARD_PARAGRAPH}>
        📝 Suivre vos accompagnements facilement au quotidien
        <br />
        <br />👤 Simplifier votre suivi des publics accompagnés
        <br />
        <br />📊 Visualiser graphiquement vos statistiques et les partager
        <br />
        <br />🤝 Créer une équipe et voir les statistiques de chaque membre
        <br />
        <br />✨ Rejoindre la communauté de +{totalUsers} médiateur·rices
        numériques
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
      📝 Suivre vos accompagnements facilement au quotidien
      <br />
      <br />👤 Simplifier votre suivi des publics accompagnés
      <br />
      <br />📊 Visualiser graphiquement vos statistiques et les partager
      <br />
      <br />🤝 Rejoindre la communauté de +{totalUsers} médiateur·rices
      numériques
    </MjmlText>
  )
}

export const nouveauAccountEmail = {
  text: ({
    firstname,
    totalUsers,
    matomoCampaignId,
    isMediateur,
    isCoordinateur,
    monthsCount,
  }: AccountReadyEmailProps): string => {
    const actions = getTextActions({ isMediateur, isCoordinateur, totalUsers })
    const monthsLabel = getMonthsLabel(monthsCount)

    const ctaUrl = isMediateur
      ? emailAssetUrl(FIRST_ACTIVITY_PATH + matomoCampaignId)
      : emailAssetUrl(TEAM_PATH + matomoCampaignId)

    const ctaText = isMediateur
      ? 'Pour enregistrer votre première activité'
      : 'Pour envoyer votre première invitation'

    return `Bonjour ${firstname ?? ''},

Cela fait maintenant ${monthsLabel} que vous avez rejoint La Coop de la médiation numérique, mais vous n'avez pas encore eu l'occasion d'utiliser pleinement la plateforme.

Bonne nouvelle : votre compte est toujours actif !

Il ne vous reste plus qu'à franchir le pas pour :
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
    totalUsers,
    matomoCampaignId,
    isMediateur,
    isCoordinateur,
    monthsCount,
  }: AccountReadyEmailProps): string => {
    const monthsLabel = getMonthsLabel(monthsCount)

    const ctaUrl = isMediateur
      ? emailAssetUrl(FIRST_ACTIVITY_PATH + matomoCampaignId)
      : emailAssetUrl(TEAM_PATH + matomoCampaignId)

    const ctaLabel = isMediateur
      ? "J'enregistre ma 1ère activité"
      : "J'envoie ma première invitation"

    return renderToMjml(
      <LayoutWithFooter
        title="Votre compte est prêt, il ne manque que vous !"
        preview={`Cela fait ${monthsLabel} que vous avez rejoint La Coop. Votre compte est toujours actif !`}
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
              Votre compte est prêt, il ne manque que vous&nbsp;!
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
              Cela fait maintenant {monthsLabel} que vous avez rejoint La Coop
              de la médiation numérique, mais vous n'avez pas encore eu
              l'occasion d'utiliser pleinement la plateforme.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              Bonne nouvelle&nbsp;: votre compte est toujours actif ✅
            </MjmlText>
            <MjmlText {...{ ...STANDARD_PARAGRAPH, fontWeight: '700' }}>
              Il ne vous reste plus qu'à franchir le pas pour&nbsp;:
            </MjmlText>
            <MjmlActions
              isMediateur={isMediateur}
              isCoordinateur={isCoordinateur}
              totalUsers={totalUsers}
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
