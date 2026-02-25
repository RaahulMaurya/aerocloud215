// Email notification helper functions

export async function sendUploadNotification(userEmail: string, fileName: string) {
  try {
    await fetch("/api/send-notification-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: userEmail,
        subject: "File Uploaded Successfully",
        message: `Your file "${fileName}" has been uploaded to CloudVault.`,
        type: "upload",
      }),
    })
  } catch (error) {
    console.error("Failed to send upload notification:", error)
  }
}

export async function sendShareNotification(userEmail: string, fileName: string) {
  try {
    await fetch("/api/send-notification-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: userEmail,
        subject: "File Shared",
        message: `A share link has been created for "${fileName}".`,
        type: "share",
      }),
    })
  } catch (error) {
    console.error("Failed to send share notification:", error)
  }
}

export async function sendStorageAlertNotification(userEmail: string, storageUsed: number, storageTotal: number) {
  const percentage = (storageUsed / storageTotal) * 100
  try {
    await fetch("/api/send-notification-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: userEmail,
        subject: "Storage Alert - Running Low",
        message: `Your storage is ${percentage.toFixed(
          0,
        )}% full (${storageUsed.toFixed(2)}GB / ${storageTotal}GB). Consider upgrading your plan.`,
        type: "storage_alert",
      }),
    })
  } catch (error) {
    console.error("Failed to send storage alert:", error)
  }
}
