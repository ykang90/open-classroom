export const config = { runtime: 'edge' }
import { verifySessionJwt, jsonResponse, errorResponse, supabase, withErrorHandler } from '../_lib/all'

export default withErrorHandler(async function handler(req: Request): Promise<Response> {
  if (req.method !== 'DELETE') return errorResponse('Method not allowed', 405)

  const auth = await verifySessionJwt(req)
  if (!auth) return errorResponse('Unauthorized', 401)

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return errorResponse('Missing key id', 400)

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', auth.userId)

  if (error) return errorResponse(error.message, 500)
  return jsonResponse({ deleted: true })
})
