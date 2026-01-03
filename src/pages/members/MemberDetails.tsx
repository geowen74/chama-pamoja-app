import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Wallet,
  HandCoins,
  TrendingUp,
  Edit,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  MapPin,
  Briefcase,
  CreditCard,
} from 'lucide-react'

export default function MemberDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { members, contributions, loans } = useDataStore()

  const member = members.find((m) => m.id === id)
  const memberContributions = contributions.filter((c) => c.memberId === id)
  const memberLoans = loans.filter((l) => l.memberId === id)

  if (!member) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Member not found</h2>
        <button onClick={() => navigate('/members')} className="btn btn-primary mt-4">
          Back to Members
        </button>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    chairman: 'bg-violet-100 text-violet-600',
    vice_chairman: 'bg-violet-50 text-violet-500',
    treasurer: 'bg-blue-100 text-blue-600',
    vice_treasurer: 'bg-blue-50 text-blue-500',
    secretary: 'bg-green-100 text-green-600',
    vice_secretary: 'bg-green-50 text-green-500',
    admin: 'bg-purple-100 text-purple-600',
    member: 'bg-gray-100 text-gray-600',
  }

  const statusColors = {
    active: 'bg-success-100 text-success-600',
    inactive: 'bg-gray-100 text-gray-600',
    suspended: 'bg-danger-100 text-danger-600',
  }

  const stats = [
    { label: 'Total Contributions', value: `KES ${member.totalContributions.toLocaleString()}`, icon: Wallet, color: 'blue' },
    { label: 'Total Loans', value: `KES ${member.totalLoans.toLocaleString()}`, icon: HandCoins, color: 'green' },
    { label: 'Outstanding Loans', value: `KES ${member.outstandingLoans.toLocaleString()}`, icon: TrendingUp, color: 'orange' },
    { label: 'Shares', value: member.shares, icon: TrendingUp, color: 'purple' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/members')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Member Details</h1>
        </div>
        <button className="btn btn-secondary flex items-center gap-2">
          <Edit size={18} />
          Edit
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={40} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[member.role]}`}>
                  {member.role}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[member.status]}`}>
                  {member.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 md:border-l md:pl-6 border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Mail size={18} className="text-gray-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="text-sm font-medium text-gray-900">{member.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Phone size={18} className="text-gray-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <div className="text-sm font-medium text-gray-900">{member.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar size={18} className="text-gray-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Joined</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center shadow-lg shadow-${stat.color}-500/25`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info & Next of Kin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Additional Member Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={20} className="text-violet-600" />
            Additional Information
          </h3>
          <div className="space-y-3">
            {member.idNumber && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CreditCard size={18} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">ID Number</div>
                  <div className="text-sm font-medium text-gray-900">{member.idNumber}</div>
                </div>
              </div>
            )}
            {member.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin size={18} className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Address</div>
                  <div className="text-sm font-medium text-gray-900">{member.address}</div>
                </div>
              </div>
            )}
            {member.dateOfBirth && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar size={18} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Date of Birth</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(member.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            {member.occupation && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Briefcase size={18} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Occupation</div>
                  <div className="text-sm font-medium text-gray-900">{member.occupation}</div>
                </div>
              </div>
            )}
            {!member.idNumber && !member.address && !member.dateOfBirth && !member.occupation && (
              <div className="text-center py-4 text-gray-500">No additional information</div>
            )}
          </div>
        </div>

        {/* Next of Kin */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-amber-600" />
            Next of Kin
          </h3>
          {member.nextOfKin ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <User size={18} className="text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Full Name</div>
                  <div className="text-sm font-medium text-gray-900">{member.nextOfKin.fullName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-pink-100 flex items-center justify-center">
                  <UserPlus size={18} className="text-pink-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Relationship</div>
                  <div className="text-sm font-medium text-gray-900">{member.nextOfKin.relationship}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Phone size={18} className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="text-sm font-medium text-gray-900">{member.nextOfKin.phone}</div>
                </div>
              </div>
              {member.nextOfKin.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="text-sm font-medium text-gray-900">{member.nextOfKin.email}</div>
                  </div>
                </div>
              )}
              {member.nextOfKin.address && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <MapPin size={18} className="text-violet-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="text-sm font-medium text-gray-900">{member.nextOfKin.address}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <UserPlus size={40} className="mx-auto text-gray-300 mb-2" />
              <p>No next of kin information</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contributions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Contributions</h3>
            <Link to="/contributions" className="text-primary-600 text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {memberContributions.slice(0, 5).map((contribution) => (
              <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {contribution.contributionTypeName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(contribution.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    KES {contribution.amount.toLocaleString()}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${
                    contribution.status === 'confirmed' ? 'text-success-600' :
                    contribution.status === 'pending' ? 'text-warning-600' : 'text-danger-600'
                  }`}>
                    {contribution.status === 'confirmed' ? <CheckCircle size={12} /> :
                     contribution.status === 'pending' ? <Clock size={12} /> : <XCircle size={12} />}
                    {contribution.status}
                  </div>
                </div>
              </div>
            ))}
            {memberContributions.length === 0 && (
              <div className="text-center py-4 text-gray-500">No contributions yet</div>
            )}
          </div>
        </div>

        {/* Loans */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Loans</h3>
            <Link to="/loans" className="text-primary-600 text-sm font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {memberLoans.slice(0, 5).map((loan) => (
              <Link
                key={loan.id}
                to={`/loans/${loan.id}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <div className="text-sm font-medium text-gray-900">{loan.loanTypeName}</div>
                  <div className="text-xs text-gray-500">
                    Applied {new Date(loan.applicationDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    KES {loan.principalAmount.toLocaleString()}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    loan.status === 'completed' ? 'bg-success-100 text-success-600' :
                    loan.status === 'repaying' || loan.status === 'disbursed' ? 'bg-blue-100 text-blue-600' :
                    loan.status === 'pending' || loan.status === 'approved' ? 'bg-warning-100 text-warning-600' :
                    'bg-danger-100 text-danger-600'
                  }`}>
                    {loan.status}
                  </span>
                </div>
              </Link>
            ))}
            {memberLoans.length === 0 && (
              <div className="text-center py-4 text-gray-500">No loans yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
