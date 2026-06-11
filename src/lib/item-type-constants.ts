export const TEXT_CONTENT_TYPES = ["snippet", "prompt", "command", "note"] as const;
export const LANGUAGE_TYPES = ["snippet", "command"] as const;
export const FILE_TYPES = ["file", "image"] as const;

export type TextContentType = (typeof TEXT_CONTENT_TYPES)[number];
export type LanguageType = (typeof LANGUAGE_TYPES)[number];
export type FileType = (typeof FILE_TYPES)[number];
