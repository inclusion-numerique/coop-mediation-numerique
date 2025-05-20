import { metadataTitle } from '@app/web/app/metadataTitle'
import { mergeWithDefaultAssistantConfiguration } from '@app/web/assistant/configuration/defaultAssistantConfiguration'
import { getAssistantPageData } from '@app/web/assistant/getAssistantPageData'
import { authenticateUser } from '@app/web/auth/authenticateUser'
import AdministrationTitle from '@app/web/libs/ui/administration/AdministrationTitle'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import Accordion from '@codegouvfr/react-dsfr/Accordion'
import classNames from 'classnames'
import { marked } from 'marked'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'

export const generateMetadata = (): Metadata => ({
  title: metadataTitle('Assistant - Chat'),
})

const formatParsedArgumentValue = (value: unknown) => {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'number') {
    return value.toString()
  }

  if (value === null) {
    return 'null'
  }

  return '_unknown_'
}

const Page = async (props: {
  params: Promise<{ threadId: string }>
}) => {
  const params = await props.params

  const { threadId } = params

  const user = await authenticateUser()

  const data = await getAssistantPageData({ threadId, userId: user.id })

  if (!data.chatThread) {
    notFound()
    return
  }

  const configuration = mergeWithDefaultAssistantConfiguration(
    data.chatThread.configuration,
  )

  return (
    <div className="fr-px-6v">
      <AdministrationTitle icon="fr-icon-chat-2-line">
        Chat session {threadId} - Debug
      </AdministrationTitle>
      <Accordion
        label={`Paramètres utilisés : ${configuration.title}`}
        className="fr-mb-4v"
      >
        <div
          className="fr-table fr-table--no-scroll fr-table--bordered"
          id="table-bordered-component"
        >
          <div className="fr-table__wrapper">
            <div className="fr-table__container">
              <div className="fr-table__content">
                <table id="table-bordered">
                  <tbody>
                    <tr>
                      <td>Température</td>
                      <td>{configuration.temperature}</td>
                    </tr>
                    <tr>
                      <td>Top&nbsp;P</td>
                      <td>{configuration.topP}</td>
                    </tr>
                    <tr>
                      <td>Presence&nbsp;penalty</td>
                      <td>{configuration.presencePenalty}</td>
                    </tr>
                    <tr>
                      <td>Frequency&nbsp;penalty</td>
                      <td>{configuration.frequencyPenalty}</td>
                    </tr>
                    <tr>
                      <td>System&nbsp;message</td>
                      <td
                        dangerouslySetInnerHTML={{
                          __html:
                            configuration.systemMessage?.replaceAll(
                              '\n',
                              '<br>',
                            ) ?? '-',
                        }}
                      />
                    </tr>
                    <tr>
                      <td>Search&nbsp;tool&nbsp;description</td>
                      <td>{configuration.searchToolDescription}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Accordion>
      {data.messages?.map((message) => (
        <Fragment key={message.id}>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-lg-6">
              <h3 className="fr-text--lg fr-text--bold">{message.role}</h3>
              {message.content ? (
                <div
                  className={classNames(
                    'fr-p-4v fr-pb-0 fr-border-radius--8',
                    message.role === 'user'
                      ? 'fr-background-alt--blue-france'
                      : message.role === 'assistant'
                        ? 'fr-background-alt--green-archipel'
                        : 'fr-background-alt--grey',
                  )}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: marked
                        .parse(message.content, { async: false })
                        .replaceAll('\n', '<br/>'),
                    }}
                  />
                </div>
              ) : null}
              {message.parts.length > 0 &&
                message.parts
                  .map((part) =>
                    part.type === 'tool-invocation' ? part : null,
                  )
                  .filter(onlyDefinedAndNotNull)
                  .map(({ toolInvocation }) => {
                    return (
                      <div
                        className="fr-p-4v fr-pb-0 fr-background-alt--brown-caramel fr-border-radius--8"
                        key={toolInvocation.toolCallId}
                      >
                        <p>
                          Tool call <strong>{toolInvocation.toolName}</strong>
                          <br />
                        </p>
                        <ul>
                          {Object.entries(toolInvocation.args).map(
                            ([key, value]) => (
                              <li key={key}>
                                {key}: {formatParsedArgumentValue(value)}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )
                  })}
            </div>
            <div className="fr-col-12 fr-col-lg-6">
              <pre className="fr-text--xs fr-overflow-x-auto">
                {JSON.stringify(message, null, 2)}
              </pre>
            </div>
          </div>
          <hr className="fr-separator-4v" />
        </Fragment>
      ))}
    </div>
  )
}

export default Page
