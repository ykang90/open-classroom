export const config = { runtime: 'edge' }
import { verifyApiKey, jsonResponse, errorResponse, supabase, withErrorHandler } from '../../_lib/all'

export default withErrorHandler(async function handler(req: Request): Promise<Response> {
  if (req.method !== 'PATCH') return errorResponse('Method not allowed', 405)

  const auth = await verifyApiKey(req)
  if (!auth) return errorResponse('Unauthorized', 401)
  if (auth.role !== 'teacher') return errorResponse('Forbidden', 403)

  const url = new URL(req.url)
  const parts = url.pathname.split('/')
  const id = parts[parts.length - 1]

  // 改用 text 再转 json，修复 edge 打包模块报错
  const rawText = await req.text()
  const body = JSON.parse(rawText) as any

  // camelCase → snake_case 映射
  const mapping: Record<string, string> = {
    title: 'title',
    description: 'description',
    isActive: 'is_active',
    dueDate: 'due_date',
    releaseDate: 'release_date',
    submitType: 'submit_type',
    showcaseEnabled: 'showcase_enabled',
    showcaseRequiredApproval: 'showcase_require_approval',
  }

  const updateData: Record<string, unknown> = {}
  for (const [camel, snake] of Object.entries(mapping)) {
    if (camel in body) updateData[snake] = body[camel]
  }

  if (Object.keys(updateData).length === 0) return errorResponse('No valid fields to update')

  const { data, error } = await supabase
    .from('assignments')
    .update(updateData)
    .eq('id', id)

  if (error) return errorResponse(error.message, 500)
  return jsonResponse({ data })
})
