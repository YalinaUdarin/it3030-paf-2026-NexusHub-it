import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ticketApi } from '../api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import SLATimer from '../components/SLATimer'
import toast from 'react-hot-toast'
import { HiArrowLeft, HiPencil, HiTrash } from 'react-icons/hi'
import { formatDistanceToNow } from 'date-fns'

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isTechnician } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchTicket() }, [id])

  const fetchTicket = async () => {
    try {
      const { data } = await ticketApi.getById(id)
      setTicket(data)
    } finally { setLoading(false) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const { data } = await ticketApi.addComment(id, comment)
      setTicket(data)
      setComment('')
      toast.success('Comment added')
    } catch { toast.error('Failed to add comment') }
    finally { setSubmitting(false) }
  }

  const handleEditComment = async (commentId) => {
    try {
      const { data } = await ticketApi.editComment(id, commentId, editingComment.content)
      setTicket(data)
      setEditingComment(null)
      toast.success('Comment updated')
    } catch { toast.error('Failed to update comment') }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      const { data } = await ticketApi.deleteComment(id, commentId)
      setTicket(data)
      toast.success('Comment deleted')
    } catch { toast.error('Failed to delete comment') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"/></div>
  if (!ticket) return <div className="card text-center py-12 text-gray-500">Ticket not found</div>

  const priorityColor = {
    LOW: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700'
  }

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
        <HiArrowLeft /> Back
      </button>

      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{ticket.title}</h2>
            <p className="text-gray-500 text-sm mt-1">📍 {ticket.location || 'No location specified'}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={ticket.status} />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColor[ticket.priority]}`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        <p className="text-gray-700 text-sm leading-relaxed">{ticket.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div><p className="text-xs text-gray-400">Category</p><p className="text-sm font-medium">{ticket.category?.replace('_', ' ')}</p></div>
          <div><p className="text-xs text-gray-400">Reported By</p><p className="text-sm font-medium">{ticket.reportedByName}</p></div>
          <div><p className="text-xs text-gray-400">Assigned To</p><p className="text-sm font-medium">{ticket.assignedToName || 'Unassigned'}</p></div>
          {ticket.resolutionNotes && (
            <div className="col-span-3">
              <p className="text-xs text-gray-400">Resolution Notes</p>
              <p className="text-sm font-medium text-green-700">{ticket.resolutionNotes}</p>
            </div>
          )}
          {ticket.rejectionReason && (
            <div className="col-span-3">
              <p className="text-xs text-gray-400">Rejection Reason</p>
              <p className="text-sm font-medium text-red-700">{ticket.rejectionReason}</p>
            </div>
          )}
        </div>

        {ticket.attachmentUrls?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
            <div className="flex gap-2">
              {ticket.attachmentUrls.map((url, i) => (
                <a key={i} href={`http://localhost:8080${url}`} target="_blank" rel="noreferrer"
                   className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors">
                  <img src={`http://localhost:8080${url}`} alt={`Attachment ${i+1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SLA Timer */}
      <SLATimer createdAt={ticket.createdAt} priority={ticket.priority} status={ticket.status} />

      {/* Comments */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Comments ({ticket.comments?.length || 0})</h3>
        <div className="space-y-4 mb-6">
          {ticket.comments?.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment.</p>
          )}
          {ticket.comments?.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs flex-shrink-0">
                {c.authorName?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{c.authorName}</span>
                    <span className="text-xs text-gray-400 ml-2">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  </div>
                  {(c.authorId === user?.id || isAdmin()) && (
                    <div className="flex gap-1">
                      <button onClick={() => setEditingComment({ id: c.id, content: c.content })}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                        <HiPencil className="text-sm"/>
                      </button>
                      <button onClick={() => handleDeleteComment(c.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <HiTrash className="text-sm"/>
                      </button>
                    </div>
                  )}
                </div>
                {editingComment?.id === c.id ? (
                  <div className="mt-1 flex gap-2">
                    <input value={editingComment.content}
                           onChange={e => setEditingComment({...editingComment, content: e.target.value})}
                           className="input text-sm" />
                    <button onClick={() => handleEditComment(c.id)} className="btn-primary text-sm px-3">Save</button>
                    <button onClick={() => setEditingComment(null)} className="btn-secondary text-sm px-3">Cancel</button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 mt-1">{c.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleComment} className="flex gap-2">
          <input value={comment} onChange={e => setComment(e.target.value)}
                 placeholder="Write a comment..." className="input flex-1" />
          <button type="submit" disabled={submitting || !comment.trim()} className="btn-primary">
            {submitting ? '...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
