export const config = { runtime: 'edge' }

import { verifySessionJwt, jsonResponse, errorResponse, supabase, withErrorHandler } from '../_lib/all'

export default withErrorHandler(async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const auth = await verifySessionJwt(req)
  if (!auth) return errorResponse('Unauthorized', 401)

  const body = await req.json() as any
  const { label } = body
  if (!label || typeof label !== 'string') return errorResponse('label is required', 400)

  export const config = { runtime: 'edge' }

import { verifySessionJwt, jsonResponse, errorResponse, supabase, withErrorHandler } from '~/lib/api'

export default withErrorHandler(async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return errorResponse('Method not allowed', 405)

  const auth = await verifySessionJwt(req)
  if (!auth) return errorResponse('Unauthorized', 401)

  const body = await req.json() as any
  const { label } = body
  if (!label || typeof label !== 'string') return errorResponse('label is required', 400)

  // ========== 这里替换成调用我们写好的数据库RPC函数 ==========
  const { data, error } = await supabase.rpc('create_teacher_api_key', {
    input_label: label
  })

  if (error) {
    console.log('rpc error', error)
    return errorResponse(error.message, 500)
  }

  return jsonResponse({ key: data })
})
