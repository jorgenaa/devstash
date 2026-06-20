'use client';

import { useEffect, useState } from 'react';
import Editor, { type Monaco } from '@monaco-editor/react';
import { Clipboard, Crown, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEditorPreferences } from '@/contexts/editor-preferences-context';
import { SUPPORTED_LANGUAGES } from '@/lib/item-type-constants';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const MAC_DOTS = ['#ff5f57', '#febc2e', '#28c840'] as const;

function defineCustomThemes(monaco: Monaco) {
  monaco.editor.defineTheme('monokai', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'f92672' },
      { token: 'string', foreground: 'e6db74' },
      { token: 'number', foreground: 'ae81ff' },
      { token: 'type', foreground: '66d9ef', fontStyle: 'italic' },
      { token: 'class', foreground: 'a6e22e' },
      { token: 'function', foreground: 'a6e22e' },
      { token: 'variable', foreground: 'f8f8f2' },
      { token: 'operator', foreground: 'f92672' },
    ],
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'editor.lineHighlightBackground': '#3e3d3280',
      'editor.selectionBackground': '#49483e',
      'editorLineNumber.foreground': '#75715e',
      'editorCursor.foreground': '#f8f8f0',
    },
  });

  monaco.editor.defineTheme('github-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'ff7b72' },
      { token: 'string', foreground: 'a5d6ff' },
      { token: 'number', foreground: '79c0ff' },
      { token: 'type', foreground: 'ff7b72' },
      { token: 'class', foreground: 'f0883e' },
      { token: 'function', foreground: 'd2a8ff' },
      { token: 'variable', foreground: 'ffa657' },
      { token: 'operator', foreground: 'ff7b72' },
    ],
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'editor.lineHighlightBackground': '#161b2280',
      'editor.selectionBackground': '#264f78',
      'editorLineNumber.foreground': '#8b949e',
      'editorCursor.foreground': '#c9d1d9',
    },
  });
}

export type ExplainState = {
  isPro: boolean;
  onExplain: () => void;
  explaining: boolean;
  explanation: string | null;
};

type Props = {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
  explain?: ExplainState;
};

export function CodeEditor({ value, onChange, language, readOnly = false, explain }: Props) {
  const [height, setHeight] = useState(120);
  const [activeTab, setActiveTab] = useState<'code' | 'explain'>('code');
  const { prefs } = useEditorPreferences();
  const lang = language?.toLowerCase() || 'plaintext';
  const langLabel = SUPPORTED_LANGUAGES.find((l) => l.value === lang)?.label;

  useEffect(() => {
    if (explain?.explanation) {
      setActiveTab('explain');
    } else {
      setActiveTab('code');
    }
  }, [explain?.explanation]);

  async function handleCopy() {
    if (!value) {
      toast.error('Nothing to copy');
      return;
    }
    await navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  }

  const showTabs = !!explain?.explanation;

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
          {langLabel && langLabel !== 'Plain Text' && (
            <span className='text-[11px] text-zinc-500'>{langLabel}</span>
          )}
          {showTabs ? (
            <div className='flex items-center rounded border border-white/10'>
              <button
                type='button'
                onClick={() => setActiveTab('code')}
                className={`rounded-l px-2 py-0.5 text-[11px] transition-colors ${
                  activeTab === 'code'
                    ? 'bg-white/15 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Code
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('explain')}
                className={`rounded-r px-2 py-0.5 text-[11px] transition-colors ${
                  activeTab === 'explain'
                    ? 'bg-white/15 text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Explain
              </button>
            </div>
          ) : explain ? (
            explain.isPro ? (
              <button
                type='button'
                onClick={explain.onExplain}
                disabled={explain.explaining}
                className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200 disabled:opacity-50'
              >
                {explain.explaining ? (
                  <Loader2 className='size-3 animate-spin' />
                ) : (
                  <Sparkles className='size-3' />
                )}
                {explain.explaining ? 'Explaining…' : 'Explain'}
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
                      Explain
                    </button>
                  }
                />
                <TooltipContent>AI features require Pro subscription</TooltipContent>
              </Tooltip>
            )
          ) : null}
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
      {activeTab === 'explain' && explain?.explanation ? (
        <div className='markdown-preview overflow-y-auto bg-[#1e1e1e] px-4 py-3 text-sm text-zinc-200'>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{explain.explanation}</ReactMarkdown>
        </div>
      ) : (
        <Editor
          value={value}
          language={lang}
          theme={prefs.theme}
          height={Math.min(height, 400)}
          options={{
            readOnly,
            fontSize: prefs.fontSize,
            tabSize: prefs.tabSize,
            lineHeight: Math.round(prefs.fontSize * 1.6),
            minimap: { enabled: prefs.minimap },
            scrollBeyondLastLine: false,
            wordWrap: prefs.wordWrap ? 'on' : 'off',
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
            <div className='flex h-30 items-center justify-center bg-[#1e1e1e] text-xs text-zinc-500'>
              Loading editor…
            </div>
          }
          beforeMount={defineCustomThemes}
          onMount={(editor) => {
            const update = () => {
              setHeight(Math.max(120, editor.getContentHeight()));
            };
            update();
            editor.onDidContentSizeChange(update);
          }}
          onChange={(val) => onChange?.(val ?? '')}
        />
      )}
    </div>
  );
}
