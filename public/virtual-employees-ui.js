/**
 * پازل کالا | سامانه جامع کارمندان مجازی و ایجنت‌های هوشمند
 * منحصراً در پنل مدیریت فروشگاه (حذف کامل از ویترین و پنل کاربری)
 */

(function () {
  'use strict';

  // تزریق استایل‌های مستقل و تضمین‌شده
  function injectStyles() {
    if (document.getElementById('ve-custom-styles')) return;

    const style = document.createElement('style');
    style.id = 've-custom-styles';
    style.textContent = `
      #virtual-employees-modal, #virtual-employees-modal * {
        box-sizing: border-box;
        font-family: Vazirmatn, system-ui, -apple-system, sans-serif;
      }

      .ve-pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #34d399;
        box-shadow: 0 0 8px #34d399;
        animation: vePulse 2s infinite;
        display: inline-block;
      }
      @keyframes vePulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.3); }
      }

      /* پنجره مودال کارمندان */
      .ve-modal-backdrop {
        position: fixed !important;
        inset: 0 !important;
        z-index: 99999999 !important;
        background: rgba(15, 23, 42, 0.85) !important;
        backdrop-filter: blur(8px) !important;
        -webkit-backdrop-filter: blur(8px) !important;
        display: none;
        align-items: center !important;
        justify-content: center !important;
        padding: 14px !important;
        direction: rtl !important;
      }
      .ve-modal-backdrop.ve-open {
        display: flex !important;
      }

      .ve-dialog-box {
        position: relative !important;
        width: 100% !important;
        max-width: 980px !important;
        max-height: 92vh !important;
        background: #0f172a !important;
        border: 1px solid #334155 !important;
        border-radius: 24px !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        color: #f8fafc !important;
        animation: veFadeIn 0.2s ease-out !important;
      }
      @keyframes veFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }

      .ve-btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
        color: #ffffff !important;
        border: 1px solid #34d399 !important;
        padding: 8px 16px !important;
        border-radius: 12px !important;
        font-size: 12px !important;
        font-weight: 800 !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
      }
      .ve-btn-primary:hover {
        background: #059669 !important;
        transform: translateY(-1px) !important;
      }

      .ve-btn-close {
        background: #1e293b !important;
        color: #94a3b8 !important;
        border: 1px solid #334155 !important;
        width: 36px !important;
        height: 36px !important;
        border-radius: 12px !important;
        cursor: pointer !important;
        font-size: 16px !important;
        font-weight: bold !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s !important;
      }
      .ve-btn-close:hover {
        background: #334155 !important;
        color: #ffffff !important;
      }

      .ve-card {
        background: #1e293b !important;
        border: 1px solid #334155 !important;
        border-radius: 20px !important;
        padding: 16px 20px !important;
        margin-bottom: 14px !important;
        transition: border-color 0.2s !important;
      }
      .ve-card:hover {
        border-color: #6366f1 !important;
      }
      .ve-card.ve-active {
        border-right: 4px solid #10b981 !important;
      }
      .ve-card.ve-paused {
        border-right: 4px solid #f59e0b !important;
        opacity: 0.85 !important;
      }

      .ve-cmd-input {
        flex: 1 !important;
        background: #020617 !important;
        border: 1px solid #475569 !important;
        border-radius: 12px !important;
        color: #ffffff !important;
        padding: 9px 14px !important;
        font-size: 12px !important;
        outline: none !important;
        direction: rtl !important;
      }
      .ve-cmd-input:focus {
        border-color: #10b981 !important;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
      }

      .ve-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .ve-scrollbar::-webkit-scrollbar-track {
        background: #0f172a;
      }
      .ve-scrollbar::-webkit-scrollbar-thumb {
        background: #475569;
        border-radius: 3px;
      }

      .ve-toast {
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        z-index: 999999999 !important;
        background: #1e293b !important;
        color: #ffffff !important;
        border: 1px solid #475569 !important;
        border-radius: 14px !important;
        padding: 12px 18px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        direction: rtl !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
        animation: veToastIn 0.3s ease-out !important;
      }
      @keyframes veToastIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  let employees = [];
  let filterStatus = 'all'; // 'all', 'active', 'paused'
  let isExecutingId = null;

  async function fetchEmployees() {
    try {
      const res = await fetch('/api/virtual-employees');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.employees)) {
          employees = data.employees;
          renderCards();
          updateCounts();
        }
      }
    } catch (e) {
      console.warn('[VE] Failed to load employees:', e);
    }
  }

  function updateCounts() {
    const badge = document.getElementById('ve-badge-total');
    if (badge) {
      const activeCount = employees.filter((e) => e.status === 'active').length;
      badge.textContent = `${activeCount} فعال از ${employees.length} کارمند مجازی`;
    }
  }

  function createModal() {
    if (document.getElementById('virtual-employees-modal')) return;

    injectStyles();

    const backdrop = document.createElement('div');
    backdrop.id = 'virtual-employees-modal';
    backdrop.className = 've-modal-backdrop';

    backdrop.innerHTML = `
      <div id="virtual-employees-dialog" class="ve-dialog-box">
        
        <!-- Header -->
        <div style="padding: 16px 24px; background: linear-gradient(90deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #7c3aed, #4f46e5); display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); border: 1px solid rgba(255, 255, 255, 0.2);">
              🤖
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h2 style="margin: 0; font-size: 16px; font-weight: 900; color: #ffffff;">کارمندان مجازی من (ایجنت‌های هوشمند پنل مدیریت)</h2>
                <span id="ve-badge-total" style="font-size: 11px; padding: 2px 10px; border-radius: 9999px; background: rgba(99, 102, 241, 0.2); color: #a5b4fc; border: 1px solid rgba(99, 102, 241, 0.4); font-weight: 700;">
                  در حال بارگذاری...
                </span>
              </div>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">
                مشاهده نقش‌ها و وظایف در فروشگاه، صدور دستور مستقیم، حذف و استخدام ایجنت جدید
              </p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <button id="ve-btn-add-agent" class="ve-btn-primary">
              <span>➕</span>
              <span>استخدام کارمند جدید</span>
            </button>
            <button id="ve-btn-close-dlg" class="ve-btn-close" title="بستن">✕</button>
          </div>
        </div>

        <!-- Filter Subbar -->
        <div style="padding: 10px 24px; background: rgba(2, 6, 23, 0.6); border-bottom: 1px solid #1e293b; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; flex-shrink: 0;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <button data-filter="all" class="ve-filter-btn" style="padding: 6px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: #6366f1; color: #ffffff;">همه ایجنت‌ها</button>
            <button data-filter="active" class="ve-filter-btn" style="padding: 6px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: transparent; color: #94a3b8;">آماده‌باش و فعال</button>
            <button data-filter="paused" class="ve-filter-btn" style="padding: 6px 14px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: none; background: transparent; color: #94a3b8;">متوقف شده</button>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; color: #34d399; font-weight: 700;">
            <span class="ve-pulse-dot"></span>
            <span>موتور هوش مصنوعی و تحلیل زنده فروشگاه متصل است</span>
          </div>
        </div>

        <!-- Cards Container -->
        <div id="ve-cards-list" class="ve-scrollbar" style="flex: 1; overflow-y: auto; padding: 20px 24px; min-height: 250px;">
          <div style="text-align: center; padding: 40px; color: #64748b;">در حال فراخوانی اطلاعات کارمندان مجازی...</div>
        </div>

        <!-- Add Employee Modal Form -->
        <div id="ve-add-modal-overlay" style="position: absolute; inset: 0; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; padding: 16px; z-index: 50;">
          <div style="width: 100%; max-width: 520px; background: #0f172a; border: 1px solid #334155; border-radius: 20px; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 15px; font-weight: 900; color: #ffffff;">استخدام کارمند مجازی (ایجنت) جدید</h3>
              <button id="ve-btn-close-add-form" class="ve-btn-close" style="width: 30px; height: 30px;">✕</button>
            </div>

            <form id="ve-add-employee-form" style="display: flex; flex-direction: column; gap: 12px; font-size: 12px;">
              <div style="display: flex; gap: 10px;">
                <div style="flex: 1;">
                  <label style="display: block; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">نام کارمند:</label>
                  <input id="ve-in-name" type="text" required placeholder="مثال: کیان نوری" style="width: 100%; background: #1e293b; border: 1px solid #475569; border-radius: 10px; padding: 8px 12px; color: #ffffff; outline: none;" />
                </div>
                <div style="width: 110px;">
                  <label style="display: block; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">آواتار:</label>
                  <input id="ve-in-avatar" type="text" value="🤖" required style="width: 100%; background: #1e293b; border: 1px solid #475569; border-radius: 10px; padding: 8px 12px; color: #ffffff; text-align: center; font-size: 16px; outline: none;" />
                </div>
              </div>

              <div>
                <label style="display: block; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">سمت و نقش کارمند در سایت:</label>
                <input id="ve-in-role" type="text" required placeholder="مثال: ناظر بر تخفیف‌ها و پیشنهادهای روز" style="width: 100%; background: #1e293b; border: 1px solid #475569; border-radius: 10px; padding: 8px 12px; color: #ffffff; outline: none;" />
              </div>

              <div style="display: flex; gap: 10px;">
                <div style="flex: 1;">
                  <label style="display: block; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">دپارتمان:</label>
                  <input id="ve-in-dept" type="text" value="عملیات هوشمند فروشگاه" style="width: 100%; background: #1e293b; border: 1px solid #475569; border-radius: 10px; padding: 8px 12px; color: #ffffff; outline: none;" />
                </div>
                <div style="flex: 1;">
                  <label style="display: block; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">وضعیت اولیه:</label>
                  <select id="ve-in-status" style="width: 100%; background: #1e293b; border: 1px solid #475569; border-radius: 10px; padding: 8px 12px; color: #ffffff; outline: none;">
                    <option value="active">فعال و آماده‌باش</option>
                    <option value="paused">متوقف</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="display: block; font-weight: 700; color: #cbd5e1; margin-bottom: 4px;">شرح وظایف:</label>
                <textarea id="ve-in-desc" rows="2" placeholder="توضیح کوتاه درباره حیطه مسئولیت این ایجنت..." style="width: 100%; background: #1e293b; border: 1px solid #475569; border-radius: 10px; padding: 8px 12px; color: #ffffff; outline: none; resize: none;"></textarea>
              </div>

              <div>
                <label style="display: block; font-weight: 700; color: #a5b4fc; margin-bottom: 4px;">دستور و مأموریت دائمی کارمند (Instruction):</label>
                <textarea id="ve-in-instruction" rows="2" required placeholder="دستوری که کارمند در تمامی اقدامات موظف به رعایت آن است..." style="width: 100%; background: #1e1b4b; border: 1px solid #6366f1; border-radius: 10px; padding: 8px 12px; color: #ffffff; outline: none; resize: none;"></textarea>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; padding-top: 10px; border-top: 1px solid #1e293b;">
                <button type="button" id="ve-btn-cancel-add-form" style="padding: 8px 16px; border-radius: 10px; background: #1e293b; color: #cbd5e1; border: 1px solid #334155; cursor: pointer; font-weight: 700;">انصراف</button>
                <button type="submit" class="ve-btn-primary" style="padding: 8px 20px;">استخدام و فعال‌سازی</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('ve-btn-close-dlg').addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    const addOverlay = document.getElementById('ve-add-modal-overlay');
    document.getElementById('ve-btn-add-agent').addEventListener('click', () => {
      addOverlay.style.display = 'flex';
    });
    document.getElementById('ve-btn-close-add-form').addEventListener('click', () => {
      addOverlay.style.display = 'none';
    });
    document.getElementById('ve-btn-cancel-add-form').addEventListener('click', () => {
      addOverlay.style.display = 'none';
    });

    document.getElementById('ve-add-employee-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const newEmp = {
        name: document.getElementById('ve-in-name').value.trim(),
        avatar: document.getElementById('ve-in-avatar').value.trim(),
        role: document.getElementById('ve-in-role').value.trim(),
        department: document.getElementById('ve-in-dept').value.trim(),
        status: document.getElementById('ve-in-status').value,
        description: document.getElementById('ve-in-desc').value.trim(),
        instruction: document.getElementById('ve-in-instruction').value.trim(),
      };

      try {
        const res = await fetch('/api/virtual-employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmp),
        });
        if (res.ok) {
          addOverlay.style.display = 'none';
          document.getElementById('ve-add-employee-form').reset();
          await fetchEmployees();
          showToast(`کارمند جدید «${newEmp.name}» با موفقیت استخدام و مستقر شد.`, 'success');
        } else {
          showToast('خطا در استخدام کارمند مجازی جدید.', 'error');
        }
      } catch (err) {
        showToast('خطا در اتصال به سرور.', 'error');
      }
    });

    backdrop.querySelectorAll('.ve-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        backdrop.querySelectorAll('.ve-filter-btn').forEach((b) => {
          b.style.background = 'transparent';
          b.style.color = '#94a3b8';
        });
        btn.style.background = '#6366f1';
        btn.style.color = '#ffffff';
        filterStatus = btn.dataset.filter;
        renderCards();
      });
    });
  }

  function renderCards() {
    const list = document.getElementById('ve-cards-list');
    if (!list) return;

    let items = employees;
    if (filterStatus === 'active') {
      items = employees.filter((e) => e.status === 'active');
    } else if (filterStatus === 'paused') {
      items = employees.filter((e) => e.status !== 'active');
    }

    if (items.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 48px 16px; background: rgba(30, 41, 59, 0.5); border-radius: 16px; border: 1px dashed #334155; color: #94a3b8;">
          <p style="font-size: 13px; font-weight: 700; margin: 0;">هیچ کارمندی با این فیلتر یافت نشد.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = items
      .map((emp) => {
        const isActive = emp.status === 'active';
        const isExec = isExecutingId === emp.id;
        const history = emp.commandHistory || [];
        const latestHistory = history[0];

        return `
          <div class="ve-card ${isActive ? 've-active' : 've-paused'}">
            
            <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 14px;">
                <div style="position: relative;">
                  <div style="width: 52px; height: 52px; border-radius: 16px; background: #0f172a; border: 1.5px solid #334155; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    ${emp.avatar || '🤖'}
                  </div>
                  <span style="position: absolute; bottom: -2px; left: -2px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #1e293b; background: ${isActive ? '#34d399' : '#f59e0b'};"></span>
                </div>

                <div>
                  <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <h3 style="margin: 0; font-size: 15px; font-weight: 900; color: #ffffff;">${emp.name}</h3>
                    <span style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: ${isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}; color: ${isActive ? '#34d399' : '#fbbf24'}; border: 1px solid ${isActive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(245, 158, 11, 0.3)'};">
                      ${isActive ? '● آماده‌باش و فعال' : '⏸ متوقف شده'}
                    </span>
                    <span style="font-size: 10px; padding: 2px 8px; border-radius: 8px; background: #0f172a; color: #94a3b8; border: 1px solid #334155;">
                      ${emp.department || 'عملیات پازل کالا'}
                    </span>
                  </div>
                  <div style="margin-top: 4px; font-size: 12px; font-weight: 800; color: #a5b4fc; display: flex; align-items: center; gap: 6px;">
                    <span>💼 نقش در سایت:</span>
                    <span>${emp.role}</span>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 6px;">
                <button onclick="window.__veToggleStatus('${emp.id}')" style="padding: 6px 12px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; border: 1px solid ${isActive ? 'rgba(245, 158, 11, 0.4)' : 'rgba(52, 211, 153, 0.4)'}; background: ${isActive ? 'rgba(245, 158, 11, 0.15)' : 'rgba(52, 211, 153, 0.15)'}; color: ${isActive ? '#fbbf24' : '#34d399'}; transition: all 0.2s;">
                  ${isActive ? '⏸ توقف موقت' : '▶ فعال‌سازی'}
                </button>
                <button onclick="window.__veDelete('${emp.id}')" style="padding: 6px 10px; border-radius: 10px; font-size: 12px; cursor: pointer; border: 1px solid rgba(244, 63, 94, 0.4); background: rgba(244, 63, 94, 0.15); color: #fb7185; transition: all 0.2s;" title="حذف این کارمند">
                  🗑️
                </button>
              </div>
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; border-radius: 12px; padding: 10px 14px; font-size: 12px; color: #cbd5e1; line-height: 1.6; margin-bottom: 10px;">
              <span style="font-weight: 800; color: #94a3b8; margin-left: 4px;">شرح مسئولیت:</span>
              ${emp.description || 'مسئول اجرای امور محوله در فروشگاه پازل کالا'}
              
              <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
                <span style="font-size: 10px; color: #64748b; font-weight: 700;">حیطه صلاحیت:</span>
                ${(emp.capabilities || ['عملیات هوشمند']).map((c) => `<span style="font-size: 10px; padding: 1px 8px; border-radius: 6px; background: rgba(99, 102, 241, 0.15); color: #c7d2fe; border: 1px solid rgba(99, 102, 241, 0.3);">${c}</span>`).join('')}
              </div>
            </div>

            <div style="background: linear-gradient(90deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px; padding: 10px 14px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; font-weight: 800; color: #c7d2fe; display: flex; align-items: center; gap: 4px;">
                  <span>📜</span>
                  <span>دستور و مأموریت دائمی کارمند (Instruction):</span>
                </span>
                <button onclick="window.__veEditInstruction('${emp.id}')" style="background: none; border: none; font-size: 11px; color: #818cf8; font-weight: 800; text-decoration: underline; cursor: pointer;">
                  ویرایش مأموریت
                </button>
              </div>
              <p style="margin: 0; font-size: 11px; color: #cbd5e1; line-height: 1.5; font-family: monospace;">
                ${emp.instruction || 'مأموریت فعلی مشخص نشده است.'}
              </p>
            </div>

            <div style="background: #0f172a; border: 1px solid #334155; border-radius: 14px; padding: 12px 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 900; color: #34d399; display: flex; align-items: center; gap: 6px;">
                  <span>⚡</span>
                  <span>ارسال دستور مستقیم و آنی به «${emp.name}»:</span>
                </span>
                <span style="font-size: 10px; color: #64748b;">پاسخ و تحلیل زنده هوش مصنوعی</span>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 8px;">
                <button type="button" onclick="document.getElementById('ve-in-cmd-${emp.id}').value='گزارش فوری از وضعیت کالاهای تحت نظارت خود بده'; window.__veRunCommand('${emp.id}')" style="font-size: 10px; padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; cursor: pointer;">📊 گزارش وضعیت</button>
                <button type="button" onclick="document.getElementById('ve-in-cmd-${emp.id}').value='قیمت‌ها و موجودی را با تأمین‌کنندگان بررسی کن'; window.__veRunCommand('${emp.id}')" style="font-size: 10px; padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; cursor: pointer;">🔍 بررسی قیمت و موجودی</button>
                <button type="button" onclick="document.getElementById('ve-in-cmd-${emp.id}').value='کالاهای کم‌موجود و پرتقاضا را لیست کن'; window.__veRunCommand('${emp.id}')" style="font-size: 10px; padding: 3px 8px; border-radius: 6px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; cursor: pointer;">📦 اقلام نیازمند تأمین</button>
              </div>

              <div style="display: flex; gap: 8px;">
                <input id="ve-in-cmd-${emp.id}" class="ve-cmd-input" type="text" placeholder="دستور مورد نظر را بنویسید (مثال: حاشیه سود را بررسی کن، یا تخفیف‌های ویژه را بازبینی کن...)" onkeydown="if(event.key==='Enter') window.__veRunCommand('${emp.id}')" />
                <button id="ve-btn-exec-${emp.id}" onclick="window.__veRunCommand('${emp.id}')" ${isExec ? 'disabled' : ''} class="ve-btn-primary" style="white-space: nowrap;">
                  ${isExec ? '⏳ در حال اجرا...' : 'ارسال دستور 🚀'}
                </button>
              </div>

              ${
                latestHistory
                  ? `
                <div style="margin-top: 10px; background: rgba(2, 6, 23, 0.7); border: 1px solid #1e293b; border-radius: 10px; padding: 10px 12px; font-size: 11px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 4px; margin-bottom: 6px;">
                    <span style="font-weight: 800; color: #a5b4fc;">آخرین پاسخ ایجنت به دستور «${latestHistory.command}»:</span>
                    <span style="font-size: 10px; color: #64748b;">${latestHistory.timestamp}</span>
                  </div>
                  <div style="color: #e2e8f0; line-height: 1.6; white-space: pre-line;">${latestHistory.result}</div>
                </div>
              `
                  : ''
              }

              ${
                history.length > 1
                  ? `
                <details style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
                  <summary style="cursor: pointer; font-weight: 700; user-select: none;">نمایش ${history.length - 1} دستور قبلی این ایجنت...</summary>
                  <div style="margin-top: 6px; display: flex; flex-direction: column; gap: 6px; max-height: 160px; overflow-y: auto; padding-right: 4px;">
                    ${history
                      .slice(1)
                      .map(
                        (h) => `
                      <div style="background: #020617; border: 1px solid #1e293b; border-radius: 8px; padding: 6px 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 3px;">
                          <span style="font-weight: 700; color: #cbd5e1;">دستور: ${h.command}</span>
                          <span>${h.timestamp}</span>
                        </div>
                        <div style="color: #cbd5e1; white-space: pre-line;">${h.result}</div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </details>
              `
                  : ''
              }

            </div>

          </div>
        `;
      })
      .join('');
  }

  window.__veToggleStatus = async function (id) {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const newStatus = emp.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/virtual-employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        emp.status = newStatus;
        renderCards();
        updateCounts();
        showToast(`وضعیت «${emp.name}» به ${newStatus === 'active' ? 'فعال' : 'متوقف'} تغییر یافت.`, 'info');
      }
    } catch {
      showToast('خطا در تغییر وضعیت کارمند.', 'error');
    }
  };

  window.__veDelete = async function (id) {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    if (!confirm(`آیا از حذف کارمند مجازی «${emp.name}» (${emp.role}) اطمینان دارید؟`)) return;

    try {
      const res = await fetch(`/api/virtual-employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        employees = employees.filter((e) => e.id !== id);
        renderCards();
        updateCounts();
        showToast(`کارمند مجازی «${emp.name}» با موفقیت حذف شد.`, 'success');
      }
    } catch {
      showToast('خطا در حذف کارمند.', 'error');
    }
  };

  window.__veEditInstruction = async function (id) {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    const newInstruction = prompt(`دستور و مأموریت جدید برای «${emp.name}»:`, emp.instruction);
    if (newInstruction === null || !newInstruction.trim()) return;

    try {
      const res = await fetch(`/api/virtual-employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: newInstruction.trim() }),
      });
      if (res.ok) {
        emp.instruction = newInstruction.trim();
        renderCards();
        showToast(`مأموریت «${emp.name}» به‌روزرسانی شد.`, 'success');
      }
    } catch {
      showToast('خطا در به‌روزرسانی مأموریت.', 'error');
    }
  };

  window.__veRunCommand = async function (id) {
    const input = document.getElementById(`ve-in-cmd-${id}`);
    if (!input) return;
    const cmdText = input.value.trim();
    if (!cmdText) {
      showToast('لطفاً متن دستور را بنویسید.', 'warning');
      return;
    }

    const emp = employees.find((e) => e.id === id);
    if (!emp) return;

    isExecutingId = id;
    renderCards();

    try {
      const res = await fetch(`/api/virtual-employees/${id}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdText }),
      });

      isExecutingId = null;
      if (res.ok) {
        await fetchEmployees();
        showToast(`دستور با موفقیت توسط «${emp.name}» اجرا شد!`, 'success');
      } else {
        renderCards();
        showToast('خطا در اجرای دستور توسط ایجنت.', 'error');
      }
    } catch {
      isExecutingId = null;
      renderCards();
      showToast('خطا در ارتباط با سرور ایجنت.', 'error');
    }
  };

  function openModal() {
    createModal();
    fetchEmployees();
    const modal = document.getElementById('virtual-employees-modal');
    if (modal) {
      modal.classList.add('ve-open');
    }
  }

  function closeModal() {
    const modal = document.getElementById('virtual-employees-modal');
    if (modal) {
      modal.classList.remove('ve-open');
    }
  }

  function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = 've-toast';
    t.style.borderLeft = type === 'success' ? '4px solid #10b981' : type === 'error' ? '4px solid #f43f5e' : '4px solid #6366f1';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s';
      setTimeout(() => t.remove(), 300);
    }, 3500);
  }

  window.openVirtualEmployeesModal = openModal;
  window.closeVirtualEmployeesModal = closeModal;

  // بررسی دقیق: آیا کاربر در حال حاضر در پنل مدیریت است؟
  function isInAdminPanel() {
    const hash = (window.location.hash || '').toLowerCase();
    if (hash.startsWith('#admin')) return true;

    // بررسی وجود عناصر اختصاصی پنل مدیریت در صفحه
    if (document.getElementById('btn-react-virtual-staff') || document.getElementById('btn-admin-inner-virtual-staff')) return true;

    const asides = document.querySelectorAll('aside');
    for (const aside of asides) {
      if ((aside.textContent || '').includes('بخش‌های مدیریت')) return true;
    }
    return false;
  }

  // پاکسازی هرگونه آیکون یا دکمه از پنل کاربری یا ویترین
  function purgeStorefrontButtons() {
    // حذف دکمه شناور سراسری اگر در پنل کاربری باشد
    const pill = document.getElementById('ve-topbar-quick-pill');
    if (pill) pill.remove();

    // حذف دکمه هدر سایت
    const storeBtn = document.getElementById('btn-ve-storefront-header');
    if (storeBtn) storeBtn.remove();

    const storeBtn2 = document.getElementById('header-store-virtual-staff-btn');
    if (storeBtn2) storeBtn2.remove();
  }

  // تزریق منحصراً در پنل مدیریت
  function syncAdminButtons() {
    injectStyles();

    // همیشه عناصر ویترین را پاک نگه دار
    purgeStorefrontButtons();

    // اگر در پنل مدیریت نیستیم، توقف کن
    if (!isInAdminPanel()) return;

    // ۱. تزریق در کارت سفید بالای پنل مدیریت در صورت نیاز
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      const txt = (btn.textContent || '').trim();
      if (txt.includes('ثبت کالای جدید') && !txt.includes('کارمندان مجازی')) {
        const parent = btn.parentElement;
        if (parent && !parent.querySelector('#btn-admin-inner-virtual-staff') && !parent.querySelector('#btn-ve-header-injected')) {
          const headerBtn = document.createElement('button');
          headerBtn.id = 'btn-ve-header-injected';
          headerBtn.type = 'button';
          headerBtn.style.cssText = `
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 7px 14px !important;
            border-radius: 12px !important;
            font-size: 11px !important;
            font-weight: 900 !important;
            background: linear-gradient(135deg, #7c3aed, #4f46e5) !important;
            color: #ffffff !important;
            border: 1.5px solid #c084fc !important;
            box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45) !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            flex-shrink: 0 !important;
          `;
          headerBtn.title = 'مشاهده و مدیریت کارمندان مجازی (ایجنت‌ها)';
          headerBtn.innerHTML = `
            <span style="font-size: 15px;">🤖</span>
            <span>کارمندان مجازی (ایجنت‌ها)</span>
            <span class="ve-pulse-dot" style="width: 7px; height: 7px;"></span>
          `;
          headerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal();
          });
          parent.prepend(headerBtn);
        }
      }
    }

    // ۲. نوار کناری پنل مدیریت (Aside)
    const asides = document.querySelectorAll('aside');
    for (const aside of asides) {
      if (aside.textContent.includes('بخش‌های مدیریت') && !aside.querySelector('#btn-ve-aside-item')) {
        const listDiv = aside.querySelector('div.space-y-0\\.5') || aside.querySelector('div.flex-1');
        if (listDiv) {
          const sideBtn = document.createElement('button');
          sideBtn.id = 'btn-ve-aside-item';
          sideBtn.type = 'button';
          sideBtn.style.cssText = `
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 8px 12px !important;
            border-radius: 12px !important;
            font-size: 12px !important;
            font-weight: 800 !important;
            background: linear-gradient(90deg, #ede9fe, #f5f3ff) !important;
            color: #6d28d9 !important;
            border: 1px solid #c4b5fd !important;
            margin-bottom: 8px !important;
            cursor: pointer !important;
            box-shadow: 0 2px 4px rgba(109, 40, 217, 0.1) !important;
          `;
          sideBtn.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 16px;">🤖</span>
              <span>کارمندان مجازی (ایجنت‌ها)</span>
            </div>
            <span style="font-size: 10px; padding: 2px 8px; border-radius: 9999px; background: #7c3aed; color: #fff; font-weight: 800;">فعال</span>
          `;
          sideBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openModal();
          });
          listDiv.prepend(sideBtn);
        }
      }
    }
  }

  setInterval(syncAdminButtons, 500);

  function checkHash() {
    const h = (window.location.hash || '').toLowerCase();
    if (h.includes('virtual-staff') || h.includes('agents')) {
      openModal();
    }
  }
  window.addEventListener('hashchange', checkHash);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createModal();
      fetchEmployees();
      syncAdminButtons();
      checkHash();
    });
  } else {
    createModal();
    fetchEmployees();
    syncAdminButtons();
    checkHash();
  }
})();
