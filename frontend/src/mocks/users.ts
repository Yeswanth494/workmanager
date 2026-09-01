import type { User } from '@/types/auth'
import { ROLES } from '@/utils/constants'

export const mockUsers: (User & { password: string })[] = [
  {
    id: 'u1',
    name: 'Ava Whitfield',
    email: 'admin@worksphere.io',
    password: 'password',
    role: ROLES.ADMIN,
    title: 'Head of Operations',
    department: 'Executive',
  },
  {
    id: 'u2',
    name: 'Marcus Reyes',
    email: 'manager@worksphere.io',
    password: 'password',
    role: ROLES.MANAGER,
    title: 'Engineering Manager',
    department: 'Engineering',
  },
  {
    id: 'u3',
    name: 'Priya Nandan',
    email: 'employee@worksphere.io',
    password: 'password',
    role: ROLES.EMPLOYEE,
    title: 'Software Engineer',
    department: 'Engineering',
  },
]
