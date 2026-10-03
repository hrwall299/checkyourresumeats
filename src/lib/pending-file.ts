// Hands a file picked on another page to the /check page (in-memory only, never persisted).
let pending: File | null = null;
export const setPendingFile = (f: File | null) => { pending = f; };
export const takePendingFile = () => { const f = pending; pending = null; return f; };
