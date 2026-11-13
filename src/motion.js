import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initMotion() {
  const media = gsap.matchMedia();
  media.add(
    {
      desktop: "(min-width: 761px)",
      mobile: "(max-width: 760px)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      if (context.conditions.reduced) return;
      const mobile = context.conditions.mobile;
      const distance = mobile ? 18 : 32;
      const defaults = { duration: 0.65, ease: "power3.out", clearProps: "all" };
      const enter = { opacity: 0, y: distance };
      const trigger = (element) => ({
        trigger: element,
        start: "top 90%",
        once: true,
      });

      const hero = gsap.timeline({ defaults });
      hero
        .from(".hero-copy .eyebrow", { ...enter, duration: 0.45 })
        .from(".hero-line", { ...enter, stagger: 0.1 }, "-=0.25")
        .from(".hero-copy > p", enter, "-=0.4")
        .from(".hero-actions, .hero-note", { ...enter, stagger: 0.1 }, "-=0.4");

      const underline = document.querySelector(".hero h1 path");
      const length = underline.getTotalLength();
      hero.fromTo(underline,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 0.6, ease: "power2.out", clearProps: "all" },
        0.6,
      );

      gsap.from(".events .section-heading > *", {
        ...defaults,
        ...enter,
        stagger: 0.12,
        scrollTrigger: trigger(".events .section-heading"),
      });

      const cards = gsap.utils.toArray(".event-card");
      cards.forEach((card, index) => {
        card.classList.add("is-revealing");
        gsap.from(card, {
          ...defaults,
          ...enter,
          delay: mobile ? 0 : index * 0.12,
          ease: "back.out(1.08)",
          scrollTrigger: trigger(mobile ? card : ".event-grid"),
          onComplete: () => card.classList.remove("is-revealing"),
        });
      });

      const date = gsap.timeline({
        defaults,
        scrollTrigger: trigger(".date-banner"),
      });
      date
        .from(".date-banner > div:first-child > span", enter)
        .from(".date-banner strong", {
          ...enter,
          clipPath: "inset(0 0 100% 0)",
          duration: 0.8,
        }, "-=0.45")
        .from(".date-side p", enter, "-=0.55")
        .from(".date-flower", {
          opacity: 0,
          scale: 0.8,
          rotation: -45,
          ease: "back.out(1.3)",
        }, "-=0.55");

      // matchMedia reverts all GSAP styles/triggers, including on preference changes.
      return () => cards.forEach((card) => card.classList.remove("is-revealing"));
    },
  );
}
