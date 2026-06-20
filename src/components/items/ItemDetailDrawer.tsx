'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Check,
  Clipboard,
  Download,
  ExternalLink,
  File,
  Pencil,
  Pin,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { deleteItem, updateItem, toggleItemFavorite, toggleItemPin } from '@/actions/items';
import { generateAutoTags, generateDescription, explainCode } from '@/actions/ai';
import { CollectionSelect } from '@/components/ui/collection-select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CodeEditor, type ExplainState } from '@/components/ui/code-editor';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import type { ItemDetail } from '@/lib/db/items';
import { ItemTypeIcon } from '@/lib/item-type-icons';
import { TEXT_CONTENT_TYPES, LANGUAGE_TYPES, FILE_TYPES, SUPPORTED_LANGUAGES } from '@/lib/item-type-constants';
import { FormField } from '@/components/ui/form-field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ItemDetailResponse = Omit<ItemDetail, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(iso: string) {
  return DATE_FORMATTER.format(new Date(iso));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DrawerSkeleton() {
  return (
    <div className='flex flex-col gap-4 p-4 pt-2'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-5 w-3/4' />
        <div className='flex gap-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-4 w-16' />
        </div>
      </div>
      <Skeleton className='h-px w-full' />
      <div className='flex gap-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className='h-7 w-16' />
        ))}
      </div>
      <Skeleton className='h-px w-full' />
      <div className='flex flex-col gap-3'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-16 w-full' />
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-32 w-full' />
        <Skeleton className='h-4 w-24' />
        <div className='flex gap-2'>
          <Skeleton className='h-5 w-14' />
          <Skeleton className='h-5 w-14' />
          <Skeleton className='h-5 w-14' />
        </div>
      </div>
    </div>
  );
}

type UserCollection = { id: string; name: string };

type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
  collectionIds: string[];
};

function toEditState(item: ItemDetailResponse): EditState {
  return {
    title: item.title,
    description: item.description ?? '',
    content: item.content ?? '',
    url: item.url ?? '',
    language: item.language ?? '',
    tags: item.tags.join(', '),
    collectionIds: item.collections.map((c) => c.id),
  };
}

// ── Action bar ────────────────────────────────────────────────────────────────

type DrawerActionBarProps =
  | {
      editing: true;
      saving: boolean;
      canSave: boolean;
      onSave: () => void;
      onCancel: () => void;
    }
  | {
      editing: false;
      isFavorite: boolean;
      isPinned: boolean;
      toggling: boolean;
      pinning: boolean;
      deleting: boolean;
      itemTitle: string;
      onFavorite: () => void;
      onPin: () => void;
      onCopy: () => void;
      onEdit: () => void;
      onDelete: () => void;
    };

function DrawerActionBar(props: DrawerActionBarProps) {
  if (props.editing) {
    return (
      <div className='flex items-center gap-2 px-4'>
        <Button size='sm' onClick={props.onSave} disabled={props.saving || !props.canSave}>
          <Save className='mr-1 size-3.5' />
          Save
        </Button>
        <Button variant='ghost' size='sm' onClick={props.onCancel} disabled={props.saving}>
          <X className='mr-1 size-3.5' />
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-0.5 px-4'>
      <Button
        variant='ghost'
        size='sm'
        className={props.isFavorite ? 'text-yellow-400 hover:text-yellow-400' : ''}
        onClick={props.onFavorite}
        disabled={props.toggling}
      >
        <Star className={`mr-1 size-3.5 ${props.isFavorite ? 'fill-yellow-400' : ''}`} />
        Favorite
      </Button>
      <Button
        variant='ghost'
        size='sm'
        className={props.isPinned ? 'text-orange-400 hover:text-orange-400' : ''}
        onClick={props.onPin}
        disabled={props.pinning}
      >
        <Pin className={`mr-1 size-3.5 ${props.isPinned ? 'fill-orange-400' : ''}`} />
        {props.isPinned ? 'Unpin' : 'Pin'}
      </Button>
      <Button variant='ghost' size='sm' onClick={props.onCopy}>
        <Clipboard className='mr-1 size-3.5' />
        Copy
      </Button>
      <Button variant='ghost' size='sm' onClick={props.onEdit}>
        <Pencil className='mr-1 size-3.5' />
        Edit
      </Button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant='ghost'
              size='sm'
              aria-label='Delete item'
              className='ml-auto text-destructive hover:text-destructive'
            />
          }
        >
          <Trash2 className='size-3.5' />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{props.itemTitle}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={props.deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={props.onDelete}
              disabled={props.deleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {props.deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── View body ─────────────────────────────────────────────────────────────────

type DrawerViewBodyProps = {
  item: ItemDetailResponse;
  showLanguage: boolean;
  showFile: boolean;
  isImage: boolean;
  downloadUrl: string | null;
  explainState?: ExplainState;
};

function DrawerViewBody({ item, showLanguage, showFile, isImage, downloadUrl, explainState }: DrawerViewBodyProps) {
  return (
    <>
      {item.description && (
        <section className='flex flex-col gap-1.5'>
          <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Description
          </h3>
          <p className='text-sm'>{item.description}</p>
        </section>
      )}

      {showFile && item.fileUrl && (
        <section className='flex flex-col gap-2'>
          <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            {isImage ? 'Image' : 'File'}
          </h3>
          {isImage ? (
            <div className='relative h-64 w-full overflow-hidden rounded-lg'>
              <Image
                src={downloadUrl!}
                alt={item.fileName ?? 'Image'}
                fill
                unoptimized
                className='object-contain'
                sizes='480px'
              />
            </div>
          ) : (
            <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded bg-muted'>
                <File className='size-4 text-muted-foreground' />
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{item.fileName ?? 'File'}</p>
                {item.fileSize != null && (
                  <p className='text-xs text-muted-foreground'>{formatBytes(item.fileSize)}</p>
                )}
              </div>
            </div>
          )}
          {downloadUrl && (
            <a href={downloadUrl} download={item.fileName ?? undefined}>
              <Button variant='outline' size='sm' className='w-full' type='button'>
                <Download className='mr-1.5 size-3.5' />
                Download
              </Button>
            </a>
          )}
        </section>
      )}

      {item.content && (
        <section className='flex flex-col gap-1.5'>
          <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Content
          </h3>
          {showLanguage ? (
            <CodeEditor value={item.content} language={item.language} readOnly explain={explainState} />
          ) : (
            <MarkdownEditor value={item.content} readOnly />
          )}
        </section>
      )}

      {item.url && (
        <section className='flex flex-col gap-1.5'>
          <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            URL
          </h3>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 break-all text-sm text-blue-400 hover:underline'
          >
            {item.url}
            <ExternalLink className='size-3 shrink-0' />
          </a>
        </section>
      )}

      {item.tags.length > 0 && (
        <section className='flex flex-col gap-1.5'>
          <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Tags
          </h3>
          <div className='flex flex-wrap gap-1.5'>
            {item.tags.map((tag) => (
              <Badge key={tag} variant='secondary' className='text-xs'>
                {tag}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {item.collections.length > 0 && (
        <section className='flex flex-col gap-1.5'>
          <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Collections
          </h3>
          <div className='flex flex-wrap gap-1.5'>
            {item.collections.map((col) => (
              <Badge key={col.id} variant='outline' className='text-xs'>
                {col.name}
              </Badge>
            ))}
          </div>
        </section>
      )}

      <section className='flex flex-col gap-2'>
        <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          Details
        </h3>
        <div className='flex flex-col gap-1.5 text-xs text-muted-foreground'>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='size-3' />
              <span>Created</span>
            </div>
            <span>{formatDate(item.createdAt)}</span>
          </div>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='size-3' />
              <span>Updated</span>
            </div>
            <span>{formatDate(item.updatedAt)}</span>
          </div>
        </div>
      </section>
    </>
  );
}

// ── Edit body ─────────────────────────────────────────────────────────────────

type DrawerEditBodyProps = {
  editState: EditState;
  typeName: string;
  showContent: boolean;
  showLanguage: boolean;
  showUrl: boolean;
  collections: UserCollection[];
  isPro: boolean;
  suggestedTags: string[];
  suggesting: boolean;
  generatingDescription: boolean;
  field: (key: keyof EditState, value: string) => void;
  setCollectionIds: (ids: string[]) => void;
  onSuggestTags: () => void;
  onAcceptTag: (tag: string) => void;
  onRejectTag: (tag: string) => void;
  onGenerateDescription: () => void;
};

function DrawerEditBody({
  editState, typeName, showContent, showLanguage, showUrl, collections,
  isPro, suggestedTags, suggesting, generatingDescription,
  field, setCollectionIds, onSuggestTags, onAcceptTag, onRejectTag, onGenerateDescription,
}: DrawerEditBodyProps) {
  return (
    <>
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Description
          </label>
          {isPro && (
            <button
              type='button'
              onClick={onGenerateDescription}
              disabled={generatingDescription}
              className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
            >
              <Sparkles className='size-3' />
              {generatingDescription ? 'Generating…' : 'Generate'}
            </button>
          )}
        </div>
        <Textarea
          value={editState.description}
          onChange={(e) => field('description', e.target.value)}
          rows={3}
          placeholder='Optional description'
          className='resize-none'
        />
      </div>

      {showLanguage && (
        <FormField label='Language'>
          <Select
            value={editState.language || 'plaintext'}
            onValueChange={(v) => field('language', !v || v === 'plaintext' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select language' />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}

      {showContent && (
        <FormField label='Content'>
          {showLanguage ? (
            <CodeEditor
              value={editState.content}
              onChange={(v) => field('content', v)}
              language={editState.language}
            />
          ) : (
            <MarkdownEditor
              value={editState.content}
              onChange={(v) => field('content', v)}
            />
          )}
        </FormField>
      )}

      {showUrl && (
        <FormField label='URL'>
          <Input
            value={editState.url}
            onChange={(e) => field('url', e.target.value)}
            placeholder='https://...'
            type='url'
          />
        </FormField>
      )}

      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
            Tags
          </label>
          {isPro && (
            <button
              type='button'
              onClick={onSuggestTags}
              disabled={suggesting}
              className='flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
            >
              <Sparkles className='size-3' />
              {suggesting ? 'Suggesting…' : 'Suggest Tags'}
            </button>
          )}
        </div>
        <Input
          value={editState.tags}
          onChange={(e) => field('tags', e.target.value)}
          placeholder='react, hooks, typescript'
        />
        <p className='text-[11px] text-muted-foreground'>Comma-separated</p>
        {suggestedTags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {suggestedTags.map((tag) => (
              <span
                key={tag}
                className='flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px]'
              >
                {tag}
                <button
                  type='button'
                  onClick={() => onAcceptTag(tag)}
                  aria-label={`Accept tag ${tag}`}
                  className='text-emerald-500 hover:text-emerald-400'
                >
                  <Check className='size-3' />
                </button>
                <button
                  type='button'
                  onClick={() => onRejectTag(tag)}
                  aria-label={`Reject tag ${tag}`}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <X className='size-3' />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <FormField label='Collections'>
        <CollectionSelect
          collections={collections}
          value={editState.collectionIds}
          onChange={setCollectionIds}
        />
      </FormField>

      <FormField label='Type' hint='Type cannot be changed'>
        <Badge variant='secondary' className='w-fit capitalize'>
          {typeName}
        </Badge>
      </FormField>
    </>
  );
}

// ── Coordinator ───────────────────────────────────────────────────────────────

type DrawerContentProps = {
  item: ItemDetailResponse;
  onItemUpdate: (updated: ItemDetailResponse) => void;
  onDelete: () => void;
  isPro: boolean;
};

function DrawerContent({ item, onItemUpdate, onDelete, isPro }: DrawerContentProps) {
  const router = useRouter();
  const { type } = item;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [editState, setEditState] = useState<EditState>(() => toEditState(item));
  const [availableCollections, setAvailableCollections] = useState<UserCollection[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    setExplanation(null);
  }, [item.id]);

  function field(key: keyof EditState, value: string) {
    setEditState((prev) => ({ ...prev, [key]: value }));
  }

  function setCollectionIds(ids: string[]) {
    setEditState((prev) => ({ ...prev, collectionIds: ids }));
  }

  function handleEdit() {
    setEditState(toEditState(item));
    setEditing(true);
    setSuggestedTags([]);
    if (availableCollections.length === 0) {
      fetch('/api/collections')
        .then((res) => res.ok ? res.json() as Promise<UserCollection[]> : [])
        .then(setAvailableCollections)
        .catch(() => {});
    }
  }

  async function handleGenerateDescription() {
    if (!editState.title.trim()) {
      toast.error('Add a title before generating a description');
      return;
    }
    setGeneratingDescription(true);
    const result = await generateDescription({
      typeName: type.name,
      title: editState.title,
      content: editState.content || undefined,
      url: editState.url || undefined,
    });
    setGeneratingDescription(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    field('description', result.description);
  }

  async function handleSuggestTags() {
    if (!editState.title.trim()) {
      toast.error('Add a title before suggesting tags');
      return;
    }
    setSuggesting(true);
    const result = await generateAutoTags({
      typeName: type.name,
      title: editState.title,
      content: editState.content || undefined,
    });
    setSuggesting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setSuggestedTags(result.tags);
  }

  function acceptTag(tag: string) {
    const existing = editState.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (!existing.includes(tag)) {
      field('tags', [...existing, tag].join(', '));
    }
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  }

  function rejectTag(tag: string) {
    setSuggestedTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleCancel() {
    setEditing(false);
  }

  async function handleExplain() {
    if (!item.content) return;
    setExplaining(true);
    const result = await explainCode({
      typeName: type.name as 'snippet' | 'command',
      title: item.title,
      content: item.content,
    });
    setExplaining(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setExplanation(result.explanation);
  }

  async function handleSave() {
    setSaving(true);
    const tags = editState.tags.split(',').map((t) => t.trim()).filter(Boolean);

    const result = await updateItem(item.id, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      url: editState.url || null,
      language: editState.language || null,
      tags,
      collectionIds: editState.collectionIds,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    onItemUpdate({
      ...result.data,
      createdAt: result.data.createdAt.toISOString(),
      updatedAt: result.data.updatedAt.toISOString(),
    });
    setEditing(false);
    router.refresh();
    toast.success('Item saved');
  }

  async function handlePin() {
    setPinning(true);
    const result = await toggleItemPin(item.id);
    setPinning(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    onItemUpdate({ ...item, isPinned: result.isPinned });
    toast.success(result.isPinned ? 'Pinned' : 'Unpinned');
    router.refresh();
  }

  async function handleFavorite() {
    setToggling(true);
    const result = await toggleItemFavorite(item.id);
    setToggling(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    onItemUpdate({ ...item, isFavorite: result.isFavorite });
    toast.success(result.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteItem(item.id);
    setDeleting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success('Item deleted');
    router.refresh();
    onDelete();
  }

  async function handleCopy() {
    const text = item.content ?? item.url ?? '';
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  }

  const showContent = (TEXT_CONTENT_TYPES as readonly string[]).includes(type.name);
  const showLanguage = (LANGUAGE_TYPES as readonly string[]).includes(type.name);
  const showUrl = type.name === 'link';
  const showFile = (FILE_TYPES as readonly string[]).includes(type.name);
  const isImage = type.name === 'image';
  const downloadUrl = item.fileUrl ? `/api/download/${item.fileUrl}` : null;

  return (
    <>
      <SheetHeader className='gap-2 pr-10'>
        <div className='flex items-center gap-2'>
          <div
            className='flex size-7 shrink-0 items-center justify-center rounded'
            style={{ backgroundColor: `${type.color}20` }}
          >
            <ItemTypeIcon name={type.icon} className='size-3.5' style={{ color: type.color }} />
          </div>
          {editing ? (
            <Input
              value={editState.title}
              onChange={(e) => field('title', e.target.value)}
              className='h-7 text-sm font-semibold'
              placeholder='Title'
            />
          ) : (
            <SheetTitle className='truncate text-base'>{item.title}</SheetTitle>
          )}
        </div>
        {!editing && (
          <div className='flex flex-wrap gap-1.5'>
            <Badge variant='secondary' className='capitalize'>{type.name}</Badge>
            {item.language && <Badge variant='secondary'>{item.language}</Badge>}
          </div>
        )}
      </SheetHeader>

      <Separator />

      {editing ? (
        <DrawerActionBar
          editing
          saving={saving}
          canSave={!!editState.title.trim()}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <DrawerActionBar
          editing={false}
          isFavorite={item.isFavorite}
          isPinned={item.isPinned}
          toggling={toggling}
          pinning={pinning}
          deleting={deleting}
          itemTitle={item.title}
          onFavorite={handleFavorite}
          onPin={handlePin}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Separator />

      <div className='flex flex-col gap-5 overflow-y-auto px-4 pb-6'>
        {editing ? (
          <DrawerEditBody
            editState={editState}
            typeName={type.name}
            showContent={showContent}
            showLanguage={showLanguage}
            showUrl={showUrl}
            collections={availableCollections}
            isPro={isPro}
            suggestedTags={suggestedTags}
            suggesting={suggesting}
            generatingDescription={generatingDescription}
            field={field}
            setCollectionIds={setCollectionIds}
            onSuggestTags={handleSuggestTags}
            onAcceptTag={acceptTag}
            onRejectTag={rejectTag}
            onGenerateDescription={handleGenerateDescription}
          />
        ) : (
          <DrawerViewBody
            item={item}
            showLanguage={showLanguage}
            showFile={showFile}
            isImage={isImage}
            downloadUrl={downloadUrl}
            explainState={showLanguage ? {
              isPro,
              onExplain: handleExplain,
              explaining,
              explanation,
            } : undefined}
          />
        )}
      </div>
    </>
  );
}

type Props = {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPro?: boolean;
};

export function ItemDetailDrawer({ itemId, open, onOpenChange, isPro = false }: Props) {
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const loading = open && !!itemId && item?.id !== itemId;

  useEffect(() => {
    if (!open || !itemId) return;

    let active = true;

    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load item');
        return res.json() as Promise<ItemDetailResponse>;
      })
      .then((data) => {
        if (active) setItem(data);
      })
      .catch(() => toast.error('Failed to load item'));

    return () => {
      active = false;
    };
  }, [open, itemId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 p-0 sm:max-w-120'
      >
        {loading || !item ? (
          <DrawerSkeleton />
        ) : (
          <DrawerContent
            item={item}
            onItemUpdate={setItem}
            onDelete={() => onOpenChange(false)}
            isPro={isPro}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
