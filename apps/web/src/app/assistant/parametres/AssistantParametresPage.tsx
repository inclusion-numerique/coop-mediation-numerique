import AssistantParametresForm from '@app/web/app/assistant/parametres/AssistantParametresForm'
import type { AssistantParametresPageData } from '@app/web/app/assistant/parametres/getAssistantParametresPageData'
import { assistantConfigurationDefaultValuesFromModel } from '@app/web/assistant/configuration/AssistantConfigurationValidation'
import Breadcrumbs from '@app/web/components/Breadcrumbs'
import SkipLinksPortal from '@app/web/components/SkipLinksPortal'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { contentId } from '@app/web/utils/skipLinks'

const AssistantParametresPage = ({
  data,
}: {
  data: AssistantParametresPageData
}) => (
  <div className="fr-container fr-container--800">
    <SkipLinksPortal />
    <Breadcrumbs
      currentPage="Paramètres"
      homeLinkHref="/"
      parents={[{ label: 'Assistant', linkProps: { href: '/assistant' } }]}
      className="fr-mb-4v"
    />
    <main id={contentId}>
      <AdministrationTitle icon="fr-icon-settings-5-line">
        Paramètres de l’assistant
      </AdministrationTitle>
      <AssistantParametresForm
        defaultValues={assistantConfigurationDefaultValuesFromModel(data)}
        defaultConfiguration={data.defaultConfiguration}
      />
    </main>
  </div>
)

export default AssistantParametresPage
