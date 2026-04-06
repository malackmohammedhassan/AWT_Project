import { Database, FlaskConical, Gauge, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/datasets", label: "Datasets", icon: Database },
  { to: "/training", label: "Training", icon: FlaskConical },
  { to: "/prediction", label: "Prediction", icon: Gauge },
  { to: "/experiments", label: "Experiments Lab", icon: Sparkles },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-60 border-r border-slate-700 bg-slate-900/95 backdrop-blur-md">
      <div className="flex h-16 items-center border-b border-slate-800 px-5">
        <p className="text-lg font-semibold text-slate-100">ML Ops Console</p>
      </div>
      <nav className="mt-6 px-3">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "border-emerald-400 bg-slate-800 text-slate-100"
                        : "border-transparent text-slate-300 hover:bg-slate-800/70 hover:text-slate-100",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
