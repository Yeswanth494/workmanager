import { Outlet } from 'react-router-dom'
import { Waypoints, Users, FolderKanban, ShieldCheck, CheckCircle2 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-bg lg:grid lg:grid-cols-[minmax(420px,0.9fr)_1.1fr]">
      <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent-500 text-ink-950 shadow-sm">
              <Waypoints className="size-5" strokeWidth={2.4} />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-text">WorkSphere</p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-text-faint">Work management platform</p>
            </div>
          </div>
          <Outlet />
        </div>
      </section>

      <section className="relative hidden overflow-hidden bg-ink-900 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(85,226,214,.22),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(24,183,170,.18),transparent_38%)]" />
        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-400/20 bg-accent-400/10 px-3 py-1 text-xs font-medium text-accent-300">
            <span className="size-1.5 rounded-full bg-accent-300" /> Enterprise workspace
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">
            Everything your team needs to keep work moving.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/55">
            Manage people, projects, tasks, attendance, leave, and timesheets from one clean workspace connected to your Spring Boot platform.
          </p>

          <div className="mt-8 space-y-3">
            {[
              [Users, 'Employee management', 'Profiles, departments, roles and teams'],
              [FolderKanban, 'Project operations', 'Projects, tasks, progress and priorities'],
              [ShieldCheck, 'Controlled approvals', 'Leave and timesheet workflows by role'],
            ].map(([Icon, title, description]) => {
              const I = Icon as typeof Users
              return (
                <div key={title as string} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.04] p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/7 text-accent-300">
                    <I className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{title as string}</p>
                    <p className="mt-0.5 text-xs text-white/40">{description as string}</p>
                  </div>
                  <CheckCircle2 className="ml-auto size-4 text-accent-300/70" />
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-white/30">
          <span className="size-1.5 rounded-full bg-accent-400" />
          React + Spring Boot · Modular monolith
        </div>
      </section>
    </div>
  )
}
