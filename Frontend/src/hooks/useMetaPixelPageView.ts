import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackMetaPageView } from "@/lib/meta-pixel";

/**
 * Fires Meta Pixel PageView on every client-side route change (SPA).
 * Initial PageView still comes from index.html bootstrap.
 */
export function useMetaPixelPageView() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    trackMetaPageView();
  }, [location.pathname, location.search]);
}
