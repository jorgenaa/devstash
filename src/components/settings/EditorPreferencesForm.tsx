"use client";

import { useEditorPreferences } from "@/contexts/editor-preferences-context";
import {
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
} from "@/types/editor-preferences";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function EditorPreferencesForm() {
  const { prefs, updatePref } = useEditorPreferences();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="font-size">Font Size</Label>
          <p className="text-xs text-muted-foreground">Editor font size in pixels</p>
        </div>
        <Select
          value={String(prefs.fontSize)}
          onValueChange={(v) => updatePref("fontSize", Number(v))}
        >
          <SelectTrigger id="font-size" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="tab-size">Tab Size</Label>
          <p className="text-xs text-muted-foreground">Number of spaces per tab</p>
        </div>
        <Select
          value={String(prefs.tabSize)}
          onValueChange={(v) => updatePref("tabSize", Number(v))}
        >
          <SelectTrigger id="tab-size" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="theme">Theme</Label>
          <p className="text-xs text-muted-foreground">Code editor color theme</p>
        </div>
        <Select
          value={prefs.theme}
          onValueChange={(v) =>
            updatePref("theme", v as (typeof THEME_OPTIONS)[number]["value"])
          }
        >
          <SelectTrigger id="theme" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="word-wrap">Word Wrap</Label>
          <p className="text-xs text-muted-foreground">Wrap long lines in the editor</p>
        </div>
        <Switch
          id="word-wrap"
          checked={prefs.wordWrap}
          onCheckedChange={(checked) => updatePref("wordWrap", checked)}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="minimap">Minimap</Label>
          <p className="text-xs text-muted-foreground">Show code overview on the right</p>
        </div>
        <Switch
          id="minimap"
          checked={prefs.minimap}
          onCheckedChange={(checked) => updatePref("minimap", checked)}
        />
      </div>
    </div>
  );
}
