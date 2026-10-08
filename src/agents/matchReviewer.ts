// ایجنت تطبیق محلی: deterministic، قابل ممیزی و بدون سرویس هوش مصنوعی خارجی.
import { buildProductProfile, validateProductCompatibility, normalizeText } from '../supplierEngine.js';
import { readJson, loadCatalogs, saveReport } from './common.js';
import type { AgentAlert } from './common.js';

const tokens = (t: string) => new Set(normalizeText(t).split(/\s+/).filter((w) => w.length > 1));
const jaccard = (a: Set<string>, b: Set<string>) => { let i = 0; a.forEach((x) => b.has(x) && i++); return a.size + b.size - i ? i / (a.size + b.size - i) : 0; };
const itemText = (i: any) => i.title || i.name || i.product_name_en || i.persianName || i.product_name || '';

function scoreCandidate(master: any, item: any) {
  const mp = buildProductProfile(master), sp = buildProductProfile(item);
  const compat = validateProductCompatibility(mp, sp);
  const nameScore = jaccard(tokens(master.name + ' ' + (master.persianName || '') + ' ' + (master.modelCode || '')), tokens(itemText(item)));
  const brandMatch = mp.brand && sp.brand && normalizeText(mp.brand) === normalizeText(sp.brand) ? 0.25 : 0;
  const modelMatch = mp.series && sp.series && normalizeText(mp.series) === normalizeText(sp.series) ? 0.35 : 0;
  const memoryMatch = mp.ram && sp.ram && Number(mp.ram) === Number(sp.ram) && mp.storage && sp.storage && Number(mp.storage) === Number(sp.storage) ? 0.25 : 0;
  const score = Math.max(0, Math.min(1, (compat.compatible ? 0.25 : 0) + nameScore * 0.35 + brandMatch + modelMatch + memoryMatch));
  return { compat, score };
}

export async function runMatchReviewer(opts: { productIds?: string[]; catalogs?: Awaited<ReturnType<typeof loadCatalogs>> } = {}) {
  const products = readJson<any[]>('products.json', []).filter((p) => p.active !== false && (!opts.productIds || opts.productIds.includes(p.id)));
  const catalogs = opts.catalogs ?? (await loadCatalogs());
  const alerts: AgentAlert[] = [], suggestions: any[] = [];

  for (const p of products) for (const { supplier, adapter, items, error } of catalogs) {
    if (error || !items.length) continue;
    const current = adapter.matchProduct(p, items);
    if (current && (current.confidence === 'exact' || current.confidence === 'high')) continue;
    const cands = items.map((item) => ({ item, ...scoreCandidate(p, item) }))
      .filter((c) => c.compat.compatible && c.score >= 0.55)
      .sort((a, b) => b.score - a.score).slice(0, 5);
    if (!cands.length) continue;
    const pick = cands[0];
    const status = pick.score >= 0.85 ? 'high_confidence_review' : 'needs_review';
    const s = { productId: p.id, productName: p.name, supplierId: supplier.id, supplierName: supplier.name, candidate: itemText(pick.item), candidateId: pick.item.id ?? null,
      confidence: Number(pick.score.toFixed(2)), method: 'local-rule-engine', reason: 'امتیاز نام/مدل + برند + رم/حافظه + سازگاری فنی', status };
    suggestions.push(s);
    alerts.push({ key: `match:${p.id}:${supplier.id}`, type: 'match_suggestion', severity: status === 'high_confidence_review' ? 'warning' : 'info', message: `برای «${p.name}» در ${supplier.name} پیشنهاد: «${s.candidate}» (اطمینان ${Math.round(s.confidence * 100)}٪، موتور قاعده‌ای)`, data: s });
  }
  return saveReport({ agent: 'matchReviewer', summary: suggestions.length ? `${suggestions.length} پیشنهاد تطبیق برای بازبینی` : 'تطبیق مبهمی پیدا نشد.', alerts, data: { suggestions } });
}
