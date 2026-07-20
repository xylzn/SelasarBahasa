'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// How long (ms) to wait before forcing "revealed" on any element that the
// IntersectionObserver has not yet triggered for. This is the last-resort
// safety net so content NEVER stays invisible.
const FORCE_REVEAL_AFTER_MS = 1500;

function observeElement(el: Element, observer: IntersectionObserver) {
  // Per-element safety fallback: if still not revealed after 1.5 s, force it.
  const timer = setTimeout(() => {
    if (!el.classList.contains('revealed')) {
      el.classList.add('revealed');
    }
  }, FORCE_REVEAL_AFTER_MS);

  // Store the timer id on the element so we can cancel it if the observer
  // fires first (keeps things clean, avoids a redundant classList.add call).
  (el as HTMLElement).dataset.revealTimer = String(timer);

  observer.observe(el);
}

export function ScrollAnimate() {
  const pathname = usePathname();
  // Keep a stable ref to the observer across re-renders within the same route.
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mutationRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // ── Create the IntersectionObserver ──────────────────────────────────
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            // Cancel the per-element safety timer — IO fired in time.
            const timerId = el.dataset.revealTimer;
            if (timerId) clearTimeout(Number(timerId));
            el.classList.add('revealed');
            io.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.05,
      }
    );
    observerRef.current = io;

    // ── Observe elements already in the DOM ──────────────────────────────
    document.querySelectorAll<Element>('.reveal, .reveal-fade').forEach((el) => {
      if (!el.classList.contains('revealed')) {
        observeElement(el, io);
      }
    });

    // ── MutationObserver: catch elements added to DOM AFTER first paint ──
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const el = node as Element;
          // Check the node itself
          if (
            (el.classList.contains('reveal') || el.classList.contains('reveal-fade')) &&
            !el.classList.contains('revealed')
          ) {
            observeElement(el, io);
          }
          // Check descendants
          el.querySelectorAll<Element>('.reveal, .reveal-fade').forEach((child) => {
            if (!child.classList.contains('revealed')) {
              observeElement(child, io);
            }
          });
        });
      });
    });

    mo.observe(document.body, { childList: true, subtree: true });
    mutationRef.current = mo;

    return () => {
      io.disconnect();
      mo.disconnect();
      observerRef.current = null;
      mutationRef.current = null;
    };
  }, [pathname]);

  return null;
}
