import { useJsonStore } from '../stores/jsonStore'

export function DiffInput() {
  const { rawInputLeft, rawInputRight, setRawInputLeft, setRawInputRight } = useJsonStore()

  return (
    <div className="flex gap-0 border-b border-gray-800">
      <div className="flex-1 p-3 border-r border-gray-800">
        <span className="text-xs text-gray-500 font-mono mb-1 block">LEFT (original)</span>
        <textarea
          value={rawInputLeft}
          onChange={(e) => setRawInputLeft(e.target.value)}
          placeholder="Paste original JSON..."
          className="w-full h-32 resize-y rounded bg-gray-900 border border-gray-800 p-2 font-mono text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
          spellCheck={false}
        />
      </div>
      <div className="flex-1 p-3">
        <span className="text-xs text-gray-500 font-mono mb-1 block">RIGHT (modified)</span>
        <textarea
          value={rawInputRight}
          onChange={(e) => setRawInputRight(e.target.value)}
          placeholder="Paste modified JSON..."
          className="w-full h-32 resize-y rounded bg-gray-900 border border-gray-800 p-2 font-mono text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-600"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
