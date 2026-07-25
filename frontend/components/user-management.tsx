'use client'

import { useState } from 'react'
import { CreateUserInput, UpdateUserInput, User, Role, roleLabels } from '@/lib/types'
import { Users, Plus, X, Edit2, Trash2, ShieldCheck, Eye, ShieldAlert, ClipboardList } from 'lucide-react'

interface UserManagementProps {
  users: User[]
  currentUser: User | null
  onAddUser: (data: CreateUserInput) => void
  onUpdateUser: (id: string, data: UpdateUserInput) => void
  onDeleteUser: (id: string) => void
}

const roleIcons: Record<Role, React.ElementType> = {
  ADMIN: ShieldAlert,
  SUPERVISEUR: ShieldCheck,
  AGENT: ClipboardList
}

const roleBadgeColors: Record<Role, string> = {
  ADMIN: 'bg-amber-100 text-amber-600',
  SUPERVISEUR: 'bg-blue-100 text-blue-600',
  AGENT: 'bg-emerald-100 text-emerald-600'
}

export function UserManagement({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}: UserManagementProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('AGENT')

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('AGENT')
    setShowForm(false)
    setEditingUser(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    if (editingUser) {
      const data: UpdateUserInput = { name, email, role }
      if (password) data.password = password
      onUpdateUser(editingUser.id, data)
    } else {
      if (!password || password.length < 8) return
      onAddUser({ name, email, password, role })
    }
    resetForm()
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setPassword('')
    setRole(user.role)
    setShowForm(true)
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold">Utilisateurs</h2>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-muted/50 rounded-lg space-y-3">
          <h3 className="font-medium text-sm">
            {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              required
            />
            <input
              type="password"
              placeholder={editingUser ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe (min. 8 caracteres)'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
              minLength={8}
              required={!editingUser}
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
            >
              <option value="ADMIN">Administrateur</option>
              <option value="SUPERVISEUR">Superviseur</option>
              <option value="AGENT">Agent</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              {editingUser ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {users.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun utilisateur. Ajoutez-en un pour commencer.
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role]
            return (
              <div
                key={user.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  currentUser?.id === user.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${roleBadgeColors[user.role]}`}>
                    <RoleIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {user.name}
                      {!user.active && (
                        <span className="text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          Desactive
                        </span>
                      )}
                      {currentUser?.id === user.id && (
                        <span className="text-[10px] uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Vous
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[user.role]} - {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {currentUser?.id !== user.id && (
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-destructive"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
        <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p>
          <span className="font-medium text-foreground">ADMIN</span> gere les utilisateurs et tout le systeme.{' '}
          <span className="font-medium text-foreground">SUPERVISEUR</span> a une vue 360 sur toutes les saisies.{' '}
          <span className="font-medium text-foreground">AGENT</span> saisit ses propres operations terrain.
        </p>
      </div>
    </div>
  )
}
