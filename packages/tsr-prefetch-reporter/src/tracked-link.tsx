import * as React from "react";
import { Link } from "@tanstack/react-router";

type TrackedLinkProps = React.ComponentProps<typeof Link> & {
  router: any;
  ttlMs?: number;
};

export function TrackedLink({ router, ttlMs = 15000, onPointerEnter, onClick, ...props }: TrackedLinkProps) {
  const aRef = React.useRef<HTMLAnchorElement | null>(null);
  const wasteTimer = React.useRef<number | null>(null);
  const hadClick = React.useRef(false);

  const setState = (state?: "pending" | "hit" | "waste") => {
    const el = aRef.current;
    if (!el) return;
    if (!state) el.removeAttribute("data-tsr-prefetch");
    else el.setAttribute("data-tsr-prefetch", state);
  };

  const handlePointerEnter: React.PointerEventHandler<HTMLAnchorElement> = (e) => {
    setState("pending");

    if (wasteTimer.current) window.clearTimeout(wasteTimer.current);
    hadClick.current = false;
    wasteTimer.current = window.setTimeout(() => {
      if (!hadClick.current) setState("waste");
    }, ttlMs);

    onPointerEnter?.(e);
  };

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    hadClick.current = true;
    if (wasteTimer.current) window.clearTimeout(wasteTimer.current);
    setState("hit");

    onClick?.(e);
  };

  React.useEffect(() => {
    return () => { if (wasteTimer.current) window.clearTimeout(wasteTimer.current); };
  }, []);

  return (
    <Link
      ref={aRef as any}
      onPointerEnter={handlePointerEnter}
      onClick={handleClick}
      {...props}
    />
  );
}
