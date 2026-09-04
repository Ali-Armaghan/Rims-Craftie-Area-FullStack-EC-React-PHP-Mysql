import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  endTrackingPage,
  endTrackingSession,
  initTrackingSession,
  logTrackingEvent,
  logTrackingPageView,
  pingTracking,
} from "@/services/api";

const SESSION_KEY = "craftie_area_visitor_session_uuid";

function getSessionUuid() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(SESSION_KEY, next);
  return next;
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

function getOs() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac OS")) return "macOS";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  if (ua.includes("Linux")) return "Linux";
  return "Unknown";
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
  };
}

function secondsSince(startedAt: number) {
  return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
}

export function useVisitorTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const sessionUuidRef = useRef<string>(getSessionUuid());
  const pageViewIdRef = useRef<number | null>(null);
  const pageStartedAtRef = useRef<number>(Date.now());
  const currentPathRef = useRef<string>("");

  useEffect(() => {
    initTrackingSession({
      session_uuid: sessionUuidRef.current,
      user_id: user?.id,
      referer: document.referrer || undefined,
      landing_page: `${location.pathname}${location.search}`,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOs(),
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...getUtmParams(),
    }).catch(() => undefined);
  }, [location.pathname, location.search, user?.id]);

  useEffect(() => {
    const nextPath = `${location.pathname}${location.search}`;
    const previousPageViewId = pageViewIdRef.current;

    if (previousPageViewId) {
      endTrackingPage({
        session_uuid: sessionUuidRef.current,
        page_view_id: previousPageViewId,
        stay_duration: secondsSince(pageStartedAtRef.current),
        exit_type: "navigation",
      });
    }

    pageStartedAtRef.current = Date.now();
    currentPathRef.current = nextPath;
    pageViewIdRef.current = null;

    logTrackingPageView({
      session_uuid: sessionUuidRef.current,
      page_path: nextPath,
      page_url: window.location.href,
      page_title: document.title,
      referrer_url: document.referrer || undefined,
    })
      .then((response) => {
        pageViewIdRef.current = response?.data?.page_view_id ?? null;
      })
      .catch(() => undefined);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      pingTracking({
        session_uuid: sessionUuidRef.current,
        current_page: currentPathRef.current || `${location.pathname}${location.search}`,
        page_title: document.title,
        page_view_id: pageViewIdRef.current,
        stay_duration: secondsSince(pageStartedAtRef.current),
      });
    }, 15000);

    return () => window.clearInterval(interval);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const actionable = target?.closest("a,button,[role='button']");
      if (!actionable) return;

      logTrackingEvent({
        session_uuid: sessionUuidRef.current,
        page_view_id: pageViewIdRef.current,
        event_type: "click",
        event_name:
          actionable.getAttribute("aria-label") ||
          actionable.textContent?.trim().slice(0, 100) ||
          actionable.tagName.toLowerCase(),
        page_path: currentPathRef.current,
        event_data: {
          tag: actionable.tagName.toLowerCase(),
          href: actionable instanceof HTMLAnchorElement ? actionable.href : undefined,
        },
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pageViewIdRef.current) {
        endTrackingPage({
          session_uuid: sessionUuidRef.current,
          page_view_id: pageViewIdRef.current,
          stay_duration: secondsSince(pageStartedAtRef.current),
          exit_type: "close",
        });
      }

      endTrackingSession({
        session_uuid: sessionUuidRef.current,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
