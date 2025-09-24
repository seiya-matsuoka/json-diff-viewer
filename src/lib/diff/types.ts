export type DiffState = "equal" | "added" | "removed" | "changed";
export type Path = string;

export interface DiffNode {
  path: Path;
  key?: string;
  type: "object" | "array" | "value";
  state: DiffState;
  left?: unknown;
  right?: unknown;
  children?: DiffNode[];
}

export interface DiffOptions {
  epsilon: number;
  keySort: boolean;
}
