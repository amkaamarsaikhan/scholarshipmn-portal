"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { FirebaseAnalytics } from "@/components/FirebaseAnalytics";
import WebVitalsReporter from "@/components/WebVitalsReporter";

export default function ClientAnalytics() {
  const [enableFirebaseAnalytics, setEnableFirebaseAnalytics] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    idleId = window.requestIdleCallback?.(() => setEnableFirebaseAnalytics(true), {
      timeout: 2500,
    });

    if (idleId === undefined) {
      timeoutId = window.setTimeout(() => setEnableFirebaseAnalytics(true), 1200);
    }

    return () => {
      if (idleId !== undefined) {
        window.cancelIdleCallback?.(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <>
      <Analytics />
      <WebVitalsReporter />
      {enableFirebaseAnalytics ? <FirebaseAnalytics /> : null}
    </>
  );
}
