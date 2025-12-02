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

const FINALIZE_PATH = '/coop?mtm_campaign='

const HELP_URL =
  'https://docs.numerique.gouv.fr/docs/09e84488-ad22-4495-abcc-dd813a20ddd5/'

export const finishYourSignupEmail = {
  text: ({
    firstname,
    totalUsers,
    matomoCampaignId,
  }: {
    firstname: string | null
    totalUsers: number
    matomoCampaignId: string
  }): string =>
    `Bonjour ${firstname},

Nous avons remarqué que vous n’avez pas encore finalisé votre inscription sur La Coop de la médiation numérique.

En terminant votre inscription, vous pourrez :
- Suivre vos accompagnements facilement
- Simplifier et personnaliser votre suivi des publics accompagnés
- Visualiser graphiquement vos données d’accompagnement et les partager
- Rejoindre la communauté de ${totalUsers} médiateur·rices numériques inscrit·es sur La Coop

Pour finaliser votre inscription, utilisez ce lien :
${emailAssetUrl(FINALIZE_PATH + matomoCampaignId)}

Besoin d’aide ? Contactez notre équipe en répondant à cet email ou consultez le centre d’aide :
${HELP_URL}

À bientôt,
L’équipe de La Coop de la médiation numérique
`,

  mjml: ({
    firstname,
    totalUsers,
    matomoCampaignId,
  }: {
    firstname: string | null
    totalUsers: number
    matomoCampaignId: string
  }): string =>
    renderToMjml(
      <LayoutWithFooter
        title="Votre inscription n’est pas finalisée"
        preview="Vous n’avez pas terminé votre inscription sur La Coop de la médiation numérique."
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
              Votre inscription n’est pas finalisée
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
              Nous avons remarqué que vous n’avez pas encore finalisé votre
              inscription sur La Coop de la médiation numérique.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              En terminant votre inscription, vous pourrez :<br />📝 Suivre vos
              accompagnements facilement
              <br />
              👩‍🦰 Simplifier et personnaliser votre suivi des publics
              accompagnés
              <br />📊 Visualiser graphiquement vos données d’accompagnement et
              les partager
              <br />🤝 Rejoindre la communauté de {totalUsers} médiateur·rices
              numériques inscrit·es sur La Coop
            </MjmlText>
            <MjmlButton
              fontWeight="500"
              fontSize="16px"
              href={emailAssetUrl(FINALIZE_PATH + matomoCampaignId)}
            >
              Je finalise mon inscription
            </MjmlButton>
            <MjmlText {...STANDARD_PARAGRAPH} paddingTop="16px">
              Besoin d’aide&nbsp;? Contactez notre équipe en répondant à cet
              email ou consultez <a href={HELP_URL}>le centre d’aide</a>.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>À bientôt,</MjmlText>
            <MjmlText {...STANDARD_TEXT}>
              L’équipe de <b>La Coop de la médiation numérique</b>
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </LayoutWithFooter>,
    ),
}
