import type { RagSearchChunkResult } from '@app/web/assistant/rag/executeRagSearch'
import {
  type RagChunkResultForAssistant,
  formatRagSearchResultToJsonForAssistant,
} from '@app/web/assistant/rag/formatRagSearchResultToMarkdown'
import { getRagChunksForQuery } from '@app/web/assistant/rag/getRagChunksForQuery'
import { ragSources } from '@app/web/assistant/rag/sources'
import type { AgenticSearchToolYamlResult } from '@app/web/assistant/tools/agenticSearchTool'
import {
  centreAideRagToolDescription,
  centreAideRagToolName,
} from '@app/web/assistant/tools/centreAideRagToolConfig'
import type { ZodFunctionOptions } from '@app/web/assistant/tools/zodFunctionType'
import { tool } from 'ai'
import { stringify } from 'yaml'
import { z } from 'zod'

export const centreAideRagToolParameters = z.object({
  query: z
    .string()
    .describe(
      'Le message complet qui sera comparé avec les embeddings de nos collections de documents d’aides. Cela doit contenir le contexte et assez de sens pour pouvoir faire un RAG efficace.',
    ),
  objectif: z
    .string()
    .describe(
      'L’objectif de la recherche dans le contexte de la discussion. Permet de ranker les résultats par ordre de pertinence.',
    ),
})

export type CentreAideToolResult =
  | {
      error: string
    }
  | {
      error?: undefined
      objectif: string
      sources: RagChunkResultForAssistant[] | undefined
    }

export type CentreAideRagToolParameters = z.infer<
  typeof centreAideRagToolParameters
>

const errorResult = (errorMessage: string) => {
  const yamlErrorResult = {
    error: errorMessage,
  } satisfies AgenticSearchToolYamlResult
  return stringify(yamlErrorResult)
}

export const centreAideRagToolOptions = {
  name: centreAideRagToolName,
  description: centreAideRagToolDescription,
  parameters: centreAideRagToolParameters,
  function: async ({ query }) => {
    const ragRawResults = await getRagChunksForQuery(query, {
      sources: [ragSources.centreAideNotion],
    })

    const chunks =
      ragRawResults?.chunkResults.length > 0
        ? ragRawResults.chunkResults
        : false

    if (!chunks) {
      return errorResult(
        `Aucun résultat pertinent ne correspond à la recherche.`,
      )
    }

    // We need to merge the chunks that are from the same source

    const chunksBySource = new Map<string, RagSearchChunkResult[]>()
    for (const chunk of chunks) {
      const sourceId = chunk.sourceId

      const existingChunks = chunksBySource.get(sourceId)

      if (existingChunks) {
        existingChunks.push(chunk)
        existingChunks.sort((a, b) => a.chunk - b.chunk)
      } else {
        chunksBySource.set(sourceId, [chunk])
      }
    }

    // Then we reconstruct the chunks array by merging the chunks from each source
    const resultChunks: RagSearchChunkResult[] = []
    for (const sourceChunks of chunksBySource.values()) {
      const resultChunk = sourceChunks.at(0)

      if (!resultChunk) {
        // Will not happen, here for type safety
        continue
      }

      for (const chunk of sourceChunks) {
        if (chunk === resultChunk) {
          continue
        }
        resultChunk.content += `\n\n${chunk.content}`
      }

      resultChunks.push(resultChunk)
    }

    const yamlResultObject = {
      objectif: `L’assistant doit utiliser ces informations pour répondre de manière complète et pertinente et générer les liens vers les sources pour l’utilisateur dans l’objectif de : ${query}`,
      sources: formatRagSearchResultToJsonForAssistant(resultChunks),
    }

    return stringify(yamlResultObject)
  },
} satisfies ZodFunctionOptions<typeof centreAideRagToolParameters>

export const centreAideRagTool = tool({
  parameters: centreAideRagToolParameters,
  description: centreAideRagToolDescription,
  execute: centreAideRagToolOptions.function,
})
