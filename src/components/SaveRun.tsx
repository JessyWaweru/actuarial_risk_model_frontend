import { useState } from 'react'
import { api } from '../api/client'
import { Button, TextInput } from './ui'

export function SaveRun({ kind, input, result }: { kind: string; input: unknown; result: unknown }) {
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function handleSave() {
    if (!name.trim()) return
    setStatus('saving')
    try {
      await api.runs.create(kind, name.trim(), input, result)
      setStatus('saved')
      setName('')
      setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <TextInput value={name} onChange={setName} placeholder="Name this run to save it" />
      <Button variant="secondary" onClick={handleSave} disabled={!name.trim() || status === 'saving'}>
        {status === 'saved' ? 'Saved ✓' : status === 'saving' ? 'Saving…' : 'Save run'}
      </Button>
      {status === 'error' && <span className="text-xs text-red-400">Failed to save</span>}
    </div>
  )
}
