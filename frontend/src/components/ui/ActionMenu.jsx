"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TONES = {
  default: "text-gray-700 hover:bg-gray-50",
  primary: "text-blue-600 hover:bg-blue-50",
  success: "text-green-600 hover:bg-green-50",
  danger: "text-red-600 hover:bg-red-50",
};

const MENU_OFFSET = 4;
const VIEWPORT_PADDING = 8;

const ActionMenu = ({ items = [], width = 208, triggerLabel = "Open actions" }) => {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const rect = trigger.getBoundingClientRect();
    const menuHeight = menu.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlip =
      spaceBelow < menuHeight + MENU_OFFSET + VIEWPORT_PADDING &&
      rect.top > menuHeight + MENU_OFFSET + VIEWPORT_PADDING;

    const top = shouldFlip
      ? rect.top - menuHeight - MENU_OFFSET
      : rect.bottom + MENU_OFFSET;
    const maxLeft = Math.max(window.innerWidth - width - VIEWPORT_PADDING, VIEWPORT_PADDING);
    const left = Math.min(Math.max(rect.right - width, VIEWPORT_PADDING), maxLeft);

    setPosition({ top, left });
  }, [width]);

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target)) return;
      if (menuRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  const menuItems = items.filter(Boolean);
  if (menuItems.length === 0) return null;

  const handleSelect = (item) => {
    setIsOpen(false);
    item.onClick?.();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="
          rounded-lg p-2
          text-gray-500
          transition
          hover:bg-gray-100
          hover:text-gray-800
          active:scale-95
        "
      >
        ⋮
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ top: position.top, left: position.left, width }}
            className="fixed z-50 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          >
            {menuItems.map((item, index) => (
              <div key={item.key ?? index}>
                {item.dividerBefore && (
                  <div className="my-1 border-t border-gray-200" />
                )}

                <button
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                  className={`
                    flex w-full items-center gap-2
                    px-4 py-2.5
                    text-left text-sm
                    transition
                    disabled:cursor-not-allowed
                    disabled:text-gray-400
                    disabled:hover:bg-transparent
                    ${TONES[item.tone] || TONES.default}
                  `}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default ActionMenu;
