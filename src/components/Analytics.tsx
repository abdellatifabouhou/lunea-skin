"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Analytics & pixels — loaded only when an ID is configured.
 * Configure in .env:
 *   NEXT_PUBLIC_GA4_MEASUREMENT_ID=YOUR_GA4_MEASUREMENT_ID
 *   NEXT_PUBLIC_META_PIXEL_ID=YOUR_META_PIXEL_ID
 *   NEXT_PUBLIC_TIKTOK_PIXEL_ID=YOUR_TIKTOK_PIXEL_ID
 * Placeholders (values starting with "YOUR_") are ignored so nothing breaks.
 */
function realId(v: string | undefined): string | null {
  const s = (v ?? "").trim();
  return s && !s.startsWith("YOUR_") ? s : null;
}

export function Analytics() {
  const pathname = usePathname();
  const firstPath = useRef(true);
  const ga4 = realId(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);
  const meta = realId(process.env.NEXT_PUBLIC_META_PIXEL_ID);
  const tiktok = realId(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID);

  useEffect(() => {
    if (!ga4 || firstPath.current) {
      firstPath.current = false;
      return;
    }

    try {
      window.gtag?.("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    } catch {
      /* analytics must never break navigation */
    }
  }, [ga4, pathname]);

  return (
    <>
      {ga4 && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4}',{send_page_view:true});`}
          </Script>
        </>
      )}
      {meta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`}
        </Script>
      )}
      {tiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktok}');ttq.page();}(window,document,'ttq');`}
        </Script>
      )}
    </>
  );
}
