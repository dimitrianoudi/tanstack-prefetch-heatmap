import * as React from "react";
import { useRouter } from "@tanstack/react-router";

type PrefetchStatus = "pending" | "hit" | "waste" | undefined;

export type TrackedLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: any;
  params?: any;
  search?: any;
  hash?: string;
  from?: any;
  replace?: boolean;
  ttlMs?: number;
  intent?: Array<"hover" | "focus" | "touch">;
  onPrefetchIntent?: (href: string) => void;
};

export function TrackedLink(props: TrackedLinkProps) {
  const {
    to, params, search, hash, from, replace,
    ttlMs = 15000,
    intent = ["hover", "focus", "touch"],
    onPrefetchIntent,
    className, children, target, rel,
    onMouseEnter, onFocus, onTouchStart, onClick,
    ...rest
  } = props;

  const router = useRouter();

  const { href } = router.buildLocation({
    to: to as any,
    params: params as any,
    search: search as any,
    hash,
    from,
  } as any);

  const [status, setStatus] = React.useState<PrefetchStatus>(undefined);
  const timer = React.useRef<number | null>(null);
  const clicked = React.useRef(false);

  const startPending = React.useCallback(() => {
    setStatus("pending");
    clicked.current = false;
    onPrefetchIntent?.(href);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (!clicked.current) setStatus("waste");
    }, ttlMs);
  }, [href, onPrefetchIntent, ttlMs]);

  const handleMouseEnter: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (intent.includes("hover")) startPending();
    onMouseEnter?.(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLAnchorElement> = (e) => {
    if (intent.includes("focus")) startPending();
    onFocus?.(e);
  };

  const handleTouchStart: React.TouchEventHandler<HTMLAnchorElement> = (e) => {
    if (intent.includes("touch") && status !== "pending") startPending();
    onTouchStart?.(e);
  };

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (
      e.defaultPrevented ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
      target === "_blank"
    ) {
      onClick?.(e);
      return;
    }

    e.preventDefault();
    clicked.current = true;
    if (timer.current) window.clearTimeout(timer.current);
    setStatus("hit");

    router.navigate({
      to: to as any,
      params: params as any,
      search: search as any,
      hash,
      from,
      replace,
    } as any);

    onClick?.(e);
  };

  React.useEffect(() => {
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, []);

  return (
    <a
      {...rest}
      href={href}
      target={target}
      rel={rel}
      className={className}
      data-tsr-prefetch={status}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
