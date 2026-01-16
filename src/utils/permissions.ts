import { useAuthStore } from '../store/authStore'

// Define all possible permissions/actions in the app
export type Permission =
  // Member permissions
  | 'view_members'
  | 'add_members'
  | 'edit_members'
  | 'delete_members'
  | 'change_member_roles'
  // Contribution permissions
  | 'view_contributions'
  | 'add_contributions'
  | 'edit_contributions'
  | 'confirm_contributions'
  | 'delete_contributions'
  // Loan permissions
  | 'view_loans'
  | 'apply_loan'
  | 'approve_loans'
  | 'reject_loans'
  | 'disburse_loans'
  | 'record_repayments'
  // Meeting permissions
  | 'view_meetings'
  | 'schedule_meetings'
  | 'edit_meetings'
  | 'delete_meetings'
  | 'record_attendance'
  // Expense permissions
  | 'view_expenses'
  | 'add_expenses'
  | 'edit_expenses'
  | 'approve_expenses'
  | 'delete_expenses'
  // Project permissions
  | 'view_projects'
  | 'add_projects'
  | 'edit_projects'
  | 'delete_projects'
  // Fine permissions
  | 'view_fines'
  | 'add_fines'
  | 'edit_fines'
  | 'waive_fines'
  | 'delete_fines'
  // Report permissions
  | 'view_reports'
  | 'export_reports'
  // Settings permissions
  | 'view_settings'
  | 'edit_settings'
  | 'manage_contribution_types'
  | 'manage_loan_types'
  | 'manage_fine_types'

// Define role types
export type UserRole = 
  | 'admin' 
  | 'chairman' 
  | 'vice_chairman' 
  | 'treasurer' 
  | 'vice_treasurer' 
  | 'secretary' 
  | 'vice_secretary' 
  | 'member'

// Role descriptions for display
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Full system access - Can manage all aspects of the chama',
  chairman: 'Leadership role - Approves loans, expenses, and oversees operations',
  vice_chairman: 'Assists chairman - Can approve in chairman\'s absence',
  treasurer: 'Financial management - Manages contributions, loans, and expenses',
  vice_treasurer: 'Assists treasurer - Records financial transactions',
  secretary: 'Records management - Manages meetings, members, and documentation',
  vice_secretary: 'Assists secretary - Helps with record keeping',
  member: 'Standard member - Can view data and apply for loans',
}

// Role hierarchy (higher number = more privileges)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 100,
  chairman: 90,
  vice_chairman: 80,
  treasurer: 70,
  vice_treasurer: 60,
  secretary: 70,
  vice_secretary: 60,
  member: 10,
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  chairman: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  vice_chairman: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  treasurer: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  vice_treasurer: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  secretary: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  vice_secretary: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  member: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
}

// Sensitive actions that require PIN/password verification
export const SENSITIVE_ACTIONS: Permission[] = [
  'approve_loans',
  'reject_loans',
  'disburse_loans',
  'approve_expenses',
  'delete_members',
  'change_member_roles',
  'delete_contributions',
  'delete_expenses',
  'delete_projects',
  'delete_fines',
  'waive_fines',
  'edit_settings',
  'manage_contribution_types',
],
  treasurer: [
    // All permissions
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  vice_treasurer: [
    // All permissions
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  secretary: [
    // All permissions
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  vice_secretary: [
    // All permissions
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ],
  member: [
    'view_members', 'add_members', 'edit_members', 'delete_members', 'change_member_roles',
    'view_contributions', 'add_contributions', 'edit_contributions', 'confirm_contributions', 'delete_contributions',
    'view_loans', 'apply_loan', 'approve_loans', 'reject_loans', 'disburse_loans', 'record_repayments',
    'view_meetings', 'schedule_meetings', 'edit_meetings', 'delete_meetings', 'record_attendance',
    'view_expenses', 'add_expenses', 'edit_expenses', 'approve_expenses', 'delete_expenses',
    'view_projects', 'add_projects', 'edit_projects', 'delete_projects',
    'view_fines', 'add_fines', 'edit_fines', 'waive_fines', 'delete_fines',
    'view_reports', 'export_reports',
    'view_settings', 'edit_settings', 'manage_contribution_types', 'manage_loan_types', 'manage_fine_types',
  ]
};

// Sensitive actions that require PIN/password verification
export const SENSITIVE_ACTIONS: Permission[] = [
  'approve_loans',
  'reject_loans',
  'disburse_loans',
  'approve_expenses',
  'delete_members',
  'change_member_roles',
  'delete_contributions',
  'delete_expenses',
  'delete_projects',
  'delete_fines',
  'waive_fines',
  'edit_settings',
  'manage_contribution_types',
];

/**
 * Hook to check if the current user can edit (legacy)
 */
export function useCanEdit(): boolean {
  const { user } = useAuthStore()
  return canEdit(user?.role)
}

/**
 * Hook to get the current user's role
 */
export function useUserRole(): UserRole | undefined {
  const { user } = useAuthStore()
  return user?.role as UserRole | undefined
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || []
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  return ROLE_DESCRIPTIONS[role] || 'Unknown role'
}

/**
 * Compare role hierarchy
 */
export function isRoleHigherOrEqual(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2]
}
