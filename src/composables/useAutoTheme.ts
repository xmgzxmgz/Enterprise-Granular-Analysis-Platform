export function useAutoTheme() {
  const htmlEl = document.documentElement;

  const apply = (mode: "light" | "dark") => {
    htmlEl.classList.remove("light", "dark");
    htmlEl.classList.add(mode);
  };

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleMedia = (e: MediaQueryListEvent) => {
    apply(e.matches ? "dark" : "light");
  };
  // 初次按系统偏好设置
  apply(media.matches ? "dark" : "light");
  // 监听系统主题变化
  media.addEventListener("change", handleMedia);

  // 时间维度的兜底：晚7点-早7点自动暗色
  const checkTime = () => {
    const hour = new Date().getHours();
    const preferDarkByTime = hour >= 19 || hour < 7;
    if (!media.matches) {
      apply(preferDarkByTime ? "dark" : "light");
    }
  };
  checkTime();
  const timer = window.setInterval(checkTime, 10 * 60 * 1000);

  return () => {
    window.clearInterval(timer);
    media.removeEventListener("change", handleMedia);
  };
}
