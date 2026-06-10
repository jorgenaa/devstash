'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Clipboard,
  Download,
  ExternalLink,
  File,
  Pencil,
  Pin,
  Save,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { deleteItem, updateItem } from '@/actions/items';
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
import { CodeEditor } from '@/components/ui/code-editor';
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

const TEXT_CONTENT_TYPES = ['snippet', 'prompt', 'command', 'note'];
const LANGUAGE_TYPES = ['snippet', 'command'];
const FILE_TYPES = ['file', 'image'];

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

type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

function toEditState(item: ItemDetailResponse): EditState {
  return {
    title: item.title,
    description: item.description ?? '',
    content: item.content ?? '',
    url: item.url ?? '',
    language: item.language ?? '',
    tags: item.tags.join(', '),
  };
}

type DrawerContentProps = {
  item: ItemDetailResponse;
  onItemUpdate: (updated: ItemDetailResponse) => void;
  onDelete: () => void;
};

function DrawerContent({ item, onItemUpdate, onDelete }: DrawerContentProps) {
  const router = useRouter();
  const { type } = item;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editState, setEditState] = useState<EditState>(() =>
    toEditState(item),
  );

  function handleEdit() {
    setEditState(toEditState(item));
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    const tags = editState.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      url: editState.url || null,
      language: editState.language || null,
      tags,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const updated: ItemDetailResponse = {
      ...result.data,
      createdAt: result.data.createdAt.toISOString(),
      updatedAt: result.data.updatedAt.toISOString(),
    };

    onItemUpdate(updated);
    setEditing(false);
    router.refresh();
    toast.success('Item saved');
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

  function field(key: keyof EditState, value: string) {
    setEditState((prev) => ({ ...prev, [key]: value }));
  }

  const showContent = TEXT_CONTENT_TYPES.includes(type.name);
  const showLanguage = LANGUAGE_TYPES.includes(type.name);
  const showUrl = type.name === 'link';
  const showFile = FILE_TYPES.includes(type.name);
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
            <ItemTypeIcon
              name={type.icon}
              className='size-3.5'
              style={{ color: type.color }}
            />
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
            <Badge variant='secondary' className='capitalize'>
              {type.name}
            </Badge>
            {item.language && (
              <Badge variant='secondary'>{item.language}</Badge>
            )}
          </div>
        )}
      </SheetHeader>

      <Separator />

      {editing ? (
        <div className='flex items-center gap-2 px-4'>
          <Button
            size='sm'
            onClick={handleSave}
            disabled={saving || !editState.title.trim()}
          >
            <Save className='mr-1 size-3.5' />
            Save
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleCancel}
            disabled={saving}
          >
            <X className='mr-1 size-3.5' />
            Cancel
          </Button>
        </div>
      ) : (
        <div className='flex items-center gap-0.5 px-4'>
          <Button
            variant='ghost'
            size='sm'
            className={
              item.isFavorite ? 'text-yellow-400 hover:text-yellow-400' : ''
            }
          >
            <Star
              className={`mr-1 size-3.5 ${item.isFavorite ? 'fill-yellow-400' : ''}`}
            />
            Favorite
          </Button>
          <Button variant='ghost' size='sm'>
            <Pin className='mr-1 size-3.5' />
            Pin
          </Button>
          <Button variant='ghost' size='sm' onClick={handleCopy}>
            <Clipboard className='mr-1 size-3.5' />
            Copy
          </Button>
          <Button variant='ghost' size='sm' onClick={handleEdit}>
            <Pencil className='mr-1 size-3.5' />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant='ghost'
                  size='sm'
                  className='ml-auto text-destructive hover:text-destructive'
                />
              }
            >
              <Trash2 className='size-3.5' />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete &quot;{item.title}&quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this item. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <Separator />

      <div className='flex flex-col gap-5 overflow-y-auto px-4 pb-6'>
        {editing ? (
          <>
            <section className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Description
              </label>
              <Textarea
                value={editState.description}
                onChange={(e) => field('description', e.target.value)}
                rows={3}
                placeholder='Optional description'
                className='resize-none'
              />
            </section>

            {showContent && (
              <section className='flex flex-col gap-1.5'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Content
                </label>
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
              </section>
            )}

            {showUrl && (
              <section className='flex flex-col gap-1.5'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  URL
                </label>
                <Input
                  value={editState.url}
                  onChange={(e) => field('url', e.target.value)}
                  placeholder='https://...'
                  type='url'
                />
              </section>
            )}

            {showLanguage && (
              <section className='flex flex-col gap-1.5'>
                <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  Language
                </label>
                <Input
                  value={editState.language}
                  onChange={(e) => field('language', e.target.value)}
                  placeholder='e.g. typescript'
                />
              </section>
            )}

            <section className='flex flex-col gap-1.5'>
              <label className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Tags
              </label>
              <Input
                value={editState.tags}
                onChange={(e) => field('tags', e.target.value)}
                placeholder='react, hooks, typescript'
              />
              <p className='text-[11px] text-muted-foreground'>
                Comma-separated
              </p>
            </section>

            <section className='flex flex-col gap-1.5'>
              <h3 className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Type
              </h3>
              <Badge variant='secondary' className='w-fit capitalize'>
                {type.name}
              </Badge>
              <p className='text-[11px] text-muted-foreground'>
                Type cannot be changed
              </p>
            </section>
          </>
        ) : (
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
                      <p className='truncate text-sm font-medium'>
                        {item.fileName ?? 'File'}
                      </p>
                      {item.fileSize != null && (
                        <p className='text-xs text-muted-foreground'>
                          {formatBytes(item.fileSize)}
                        </p>
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
                  <CodeEditor value={item.content} language={item.language} readOnly />
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
        )}
      </div>
    </>
  );
}

type Props = {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ItemDetailDrawer({ itemId, open, onOpenChange }: Props) {
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
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
