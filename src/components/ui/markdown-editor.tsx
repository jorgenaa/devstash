'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clipboard } from 'lucide-react';
import { toast } from 'sonner';

const MAC_DOTS = ['#ff5f57', '#febc2e', '#28c840'] as const;

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
};

export function MarkdownEditor({ value, onChange, readOnly = false }: Props) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const showPreview = readOnly || tab === 'preview';

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
          {!readOnly && (
            <div className='flex items-center gap-0.5'>
              <button
                type='button'
                onClick={() => setTab('write')}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  tab === 'write'
                    ? 'bg-white/20 text-zinc-200'
                    : 'text-zinc-500 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >
                Write
              </button>
              <button
                type='button'
                onClick={() => setTab('preview')}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  tab === 'preview'
                    ? 'bg-white/20 text-zinc-200'
                    : 'text-zinc-500 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >
                Preview
              </button>
            </div>
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

      {showPreview ? (
        <div className='max-h-[400px] min-h-[120px] overflow-y-auto bg-[#1e1e1e] px-4 py-3'>
          {value ? (
            <div className='markdown-preview'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className='text-xs text-zinc-600'>Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder='Write markdown here…'
          className='min-h-[120px] max-h-[400px] w-full resize-y bg-[#1e1e1e] px-4 py-3 font-mono text-xs text-zinc-200 outline-none placeholder:text-zinc-600'
        />
      )}
    </div>
  );
}
