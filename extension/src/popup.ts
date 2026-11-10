import {
  CAPTURE_EXCLUDES,
  CAPTURE_INCLUDES,
} from '../../lib/layerwake/collect';

const button = document.getElementById('capture') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLParagraphElement;

function fill(listId: string, items: string[]) {
  const list = document.getElementById(listId);
  if (!list) return;
  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  }
}
fill('includes', CAPTURE_INCLUDES);
fill('excludes', CAPTURE_EXCLUDES);

const UNSUPPORTED =
  'Layerwake cannot run on this tab. Browser pages, the extension store and built-in viewers do not allow it. Open a regular web page and try again.';

function isUnsupportedUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    /^(chrome|edge|brave|about|devtools|view-source|chrome-extension|moz-extension):/i.test(
      url
    ) ||
    /^https:\/\/(chromewebstore\.google\.com|chrome\.google\.com\/webstore)/i.test(
      url
    )
  );
}

button.addEventListener('click', async () => {
  status.textContent = '';
  button.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id || isUnsupportedUrl(tab.url)) {
      status.textContent = UNSUPPORTED;
      return;
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'],
    });
    // Get out of the way so the page can be picked from.
    window.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    status.textContent = /file:\/\//i.test(message)
      ? 'To capture local files, turn on “Allow access to file URLs” for Layerwake on the extensions page.'
      : UNSUPPORTED;
  } finally {
    button.disabled = false;
  }
});
