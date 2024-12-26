import { z } from 'zod'
import { zodFunction } from 'openai/helpers/zod'
import axios from 'axios'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { ZodFunctionOptions } from '@app/web/assistant/tools/zodFunctionType'

// See https://api.search.brave.com/app/documentation/web-search/query#LocalSearchAPIQueryParameters
export type BraveApiSearchParams = {
  q: string // The search query
  country?: string // The country code
  search_lang?: string // The language code
  ui_lang?: string // The UI language code
  count?: number // The number of results to return
  offset?: number // The offset of the first result to return
  safesearch?: 'off' | 'moderate' | 'strict' // The safe search level
  freshness?: string // The freshness of the results
  textDecorations?: boolean // Whether to show text decorations
  spellcheck?: boolean // Whether to enable spellcheck
  resultFilter?: string // The result filter
  gogglesId?: string // The goggles ID
  units?: 'metric' | 'imperial' // The units
  extraSnippets?: boolean // Whether to show extra snippets
  summary?: boolean // Whether to show a summary
}

export type BraveApiSearchResponse = {
  query: {
    original: string
    // and more fields
  }
  mixed: {
    // and more fields
  }
  type: 'search'
  web: {
    type: 'search'
    family_friendly: boolean
    results: {
      title: string
      url: string
      is_source_local: boolean
      is_source_both: boolean
      description: string
      profile: {
        name: string
        url: string
        long_name: string
        img: string
      }
      language: string
      family_friendly: boolean
      type: string
      subtype: string
      is_live: boolean
      meta_url: {
        scheme: string
        netloc: string
        hostname: string
        favicon: string
        path: string
      }
      thumbnail: {
        src: string
        original: string
        logo: boolean
      }
    }[]
  }
}

const formatResultForAssistant = ({
  description,
  // meta_url,
  // profile,
  thumbnail,
  title,
  url,
}: BraveApiSearchResponse['web']['results'][number]) => ({
  title,
  description,
  url,
  thumbnail,
})

export const webSearchToolParameters = z.object({
  query: z.string().describe('The search query'),
})

// TODO Deeper search tool that crawls
// https://spider.cloud/credits/new

export const webSearchToolOptions = {
  name: 'web_search',
  description:
    'Recherche sur internet, utilise les résultats pour trouver les quelles sont les informations utiles a utiliser pour mieux répondre.',
  parameters: webSearchToolParameters,
  function: async ({ query }) => {
    const headers = {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip',
      'X-Subscription-Token': ServerWebAppConfig.Assistant.Brave.apiKey,
    }

    const params: BraveApiSearchParams = {
      q: query,
      country: 'FR',
      search_lang: 'fr',
      ui_lang: 'fr-FR',
      count: 10,
      safesearch: 'strict',
      textDecorations: false,
      spellcheck: false,
      resultFilter: 'web,news',
      gogglesId:
        'https://gist.githubusercontent.com/Clrk/800bf69ac450d9fd07846c1dcb012d1f/raw',
      extraSnippets: false,
      summary: true,
    }

    const url = 'https://api.search.brave.com/res/v1/web/search'

    const response = await axios.get<BraveApiSearchResponse>(url, {
      params,
      headers,
    })

    const { results } = response.data.web

    return {
      results: results.map(formatResultForAssistant),
    }
  },
} satisfies ZodFunctionOptions<typeof webSearchToolParameters>

export const webSearchTool = zodFunction(webSearchToolOptions)
