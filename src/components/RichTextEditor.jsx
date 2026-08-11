import { useRef, useEffect } from 'react'
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

export default function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  function exec(command, val = null) {
    document.execCommand(command, false, val)
    editorRef.current.focus()
    onChange(editorRef.current.innerHTML)
  }

  function handleInput() {
    onChange(editorRef.current.innerHTML)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200 items-center">
        <button type="button" onClick={() => exec('bold')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Bold">
          <Bold size={16} />
        </button>
        <button type="button" onClick={() => exec('italic')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Italic">
          <Italic size={16} />
        </button>
        <button type="button" onClick={() => exec('underline')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Underline">
          <Underline size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" onClick={() => exec('formatBlock', 'H1')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700 font-bold text-xs" title="Heading 1">
          H1
        </button>
        <button type="button" onClick={() => exec('formatBlock', 'H2')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700 font-bold text-xs" title="Heading 2">
          H2
        </button>
        <button type="button" onClick={() => exec('formatBlock', 'P')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700 font-bold text-xs" title="Paragraph">
          P
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" onClick={() => exec('justifyLeft')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Align Left">
          <AlignLeft size={16} />
        </button>
        <button type="button" onClick={() => exec('justifyCenter')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Align Center">
          <AlignCenter size={16} />
        </button>
        <button type="button" onClick={() => exec('justifyRight')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Align Right">
          <AlignRight size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Bullet List">
          <List size={16} />
        </button>
        <button type="button" onClick={() => exec('insertOrderedList')} className="p-1.5 hover:bg-gray-100 rounded text-slate-700" title="Number List">
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <select 
          onChange={(e) => exec('fontName', e.target.value)} 
          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1 text-slate-700 outline-none"
          title="Font Family"
        >
          <option value="Inter, sans-serif">Default Font</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Courier New, monospace">Courier</option>
        </select>
      </div>
      
      {/* Editor Area */}
      <div 
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        className="p-4 min-h-[300px] prose prose-sm max-w-none outline-none"
      />
    </div>
  )
}
