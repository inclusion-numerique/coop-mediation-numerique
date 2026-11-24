import {
  MjmlButton,
  MjmlColumn,
  MjmlDivider,
  MjmlSection,
  MjmlSpacer,
  MjmlText,
} from '@faire/mjml-react'
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml'
import { getServerBaseUrl } from '@/configuration/projet/baseUrl'
import { projectTitle } from '@/configuration/projet/config'
import Explanations from '@/features/equipe/implementations/email/explanations.email-fragment'
import Invitation from '@/features/equipe/implementations/email/invitation.email-fragment'
import LayoutWithFooter from '@/libraries/emails/components/LayoutWithFooter'
import { emailAssetUrl } from '@/libraries/emails/emailAssetUrl'
import { backgroundColor } from '@/libraries/emails/styles'

export const invitationDUnNouveauMediateur = {
  text: ({ url, from }: { url: string; from: string }): string =>
    `Pour accepter l'invitation à rejoindre l’équipe de coordination de ${from}, merci d'utiliser le lien suivant :\n${emailAssetUrl(getServerBaseUrl(), url)}\n\n`,
  mjml: ({ url, from }: { url: string; from: string }): string =>
    renderToMjml(
      <LayoutWithFooter
        projectTitle={projectTitle}
        urlDeBase={getServerBaseUrl()}
        title="Invitation à rejoindre une équipe sur La Coop de la médiation numérique"
        preview={`Vous êtes invité par ${from} à rejoindre son équipe de coordination.`}
      >
        <MjmlSection padding="0 15px 0 15px">
          <MjmlColumn>
            <Invitation from={from} />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection padding="0 40px 10px 40px">
          <MjmlColumn
            backgroundColor="#e8edff"
            borderRadius="8px"
            padding="16px 24px"
          >
            <MjmlText
              fontWeight="700"
              fontSize="20px"
              lineHeight="28px"
              padding="0 0 4px"
            >
              Créez votre compte sur la plateforme
            </MjmlText>
            <MjmlText
              fontWeight="400"
              fontSize="16px"
              color="#3A3A3A"
              lineHeight="24px"
              padding={0}
            >
              En acceptant cette invitation, vous serez invité à créer votre
              compte sur La Coop de la médiation numérique.
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection padding={15}>
          <MjmlColumn>
            <MjmlDivider
              paddingBottom="24px"
              border-width="1px"
              border-style="solid"
              border-color="#DDD"
            />
            <MjmlButton
              width="100%"
              fontWeight="500"
              fontSize="18px"
              href={emailAssetUrl(getServerBaseUrl(), url)}
            >
              Voir l’invitation
            </MjmlButton>
            <MjmlSpacer height="32px" />
          </MjmlColumn>
        </MjmlSection>
        <MjmlSection backgroundColor={backgroundColor} />
        <Explanations />
      </LayoutWithFooter>,
    ),
}
