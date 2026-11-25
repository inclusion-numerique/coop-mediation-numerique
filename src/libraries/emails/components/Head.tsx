import {
  MjmlAll,
  MjmlAttributes,
  MjmlButton,
  MjmlFont,
  MjmlHead,
  MjmlPreview,
  MjmlSection,
  MjmlText,
  MjmlTitle,
} from '@faire/mjml-react'
import { ReactNode } from 'react'
import { emailAssetUrl } from '@/libraries/emails/email-asset-url'
import { brandColor } from '@/libraries/emails/styles'

const Head = ({
  preview,
  title,
  urlDeBase,
}: {
  title: ReactNode
  preview: ReactNode
  urlDeBase: string
}) => (
  <MjmlHead>
    <MjmlFont
      name="Marianne"
      href={emailAssetUrl(urlDeBase, '/email/fonts.css')}
    />
    <MjmlAttributes>
      <MjmlAll fontFamily="Marianne, Helvetica, Arial, sans-serif" />
      <MjmlSection backgroundColor="white" />
      <MjmlButton
        backgroundColor={brandColor}
        borderRadius={0}
        fontSize="16px"
        lineHeight="24px"
        fontWeight="400"
        innerPadding="8px 16px"
      />
      <MjmlText fontSize="16px" lineHeight="24px" fontWeight="400" />
    </MjmlAttributes>
    <MjmlTitle>{title}</MjmlTitle>
    <MjmlPreview>{preview}</MjmlPreview>
  </MjmlHead>
)

export default Head
