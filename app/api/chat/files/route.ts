import { GoogleGenerativeAI } from '@google/generative-ai'
import { getAdminDb } from '@/lib/firebase-admin'
import { listUserFilesAdmin } from '@/lib/storage-admin'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, userId, userContext } = await req.json()

    console.log('[Chat API] Called with userId:', userId)

    // Check both environment variable names since users often use GOOGLE_API_KEY instead of the longer version
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY

    if (!apiKey) {
      console.error('[Chat API] Missing GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY')
      return new Response(JSON.stringify({ error: 'AI service not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Fetch files and user data gracefully (optional — falls back if Admin SDK not configured)
    let files: any[] = []
    let dbUserData: Record<string, any> = {}

    try {
      const adminDb = getAdminDb()
      const [fetchedFiles, userDoc] = await Promise.all([
        listUserFilesAdmin(userId).catch(e => {
          console.warn('[Chat API] Could not fetch files:', e?.message)
          return []
        }),
        adminDb.doc(`users/${userId}`).get().catch(e => {
          console.warn('[Chat API] Could not fetch user doc:', e?.message)
          return null
        })
      ])
      files = fetchedFiles
      dbUserData = userDoc?.data() || {}
    } catch (adminErr: any) {
      console.warn('[Chat API] Firebase Admin not configured, using client context only:', adminErr?.message)
    }

    const finalUserData = { ...dbUserData, ...(userContext || {}) }

    const totalBytes = files.reduce((acc, file: any) => acc + (file.size || 0), 0)
    const totalGB = (totalBytes / (1024 * 1024 * 1024)).toFixed(2)
    const maxGB = finalUserData.maxStorage
      ? (finalUserData.maxStorage / (1024 * 1024 * 1024)).toFixed(0)
      : '5'

    const systemInstruction = `You are CloudVault AI, an intelligent storage assistant.

CONTEXT - USER DETAILS:
- Name: ${finalUserData.displayName || finalUserData.name || 'User'}
- Email: ${finalUserData.email || 'Unknown'} (Do not share unless asked)
- Current Plan: ${finalUserData.subscriptionPlan || finalUserData.plan || 'Free'}
- Plan Expiry: ${finalUserData.planExpiry ? new Date(finalUserData.planExpiry).toLocaleDateString() : 'N/A'}
- Storage Used: ${totalGB} GB / ${maxGB} GB
- Total Files: ${files.length}

USER FILES (Top 100 recent):
${files.slice(0, 100).map((f: any) => `- ${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB) [${f.folder || 'Root'}]`).join('\n') || 'No file data available.'}

PRICING PLANS:
1. Free: 5 GB, 5 links/month, 1 GB bandwidth, 2-day expiry
2. Starter: 50 GB, 50 links/month, 10 GB bandwidth, 30-day expiry, Vault
3. Pro: 200 GB, 500 links/month, 100 GB bandwidth, 365-day expiry, AI Chatbot, HD BG Removal
4. Enterprise: 1 TB, unlimited links/bandwidth, never expire, Dedicated Manager

FAQ:
- Change Password: Settings > Security > Change Password
- 2FA: Settings > Security > Two-Factor Authentication
- Update Profile: Settings > Profile
- Delete Account: Settings > Danger Zone (irreversible!)
- Contact Support: support@cloudvault.com

GUIDELINES:
- Be concise and friendly.
- If asked about a file, check the file list and confirm if found.
- Suggest upgrading if a feature isn't in their plan.`

    // Convert messages array to Gemini history format
    // messages = [{ role: 'user'|'assistant', content: string }, ...]
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : (m.parts?.map((p: any) => p.text).join('') || '') }]
    }))

    const lastMessage = messages[messages.length - 1]
    const userMessage = typeof lastMessage?.content === 'string'
      ? lastMessage.content
      : (lastMessage?.parts?.map((p: any) => p.text).join('') || '')

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction,
    })

    const chat = model.startChat({ history })
    const result = await chat.sendMessage(userMessage)
    const text = result.response.text()

    console.log('[Chat API] Response generated successfully, length:', text.length)

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('[Chat API] Error:', error?.message || error)
    return new Response(JSON.stringify({ error: error?.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
