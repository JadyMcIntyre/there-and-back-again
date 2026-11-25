import { useEffect, useEffectEvent, type RefObject } from 'react'

export const shortcuts = {
  palette: { key: 'k', hint: '⌘/Ctrl K', label: 'Open command palette' },
  focus: { key: 'f', hint: 'F', label: 'Focus selected landmark or exhibit' },
  reset: { key: 'r', hint: 'R', label: 'Reset camera' },
  immersive: { key: 'i', hint: 'I', label: 'Toggle immersive mode' },
  atlas: { key: 'm', hint: 'M', label: 'Open atlas' },
  journal: { key: 'j', hint: 'J', label: 'Open journal' },
  bookmark: { key: 'b', hint: 'B', label: 'Return to reading bookmark' },
  help: { key: '?', hint: '?', label: 'Show keyboard shortcuts' },
} as const

export type Shortcut = keyof typeof shortcuts
export type ShortcutActions = Record<Shortcut, () => void>

export function useShortcuts(actions: ShortcutActions, dialog: boolean, worldReady: RefObject<unknown>) {
  const handle = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.repeat || event.altKey) return
    const key = event.shiftKey && event.key === '/' ? '?' : event.key.toLowerCase()
    if (key === 'k' && (event.metaKey || event.ctrlKey) && !event.shiftKey && !dialog) {
      event.preventDefault()
      actions.palette()
      return
    }
    if (dialog || event.metaKey || event.ctrlKey) return
    if (key === 'escape') {
      document.querySelectorAll<HTMLButtonElement>('.hotspot:hover, .hotspot:focus-visible')
        .forEach(button => { button.dataset.dismissed = '' })
      return
    }
    if ((event.target instanceof HTMLElement) &&
      (event.target.isContentEditable || event.target.closest('input, textarea, select, [role="textbox"]'))) return
    const id = (Object.keys(shortcuts) as Shortcut[]).find(name => name !== 'palette' && shortcuts[name].key === key)
    if (!id || (['focus', 'reset', 'immersive'].includes(id) && !worldReady.current)) return
    event.preventDefault()
    actions[id]()
  })
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => handle(event)
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [])
}
