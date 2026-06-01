// Public layout — pass-through; each sub-page owns its own chrome
export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
