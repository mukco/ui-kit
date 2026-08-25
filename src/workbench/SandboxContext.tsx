import { createContext, useContext, useRef, useState, type ReactNode } from "react"

/** Bridge between a SQL workbench surface and an assistant panel: cells can
    push a question with context, and something above owns the actual chat. */
interface SandboxContextValue {
  currentSql: string
  setCurrentSql: (sql: string) => void
  currentError: string | null
  setCurrentError: (err: string | null) => void
  pendingQuestion: { text: string } | null
  setPendingQuestion: (q: { text: string } | null) => void
  loadSqlRef: React.MutableRefObject<((sql: string) => void) | null>
  loadSql: (sql: string) => void
  openAssistantRef: React.MutableRefObject<((open: boolean) => void) | null>
  askAssistant: (text: string) => void
}

const Ctx = createContext<SandboxContextValue | null>(null)

export function SandboxProvider({ children }: { children: ReactNode }) {
  const [currentSql, setCurrentSql] = useState("")
  const [currentError, setCurrentError] = useState<string | null>(null)
  const [pendingQuestion, setPendingQuestion] = useState<{ text: string } | null>(null)

  const loadSqlRef = useRef<((sql: string) => void) | null>(null)
  const openAssistantRef = useRef<((open: boolean) => void) | null>(null)

  function loadSql(sql: string) {
    loadSqlRef.current?.(sql)
  }

  function askAssistant(text: string) {
    setPendingQuestion({ text })
    openAssistantRef.current?.(true)
  }

  return (
    <Ctx.Provider
      value={{
        currentSql,
        setCurrentSql,
        currentError,
        setCurrentError,
        pendingQuestion,
        setPendingQuestion,
        loadSqlRef,
        loadSql,
        openAssistantRef,
        askAssistant,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}

export function useSandbox(): SandboxContextValue | null {
  return useContext(Ctx)
}
