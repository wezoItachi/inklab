export type ClipboardWriter = {
  writeText: (text: string) => Promise<void>;
};

type CopyTextOptions = {
  clipboard?: ClipboardWriter | null;
  fallback?: (text: string) => boolean;
};

function browserClipboard(): ClipboardWriter | null {
  return typeof navigator === 'undefined'
    ? null
    : (navigator.clipboard ?? null);
}

function legacyCopyText(text: string) {
  if (typeof document === 'undefined') return false;
  const activeElement =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.readOnly = true;
  textarea.tabIndex = -1;
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    // oxlint-disable-next-line typescript/no-deprecated -- Intentional fallback for browsers that deny the modern Clipboard API.
    return document.execCommand('copy');
  } finally {
    textarea.remove();
    activeElement?.focus({ preventScroll: true });
  }
}

export async function copyTextToClipboard(
  text: string,
  options: CopyTextOptions = {},
) {
  const clipboard =
    'clipboard' in options ? options.clipboard : browserClipboard();
  if (clipboard) {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Permission-denied and embedded browsers can still support the legacy path.
    }
  }
  return (options.fallback ?? legacyCopyText)(text);
}
