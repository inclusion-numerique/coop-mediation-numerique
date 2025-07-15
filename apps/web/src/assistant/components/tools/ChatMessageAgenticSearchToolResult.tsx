import ToolResultCard from '@app/web/assistant/components/tools/ToolResultCard'
import type { AgenticSearchToolYamlResult } from '@app/web/assistant/tools/agenticSearchTool'
import { LesBasesLogo } from '@app/web/features/pictograms/services/LesBasesLogo'
import type { ToolInvocation } from 'ai'
import he from 'he'
import { type Tokens, marked } from 'marked'
import { parse } from 'yaml'

const parseYamlToolContent = (content: string) => {
  try {
    return parse(content) as AgenticSearchToolYamlResult
  } catch {
    return null
  }
}

const renderer = new marked.Renderer()
const linkRenderer = renderer.link.bind(renderer)
renderer.link = (linkParameters: Tokens.Link) => {
  const html = linkRenderer(linkParameters)
  return html.replace(
    /^<a /,
    `<a target="_blank" class="fr-link" rel="noreferrer noopener nofollow" `,
  )
}

const PageWebIcon = ({ src }: { src?: string }) =>
  src ? (
    <img
      className=" fr-border-radius--8 fr-p-0"
      width={32}
      height={32}
      src={src}
      alt=""
    />
  ) : (
    <div
      className="fr-background-alt--blue-france fr-border-radius--8 fr-flex fr-align-items-center fr-justify-content-center"
      style={{ width: 32, height: 32 }}
    >
      <span
        className="fr-icon-global-line fr-icon--md fr-text-title--blue-france"
        aria-hidden
      />
    </div>
  )

const ChatMessageAgenticSearchToolResult = ({
  toolInvocation: { result },
}: {
  toolInvocation: ToolInvocation & { state: 'result' }
}) => {
  const parsedToolContent = parseYamlToolContent(result)

  if (!parsedToolContent || typeof parsedToolContent !== 'object') {
    return null
  }

  if ('error' in parsedToolContent) {
    return <ToolResultCard>{parsedToolContent.error}</ToolResultCard>
  }

  const sourcesLesBases = parsedToolContent.sources_les_bases ?? []
  const sourcesSitesWeb = parsedToolContent.sources_sites_web ?? []
  const sourcesSitesOfficiels = parsedToolContent.sources_sites_officiels ?? []

  // TODO separate UI ?
  const webSources = [...sourcesSitesWeb, ...sourcesSitesOfficiels]

  return (
    <>
      {sourcesLesBases.length > 0 && (
        <>
          {sourcesLesBases.map((source, index) => {
            const parsedContent = marked.parse(source.content, {
              renderer,
              async: false,
            })

            return (
              <ToolResultCard
                key={source.id}
                title={source.title || 'Les bases - ressource'}
                url={source.url}
                icon={<LesBasesLogo width={32} height={32} />}
                isFirst={index === 0}
                isLast={
                  index === sourcesLesBases.length - 1 &&
                  webSources.length === 0
                }
              >
                <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
              </ToolResultCard>
            )
          })}
        </>
      )}
      {webSources.length > 0 && (
        <>
          {/*<h3 className={styles.toolResultTitle}>*/}
          {/*  Sites web */}
          {/*</h3>*/}

          {webSources.map((source, index) => {
            // Extract the domain from the url to use as title
            const title = source.url.split('/')[2]

            return (
              <ToolResultCard
                key={source.url}
                title={title}
                url={source.url}
                icon={<PageWebIcon src={source.thumbnail?.src} />}
                isFirst={index === 0 && sourcesLesBases.length === 0}
                isLast={index === webSources.length - 1}
              >
                <p className="fr-text--bold fr-mb-1v">{source.title}</p>
                <div className="fr-mb-4v">
                  <a href={source.url} target="_blank">
                    {source.url}
                  </a>
                </div>
                {source.summary ? (
                  <>
                    <p className="fr-text--bold fr-mb-4v">
                      Résumé de la page&nbsp;:
                    </p>
                    <div
                      className="fr-mb-0"
                      dangerouslySetInnerHTML={{
                        __html: marked.parse(source.summary, {
                          renderer,
                          async: false,
                        }),
                      }}
                    />
                  </>
                ) : (
                  <p className="fr-mb-0">{he.decode(source.description)}</p>
                )}
              </ToolResultCard>
            )
          })}
        </>
      )}
    </>
  )
}

export default ChatMessageAgenticSearchToolResult
