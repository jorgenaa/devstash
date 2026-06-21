'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Clipboard, Crown, Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MAC_DOTS = ['#ff5f57', '#febc2e', '#28c840'] as const;

export type OptimizeState = {
  isPro: boolean;
  onOptimize: () => void;
  optimizing: boolean;
  optimizedPrompt: string | null;
  onAccept: () => void;
  onReject: () => void;
};

type Props = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  optimize?: OptimizeState;
};

export function MarkdownEditor({ value, onChange, readOnly = false, optimize }: Props) {
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
          {optimize ? (
            optimize.isPro ? (
              <button
                type='button'
                onClick={optimize.onOptimize}
                disabled={optimize.optimizing}
                className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200 disabled:opacity-50'
              >
                {optimize.optimizing ? (
                  <Loader2 className='size-3 animate-spin' />
                ) : (
                  <Sparkles className='size-3' />
                )}
                {optimize.optimizing ? 'Optimizing…' : 'Optimize'}
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type='button'
                      disabled
                      className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-600 opacity-60'
                    >
                      <Crown className='size-3' />
                      Optimize
                    </button>
                  }
                />
                <TooltipContent>AI features require Pro subscription</TooltipContent>
              </Tooltip>
            )
          ) : null}
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

      {optimize?.optimizedPrompt && (
        <div className='border-t border-white/10'>
          <div className='flex items-center justify-between bg-[#1e1e1e] px-3 py-2'>
            <span className='text-[11px] font-medium text-zinc-400'>Suggested optimization</span>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={optimize.onAccept}
                className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-emerald-400 transition-colors hover:bg-white/10'
              >
                <Check className='size-3' />
                Accept
              </button>
              <button
                type='button'
                onClick={optimize.onReject}
                className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-300'
              >
                <X className='size-3' />
                Reject
              </button>
            </div>
          </div>
          <div className='max-h-[300px] overflow-y-auto bg-[#1a1a1a] px-4 py-3'>
            <div className='markdown-preview'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimize.optimizedPrompt}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
