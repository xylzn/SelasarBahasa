'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollAnimate() {
  const pathname = usePathname();

  useEffect(() => {
    // Delay slightly to allow DOM to finish rendering
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -10% 0px', // Trigger when element is 10% visible
          threshold: 0.05,
        }
      );

      const elements = document.querySelectorAll('.reveal, .reveal-fade');
      elements.forEach((el) => observer.observe(el));

      return () => {
        elements.forEach((el) => observer.unobserve(el));
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
