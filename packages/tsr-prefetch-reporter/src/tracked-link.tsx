import * as React from "react";
import type { PrefetchTrigger, ReporterOptions } from "./types";
import { createPrefetchReporter } from "./index";

type LinkProps = React.PropsWithChildren<{
  router: any;
  to: string;
  preload?: boolean | "intent";
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}>;

export function TrackedLink(props: LinkProps & { reporterOptions?: ReporterOptions }) {
  const { router, to, preload = "intent", className, onClick, children, reporterOptions } = props;
  const repRef = React.useRef(createPrefetchReporter(router, reporterOptions));
  const href = to;

  const intent = React.useCallback((trigger: PrefetchTrigger) => {
    if (preload === true || preload === "intent") {
      repRef.current.reportPrefetch(href, trigger);
    }
  }, [href, preload]);

  const anchorRef = React.useRef<HTMLAnchorElement | null>(null);
  React.useEffect(() => {
    if (!anchorRef.current || preload !== true) return;
    const el = anchorRef.current;
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          repRef.current.reportPrefetch(href, "viewport");
          io.disconnect();
          break;
        }
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [href, preload]);

  const handleClick = React.useCallback(async (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      e.preventDefault();
      await repRef.current.reportNavigation(href);
    }
  }, [href, onClick]);

  return (
    <a
      ref={anchorRef}
      href={href}
      onMouseEnter={() => intent("hover")}
      onFocus={() => intent("focus")}
      onClick={handleClick}
      data-tsr-link=""
      className={className}
    >
      {children}
    </a>
  );
}
