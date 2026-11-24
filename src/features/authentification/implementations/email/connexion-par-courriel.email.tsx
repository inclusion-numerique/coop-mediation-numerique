import {
  MjmlButton,
  MjmlColumn,
  MjmlSection,
  MjmlSpacer,
  MjmlText,
} from '@faire/mjml-react'
import { renderToMjml } from '@faire/mjml-react/utils/renderToMjml'
import { getServerBaseUrl } from '@/configuration/projet/base-url'
import { projectTitle } from '@/configuration/projet/config'
import LayoutWithFooter from '@/libraries/emails/components/LayoutWithFooter'
import { brandColor } from '@/libraries/emails/styles'

export const connexionParCourriel = {
  text: ({ url }: { url: string }): string =>
    `Pour vous connecter à ${projectTitle}, merci d'utiliser le lien suivant :\n${url}\n\n`,
  mjml: ({ url }: { url: string }): string =>
    renderToMjml(
      <LayoutWithFooter
        projectTitle={projectTitle}
        urlDeBase={getServerBaseUrl()}
        headerLogoOnly
        title={`Connexion à ${projectTitle}`}
        preview="Voici votre lien de connexion sécurisé à usage unique :"
      >
        <MjmlSection paddingTop={0}>
          <MjmlColumn>
            <MjmlText fontWeight="600" fontSize="28px" color={brandColor}>
              Connexion à {projectTitle}
            </MjmlText>
            <MjmlSpacer height="16px" />
            <MjmlText>
              Voici votre lien de connexion sécurisé à usage unique&nbsp;:
            </MjmlText>
            <MjmlButton align="center" href={url}>
              Se connecter
            </MjmlButton>
            <MjmlText>
              Si vous n&apos;avez pas demandé à recevoir cet email, vous pouvez
              l&apos;ignorer en toute sécurité.
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </LayoutWithFooter>,
    ),
}
