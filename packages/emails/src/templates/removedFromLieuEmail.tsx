import LayoutWithFooter from '@app/emails/components/LayoutWithFooter'
import { MjmlColumn, MjmlSection, MjmlText } from '@faire/mjml-react'
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

export const removedFromLieuEmail = {
  text: ({
    mediateurFirstname,
    structureNom,
    removedByName,
  }: {
    mediateurFirstname: string | null
    structureNom: string
    removedByName: string
  }): string =>
    `Bonjour${mediateurFirstname ? ` ${mediateurFirstname}` : ''},

Vous avez été retiré d’un de vos lieux d'activité par ${removedByName}.

${removedByName} vous a retiré du lieu ${structureNom} sur La Coop de la médiation numérique. Vous n'êtes plus renseigné comme travaillant dans ce lieu.

Si vous pensez qu'il s’agit d'une erreur, vous pouvez contacter notre équipe support en répondant à cet email.

Cordialement,
L’équipe de La Coop de la médiation numérique
`,

  mjml: ({
    mediateurFirstname,
    structureNom,
    removedByName,
  }: {
    mediateurFirstname: string | null
    structureNom: string
    removedByName: string
  }): string =>
    renderToMjml(
      <LayoutWithFooter
        title="Vous avez été retiré d’un de vos lieux d'activité"
        preview={`${removedByName} vous a retiré du lieu ${structureNom}.`}
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
              Vous avez été retiré d’un de vos lieux d'activité par{' '}
              {removedByName}
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              Bonjour{mediateurFirstname ? ` ${mediateurFirstname}` : ''},
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              {removedByName} vous a retiré du lieu{' '}
              <span style={{ color: '#000091', fontWeight: 700 }}>
                {structureNom}
              </span>{' '}
              sur <b>La Coop de la médiation numérique</b>. Vous n'êtes plus
              renseigné comme travaillant dans ce lieu.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>
              Si vous pensez qu’il s’agit d’une erreur, vous pouvez contacter
              notre équipe support en répondant à cet email.
            </MjmlText>
            <MjmlText {...STANDARD_PARAGRAPH}>Cordialement,</MjmlText>
            <MjmlText {...STANDARD_TEXT}>
              L’équipe de <b>La Coop de la médiation numérique</b>
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </LayoutWithFooter>,
    ),
}
