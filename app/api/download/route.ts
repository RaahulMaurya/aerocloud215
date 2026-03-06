import { NextRequest } from 'next/server'
import { getAdminStorage } from '@/lib/firebase-admin'

export const maxDuration = 30

/**
 * GET /api/download?path=<storagePath>&name=<fileName>
 *
 * Generates a fresh signed download URL server-side and redirects to it.
 * This bypasses CORS issues on the client when downloading Firebase Storage files.
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const filePath = searchParams.get('path')
        const fileName = searchParams.get('name') || 'download'

        const fallbackUrl = searchParams.get('fallbackUrl')

        if (!filePath) {
            // If path is missing but we have a fallback URL, just redirect to it immediately
            if (fallbackUrl) {
                return Response.redirect(fallbackUrl, 302)
            }

            return new Response(JSON.stringify({ error: 'Missing path parameter and fallback URL' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        // Decode the path in case it was URL-encoded
        const decodedPath = decodeURIComponent(filePath)

        // Try Admin SDK to get a signed URL (works without CORS issues)
        try {
            const adminStorage = getAdminStorage()
            const bucket = adminStorage.bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
            const file = bucket.file(decodedPath)

            // Generate a signed URL valid for 1 hour
            const [signedUrl] = await file.getSignedUrl({
                action: 'read',
                expires: Date.now() + 60 * 60 * 1000, // 1 hour
                responseDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
            })

            // Redirect to the signed URL — browser will download directly
            return Response.redirect(signedUrl, 302)
        } catch (adminErr: any) {
            console.warn('[Download API] Admin SDK failed, using fallback URL:', adminErr?.message)

            // Use the fallbackUrl passed from the client if available (has the original token)
            // Or construct a raw Firebase Storage REST API URL (requires public access or token)
            const fallbackUrl = searchParams.get('fallbackUrl')

            if (fallbackUrl) {
                return Response.redirect(fallbackUrl, 302)
            } else {
                const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cloudvault-cadca.firebasestorage.app'
                const encodedPath = encodeURIComponent(decodedPath)
                const rawUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`
                return Response.redirect(rawUrl, 302)
            }
        }
    } catch (error: any) {
        console.error('[Download API] Error:', error?.message || error)
        return new Response(JSON.stringify({ error: 'Download failed. Please try again.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
