'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

type ToolbarButton = {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  isActive: () => boolean;
};

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable h1 — h1 is reserved for the article title outside the editor
        heading: {
          levels: [2, 3, 4],
        },
        // Keep all other defaults (bold, italic, bulletList, orderedList, etc.)
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[280px] px-4 py-3 text-sm text-gray-800 outline-none leading-relaxed focus:outline-none',
      },
    },
  });

  // Sync external initial value once (for edit mode where initialData is loaded
  // asynchronously and value may arrive after editor has mounted).
  useEffect(() => {
    if (!editor) return;
    // Only reset if the editor is empty and value has actual content
    const currentHTML = editor.getHTML();
    if (value && value !== '<p></p>' && currentHTML !== value) {
      editor.commands.setContent(value, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const toolbarButtons: ToolbarButton[] = [
    {
      label: 'Bold',
      icon: <Bold size={15} />,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive('bold'),
    },
    {
      label: 'Italic',
      icon: <Italic size={15} />,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive('italic'),
    },
    {
      label: 'Heading 2',
      icon: <Heading2 size={15} />,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive('heading', { level: 2 }),
    },
    {
      label: 'Heading 3',
      icon: <Heading3 size={15} />,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive('heading', { level: 3 }),
    },
    {
      label: 'Bullet List',
      icon: <List size={15} />,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive('bulletList'),
    },
    {
      label: 'Numbered List',
      icon: <ListOrdered size={15} />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive('orderedList'),
    },
  ];

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-blue focus-within:border-transparent transition">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50 flex-wrap">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            aria-label={btn.label}
            title={btn.label}
            onClick={btn.action}
            className={`p-1.5 rounded-lg transition text-sm font-medium ${
              btn.isActive()
                ? 'bg-brand-blue text-white'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
