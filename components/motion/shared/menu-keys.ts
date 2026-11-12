const ITEM =
  '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemradio"], [role="menuitemcheckbox"]';

function items(menu: HTMLElement) {
  return Array.from(menu.querySelectorAll<HTMLElement>(ITEM)).filter(
    (item) => item.closest('[role="menu"]') === menu
  );
}

/** Moves focus to the first (or last) item of `menu`. */
export function focusMenuItem(
  menu: HTMLElement | null,
  which: 'first' | 'last' = 'first'
) {
  if (!menu) return;
  const list = items(menu);
  list[which === 'first' ? 0 : list.length - 1]?.focus();
}

/**
 * Arrow, Home and End navigation between the items of `menu`. Call it from
 * the menu's keydown handler. Returns true when the key was handled.
 */
export function handleMenuKeys(
  event: { key: string; preventDefault(): void },
  menu: HTMLElement | null
): boolean {
  if (!menu) return false;
  const list = items(menu);
  if (list.length === 0) return false;
  const index = list.indexOf(document.activeElement as HTMLElement);
  let next: number;
  switch (event.key) {
    case 'ArrowDown':
      next = (index + 1) % list.length;
      break;
    case 'ArrowUp':
      next = index <= 0 ? list.length - 1 : index - 1;
      break;
    case 'Home':
      next = 0;
      break;
    case 'End':
      next = list.length - 1;
      break;
    default:
      return false;
  }
  event.preventDefault();
  list[next].focus();
  return true;
}
