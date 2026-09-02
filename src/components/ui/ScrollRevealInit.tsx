"use client";

import { useEffect } from "react";

/**
 * ScrollRevealInit — global scroll-reveal using IntersectionObserver.
 * Attaches to any element with class "scroll-reveal" and adds "revealed"
 * when it enters the viewport. CSS handles the animation.
 */
export function ScrollRevealInit() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            // Unobserve after reveal so it doesn't re-animate
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const attachObserver = () => {
      document.querySelectorAll(".scroll-reveal:not(.revealed)").forEach((el) => {
        observer.observe(el);
      });
    };

    // Initial attach
    attachObserver();

    // Re-attach on DOM mutations (for dynamically loaded sections)
    const mutationObserver = new MutationObserver(attachObserver);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
