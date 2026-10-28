/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  AutoFlipConfig, 
  FlipbookMetadata, 
  ViewMode 
} from './types';
import { DEFAULT_FLIPBOOK } from './utils/heyzineData';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { AutopilotBar } from './components/AutopilotBar';
import { HeyzineViewer } from './components/HeyzineViewer';
import { RealisticFlipbook } from './components/RealisticFlipbook';
import { ThumbnailDrawer } from './components/ThumbnailDrawer';
import { EmbedModal } from './components/EmbedModal';
import { SettingsModal } from './components/SettingsModal';
import { FullscreenHUD } from './components/FullscreenHUD';

export default function App() {
  const [metadata, setMetadata] = useState<FlipbookMetadata>(DEFAULT_FLIPBOOK);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('heyzine');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState<boolean>(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isFlippingAnim, setIsFlippingAnim] = useState<boolean>(false);

  // Auto-flip configuration state
  const [config, setConfig] = useState<AutoFlipConfig>({
    enabled: true, // starts autoplay ready
    delaySeconds: 5, // default 5s
    loop: true,
    direction: 'forward',
    step: 1,
    pauseOnHover: false, // Default false so it NEVER stops moving in fullscreen or on hover!
    soundEnabled: true,
    volume: 0.6,
    autoStartOnLoad: true,
  });

  // Remaining time for current page countdown
  const [remainingSeconds, setRemainingSeconds] = useState<number>(config.delaySeconds);

  // References for timing loops
  const timerRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());
  const rootContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset countdown whenever delaySeconds or manual navigation happens
  const resetCountdown = useCallback(() => {
    setRemainingSeconds(config.delaySeconds);
    lastTickTimeRef.current = Date.now();
  }, [config.delaySeconds]);

  // Turn to specific page with sound
  const goToPage = useCallback((newPage: number, triggerSound: boolean = true) => {
    const clamped = Math.max(1, Math.min(metadata.totalPages, newPage));
    if (clamped !== currentPage) {
      if (triggerSound && config.soundEnabled) {
        soundManager.playFlip(config.volume);
      }
      setIsFlippingAnim(true);
      setTimeout(() => setIsFlippingAnim(false), 400);
      setCurrentPage(clamped);
      resetCountdown();
    }
  }, [currentPage, metadata.totalPages, config.soundEnabled, config.volume, resetCountdown]);

  // Next page action
  const handleNextPage = useCallback(() => {
    if (currentPage >= metadata.totalPages) {
      if (config.loop) {
        goToPage(1);
      } else {
        // Reached end
        setConfig((prev) => ({ ...prev, enabled: false }));
        try {
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        } catch {}
      }
    } else {
      goToPage(currentPage + config.step);
    }
  }, [currentPage, metadata.totalPages, config.loop, config.step, goToPage]);

  // Prev page action
  const handlePrevPage = useCallback(() => {
    if (currentPage <= 1) {
      if (config.loop) {
        goToPage(metadata.totalPages);
      }
    } else {
      goToPage(currentPage - config.step);
    }
  }, [currentPage, metadata.totalPages, config.loop, config.step, goToPage]);

  // High-precision countdown ticker
  useEffect(() => {
    if (!config.enabled) {
      setRemainingSeconds(config.delaySeconds);
      return;
    }

    lastTickTimeRef.current = Date.now();

    const interval = setInterval(() => {
      // In fullscreen, NEVER pause for hover! Only pause in windowed mode if pauseOnHover is enabled.
      const shouldPauseForHover = config.pauseOnHover && isHovered && !isFullscreen;
      if (shouldPauseForHover) {
        lastTickTimeRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const deltaSeconds = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      setRemainingSeconds((prev) => {
        const nextVal = prev - deltaSeconds;
        if (nextVal <= 0.05) {
          // Time up! Trigger flip
          if (config.direction === 'forward') {
            handleNextPage();
          } else {
            handlePrevPage();
          }
          return config.delaySeconds;
        }
        return nextVal;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [config.enabled, config.delaySeconds, config.pauseOnHover, isHovered, isFullscreen, config.direction, handleNextPage, handlePrevPage]);

  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
    if (!document.fullscreenElement) {
      try {
        const el = rootContainerRef.current || document.documentElement;
        if (el && el.requestFullscreen) {
          el.requestFullscreen().catch(() => {
            // Theater mode fallback takes over seamlessly
          });
        }
      } catch {
        // Handled by virtual theater fullscreen
      }
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, exitFullscreen, enterFullscreen]);

  // Synchronize fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.code) {
        case 'Escape':
          if (isFullscreen) {
            e.preventDefault();
            exitFullscreen();
          }
          break;
        case 'Space':
          e.preventDefault();
          setConfig((c) => ({ ...c, enabled: !c.enabled }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          handleNextPage();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          handlePrevPage();
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          setConfig((c) => ({ ...c, soundEnabled: !c.soundEnabled }));
          break;
        case 'KeyL':
          e.preventDefault();
          setConfig((c) => ({ ...c, loop: !c.loop }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextPage, handlePrevPage, toggleFullscreen, exitFullscreen, isFullscreen]);

  return (
    <div 
      ref={rootContainerRef}
      className={`bg-slate-950 text-slate-100 overflow-hidden font-sans select-none ${
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen flex flex-col'
          : 'flex flex-col h-screen w-screen'
      }`}
    >
      {/* Top Header - hidden in fullscreen presentation */}
      {!isFullscreen && (
        <Header
          metadata={metadata}
          currentPage={currentPage}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          soundEnabled={config.soundEnabled}
          onToggleSound={() => setConfig((c) => ({ ...c, soundEnabled: !c.soundEnabled }))}
          onOpenEmbedModal={() => setIsEmbedModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onSelectSection={(p) => goToPage(p)}
        />
      )}

      {/* Main Flipbook Viewer Centerpiece */}
      <main className="relative flex-1 w-full h-full min-h-0 overflow-hidden bg-slate-950 flex flex-col">
        {viewMode === 'heyzine' ? (
          <HeyzineViewer
            metadata={metadata}
            currentPage={currentPage}
            autoFlipEnabled={config.enabled}
            remainingSeconds={remainingSeconds}
            delaySeconds={config.delaySeconds}
            onPageChange={(p) => goToPage(p)}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onToggleFullscreen={toggleFullscreen}
          />
        ) : (
          <RealisticFlipbook
            metadata={metadata}
            currentPage={currentPage}
            onPageChange={(p) => goToPage(p)}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            isFlipping={isFlippingAnim}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
        )}
      </main>

      {/* Thumbnail Navigation Drawer - hidden in fullscreen */}
      {!isFullscreen && (
        <ThumbnailDrawer
          metadata={metadata}
          currentPage={currentPage}
          isOpen={isThumbnailsOpen}
          onToggle={() => setIsThumbnailsOpen(!isThumbnailsOpen)}
          onSelectPage={(p) => goToPage(p)}
        />
      )}

      {/* Bottom Autopilot Control Bar with Configurable Delay Timer - hidden in fullscreen because FullscreenHUD is active */}
      {!isFullscreen && (
        <AutopilotBar
          config={config}
          onUpdateConfig={(partial) => {
            setConfig((prev) => {
              const next = { ...prev, ...partial };
              if (partial.delaySeconds !== undefined) {
                setRemainingSeconds(partial.delaySeconds);
              }
              return next;
            });
          }}
          currentPage={currentPage}
          totalPages={metadata.totalPages}
          remainingSeconds={remainingSeconds}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
          onGoToPage={(p) => goToPage(p)}
          isHovered={isHovered}
        />
      )}

      {/* Embed Modal */}
      <EmbedModal
        isOpen={isEmbedModalOpen}
        onClose={() => setIsEmbedModalOpen(false)}
        metadata={metadata}
        config={config}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        metadata={metadata}
        onUpdateMetadata={(partial) => setMetadata((prev) => ({ ...prev, ...partial }))}
        config={config}
        onUpdateConfig={(partial) => setConfig((prev) => ({ ...prev, ...partial }))}
        onResetDefaults={() => {
          setMetadata(DEFAULT_FLIPBOOK);
          setConfig({
            enabled: true,
            delaySeconds: 5,
            loop: true,
            direction: 'forward',
            step: 1,
            pauseOnHover: false,
            soundEnabled: true,
            volume: 0.6,
            autoStartOnLoad: true,
          });
          setCurrentPage(1);
          setRemainingSeconds(5);
        }}
      />

      {/* Fullscreen Floating Presentation HUD */}
      <FullscreenHUD
        isVisible={isFullscreen}
        config={config}
        onUpdateConfig={(partial) => {
          setConfig((prev) => {
            const next = { ...prev, ...partial };
            if (partial.delaySeconds !== undefined) {
              setRemainingSeconds(partial.delaySeconds);
            }
            return next;
          });
        }}
        currentPage={currentPage}
        totalPages={metadata.totalPages}
        remainingSeconds={remainingSeconds}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        onExitFullscreen={toggleFullscreen}
      />
    </div>
  );
}
