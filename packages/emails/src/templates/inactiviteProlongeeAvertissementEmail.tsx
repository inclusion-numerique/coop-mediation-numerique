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

const CONNEXION_PATH = '/connexion?mtm_campaign=inactivite-prolongee'

const HELP_URL =
  'https://docs.numerique.gouv.fr/docs/09e84488-ad22-4495-abcc-dd813a20ddd5/'

type InactiviteProlongeeAvertissementEmailProps = {
  firstname: string | null
  dateDeSuppression: string
}

export const inactiviteProlongeeAvertissementEmail = {
  text: ({
    firstname,
    dateDeSuppression,
  }: InactiviteProlongeeAvertissementEmailProps): string =>
    `Bonjour ${firstname ?? ''},

Nous n'avons constaté aucune activité sur votre compte La Coop de la médiation numérique depuis près de 2 ans. Sans connexion de votre part, votre compte sera supprimé le ${dateDeSuppression} et vos données personnelles seront anonymisées.

Pour conserver votre compte, il vous suffit de vous connecter avant cette date :
${emailAssetUrl(CONNEXION_PATH)}

Besoin d'aide ? Contactez notre équipe en répondant à cet email ou consultez le centre d'aide :
${HELP_URL}

À bientôt,
L'équipe de La Coop de la médiation numérique
`,

  mjml: ({
    firstname,
    dateDeSuppression,
  }: InactiviteProlongeeAvertissementEmailProps): string =>
    renderToMjml(
      <LayoutWithFooter
        title="Votre compte va bientôt être supprimé"
        preview="Votre compte La Coop va être supprimé après 2 ans d'inactivité."
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
              Nous n'avons constaté aucune activité sur votre compte La Coop de
              la médiation numérique depuis près de 2 ans. Sans connexion de
              votre part, votre compte sera supprimé le{' '}
              <span style={{ color: '#000091', fontWeight: 700 }}>
                {dateDeSuppression}
              </span>{' '}
              et vos données personnelles seront anonymisées.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              Pour conserver votre compte, il vous suffit de vous connecter
              avant cette date.
            </MjmlText>
            <MjmlButton
              fontWeight="500"
              fontSize="16px"
              href={emailAssetUrl(CONNEXION_PATH)}
            >
              Je me connecte
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
    ),
}
