import {
  Mjml,
  MjmlBody,
  MjmlColumn,
  MjmlDivider,
  MjmlImage,
  MjmlSection,
  MjmlText,
} from '@faire/mjml-react'
import { PropsWithChildren, ReactNode } from 'react'
import Footer from '@/libraries/emails/components/Footer'
import Head from '@/libraries/emails/components/Head'
import { emailAssetUrl } from '@/libraries/emails/email-asset-url'
import { backgroundColor } from '@/libraries/emails/styles'

/**
 * With headerLogoOnly the logo will be centered and you can include title in children
 */
const LayoutWithFooter = ({
  children,
  headerLogoOnly = false,
  title,
  preview,
  showDivider = true,
  projectTitle,
  urlDeBase,
}: PropsWithChildren<{
  headerLogoOnly?: boolean
  title: ReactNode
  preview: ReactNode
  showDivider?: boolean
  projectTitle: string
  urlDeBase: string
}>) => (
  <Mjml>
    <Head title={title} preview={preview} urlDeBase={urlDeBase} />
    <MjmlBody backgroundColor={backgroundColor}>
      {/* Section used for a bit of headroom at the top */}
      <MjmlSection backgroundColor={backgroundColor} />
      {/* Header with logos */}
      {headerLogoOnly ? (
        <MjmlSection paddingBottom="16px">
          <MjmlColumn width="20%" verticalAlign="middle">
            <MjmlImage
              align="center"
              src={emailAssetUrl(urlDeBase, '/email/fr.svg')}
              alt="République Française"
            />
          </MjmlColumn>
        </MjmlSection>
      ) : (
        <>
          <MjmlSection padding="40px 40px 0 40px">
            <MjmlColumn width="20%" verticalAlign="middle">
              <MjmlImage
                padding={0}
                align="left"
                src={emailAssetUrl(urlDeBase, '/email/fr.svg')}
                alt="République Française"
              />
            </MjmlColumn>
            <MjmlColumn width="15%" verticalAlign="middle">
              <MjmlImage
                padding="0 10px 0 32px"
                align="left"
                src={emailAssetUrl(urlDeBase, '/email/coop.svg')}
                alt="Logo Coop de la médiation numérique"
              />
            </MjmlColumn>
            <MjmlColumn width="65%" verticalAlign="middle">
              <MjmlText padding={0} fontWeight="500" fontSize="18px">
                {projectTitle}
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
          {showDivider && (
            <MjmlSection padding="8px 15px">
              <MjmlColumn>
                <MjmlDivider
                  border-width="1px"
                  border-style="solid"
                  border-color="#DDD"
                />
              </MjmlColumn>
            </MjmlSection>
          )}
        </>
      )}
      {children}
      <Footer urlDeBase={urlDeBase} />
      {/* Section used for a bit of padding at the bottom */}
      <MjmlSection backgroundColor={backgroundColor} />
    </MjmlBody>
  </Mjml>
)

export default LayoutWithFooter
