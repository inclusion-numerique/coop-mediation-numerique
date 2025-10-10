import { handleRdvModelWebhook } from '@app/web/features/rdvsp/webhook/handleRdvModelWebhook'
import { handleUserModelWebhook } from '@app/web/features/rdvsp/webhook/handleUserModelWebhook'
import {
  RdvspWebhookModel,
  RdvspWebhookPayload,
  RdvspWebhookRdvData,
  RdvspWebhookUserData,
  RdvspWebhookAgentData,
  RdvspWebhookUserProfileData,
  RdvspWebhookEvent,
} from '@app/web/features/rdvsp/webhook/rdvWebhook'
import { NextRequest, NextResponse } from 'next/server'

type HeaderRecord = Record<string, string | string[]>
type QueryRecord = Record<string, string | string[]>

const stringifyPretty = (label: string, payload: unknown) => {
  const value = (() => {
    try {
      return JSON.stringify(payload, null, 2)
    } catch (error) {
      return `Unable to stringify payload: ${String(error)}`
    }
  })()

  // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
  console.log(`\n[rdvsp webhook] ${label}:\n${value}\n`)
}

const collectHeaders = (headers: Headers): HeaderRecord => {
  const headerRecord: HeaderRecord = {}

  for (const [key, value] of headers.entries()) {
    if (headerRecord[key]) {
      const current = headerRecord[key]
      headerRecord[key] = Array.isArray(current)
        ? [...current, value]
        : [current, value]
    } else {
      headerRecord[key] = value
    }
  }

  return headerRecord
}

const collectQueryParams = (url: URL): QueryRecord => {
  const queryRecord: QueryRecord = {}

  for (const [key, value] of url.searchParams.entries()) {
    if (queryRecord[key]) {
      const current = queryRecord[key]
      queryRecord[key] = Array.isArray(current)
        ? [...current, value]
        : [current, value]
    } else {
      queryRecord[key] = value
    }
  }

  return queryRecord
}

const normalizeFormData = (formData: FormData) => {
  const normalized: Record<string, unknown> = {}

  for (const [key, value] of formData.entries()) {
    const processedValue =
      value instanceof File
        ? {
            fileName: value.name,
            type: value.type,
            size: value.size,
          }
        : value

    if (normalized[key]) {
      const current = normalized[key]
      normalized[key] = Array.isArray(current)
        ? [...current, processedValue]
        : [current, processedValue]
    } else {
      normalized[key] = processedValue
    }
  }

  return normalized
}

const readRequestBody = async (request: NextRequest) => {
  if (request.method === 'GET' || request.method === 'HEAD') return undefined

  const contentType = request.headers.get('content-type') ?? ''
  const clonedRequest = request.clone()

  if (contentType.includes('application/json')) {
    try {
      return await clonedRequest.json()
    } catch (error) {
      return `Failed to parse JSON: ${String(error)}`
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return normalizeFormData(await clonedRequest.formData())
  }

  if (contentType.includes('multipart/form-data')) {
    return normalizeFormData(await clonedRequest.formData())
  }

  try {
    return await clonedRequest.text()
  } catch (error) {
    return `Failed to read body: ${String(error)}`
  }
}

const logRequest = async (request: NextRequest) => {
  const url = new URL(request.url)
  const headers = collectHeaders(request.headers)
  const queryParams = collectQueryParams(url)

  stringifyPretty('Method', request.method)
  stringifyPretty('Headers', headers)
  stringifyPretty('Query Params', queryParams)

  if (request.method === 'POST') {
    const body = await readRequestBody(request)
    stringifyPretty('Body', body)
  }
}

export const GET = async (request: NextRequest) => {
  await logRequest(request)

  return NextResponse.json({ status: 'ok' })
}

export const POST = async (request: NextRequest) => {
  await logRequest(request)

  try {
    const body = (await request.json()) as RdvspWebhookPayload

    // Validate the structure
    if (!body.data || !body.meta) {
      return NextResponse.json(
        { error: 'Invalid webhook payload structure' },
        { status: 400 },
      )
    }

    // Route to appropriate handler based on model type
    // Using type assertions because TypeScript cannot narrow discriminated unions with nested discriminants
    switch (body.meta.model) {
      case RdvspWebhookModel.Rdv:
        await handleRdvModelWebhook({
          data: body.data as RdvspWebhookRdvData,
          event: body.meta.event,
        })
        break

      case RdvspWebhookModel.User:
        await handleUserModelWebhook({
          data: body.data as RdvspWebhookUserData,
          event: body.meta.event,
        })
        break

      default: {
        // We no-op on models we don't need to sync
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: we log this until feature is not in production
    console.error('[rdvsp webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 },
    )
  }
}
