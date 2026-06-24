import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import { TextStyle, FontSize } from '@tiptap/extension-text-style'
import { useEffect } from 'react'

// Props: { content, onChange, onEditorReady }
// content → TipTap JSON object (from DB), can be null/empty on first load
// onChange → called with updated JSON on every change (debounce handled by parent)
// onEditorReady → called with the editor instance once it's initialized
export default function TipTapEditor({ content, onChange, onEditorReady }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: {
          openOnClick: true,
          autolink: true,
          defaultProtocol: 'https',
          HTMLAttributes: {
            target: '_blank',
            rel: 'noopener noreferrer nofollow',
            class: 'tiptap-link',
          },
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your research...',
      }),
      Typography,
      CharacterCount,
      TextStyle,
      FontSize,
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor focus:outline-none',
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON())
    },
  })

  // Expose the editor instance to the parent (for the toolbar)
  useEffect(() => {
    if (editor) onEditorReady?.(editor)
  }, [editor, onEditorReady])

  // Sync content if it changes externally (e.g. initial load from DB)
  useEffect(() => {
    if (editor && content && Object.keys(content).length > 0) {
      // Only set if editor is empty (first load) to avoid cursor jump.
      // emitUpdate:false so loading from the DB doesn't trigger a save.
      if (editor.isEmpty) {
        editor.commands.setContent(content, { emitUpdate: false })
      }
    }
  }, [editor, content])

  const wordCount = editor?.storage.characterCount.words() ?? 0

  return (
    <div className="w-full">
      <EditorContent editor={editor} className="w-full" />
      <div className="mt-8 text-right text-[12px] text-[#4a4a5a]">
        {wordCount} {wordCount === 1 ? 'word' : 'words'}
      </div>
    </div>
  )
}
