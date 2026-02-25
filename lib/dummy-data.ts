// Dummy data for the application
export const currentUser = {
  id: "user_123",
  name: "John Doe",
  email: "john@example.com",
  plan: "pro",
  storageUsed: 35.5,
  storageTotal: 50,
  avatar: "/placeholder-user.jpg",
  joinedDate: "Jan 15, 2024",
}

export const storageStats = {
  free: { storage: 5, used: 0 },
  pro: { storage: 50, used: 35.5 },
  business: { storage: 200, used: 0 },
}

export const files = [
  {
    id: "file_1",
    name: "Project Proposal.pdf",
    type: "pdf",
    size: 2.4,
    modified: "2 hours ago",
    thumbnail: "📄",
  },
  {
    id: "file_2",
    name: "Vacation Photos",
    type: "folder",
    size: 12.8,
    modified: "1 day ago",
    thumbnail: "📁",
  },
  {
    id: "file_3",
    name: "Presentation.pptx",
    type: "pptx",
    size: 5.2,
    modified: "3 days ago",
    thumbnail: "📊",
  },
  {
    id: "file_4",
    name: "Budget Spreadsheet.xlsx",
    type: "xlsx",
    size: 0.8,
    modified: "1 week ago",
    thumbnail: "📈",
  },
  {
    id: "file_5",
    name: "Documents",
    type: "folder",
    size: 8.5,
    modified: "2 weeks ago",
    thumbnail: "📁",
  },
  {
    id: "file_6",
    name: "Meeting Notes.docx",
    type: "docx",
    size: 1.2,
    modified: "3 weeks ago",
    thumbnail: "📝",
  },
]

export const sharedFiles = [
  {
    id: "shared_1",
    name: "Team Guidelines.pdf",
    sharedBy: "Sarah Johnson",
    sharedDate: "2 days ago",
    permissions: "View & Download",
    thumbnail: "📄",
  },
  {
    id: "shared_2",
    name: "Q4 Planning",
    sharedBy: "Mike Chen",
    sharedDate: "1 week ago",
    permissions: "View only",
    thumbnail: "📁",
  },
]

export const activityLog = [
  {
    id: "activity_1",
    action: "Uploaded",
    item: "Project Proposal.pdf",
    time: "2 hours ago",
    icon: "⬆️",
  },
  {
    id: "activity_2",
    action: "Shared",
    item: "Vacation Photos",
    time: "5 hours ago",
    icon: "🔗",
  },
  {
    id: "activity_3",
    action: "Deleted",
    item: "Old_Backup.zip",
    time: "1 day ago",
    icon: "🗑️",
  },
  {
    id: "activity_4",
    action: "Downloaded",
    item: "Budget Spreadsheet.xlsx",
    time: "2 days ago",
    icon: "⬇️",
  },
]

export const teamMembers = [
  {
    id: "member_1",
    name: "Alice Smith",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: "member_2",
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "Editor",
    status: "Active",
  },
  {
    id: "member_3",
    name: "Carol Davis",
    email: "carol@example.com",
    role: "Viewer",
    status: "Inactive",
  },
]
