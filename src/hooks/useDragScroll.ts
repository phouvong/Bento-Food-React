import {
  useCallback,
  useRef,
  type PointerEvent,
  type MouseEvent,
  type RefObject,
} from "react";

// Threshold (px) below which a press counts as a click, not a drag —
// matches the feel of Swiper's click suppression on the real sliders.
const DRAG_THRESHOLD = 6;

/**
 * Mouse drag-to-scroll for native `overflow-x: auto` rows (the CSS scroll
 * tracks used by "Visit Again", "New on …", and "Last Order").
 *
 * Touch input is deliberately ignored — native overflow scrolling already
 * handles it; intercepting would fight the browser. Only `pointerType ===
 * "mouse"` drags are translated into scrollLeft changes, with scroll-snap
 * disabled mid-drag so it doesn't yank the row while the button is held,
 * and clicks suppressed after a real drag so cards don't navigate.
 *
 * Generic over the element type so the ref matches whatever the row is
 * (`HTMLDivElement` for MUI Box/styled rows — the default).
 */
export interface DragScrollBind<T extends HTMLElement> {
  ref: RefObject<T | null>;
  onPointerDown: (e: PointerEvent<T>) => void;
  onPointerMove: (e: PointerEvent<T>) => void;
  onPointerUp: (e: PointerEvent<T>) => void;
  onPointerCancel: (e: PointerEvent<T>) => void;
  onClickCapture: (e: MouseEvent<T>) => void;
  // React's DragEvent type isn't needed — we only preventDefault.
  onDragStart: (e: MouseEvent<T>) => void;
  onMouseDown: (e: MouseEvent<T>) => void;
}

const useDragScroll = <
  T extends HTMLElement = HTMLDivElement,
>(): DragScrollBind<T> => {
  // The row element; also returned so callers can keep using it for their
  // arrow-button scrollBy calls.
  const ref = useRef<T | null>(null);
  const state = useRef({
    down: false,
    dragged: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const onPointerDown = useCallback((e: PointerEvent<T>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = ref.current;
    if (!el) return;
    state.current = {
      down: true,
      dragged: false,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
    };
  }, []);

  const onPointerMove = useCallback((e: PointerEvent<T>) => {
    const s = state.current;
    const el = ref.current;
    if (!s.down || !el) return;
    const dx = e.clientX - s.startX;
    if (!s.dragged && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!s.dragged) {
      s.dragged = true;
      // Snap would fight the live drag; restore it on release.
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";
      // Keep receiving moves even when the pointer leaves the row.
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = s.startScrollLeft - dx;
    e.preventDefault();
  }, []);

  const endDrag = useCallback((e: PointerEvent<T>) => {
    const s = state.current;
    const el = ref.current;
    if (!s.down) return;
    s.down = false;
    if (el && s.dragged) {
      if (el.hasPointerCapture(e.pointerId))
        el.releasePointerCapture(e.pointerId);
      // Restoring snap makes the row settle onto the nearest card, like the
      // Swiper sliders do on release.
      el.style.scrollSnapType = "";
      el.style.scrollBehavior = "";
    }
  }, []);

  const onClickCapture = useCallback((e: MouseEvent<T>) => {
    // A press that actually dragged must not click through to the card.
    if (state.current.dragged) {
      e.preventDefault();
      e.stopPropagation();
      state.current.dragged = false;
    }
  }, []);

  // Mouse-dragging a card image/link otherwise starts the browser's native
  // ghost-image drag, which cancels the pointer stream mid-gesture — the
  // same fix SlickToSwiper applies to the Swiper sliders.
  const onDragStart = useCallback((e: MouseEvent<T>) => {
    e.preventDefault();
  }, []);

  // Belt & braces: mousedown's default action is what INITIATES text
  // selection and native drags. Preventing it up front stops both before
  // dragstart ever fires. Clicks are unaffected (click is not a mousedown
  // default), and these rows contain no focusable inputs.
  const onMouseDown = useCallback((e: MouseEvent<T>) => {
    if (e.button === 0) e.preventDefault();
  }, []);

  return {
    ref,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onClickCapture,
    onDragStart,
    onMouseDown,
  };
};

export default useDragScroll;
