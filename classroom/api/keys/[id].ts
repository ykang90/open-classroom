export const config = { runtime: 'edge' }
import { verifySessionJwt, jsonResponse, errorResponse, supabase, withErrorHandler } from '~/lib/api'
import { NextRequest } from 'next/server'

export default withErrorHandler(async function handler(req: NextRequest): Promise<Response> {
  if (req.method !== 'DELETE') return errorResponse('Method not allowed', 405)

  const auth = await verifySessionJwt(req)
  if (!auth) return errorResponse('Unauthorized', 401)

  const url = new URL(req.url)
  const parts = url.pathname.split('/')
  const id = parts[parts.length - 1]

  if (!id) return errorResponse('Missing key id', 400)

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId)

  if (error) return errorResponse(error.message, 500)
  return jsonResponse({ deleted: true })
})
