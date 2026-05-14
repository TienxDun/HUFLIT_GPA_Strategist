"use client";

import { useEffect } from "react";

interface ServiceWorkerRegisterProps {
  basePath: string;
}

export function ServiceWorkerRegister({ basePath }: ServiceWorkerRegisterProps) {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const swUrl = `${basePath}/sw.js`.replace(/\/+/g, "/");
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, [basePath]);

  return null;
}
