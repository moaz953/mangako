"use client"

import { useState, useEffect } from "react"
import { getSubmissions, updateSubmissionStatus, deleteSubmission as deleteSubmissionAction } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2, Search, Filter, Eye, Check, X, Trash2, Mail, AlertTriangle } from "lucide-react"
import Image from "next/image"

interface Submission {
    id: string
    artistName: string
    email: string
    title: string
    genre: string
    synopsis: string
    portfolioUrl: string | null
    samplePages: string[]
    status: "pending" | "approved" | "rejected"
    submittedAt: string
}

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [updating, setUpdating] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [loading, setLoading] = useState(true)

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    useEffect(() => {
        async function fetchSubmissions() {
            setLoading(true)
            const data = await getSubmissions()
            setSubmissions(data)
            setLoading(false)
        }

        fetchSubmissions()
    }, [])

    const loadSubmissions = async () => {
        setLoading(true)
        const data = await getSubmissions()
        setSubmissions(data)
        setLoading(false)
    }

    const updateStatus = async (id: string, status: "approved" | "rejected") => {
        setUpdating(id)
        try {
            const result = await updateSubmissionStatus(id, status)
            if (result.success) {
                setSubmissions(submissions.map(sub =>
                    sub.id === id ? { ...sub, status } : sub
                ))
                toast.success(status === 'approved' ? 'Submission approved!' : 'Submission rejected')
            } else {
                toast.error('Failed to update status')
            }
        } catch (error) {
            toast.error('An error occurred')
        }
        setUpdating(null)
    }

    const handleDeleteClick = (id: string) => {
        setSubmissionToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!submissionToDelete) return

        setDeleting(true)
        try {
            const result = await deleteSubmissionAction(submissionToDelete)
            if (result.success) {
                setSubmissions(submissions.filter(sub => sub.id !== submissionToDelete))
                toast.success('Submission deleted')
            } else {
                toast.error('Failed to delete submission')
            }
        } catch (error) {
            toast.error('An error occurred')
        }
        setDeleting(false)
        setDeleteDialogOpen(false)
        setSubmissionToDelete(null)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved": return "bg-green-500/10 text-green-500 border-green-500/20"
            case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20"
            default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        }
    }

    // Filter Logic
    const filteredSubmissions = submissions.filter(submission => {
        const matchesSearch =
            submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.email.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === "all" || submission.status === statusFilter

        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
                    <p className="text-muted-foreground">Review manga submissions from artists</p>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search artist, title, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="w-full sm:w-[200px]">
                        <div className="relative">
                            <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredSubmissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg">
                        <Mail className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Submissions Found</h3>
                        <p className="text-sm text-muted-foreground">
                            {submissions.length === 0 ? "Artist submissions will appear here" : "Try adjusting your search or filters"}
                        </p>
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Manga Title</TableHead>
                                    <TableHead>Artist</TableHead>
                                    <TableHead>Genre</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell className="font-medium">
                                            {submission.title}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{submission.artistName}</span>
                                                <span className="text-xs text-muted-foreground">{submission.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{submission.genre}</TableCell>
                                        <TableCell>
                                            {new Date(submission.submittedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(submission.status)} variant="outline">
                                                {submission.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSelectedSubmission(submission)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                                        <DialogHeader>
                                                            <DialogTitle>{submission.title}</DialogTitle>
                                                            <DialogDescription>by {submission.artistName}</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-6 text-sm">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="font-semibold">Genre:</p>
                                                                    <p className="text-muted-foreground">{submission.genre}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold">Contact:</p>
                                                                    <p className="text-muted-foreground">{submission.email}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold">Synopsis:</p>
                                                                <p className="text-muted-foreground whitespace-pre-wrap mt-1">{submission.synopsis}</p>
                                                            </div>

                                                            {submission.portfolioUrl && (
                                                                <div>
                                                                    <p className="font-semibold">Portfolio:</p>
                                                                    <a
                                                                        href={submission.portfolioUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-primary hover:underline"
                                                                    >
                                                                        {submission.portfolioUrl}
                                                                    </a>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <p className="font-semibold mb-2">Sample Pages:</p>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {submission.samplePages.map((url, index) => (
                                                                        <div key={index} className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border">
                                                                            <Image
                                                                                src={url}
                                                                                alt={`Page ${index + 1}`}
                                                                                fill
                                                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                                                className="object-contain"
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                {submission.status === "pending" && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-green-500/10 hover:text-green-500"
                                                            onClick={() => updateStatus(submission.id, "approved")}
                                                            disabled={updating === submission.id}
                                                        >
                                                            {updating === submission.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Check className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-red-500/10 hover:text-red-500"
                                                            onClick={() => updateStatus(submission.id, "rejected")}
                                                            disabled={updating === submission.id}
                                                        >
                                                            {updating === submission.id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <X className="w-4 h-4" />
                                                            )}
                                                        </Button>
                                                    </>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleDeleteClick(submission.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Submission</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this submission? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeleteDialogOpen(false)}
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}
