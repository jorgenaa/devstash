"use client";

import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { updateEditorPreferences } from "@/actions/settings";
import {
  DEFAULT_EDITOR_PREFERENCES,
  type EditorPreferences,
} from "@/types/editor-preferences";

type ContextValue = {
  prefs: EditorPreferences;
  updatePref: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => void;
};

const EditorPreferencesContext = createContext<ContextValue>({
  prefs: DEFAULT_EDITOR_PREFERENCES,
  updatePref: () => {},
});

export function EditorPreferencesProvider({
  children,
  initial,
}: {
  children: React.ReactNode;
  initial: EditorPreferences;
}) {
  const [prefs, setPrefs] = useState<EditorPreferences>(initial);

  async function updatePref<K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) {
    const prev = prefs;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    const result = await updateEditorPreferences(next);
    if (result.success) {
      toast.success("Editor preferences saved");
    } else {
      setPrefs(prev);
      toast.error(result.error ?? "Failed to save preferences");
    }
  }

  return (
    <EditorPreferencesContext.Provider value={{ prefs, updatePref }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}
