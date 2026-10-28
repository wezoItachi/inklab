'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { getLinearNavigationIndex } from '@/lib/keyboard-navigation';
import {
  filterWeaponPickerItems,
  getWeaponPickerFamilies,
  type WeaponPickerItem,
} from '@/lib/weapon-picker';

type WeaponPickerProps = {
  items: readonly WeaponPickerItem[];
  value: string;
  onChange: (id: string) => void;
  title: string;
  description?: string;
  trigger: ReactNode;
  triggerClassName?: string;
  triggerLabel: string;
};

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function WeaponPicker({
  items,
  value,
  onChange,
  title,
  description,
  trigger,
  triggerClassName = '',
  triggerLabel,
}: WeaponPickerProps) {
  const [open, setOpen] = useState(false);
  const [family, setFamily] = useState('全部');
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const titleId = useId();
  const descriptionId = useId();
  const resultsId = useId();
  const families = useMemo(() => getWeaponPickerFamilies(items), [items]);
  const shown = useMemo(
    () => filterWeaponPickerItems(items, family, query),
    [family, items, query],
  );
  const selected = items.find((item) => item.id === value);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const choose = (id: string) => {
    onChange(id);
    close();
  };

  const focusResult = (index: number) => {
    resultRefs.current[index]?.focus();
  };

  const navigateResults = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    if (
      ![
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'End',
        'Home',
      ].includes(event.key)
    )
      return;
    const nextIndex = getLinearNavigationIndex(
      currentIndex,
      event.key as Parameters<typeof getLinearNavigationIndex>[1],
      shown.length,
    );
    if (nextIndex === null) return;
    event.preventDefault();
    focusResult(nextIndex);
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = requestAnimationFrame(() => searchRef.current?.focus());
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ??
          [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [close, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`weapon-picker-trigger ${triggerClassName}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={triggerLabel}
        onClick={() => setOpen(true)}
      >
        {trigger}
        <ChevronDown size={17} />
      </button>
      {open &&
        createPortal(
          <div
            className="weapon-picker-backdrop"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <dialog
              ref={dialogRef}
              open
              className="weapon-picker-dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
            >
              <header>
                <div>
                  <small>WEAPON SELECT</small>
                  <h2 id={titleId}>{title}</h2>
                  <p id={descriptionId}>
                    {description ?? `当前选择：${selected?.name ?? '未选择'}`}
                  </p>
                </div>
                <button
                  type="button"
                  className="weapon-picker-close"
                  aria-label="关闭武器选择"
                  onClick={close}
                >
                  <X size={19} />
                </button>
              </header>
              <div className="weapon-picker-tools">
                <label>
                  <Search size={16} />
                  <span className="visually-hidden">搜索武器</span>
                  <input
                    ref={searchRef}
                    value={query}
                    aria-controls={resultsId}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowDown' && shown.length > 0) {
                        event.preventDefault();
                        focusResult(0);
                      }
                    }}
                    placeholder="搜索武器、种类或标签"
                  />
                </label>
                <b aria-live="polite">
                  {shown.length} / {items.length}
                </b>
              </div>
              <div
                className="weapon-picker-families"
                role="tablist"
                aria-label="武器种类"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={family === '全部'}
                  className={family === '全部' ? 'active' : ''}
                  onClick={() => setFamily('全部')}
                >
                  全部
                </button>
                {families.map((item) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={family === item}
                    className={family === item ? 'active' : ''}
                    onClick={() => setFamily(item)}
                    key={item}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div id={resultsId} className="weapon-picker-results">
                {shown.map((item, index) => (
                  <button
                    ref={(element) => {
                      resultRefs.current[index] = element;
                    }}
                    type="button"
                    className={item.id === value ? 'selected' : ''}
                    aria-pressed={item.id === value}
                    onClick={() => choose(item.id)}
                    onKeyDown={(event) => navigateResults(event, index)}
                    key={item.id}
                  >
                    <span>{item.badge ?? item.name.slice(0, 1)}</span>
                    <div>
                      <b>{item.name}</b>
                      <small>
                        {item.family}
                        {item.meta ? ` · ${item.meta}` : ''}
                      </small>
                      {item.tags?.length ? (
                        <em>{item.tags.join(' · ')}</em>
                      ) : null}
                    </div>
                    {item.id === value ? <Check size={17} /> : null}
                  </button>
                ))}
                {shown.length === 0 ? (
                  <output className="weapon-picker-empty">
                    <b>没有符合条件的武器</b>
                    <span>更换种类或搜索词后再试。</span>
                  </output>
                ) : null}
              </div>
            </dialog>
          </div>,
          document.body,
        )}
    </>
  );
}
