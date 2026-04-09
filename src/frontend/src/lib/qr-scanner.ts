// Local implementation of useQRScanner using native browser camera APIs
// Does not depend on any @caffeineai packages

/* eslint-disable */
import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

declare global {
  interface Window {
    jsQR: (
      data: Uint8ClampedArray,
      width: number,
      height: number,
    ) => { data: string } | null;
  }
}

export interface QRResult {
  data: string;
  timestamp: number;
}

export interface QRScannerConfig {
  facingMode?: "user" | "environment";
  scanInterval?: number;
  maxResults?: number;
  jsQRUrl?: string;
}

interface CameraReturn {
  isActive: boolean;
  isSupported: boolean | null;
  error: { type: string; message: string } | null;
  isLoading: boolean;
  currentFacingMode: "user" | "environment";
  startCamera: () => Promise<boolean>;
  stopCamera: () => Promise<void>;
  switchCamera: (newFacingMode?: "user" | "environment") => Promise<boolean>;
  retry: () => Promise<boolean>;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}

export interface UseQRScannerReturn {
  qrResults: QRResult[];
  isScanning: boolean;
  jsQRLoaded: boolean;
  isActive: boolean;
  isSupported: boolean | null;
  error: { type: string; message: string } | null;
  isLoading: boolean;
  currentFacingMode: "user" | "environment";
  startScanning: () => Promise<boolean>;
  stopScanning: () => Promise<void>;
  switchCamera: () => Promise<boolean>;
  clearResults: () => void;
  reset: () => void;
  retry: () => Promise<boolean>;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isReady: boolean;
  canStartScanning: boolean;
}

function useCamera(config: {
  facingMode?: "user" | "environment";
}): CameraReturn {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<{ type: string; message: string } | null>(
    null,
  );
  const [currentFacingMode, setCurrentFacingMode] = useState<
    "user" | "environment"
  >(config.facingMode ?? "environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsSupported(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices &&
        !!navigator.mediaDevices.getUserMedia,
    );
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: currentFacingMode },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      setIsLoading(false);
      return true;
    } catch (err) {
      const e = err as Error;
      setError({
        type: "camera-error",
        message: e.message ?? "Camera access denied",
      });
      setIsActive(false);
      setIsLoading(false);
      return false;
    }
  }, [currentFacingMode]);

  const stopCamera = useCallback(async (): Promise<void> => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const switchCamera = useCallback(
    async (newFacingMode?: "user" | "environment"): Promise<boolean> => {
      const next =
        newFacingMode ??
        (currentFacingMode === "environment" ? "user" : "environment");
      await stopCamera();
      setCurrentFacingMode(next);
      return true;
    },
    [currentFacingMode, stopCamera],
  );

  const retry = useCallback(async (): Promise<boolean> => {
    setError(null);
    return startCamera();
  }, [startCamera]);

  return {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  };
}

export function useQRScanner(config: QRScannerConfig): UseQRScannerReturn {
  const {
    facingMode,
    scanInterval = 100,
    maxResults = 10,
    jsQRUrl = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js",
  } = config;

  const [qrResults, setQrResults] = useState<QRResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [jsQRLoaded, setJsQRLoaded] = useState(false);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastScanRef = useRef("");
  const isMountedRef = useRef(true);

  const camera = useCamera({ facingMode });

  // Load jsQR from CDN
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.jsQR === "function") {
      setJsQRLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = jsQRUrl;
    script.onload = () => {
      if (isMountedRef.current) setJsQRLoaded(true);
    };
    script.onerror = () => console.error("Failed to load jsQR library");
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [jsQRUrl]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const scanQRCode = useCallback(() => {
    if (
      !camera.videoRef.current ||
      !camera.canvasRef.current ||
      !jsQRLoaded ||
      !window.jsQR
    )
      return;
    const video = camera.videoRef.current;
    const canvas = camera.canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = window.jsQR(imageData.data, imageData.width, imageData.height);
    if (code?.data && code.data !== lastScanRef.current) {
      lastScanRef.current = code.data;
      const newResult: QRResult = { data: code.data, timestamp: Date.now() };
      if (isMountedRef.current) {
        setQrResults((prev) => [newResult, ...prev.slice(0, maxResults - 1)]);
      }
    }
  }, [camera.videoRef, camera.canvasRef, jsQRLoaded, maxResults]);

  useEffect(() => {
    if (isScanning && camera.isActive && jsQRLoaded) {
      scanIntervalRef.current = setInterval(scanQRCode, scanInterval);
    } else {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    }
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [isScanning, camera.isActive, jsQRLoaded, scanQRCode, scanInterval]);

  const startScanning = useCallback(async (): Promise<boolean> => {
    if (!camera.isActive) {
      const success = await camera.startCamera();
      if (success) {
        setIsScanning(true);
        return true;
      }
      return false;
    }
    setIsScanning(true);
    return true;
  }, [camera]);

  const stopScanning = useCallback(async (): Promise<void> => {
    setIsScanning(false);
    await camera.stopCamera();
    lastScanRef.current = "";
  }, [camera]);

  const switchCamera = useCallback(async (): Promise<boolean> => {
    const success = await camera.switchCamera();
    if (success && isScanning) lastScanRef.current = "";
    return success;
  }, [camera, isScanning]);

  const clearResults = useCallback(() => {
    setQrResults([]);
    lastScanRef.current = "";
  }, []);

  const reset = useCallback(() => {
    setIsScanning(false);
    clearResults();
  }, [clearResults]);

  return {
    qrResults,
    isScanning,
    jsQRLoaded,
    isActive: camera.isActive,
    isSupported: camera.isSupported,
    error: camera.error,
    isLoading: camera.isLoading,
    currentFacingMode: camera.currentFacingMode,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
    reset,
    retry: camera.retry,
    videoRef: camera.videoRef,
    canvasRef: camera.canvasRef,
    isReady: jsQRLoaded && camera.isSupported !== false,
    canStartScanning:
      jsQRLoaded && camera.isSupported === true && !camera.isLoading,
  };
}
