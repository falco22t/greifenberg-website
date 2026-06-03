'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import {
  Bold, Italic, Strikethrough, Underline as UnderlineIcon,
  List, ListOrdered, Quote, Code, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Link2, Highlighter,
  Undo, Redo, Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  content?: string
  onChange: (html: string) => void
  placeholder?: string
  maxLength?: number
}

function ToolbarBtn({
  onClick, active = false, disabled = false, title, children,
}: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-1.5 rounded-lg transition-all text-slate-400 hover:text-white hover:bg-white/8 disabled:opacity-30 disabled:cursor-not-allowed',
        active && 'bg-brand/20 text-brand-light'
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-0.5" />
}

export default function RichEditor({ content = '', onChange, placeholder = 'Inhalt schreiben…', maxLength = 50000 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-brand-light underline' } }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ HTMLAttributes: { class: 'bg-brand/20 text-white rounded px-0.5' } }),
    ],
    content,
    onCreate: ({ editor }) => {
      // Initial content direkt an Parent melden
      const html = editor.getHTML()
      if (html && html !== '<p></p>') onChange(html)
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] px-5 py-4 text-slate-300 leading-relaxed',
      },
    },
  })

  if (!editor) return null

  const addLink = () => {
    const url = prompt('URL eingeben:')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  const char = editor.storage.characterCount?.characters?.() ?? 0

  return (
    <div className="glass rounded-xl border border-white/8 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-white/6 bg-surface-2/50">
        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Rückgängig"><Undo className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Wiederholen"><Redo className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Überschrift 2"><Heading2 className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Überschrift 3"><Heading3 className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Format */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Fett"><Bold className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Kursiv"><Italic className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Unterstrichen"><UnderlineIcon className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Durchgestrichen"><Strikethrough className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Markieren"><Highlighter className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Aufzählung"><List className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Nummerierte Liste"><ListOrdered className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Zitat"><Quote className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code-Block"><Code className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Align */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Links"><AlignLeft className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Zentriert"><AlignCenter className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Rechts"><AlignRight className="w-3.5 h-3.5" /></ToolbarBtn>

        <Divider />

        {/* Extras */}
        <ToolbarBtn onClick={addLink} active={editor.isActive('link')} title="Link einfügen"><Link2 className="w-3.5 h-3.5" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Trennlinie"><Minus className="w-3.5 h-3.5" /></ToolbarBtn>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Footer */}
      <div className="px-5 py-2 border-t border-white/6 flex justify-end">
        <span className={cn('text-xs', char > maxLength * 0.9 ? 'text-amber-400' : 'text-slate-600')}>
          {char.toLocaleString()} / {maxLength.toLocaleString()} Zeichen
        </span>
      </div>
    </div>
  )
}
