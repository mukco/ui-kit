import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useRef, useState } from "react";
const Ctx = createContext(null);
export function SandboxProvider({ children }) {
    const [currentSql, setCurrentSql] = useState("");
    const [currentError, setCurrentError] = useState(null);
    const [pendingQuestion, setPendingQuestion] = useState(null);
    const loadSqlRef = useRef(null);
    const openAssistantRef = useRef(null);
    function loadSql(sql) {
        loadSqlRef.current?.(sql);
    }
    function askAssistant(text) {
        setPendingQuestion({ text });
        openAssistantRef.current?.(true);
    }
    return (_jsx(Ctx.Provider, { value: {
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
        }, children: children }));
}
export function useSandbox() {
    return useContext(Ctx);
}
