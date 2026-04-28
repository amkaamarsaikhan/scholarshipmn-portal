"use client";

import { useReportWebVitals } from "next/web-vitals";
import { getFirebaseAnalytics } from "@/lib/firebase";

const ALLOWED_METRICS = new Set(["CLS", "LCP", "INP", "FCP", "TTFB"]);

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!ALLOWED_METRICS.has(metric.name)) return;

    void (async () => {
      const analytics = await getFirebaseAnalytics();
      if (!analytics) return;

      const { logEvent } = await import("firebase/analytics");
      logEvent(analytics, "web_vital", {
        metric_name: metric.name,
        metric_id: metric.id,
        metric_value: Number(metric.value.toFixed(2)),
        rating: metric.rating,
        page_path: window.location.pathname,
      });
    })();
  });

  return null;
}
