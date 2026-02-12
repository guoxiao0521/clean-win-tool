export type CleanStatus = 'pending' | 'running' | 'success' | 'skipped' | 'warning'

export interface CleanItem {
  id: number
  label: string
  icon: string
  status: CleanStatus
  detail: string
}
