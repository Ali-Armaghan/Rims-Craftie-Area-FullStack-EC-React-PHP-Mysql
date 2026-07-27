import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  captureReferralFromSearch,
  stripReferralParams,
} from "@/lib/referral";

/**
 * Captures ?ref= / ?referral= / ?code= on any route and stores it for checkout.
 * Strips the param from the URL after save so the address bar stays clean.
 */
export function useReferralCapture() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const captured = captureReferralFromSearch(location.search);
    if (!captured) return;

    const nextSearch = stripReferralParams(location.search);
    if (nextSearch === location.search) return;

    navigate(
      { pathname: location.pathname, search: nextSearch, hash: location.hash },
      { replace: true }
    );
  }, [location.pathname, location.search, location.hash, navigate]);
}
