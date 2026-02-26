// Minimal toast utility — integrates with a simple DOM toast container
export function toast(message: string, type: "success" | "error" = "success") {
  if (typeof window === "undefined") return;

  const container = document.getElementById("toast-container") ?? createContainer();

  const el = document.createElement("div");
  el.className = [
    "px-4 py-3 rounded-xl text-sm font-medium shadow-lg border transition-all duration-300",
    "translate-y-2 opacity-0",
    type === "error"
      ? "bg-red-950 border-red-800/60 text-red-300"
      : "bg-gray-900 border-gray-700/60 text-gray-100",
  ].join(" ");
  el.textContent = message;

  container.appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    el.classList.remove("translate-y-2", "opacity-0");
    el.classList.add("translate-y-0", "opacity-100");
  });

  // Auto-remove
  setTimeout(() => {
    el.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

function createContainer() {
  const div = document.createElement("div");
  div.id = "toast-container";
  div.className = "fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end";
  document.body.appendChild(div);
  return div;
}
