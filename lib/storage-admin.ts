import { getAdminDb } from './firebase-admin';

export async function listUserFilesAdmin(userId: string) {
    const adminDb = getAdminDb();
    const querySnapshot = await adminDb.collection(`files/${userId}/userFiles`).get();

    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
    }));
}

export async function calculateTotalStorageAdmin(userId: string): Promise<number> {
    const files = await listUserFilesAdmin(userId);
    const totalBytes = files.reduce((acc, file: any) => acc + (file.size || 0), 0);
    return totalBytes;
}
