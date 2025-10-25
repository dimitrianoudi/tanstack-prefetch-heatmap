import * as React from "react";
import { Link } from "@tanstack/react-router";

type PrefetchStatus = "pending" | "hit" | "waste" | undefined;

type TrackedLinkProps = React.ComponentProps<typeof Link> & {
  /** Time window (ms) for a prefetch to be considered "hot" before turning into "waste". */
  ttlMs?: number;
  /** Which interactions count as "intent" to prefetch. */
  intent?: Array<"hover" | "focus" | "touch">;
  /** Optional hook for your analytics/reporter bus. */
  onPrefetchIntent?: (href: string) => void;
};

export function TrackedLink(props: TrackedLinkProps) {
  const {
    ttlMs = 15000,
    intent = ["hover", "focus", "touch"],
    onPrefetchIntent,
    onPointerEnter,
    onFocus,
    onPointerDown,
    onClick,
    to,
    ...rest
  } = props;

  const [status, setStatus] = React.useState<PrefetchStatus>(undefined);
  const timer = React.useRef<number | null>(null);
  const clicked = React.useRef(false);

  const href = typeof to === "string" ? to : (to as any)?.toString?.() ?? "";

  const startPending = React.useCallback(() => {
    setStatus("pending");
    clicked.current = false;

    // notify reporter (optional)
    if (onPrefetchIntent) onPrefetchIntent(href);

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (!clicked.current) setStatus("waste");
    }, ttlMs);
  }, [href, onPrefetchIntent, ttlMs]);

  const handlePointerEnter: React.PointerEventHandler<HTMLAnchorElement> = (e) => {
    if (intent.includes("hover")) startPending();
    onPointerEnter?.(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLAnchorElement> = (e) => {
    if (intent.includes("focus")) startPending();
    onFocus?.(e);
  };

  const handlePointerDown: React.PointerEventHandler<HTMLAnchorElement> = (e) => {
    // Touch users won’t hover; treat first touch as intent
    if (intent.includes("touch")) {
      // only kick off if we’re not already pending
      if (status !== "pending") startPending();
    }
    onPointerDown?.(e);
  };

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    clicked.current = true;
    if (timer.current) window.clearTimeout(timer.current);
    setStatus("hit");
    onClick?.(e);
  };

  React.useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <Link
      {...rest}
      to={to as any}
      data-tsr-prefetch={status}
      onPointerEnter={handlePointerEnter}
      onFocus={handleFocus}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    />
  );
}
