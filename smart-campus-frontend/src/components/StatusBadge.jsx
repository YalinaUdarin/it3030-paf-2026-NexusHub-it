export default function StatusBadge({ status }) {
  const map = {
    PENDING:     'badge-pending',
    APPROVED:    'badge-approved',
    REJECTED:    'badge-rejected',
    CANCELLED:   'badge-cancelled',
    OPEN:        'badge-open',
    IN_PROGRESS: 'badge-progress',
    RESOLVED:    'badge-resolved',
    CLOSED:      'badge-closed',
    ACTIVE:      'badge-approved',
    OUT_OF_SERVICE: 'badge-rejected',
    MAINTENANCE: 'badge-pending',
  }
  return <span className={map[status] || 'badge-cancelled'}>{status?.replace('_', ' ')}</span>
}
