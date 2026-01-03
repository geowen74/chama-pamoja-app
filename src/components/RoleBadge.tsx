import { Shield, Crown, Briefcase, FileText, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { UserRole, ROLE_DESCRIPTIONS, getRolePermissions, Permission } from '../utils/permissions'

interface RoleBadgeProps {
  role: UserRole
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const roleIcons: Record<UserRole, React.ReactNode> = {
  admin: <Shield size={16} />,
  chairman: <Crown size={16} />,
  vice_chairman: <Crown size={14} />,
  treasurer: <Briefcase size={16} />,
  vice_treasurer: <Briefcase size={14} />,
  secretary: <FileText size={16} />,
  vice_secretary: <FileText size={14} />,
  member: <Users size={16} />,
}

const roleColors: Record<UserRole, string> = {
  admin: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white',
  chairman: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  vice_chairman: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white',
  treasurer: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
  vice_treasurer: 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white',
  secretary: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
  vice_secretary: 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white',
  member: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white',
}

const roleBgColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  chairman: 'bg-amber-100 text-amber-700 border-amber-200',
  vice_chairman: 'bg-amber-50 text-amber-600 border-amber-100',
  treasurer: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  vice_treasurer: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  secretary: 'bg-blue-100 text-blue-700 border-blue-200',
  vice_secretary: 'bg-blue-50 text-blue-600 border-blue-100',
  member: 'bg-gray-100 text-gray-700 border-gray-200',
}

const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  chairman: 'Chairman',
  vice_chairman: 'Vice Chairman',
  treasurer: 'Treasurer',
  vice_treasurer: 'Vice Treasurer',
  secretary: 'Secretary',
  vice_secretary: 'Vice Secretary',
  member: 'Member',
}

// Permission category labels
const permissionCategories: Record<string, string> = {
  members: 'Members',
  contributions: 'Contributions',
  loans: 'Loans',
  meetings: 'Meetings',
  expenses: 'Expenses',
  projects: 'Projects',
  fines: 'Fines',
  reports: 'Reports',
  settings: 'Settings',
}

// Format permission for display
function formatPermission(permission: Permission): string {
  return permission
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
}

// Group permissions by category
function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {}
  
  for (const permission of permissions) {
    let groupName = 'other'
    
    if (permission.includes('member')) groupName = 'members'
    else if (permission.includes('contribution')) groupName = 'contributions'
    else if (permission.includes('loan') || permission.includes('repayment')) groupName = 'loans'
    else if (permission.includes('meeting') || permission.includes('attendance')) groupName = 'meetings'
    else if (permission.includes('expense')) groupName = 'expenses'
    else if (permission.includes('project')) groupName = 'projects'
    else if (permission.includes('fine')) groupName = 'fines'
    else if (permission.includes('report')) groupName = 'reports'
    else if (permission.includes('setting') || permission.includes('manage')) groupName = 'settings'
    
    if (!groups[groupName]) groups[groupName] = []
    groups[groupName].push(permission)
  }
  
  return groups
}

export default function RoleBadge({ role, showDetails = false, size = 'md' }: RoleBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }
  
  const permissions = getRolePermissions(role)
  const groupedPermissions = groupPermissions(permissions)

  return (
    <div className="inline-block">
      <div 
        className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${roleColors[role]} shadow-sm`}
        title={ROLE_DESCRIPTIONS[role]}
      >
        {roleIcons[role]}
        <span>{roleLabels[role]}</span>
      </div>
      
      {showDetails && (
        <div className="mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {isExpanded ? 'Hide Permissions' : 'View Permissions'}
          </button>
          
          {isExpanded && (
            <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 mb-4">{ROLE_DESCRIPTIONS[role]}</p>
              
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {permissionCategories[category] || category}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {perms.map((permission) => (
                        <span
                          key={permission}
                          className={`px-2 py-0.5 text-xs rounded-full border ${roleBgColors[role]}`}
                        >
                          {formatPermission(permission)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Total permissions: {permissions.length}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export { roleIcons, roleColors, roleBgColors, roleLabels }
