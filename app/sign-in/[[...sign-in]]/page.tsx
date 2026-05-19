import { SignIn } from "@clerk/nextjs"

const features = [
  "Real-time collaborative diagramming",
  "AI-powered spec generation",
  "Team workspace with version history",
]

export default function SignInPage() {
  return (
    <div className="flex min-h-dvh">
      <div className="w-1/2 flex flex-col justify-center px-16 py-12 bg-elevated">
        <div className="max-w-sm mx-auto w-full">
          <h1 className="text-xl font-semibold tracking-tight text-copy-primary">
            Ghost AI
          </h1>
          <p className="mt-2 text-sm text-copy-secondary">
            Design, collaborate, and generate technical specs from system
            architecture diagrams in real time.
          </p>
          <ul className="mt-8 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-copy-muted">
                <span className="h-1 w-1 rounded-full bg-brand shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-1/2 flex items-center justify-center px-4 py-12">
        <SignIn />
      </div>
    </div>
  )
}
