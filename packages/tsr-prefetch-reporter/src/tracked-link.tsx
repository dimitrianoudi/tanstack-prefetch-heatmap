import * as React from "react";
import { useRouter } from "@tanstack/react-router";

type Trigger = "hover" | "focus";

type PrefetchStatus = "pending" | "hit" | "waste" | undefined;

export type TrackedLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: any;
  params?: any;
  search?: any;
  hash?: string;
  from?: any;
  replace?: boolean;

  ttlMs?: number;

  intent?: Array<Trigger>;

  onPrefetchIntent?: (href: string) => void;
};

function routeIdFromHref(href: string): string {
  try {
    const u = new URL(href, window.location.origin);
    return u.pathname || href;
  } catch {
    return href;
  }
}

export function TrackedLink(props: TrackedLinkProps) {
  const {
    to, params, search, hash, from, replace,
    ttlMs = 15000,
    intent = ["hover", "focus"] as Trigger[],
    onPrefetchIntent,
    className, children, target, rel,
    onMouseEnter, onFocus, onClick,
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

  const routeId = routeIdFromHref(href);

  const [status, setStatus] = React.useState<PrefetchStatus>(undefined);
  const timer = React.useRef<number | null>(null);
  const clicked = React.useRef(false);

  const emit = (payload: unknown) => {
    (window as any).__TANSTACK_DEVTOOLS_EVENT_CLIENT__?.emit?.(payload);
  };

  const emitRequest = (trigger: Trigger) => {
    emit({
      type: "router.prefetch.request",
      href,
      routeId,
      trigger,
      at: Date.now(),
      attrs: { ttlMs }
    });
  };

  const emitNavComplete = () => {
    emit({
      type: "router.nav.complete",
      href,
      routeId,
      at: Date.now()
    });
  };

  const startPending = React.useCallback(
    (trigger: Trigger) => {
      setStatus("pending");
      clicked.current = false;

      emitRequest(trigger);
      onPrefetchIntent?.(href);

      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        if (!clicked.current) {
          setStatus("waste");
        }
      }, ttlMs);
    },
    [href, ttlMs, onPrefetchIntent]
  );

  const handleMouseEnter: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (intent.includes("hover")) startPending("hover");
    onMouseEnter?.(e);
  };

  const handleFocus: React.FocusEventHandler<HTMLAnchorElement> = (e) => {
    if (intent.includes("focus")) startPending("focus");
    onFocus?.(e);
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

    router
      .navigate({
        to: to as any,
        params: params as any,
        search: search as any,
        hash,
        from,
        replace,
      } as any)
      .then(() => {
        emitNavComplete();
      });

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
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
