'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

export interface ComboboxOption {
    value: string;
    label: string;
    /** Secondary text shown under the label and matched by search (e.g. a package name). */
    hint?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Lets the user keep text that matches no option, e.g. a package that is not in the list. */
    allowCustom?: boolean;
}

// Rendering hundreds of installed apps at once makes the list slow to scroll; typing narrows it.
const MAX_VISIBLE = 100;

export default function Combobox({ options, value, onChange, placeholder, allowCustom = false }: ComboboxProps) {
    const id = useId();
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    // null means the user has not typed since opening, so the input shows the current selection.
    const [query, setQuery] = useState<string | null>(null);
    const [active, setActive] = useState(0);

    const selectedText = options.find((o) => o.value === value)?.label ?? value;
    const typed = (query ?? '').trim();
    const search = typed.toLowerCase();

    const matches = useMemo(() => {
        if (!search) return options;
        const words = search.split(/\s+/);
        return options.filter((o) => {
            const haystack = `${o.label} ${o.hint ?? ''} ${o.value}`.toLowerCase();
            return words.every((w) => haystack.includes(w));
        });
    }, [options, search]);

    const visible = matches.slice(0, MAX_VISIBLE);
    const showCustom =
        allowCustom && typed !== '' && !options.some((o) => o.value.toLowerCase() === search);
    // The custom row comes last so Enter picks a real match first when there is one.
    const rowCount = visible.length + (showCustom ? 1 : 0);

    useEffect(() => {
        if (!open) return;
        listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [open, active]);

    const close = () => {
        setOpen(false);
        setQuery(null);
    };

    const choose = (next: string) => {
        onChange(next);
        close();
    };

    const pick = (index: number) => {
        if (index < visible.length) choose(visible[index].value);
        else if (showCustom) choose(typed);
    };

    // Leaving the field with text typed must not silently drop it: with allowCustom the text
    // becomes the value, otherwise the form would submit the old value while showing new text.
    const commitAndClose = () => {
        if (query !== null && allowCustom && typed) {
            const known = options.find(
                (o) => o.value.toLowerCase() === search || o.label.toLowerCase() === search
            );
            onChange(known ? known.value : typed);
        }
        close();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!open) setOpen(true);
                else setActive((i) => Math.min(i + 1, Math.max(rowCount - 1, 0)));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
                break;
            case 'Enter':
                // While the list is open, Enter picks a row instead of submitting the form.
                if (open) {
                    e.preventDefault();
                    pick(active);
                }
                break;
            case 'Escape':
                if (open) {
                    e.preventDefault();
                    close();
                }
                break;
            case 'Tab':
                commitAndClose();
                break;
        }
    };

    const rowClass = (index: number) =>
        `flex items-center justify-between gap-2 px-3 py-2 cursor-pointer text-gray-900 dark:text-gray-100 ${
            index === active ? 'bg-rose-50 dark:bg-rose-900/30' : ''
        }`;

    return (
        <div
            className="relative"
            onBlur={(e) => {
                // Focus moving to the clear button or a row stays inside; only leaving counts.
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) commitAndClose();
            }}
        >
            <input
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={`${id}-list`}
                aria-autocomplete="list"
                aria-activedescendant={open && rowCount > 0 ? `${id}-opt-${active}` : undefined}
                autoComplete="off"
                value={query ?? selectedText}
                placeholder={placeholder}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                    setOpen(true);
                }}
                onFocus={(e) => {
                    setOpen(true);
                    e.target.select();
                }}
                onClick={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-3 pr-16 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 dark:bg-gray-700 dark:text-white text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
                {value && (
                    <button
                        type="button"
                        aria-label="Clear selection"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => choose('')}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {open && (
                <ul
                    id={`${id}-list`}
                    ref={listRef}
                    role="listbox"
                    className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-lg py-1 text-sm"
                >
                    {visible.map((o, i) => (
                        <li
                            key={o.value}
                            id={`${id}-opt-${i}`}
                            role="option"
                            aria-selected={o.value === value}
                            data-index={i}
                            // Keeps focus in the input so the blur handler does not fire before the click lands.
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(o.value)}
                            onMouseEnter={() => setActive(i)}
                            className={rowClass(i)}
                        >
                            <div className="min-w-0">
                                <div className="truncate font-medium">{o.label}</div>
                                {o.hint && o.hint !== o.label && (
                                    <div className="truncate text-xs font-mono text-gray-500 dark:text-gray-400">
                                        {o.hint}
                                    </div>
                                )}
                            </div>
                            {o.value === value && <Check className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                        </li>
                    ))}

                    {matches.length > MAX_VISIBLE && (
                        <li className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                            Showing the first {MAX_VISIBLE} of {matches.length}. Keep typing to narrow the list.
                        </li>
                    )}

                    {showCustom && (
                        <li
                            id={`${id}-opt-${visible.length}`}
                            role="option"
                            aria-selected={false}
                            data-index={visible.length}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => choose(typed)}
                            onMouseEnter={() => setActive(visible.length)}
                            className={rowClass(visible.length)}
                        >
                            Use &quot;{typed}&quot;
                        </li>
                    )}

                    {rowCount === 0 && (
                        <li className="px-3 py-2 text-gray-500 dark:text-gray-400">No matches</li>
                    )}
                </ul>
            )}
        </div>
    );
}
