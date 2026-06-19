export const TEXT_CONTENT_TYPES = ["snippet", "prompt", "command", "note"] as const;
export const LANGUAGE_TYPES = ["snippet", "command"] as const;
export const FILE_TYPES = ["file", "image"] as const;

export type TextContentType = (typeof TEXT_CONTENT_TYPES)[number];
export type LanguageType = (typeof LANGUAGE_TYPES)[number];
export type FileType = (typeof FILE_TYPES)[number];

export const SUPPORTED_LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "bash", label: "Bash / Shell" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "csharp", label: "C#" },
  { value: "css", label: "CSS" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "go", label: "Go" },
  { value: "html", label: "HTML" },
  { value: "java", label: "Java" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "kotlin", label: "Kotlin" },
  { value: "markdown", label: "Markdown" },
  { value: "php", label: "PHP" },
  { value: "python", label: "Python" },
  { value: "ruby", label: "Ruby" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
  { value: "swift", label: "Swift" },
  { value: "toml", label: "TOML" },
  { value: "typescript", label: "TypeScript" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
] as const;
