"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFirebaseAnalytics } from "@/lib/firebase";

/**
 * Firebase Console → Analytics-д SPA шилжилтийг тусгах (page_view).
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
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
