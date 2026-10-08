// موتور تحقیق و کنترل محلی پازل کالا.
// عمداً به هیچ سرویس هوش مصنوعی خارجی وابسته نیست.
import type { ParsedQuery } from './queryParser.js';
import type { DkProduct } from './sources.js';

export interface Research { raw: any; sources: { title: string; url: string }[]; provider: string }
export interface AiDeps {
  research(q: ParsedQuery, evidence: DkProduct | null): Promise<Research | null>;
  review(q: ParsedQuery, draft: any): Promise<{ ok: boolean; issues: string[]; provider: string } | null>;
}

const norm = (s: unknown) => String(s || '').toLowerCase().replace(/\u200c/g, ' ').replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').trim();
const has = (text: string, terms: string[]) => terms.some((x) => norm(text).includes(norm(x)));
const brandMap: Record<string, { fa: string; en: string }> = {
  apple: { fa: 'اپل', en: 'Apple' }, samsung: { fa: 'سامسونگ', en: 'Samsung' }, xiaomi: { fa: 'شیائومی', en: 'Xiaomi' },
  redmi: { fa: 'ردمی', en: 'Redmi' }, poco: { fa: 'پوکو', en: 'POCO' }, sony: { fa: 'سونی', en: 'Sony' }, honor: { fa: 'آنر', en: 'Honor' },
};

function inferBrand(q: ParsedQuery, title: string) {
  const text = norm(`${q.raw} ${title} ${q.brandEn || ''} ${q.brandFa || ''}`);
  for (const [key, value] of Object.entries(brandMap)) if (text.includes(key) || text.includes(norm(value.fa))) return value;
  return { fa: q.brandFa || '', en: q.brandEn || '' };
}

function buildFromEvidence(q: ParsedQuery, ev: DkProduct) {
  const brand = inferBrand(q, ev.title);
  const specs = ev.specs.map((s) => ({ group: s.title, label: s.label, value: s.value })).filter((s) => s.label && s.value).slice(0, 40);
  const colors = ev.colors.map((c) => ({ name: c.name, nameEn: c.name, colorCode: c.colorCode || '#64748b', available: true }));
  const title = ev.title.trim();
  const ram = q.ram;
  const storage = q.storage;
  return {
    name: title,
    persianName: title,
    modelCode: null,
    brand: brand.fa,
    releaseYear: undefined,
    ram, storage,
    colors,
    technicalSpecs: specs,
    description: `اطلاعات این کالا بر اساس رکورد منبع انتخاب‌شده ثبت شده است. از درج مشخصات تأییدنشده خودداری شده است.`,
    fullDescription: `مشخصات و رنگ‌های این محصول از منبع داده‌شده استخراج شده‌اند. هر فیلدی که منبع معتبر برای آن ارائه نکرده باشد عمداً خالی می‌ماند تا اطلاعات ساختگی وارد کاتالوگ نشود.`,
    review: undefined,
    keyFeatures: specs.slice(0, 6).map((s) => `${s.label}: ${s.value}`),
    tags: [brand.fa, brand.en, q.modelText].filter(Boolean),
  };
}

export const liveAi: AiDeps = {
  async research(q, ev) {
    if (!ev) return null;
    return { raw: buildFromEvidence(q, ev), sources: [{ title: ev.title, url: ev.url }], provider: 'local-evidence-agent' };
  },
  async review(q, d) {
    const issues: string[] = [];
    const sourceText = norm(`${d.name} ${d.brand} ${q.modelText}`);
    if (q.modelText && !norm(d.name).includes(norm(q.modelText))) issues.push('نام مدل با ورودی کاربر تطابق کافی ندارد.');
    if (q.brandEn && !sourceText.includes(norm(q.brandEn)) && !sourceText.includes(norm(q.brandFa))) issues.push('برند با ورودی کاربر تطابق کافی ندارد.');
    if (q.ram && d.ram && Number(d.ram) !== Number(q.ram)) issues.push('رم با ورودی کاربر متفاوت است.');
    if (q.storage && d.storage && Number(d.storage) !== Number(q.storage)) issues.push('حافظه با ورودی کاربر متفاوت است.');
    if (!Array.isArray(d.technicalSpecs) || d.technicalSpecs.length < 3) issues.push('شواهد فنی کافی برای ثبت کامل وجود ندارد.');
    return { ok: issues.length === 0, issues, provider: 'local-rule-reviewer' };
  },
};
