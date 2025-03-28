import AssistantParametresPage from '@app/web/app/assistant/parametres/AssistantParametresPage'
import { getAssistantParametresPageData } from '@app/web/app/assistant/parametres/getAssistantParametresPageData'
import { metadataTitle } from '@app/web/app/metadataTitle'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import type { Metadata } from 'next'

export const generateMetadata = (): Metadata => ({
  title: metadataTitle('Assistant - Paramètres'),
})

const Page = async () => {
  const user = await authenticateUser()
  const data = await getAssistantParametresPageData({ userId: user.id })

  return <AssistantParametresPage data={data} />
}

export default Page
