import {
  MjmlButton,
  MjmlColumn,
  MjmlDivider,
  MjmlSection,
  MjmlSpacer,
} from '@faire/mjml-react'
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml'
import { getServerBaseUrl } from '@/configuration/projet/base-url'
import { projectTitle } from '@/configuration/projet/config'
import Explanations from '@/features/equipe/implementations/email/explanations.email-fragment'
import Invitation from '@/features/equipe/implementations/email/invitation.email-fragment'
import LayoutWithFooter from '@/libraries/emails/components/LayoutWithFooter'
import { emailAssetUrl } from '@/libraries/emails/email-asset-url'
import { backgroundColor } from '@/libraries/emails/styles'

export const invitationDUnMediateur = {
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
        <MjmlSection padding={15}>
          <MjmlColumn>
            <Invitation from={from} />
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
