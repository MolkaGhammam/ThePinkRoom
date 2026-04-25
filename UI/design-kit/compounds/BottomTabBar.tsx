import type { ComponentType, SVGProps } from "react";
import { cn } from "../utils/cn";

export interface BottomTab {
  key: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}

export interface BottomTabBarProps {
  tabs: BottomTab[];
  active: string;
  onChange?: (key: string) => void;
  className?: string;
}

/**
 * Floating bottom tab bar. Renders as a fixed, centered pill with side margin
 * and a soft shadow — sticks to the viewport while the page scrolls.
 *
 * Page note: pages that include this bar should reserve `pb-28` on their
 * scroll container so content does not hide behind the floating pill.
 */
export function BottomTabBar({ tabs, active, onChange, className }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-5 z-40",
        "mx-auto w-full max-w-viewport px-5",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-around rounded-full bg-white px-3 shadow-card">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onChange?.(tab.key)}
              className="group flex h-12 w-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lavender-ring"
            >
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                  isActive ? "bg-inverse text-white" : "bg-transparent text-ink",
                )}
              >
                <Icon width={22} height={22} strokeWidth={2} />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
