import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runPriceMonitor, runMatchReviewer, runBestSupplier, runDailyReport } from './agents/index.js';
import { runShoppingAssistant } from './assistant.js';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'virtual_employees.json');

export interface CommandLog {
  id: string;
  command: string;
  result: string;
  timestamp: string;
}

export interface VirtualEmployee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  systemRole: string;
  status: 'active' | 'paused' | 'idle';
  description: string;
  instruction: string;
  capabilities: string[];
  stats: {
    tasksCompleted: number;
    lastAction: string;
    lastActionTime: string;
    efficiency: string;
  };
  commandHistory: CommandLog[];
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath: string, data: any): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[VirtualEmployees] Failed to write to ${filePath}:`, err);
  }
}

export function getVirtualEmployees(): VirtualEmployee[] {
  return readJsonFile<VirtualEmployee[]>(EMPLOYEES_FILE, []);
}

export function saveVirtualEmployees(list: VirtualEmployee[]): void {
  writeJsonFile(EMPLOYEES_FILE, list);
}

export function addVirtualEmployee(emp: Partial<VirtualEmployee>): VirtualEmployee {
  const list = getVirtualEmployees();
  const id = `emp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const nowPersian = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  const newEmployee: VirtualEmployee = {
    id,
    name: String(emp.name || 'کارمند هوشمند').trim(),
    avatar: String(emp.avatar || '🤖').trim(),
    role: String(emp.role || 'دستیار عملیاتی سایت').trim(),
    department: String(emp.department || 'عملیات هوشمند').trim(),
    systemRole: String(emp.systemRole || 'custom_agent').trim(),
    status: emp.status || 'active',
    description: String(emp.description || 'ایجنت هوشمند اختصاصی پازل کالا').trim(),
    instruction: String(emp.instruction || 'مأموریت محوله مدیر سیستم را با دقت پیگیری کن.').trim(),
    capabilities: Array.isArray(emp.capabilities) && emp.capabilities.length > 0
      ? emp.capabilities.map(String)
      : ['پردازش هوشمند دستورات', 'پایش داده‌های سایت', 'گزارش‌دهی به مدیر'],
    stats: {
      tasksCompleted: 1,
      lastAction: 'پیوستن به تیم کارمندان مجازی و آماده‌باش',
      lastActionTime: 'هم‌اکنون',
      efficiency: '۱۰۰٪',
    },
    commandHistory: emp.instruction
      ? [
          {
            id: `cmd-${Date.now()}`,
            command: `دستور اولیه مأموریت: ${emp.instruction}`,
            result: 'مأموریت اولیه با موفقیت دریافت و در حافظه کاری ایجنت بارگذاری شد.',
            timestamp: nowPersian,
          },
        ]
      : [],
  };

  list.push(newEmployee);
  saveVirtualEmployees(list);
  return newEmployee;
}

export function updateVirtualEmployee(id: string, updates: Partial<VirtualEmployee>): VirtualEmployee | null {
  const list = getVirtualEmployees();
  const index = list.findIndex((e) => e.id === id);
  if (index === -1) return null;

  const current = list[index];
  const updated: VirtualEmployee = {
    ...current,
    ...updates,
    id: current.id, // prevent ID change
    stats: {
      ...current.stats,
      ...(updates.stats || {}),
    },
    commandHistory: Array.isArray(updates.commandHistory) ? updates.commandHistory : current.commandHistory,
  };

  list[index] = updated;
  saveVirtualEmployees(list);
  return updated;
}

export function deleteVirtualEmployee(id: string): boolean {
  let list = getVirtualEmployees();
  const initialLength = list.length;
  list = list.filter((e) => e.id !== id);
  if (list.length !== initialLength) {
    saveVirtualEmployees(list);
    return true;
  }
  return false;
}

/**
 * اجرای دستور مدیر بر روی ایجنت مشخص و دریافت پاسخ زنده و ثبت در سوابق
 */
export async function executeEmployeeCommand(id: string, commandText: string): Promise<{ result: string; timestamp: string }> {
  const list = getVirtualEmployees();
  const emp = list.find((e) => e.id === id);
  if (!emp) throw new Error('کارمند مورد نظر یافت نشد.');

  const nowPersian = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  // دریافت آمار و متن داده‌های زنده فروشگاه برای آگاهی کامل ایجنت
  const products = readJsonFile<any[]>(path.join(DATA_DIR, 'products.json'), []);
  const suppliers = readJsonFile<any[]>(path.join(DATA_DIR, 'suppliers.json'), []);
  const orders = readJsonFile<any[]>(path.join(DATA_DIR, 'orders.json'), []);
  const inStockCount = products.filter((p) => p.inStock !== false && p.stock > 0).length;

  let generatedResult = '';
  const cmdNorm = commandText.toLowerCase();

  // اجرای واقعی ایجنت‌ها؛ هیچ مدل زبانی یا سرویس AI خارجی در چرخه عملیاتی لازم نیست.
  if (emp.systemRole === 'price_monitor' || cmdNorm.includes('قیمت') || cmdNorm.includes('جهش')) {
    const report = await runPriceMonitor({ send: false });
    generatedResult = `ایجنت پایش قیمت اجرا شد. ${report.summary}`;
  } else if (emp.systemRole === 'catalog_matcher' || cmdNorm.includes('تطبیق') || cmdNorm.includes('کاتالوگ') || cmdNorm.includes('مدل')) {
    const report = await runMatchReviewer();
    generatedResult = `ایجنت تطبیق کاتالوگ اجرا شد. ${report.summary}`;
  } else if (emp.systemRole === 'best_supplier' || cmdNorm.includes('تأمین') || cmdNorm.includes('تامین') || cmdNorm.includes('خرید')) {
    const report = await runBestSupplier();
    generatedResult = `ایجنت انتخاب تأمین‌کننده اجرا شد. ${report.summary}`;
  } else if (emp.systemRole === 'daily_reporter' || cmdNorm.includes('گزارش') || cmdNorm.includes('فروش') || cmdNorm.includes('آمار')) {
    const report = await runDailyReport({ send: false });
    generatedResult = `ایجنت گزارش روزانه اجرا شد. ${report.summary}`;
  } else if (emp.systemRole === 'shopping_assistant' || cmdNorm.includes('مشتری') || cmdNorm.includes('مشاوره')) {
    const result = await runShoppingAssistant(products, commandText);
    generatedResult = result.ok ? result.summary || 'مشاوره بر اساس کاتالوگ محلی انجام شد.' : `مشاوره اجرا نشد: ${result.error || 'خطای نامشخص'}`;
  } else {
    generatedResult = `دستور «${commandText}» ثبت شد. این نقش ایجنت عملیاتی اختصاصی ندارد و هیچ اقدام خودکاری بدون تعریف ابزار مجاز انجام نشد.`;
  }

  // ثبت در تاریخچه دستورات این کارمند
  const newCmdLog: CommandLog = {
    id: `cmd-${Date.now()}`,
    command: commandText,
    result: generatedResult,
    timestamp: nowPersian,
  };

  emp.commandHistory.unshift(newCmdLog);
  if (emp.commandHistory.length > 20) {
    emp.commandHistory = emp.commandHistory.slice(0, 20);
  }
  emp.stats.tasksCompleted = (emp.stats.tasksCompleted || 0) + 1;
  emp.stats.lastAction = `اجرای دستور: ${commandText.slice(0, 30)}${commandText.length > 30 ? '...' : ''}`;
  emp.stats.lastActionTime = 'هم‌اکنون';

  saveVirtualEmployees(list);

  return {
    result: generatedResult,
    timestamp: nowPersian,
  };
}
