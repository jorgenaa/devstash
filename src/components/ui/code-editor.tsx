'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Clipboard } from 'lucide-react';
import { toast } from 'sonner';

const MAC_DOTS = ['#ff5f57', '#febc2e', '#28c840'] as const;

type Props = {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
};

export function CodeEditor({ value, onChange, language, readOnly = false }: Props) {
  const [height, setHeight] = useState(120);
  const lang = language?.toLowerCase() || 'plaintext';

  async function handleCopy() {
    if (!value) {
      toast.error('Nothing to copy');
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  }

  return (
    <div className='overflow-hidden rounded-md border border-border'>
      <div className='flex items-center justify-between bg-[#1e1e1e] px-3 py-2'>
        <div className='flex items-center gap-1.5'>
          {MAC_DOTS.map((color) => (
            <span
              key={color}
              className='block size-2.5 rounded-full'
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className='flex items-center gap-2'>
          {language && (
            <span className='text-[11px] text-zinc-500'>{language}</span>
          )}
          <button
            type='button'
            onClick={handleCopy}
            className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200'
          >
            <Clipboard className='size-3' />
            Copy
          </button>
        </div>
      </div>
      <Editor
        value={value}
        language={lang}
        theme='vs-dark'
        height={Math.min(height, 400)}
        options={{
          readOnly,
          fontSize: 12,
          lineHeight: 19,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          padding: { top: 8, bottom: 8 },
          scrollbar: {
            vertical: 'auto',
            horizontal: 'hidden',
            verticalScrollbarSize: 6,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          renderLineHighlight: readOnly ? 'none' : 'line',
          folding: false,
          contextmenu: false,
        }}
        loading={
          <div className='flex h-[120px] items-center justify-center bg-[#1e1e1e] text-xs text-zinc-500'>
            Loading editor…
          </div>
        }
        onMount={(editor) => {
          const update = () => {
            setHeight(Math.max(120, editor.getContentHeight()));
          };
          update();
          editor.onDidContentSizeChange(update);
        }}
        onChange={(val) => onChange?.(val ?? '')}
      />
    </div>
  );
}
