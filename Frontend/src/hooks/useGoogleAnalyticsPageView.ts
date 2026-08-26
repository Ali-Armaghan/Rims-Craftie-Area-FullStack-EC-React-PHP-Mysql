import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackGAPageView } from "@/lib/google-analytics";

/**
 * Fires Google Analytics (GA4) PageView on every client-side route change (SPA).
 * Initial PageView is handled by index.html gtag bootstrap.
 */
export function useGoogleAnalyticsPageView() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackGAPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
