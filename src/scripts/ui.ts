/**
 * UI Animations & Utilities — global module loaded by AdminLayout.
 * Exposes `window.ui` for use in any inline script or page.
 */
import { gsap } from 'gsap';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface UI {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  btnLoading: (btn: HTMLButtonElement, text?: string) => () => void;
}

// ─── Toast system ─────────────────────────────────────────────────────────────
function toast(message: string, type: ToastType = 'success', duration = 3500) {
  const container = document.getElementById('ui-toasts');
  if (!container) return;

  const palette: Record<ToastType, { bg: string; icon: string }> = {
    success: { bg: '#16a34a', icon: 'check_circle' },
    error:   { bg: '#dc2626', icon: 'error'         },
    warning: { bg: '#f59e0b', icon: 'warning'        },
    info:    { bg: '#2563eb', icon: 'info'           },
  };
  const { bg, icon } = palette[type];

  const el = document.createElement('div');
  el.className = 'ui-toast';
  el.innerHTML = `
    <span class="material-icons-round" style="color:${bg};font-size:20px">${icon}</span>
    <span class="ui-toast-msg">${message}</span>
    <button class="ui-toast-close" aria-label="Cerrar">
      <span class="material-icons-round" style="font-size:16px">close</span>
    </button>`;

  container.appendChild(el);

  // Entrance
  gsap.fromTo(el,
    { x: 80, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }
  );

  const dismiss = () => {
    if (!el.isConnected) return;
    gsap.to(el, {
      x: 80, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => el.remove(),
    });
  };

  el.querySelector('.ui-toast-close')!.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

// ─── Button loading state ─────────────────────────────────────────────────────
function btnLoading(btn: HTMLButtonElement, text = 'Procesando…'): () => void {
  const orig = btn.innerHTML;
  const origWidth = btn.offsetWidth;
  btn.style.minWidth = `${origWidth}px`;
  btn.disabled = true;
  btn.innerHTML = `<span class="ui-spinner material-icons-round">refresh</span> ${text}`;
  gsap.to(btn, { scale: 0.97, duration: 0.1 });
  return () => {
    btn.disabled = false;
    btn.innerHTML = orig;
    btn.style.minWidth = '';
    gsap.to(btn, { scale: 1, duration: 0.15, ease: 'back.out(2)' });
  };
}

// ─── Page entrance animations ─────────────────────────────────────────────────
function initEntranceAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  const header = document.querySelector<HTMLElement>('.page-header');
  if (header) {
    tl.from(header, { opacity: 0, y: -14, duration: 0.35 }, 0);
  }

  const cards = document.querySelectorAll<HTMLElement>('.card');
  if (cards.length) {
    tl.from(cards, { opacity: 0, y: 18, duration: 0.4, stagger: 0.07 }, 0.05);
  }
}

// ─── Button ripple ────────────────────────────────────────────────────────────
function initRipple() {
  document.addEventListener('click', (e: MouseEvent) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.btn');
    if (!btn || (btn as HTMLButtonElement).disabled) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.5;
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute; pointer-events:none; border-radius:50%;
      width:${size}px; height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(255,255,255,0.28);`;

    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);

    gsap.fromTo(ripple,
      { scale: 0, opacity: 1 },
      { scale: 1, opacity: 0, duration: 0.55, ease: 'power2.out',
        onComplete: () => ripple.remove() }
    );
  });
}

// ─── Auto loading on form submit ──────────────────────────────────────────────
function initFormLoading() {
  document.querySelectorAll<HTMLFormElement>('form[method="POST"]:not([data-no-loading])').forEach(form => {
    form.addEventListener('submit', () => {
      const submit = form.querySelector<HTMLButtonElement>('[type="submit"]');
      if (submit) btnLoading(submit);
    });
  });
}

// ─── Input focus micro-animation ─────────────────────────────────────────────
function initInputFocus() {
  document.querySelectorAll<HTMLElement>('.form-control').forEach(input => {
    input.addEventListener('focus', () => gsap.to(input, { scale: 1.012, duration: 0.2 }));
    input.addEventListener('blur',  () => gsap.to(input, { scale: 1,     duration: 0.2 }));
  });
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const ui: UI = { toast, btnLoading };

// Expose globally so inline scripts (onclick handlers, fetch callbacks) can use it
(window as any).ui = ui;

document.addEventListener('DOMContentLoaded', () => {
  initEntranceAnimations();
  initRipple();
  initFormLoading();
  initInputFocus();
});
