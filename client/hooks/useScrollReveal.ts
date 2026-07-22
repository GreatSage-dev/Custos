import { useEffect } from 'react';

/**
 * Premium scroll-triggered reveal system.
 *
 * Attaches IntersectionObserver to all `[data-reveal]` elements.
 * Supported modes via data-reveal attribute:
 *   "mask-up"    — clip-mask slides upward, text rises into view
 *   "blur-sharp" — blurred + scaled resolves to crisp
 *   "fade-slide" — subtle opacity + upward translate
 *   "stagger"    — children sequenced via --i CSS variable
 *   "parallax"   — scroll-scrubbed transform (continuous, not one-shot)
 *
 * Pass a dependency array to re-observe when conditional content mounts.
 */
export function useScrollReveal(deps: unknown[] = []) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');

    // Immediately reveal everything if reduced motion is preferred
    if (prefersReducedMotion) {
      elements.forEach((el) => {
        el.classList.add('revealed');
        el.removeAttribute('data-reveal');
      });
      return;
    }

    // ── IntersectionObserver ──
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target as HTMLElement;
          const type = el.dataset.reveal;

          // Stagger: set --i index on each child for sequential delay
          if (type === 'stagger') {
            const children = Array.from(el.children) as HTMLElement[];
            children.forEach((child, i) => {
              child.style.setProperty('--i', String(i));
            });

            // After the last child finishes, strip reveal CSS so
            // the element's own hover/transition styles can take over
            const lastChild = children[children.length - 1];
            if (lastChild) {
              const cleanup = () => {
                el.removeAttribute('data-reveal');
                children.forEach((c) => {
                  c.style.removeProperty('--i');
                });
              };
              lastChild.addEventListener('transitionend', cleanup, { once: true });
              // Fallback in case transitionend never fires
              setTimeout(cleanup, 2200);
            }
          }

          el.classList.add('revealed');
          observer.unobserve(el);

          // Non-stagger, non-parallax: clean up after transition
          if (type !== 'stagger' && type !== 'parallax') {
            const onEnd = () => el.removeAttribute('data-reveal');
            el.addEventListener('transitionend', onEnd, { once: true });
            setTimeout(onEnd, 1500);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' },
    );

    elements.forEach((el) => {
      if (el.dataset.reveal !== 'parallax') {
        observer.observe(el);
      }
    });

    // ── Parallax scroll scrub ──
    const parallaxEls = document.querySelectorAll<HTMLElement>(
      '[data-reveal="parallax"]',
    );
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        parallaxEls.forEach((el) => {
          const parent = el.parentElement;
          if (!parent) return;
          const rect = parent.getBoundingClientRect();
          const vh = window.innerHeight;
          if (rect.top < vh + 200 && rect.bottom > -200) {
            // 0 = section just entering bottom, 1 = section just leaving top
            const progress = (vh - rect.top) / (vh + rect.height);
            // Subtle upward scrub: -60px → +60px across the viewport
            const y = (progress - 0.5) * 120;
            el.style.transform = `translateY(${y}px)`;
          }
        });
        ticking = false;
      });
    }

    if (parallaxEls.length > 0) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll(); // Set initial position
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
