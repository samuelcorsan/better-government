import { adapters } from 'virtual:site-adapters';
import { capturePage, type PageSnapshot, type ReportReason } from '@reforma-digital/capture';
import { matchesSite, type SiteAdapter } from '@reforma-digital/registry';
import { startAdapter, type RuntimeController } from '@reforma-digital/runtime';
import {
  isPending,
  markReportNoticeShown,
  shouldShowReportNotice,
  type PendingEntry,
} from './report-storage';

declare const __BG_PENDING__: PendingEntry[];
declare const __BG_VERSION__: string;

/** Test builds only: the local playground serves each site's fixtures under their official paths. */
function officialURL(local: URL, sites: readonly SiteAdapter[]): URL {
  for (const site of sites)
    for (const route of site.routes)
      if (
        'path' in route
          ? local.pathname === route.path
          : local.pathname.startsWith(route.pathPrefix)
      )
        return new URL(local.pathname + local.search, route.origin);
  return local;
}

function allowedSender(sender: chrome.runtime.MessageSender): boolean {
  if (sender.id !== chrome.runtime.id || !sender.url) return false;
  const url = sender.url.split('?')[0] ?? '';
  return (
    url === chrome.runtime.getURL('popup.html') || url === chrome.runtime.getURL('report.html')
  );
}

function reportReason(adapter: SiteAdapter, url: URL, state: string): ReportReason | null {
  if (adapter.reportExcluded?.(url)) return null;
  if (state === 'active' || state === 'disabled') return null;
  if (!matchesSite(adapter, url)) return null;
  if (adapter.expects(url)) return 'mismatch';
  return 'unsupported';
}

async function start() {
  let url = new URL(location.href);
  if (__BG_TEST__ && url.origin === 'http://127.0.0.1:4173') url = officialURL(url, adapters);
  const adapter = adapters.find((item) => matchesSite(item, url));
  if (!adapter) return;
  let controller: RuntimeController | undefined;
  let disabled = false;
  const pending = isPending(__BG_PENDING__ ?? [], adapter.id, url.href);
  try {
    const saved = await chrome.storage.local.get('disabledSites');
    disabled = Array.isArray(saved.disabledSites) && saved.disabledSites.includes(adapter.id);
    if (!disabled)
      controller = startAdapter(adapter, {
        url,
        demo: __BG_TEST__,
        pending,
        canShowNotice: async () => shouldShowReportNotice(url.href),
        onNoticeShown: () => {
          void markReportNoticeShown(url.href);
        },
      });
  } catch {
    return;
  }
  const changes = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area !== 'local' || !changes.disabledSites) return;
    const value: unknown = changes.disabledSites.newValue;
    disabled = Array.isArray(value) && value.includes(adapter.id);
    if (disabled) controller?.restore();
  };
  chrome.storage.onChanged.addListener(changes);
  chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
    if (!allowedSender(sender)) return;
    if (!message || typeof message !== 'object' || !('type' in message)) return;
    const type = (message as { type: string }).type;
    if (type === 'status') {
      const state = disabled ? 'disabled' : (controller?.state() ?? 'unsupported');
      const reason = reportReason(adapter, url, state);
      sendResponse({
        site: adapter.id,
        name: adapter.name,
        state,
        reportable: reason !== null,
        reason,
        pending,
        url: url.href,
      });
      return;
    }
    if (type === 'restore') {
      controller?.restore();
      sendResponse({ ok: true });
      return;
    }
    if (type === 'enable' && !disabled) {
      controller?.dispose();
      controller = startAdapter(adapter, {
        url,
        demo: __BG_TEST__,
        pending,
        canShowNotice: async () => shouldShowReportNotice(url.href),
        onNoticeShown: () => {
          void markReportNoticeShown(url.href);
        },
      });
      sendResponse({ state: controller.state() });
      return;
    }
    if (type === 'capture') {
      const state = disabled ? 'disabled' : (controller?.state() ?? 'unsupported');
      const reason = reportReason(adapter, url, state);
      if (!reason) {
        sendResponse({ ok: false, error: 'Esta página no se puede reportar.' });
        return true;
      }
      void capturePage(document, {
        siteId: adapter.id,
        reason,
        extensionVersion: __BG_VERSION__,
        url,
      }).then((result) => {
        if (!result.ok) sendResponse({ ok: false, error: result.error });
        else sendResponse({ ok: true, snapshot: result.snapshot as PageSnapshot });
      });
      return true; // async response
    }
  });
}
void start();
