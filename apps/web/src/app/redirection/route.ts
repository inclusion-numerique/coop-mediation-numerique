import { NextRequest, NextResponse } from 'next/server'

/**
 * Utility route to redirect to a given URL from an internal path
 */
export const GET = async (request: NextRequest) => {
  const url = request.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 },
    )
  }

  try {
    // Validate the URL
    new URL(url)

    // Redirect to the provided URL
    return NextResponse.redirect(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 })
  }
}
