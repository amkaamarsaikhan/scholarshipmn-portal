"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFirebaseAnalytics } from "@/lib/firebase";

/**
 * Firebase Analytics: SPA-д page_view, мөн /partners/[id] → view_partner, /partners/register → partners_register_view.
 */
export function FirebaseAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const analytics = await getFirebaseAnalytics();
      if (cancelled || !analytics) return;
      const { logEvent } = await import("firebase/analytics");
      logEvent(analytics, "page_view", {
        page_path: pathname,
        page_title: typeof document !== "undefined" ? document.title : undefined,
      });

      const partnersMatch = pathname.match(/^\/partners\/([^/]+)\/?$/);
      if (partnersMatch) {
        const segment = partnersMatch[1];
        if (segment === "register") {
          logEvent(analytics, "partners_register_view", {
            page_path: pathname,
          });
        } else {
          logEvent(analytics, "view_partner", {
            partner_id: segment,
            page_path: pathname,
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
