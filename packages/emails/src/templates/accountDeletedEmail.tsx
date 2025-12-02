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

const FINALIZE_PATH = '/coop?mtm_campaign=reinscription'

const HELP_URL =
  'https://docs.numerique.gouv.fr/docs/09e84488-ad22-4495-abcc-dd813a20ddd5/'

export const accountDeletedEmail = {
  text: ({ firstname }: { firstname: string | null }): string =>
    `Bonjour ${firstname},

Votre inscription sur La Coop de la médiation numérique n’ayant pas été finalisée dans les délais, votre compte a été automatiquement supprimé.

Vous pouvez bien sûr revenir à tout moment et créer un nouveau compte en quelques minutes seulement en utilisant ce lien :
${emailAssetUrl(FINALIZE_PATH)}

Besoin d’aide ? Contactez notre équipe en répondant à cet email ou consultez le centre d’aide :
${HELP_URL}

À bientôt,
L’équipe de La Coop de la médiation numérique
`,

  mjml: ({ firstname }: { firstname: string | null }): string =>
    renderToMjml(
      <LayoutWithFooter
        title="Votre compte a été supprimé"
        preview="Vous n’avez pas terminé votre inscription sur La Coop de la médiation numérique dans les délais."
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
              Votre compte a été supprimé
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
              Votre inscription sur <b>La Coop de la médiation numérique</b>{' '}
              n’ayant pas été finalisée dans les délais, votre compte a été
              automatiquement supprimé.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              💡 Vous pouvez bien sûr revenir à tout moment et créer un nouveau
              compte en quelques minutes seulement !
            </MjmlText>
            <MjmlButton
              fontWeight="500"
              fontSize="16px"
              href={emailAssetUrl(FINALIZE_PATH)}
            >
              Je me réinscris sur La Coop
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
