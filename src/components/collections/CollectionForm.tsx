"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CollectionFormData = { name: string; description: string };

type Props = {
  form: CollectionFormData;
  onChange: (form: CollectionFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
  savingLabel: string;
};

export function CollectionForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  saving,
  submitLabel,
  savingLabel,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <FormField label="Name" required>
          <Input
            placeholder="e.g. React Patterns"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && form.name.trim()) onSubmit();
            }}
            autoFocus
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            placeholder="What's this collection for? (optional)"
            rows={3}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSubmit} disabled={!form.name.trim() || saving}>
          {saving ? savingLabel : submitLabel}
        </Button>
      </div>
    </>
  );
}
