"use client";

type Collection = { id: string; name: string };

type Props = {
  collections: Collection[];
  value: string[];
  onChange: (ids: string[]) => void;
};

export function CollectionSelect({ collections, value, onChange }: Props) {
  if (collections.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No collections yet</p>
    );
  }

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {collections.map((col) => (
        <button
          key={col.id}
          type="button"
          onClick={() => toggle(col.id)}
          className={`flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            value.includes(col.id)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          {col.name}
        </button>
      ))}
    </div>
  );
}
