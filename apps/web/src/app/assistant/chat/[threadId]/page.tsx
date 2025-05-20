import { metadataTitle } from '@app/web/app/metadataTitle'
import AssistantPageContent from '@app/web/assistant/components/AssistantPageContent'
import { getAssistantPageData } from '@app/web/assistant/getAssistantPageData'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import type { Metadata } from 'next'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export const generateMetadata = (): Metadata => ({
  title: metadataTitle('Assistant - Chat'),
})

const Page = async (props: {
  params: Promise<{ threadId: string }>
}) => {
  const params = await props.params

  const { threadId } = params

  const user = await authenticateUser()

  const data = await getAssistantPageData({ threadId, userId: user.id })

  return <AssistantPageContent data={data} threadId={threadId} user={user} />
}

export default Page
