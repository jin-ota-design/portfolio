/**
 * JIN OTA PORTFOLIO — スクロール演出
 * Powered by Motion (https://motion.dev)
 *
 * デザイン(色・レイアウト・フォント・既存のCSSホバー演出)は一切変更していません。
 * ここで追加しているのは「ページ読み込み時 / スクロールで画面に入ったときに
 * コンテンツがふわっと表示される」演出だけです。
 *
 * 安全策:
 * - prefers-reduced-motion（アニメーション低減設定）が有効な場合は何もしない
 * - CDNの読み込みに失敗/遅延した場合は、一定時間後に通常表示へフォールバックする
 * - JavaScriptが無効な環境では、そもそも要素を隠さない（style.css側の対応）
 */

(() => {
  // 注: .symbol-card / .feature-card / .feature-card-about (トップページの
  // ヒーロー部分) は js/home-intro.js 側でより演出の強いアニメーションを
  // 担当するため、ここでは対象に含めていません。
  const REVEAL_SELECTOR = [
    ".section-head",
    ".work-card",
    ".info-card",
    ".about-photo",
    ".panel",
    ".contact-hero",
    ".contact-box",
    ".project-heading",
  ].join(",");

  const root = document.documentElement;
  const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function showAllInstantly() {
    targets.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    root.classList.add("motion-fallback");
  }

  if (!targets.length || prefersReducedMotion) {
    // アニメーション対象が無い、またはユーザーがアニメーション低減を希望している場合
    showAllInstantly();
    return;
  }

  // CDNの読み込みに1.5秒以上かかった場合は、通常表示にフォールバックする
  const fallbackTimer = setTimeout(showAllInstantly, 1500);

  import("https://cdn.jsdelivr.net/npm/motion@13/+esm")
    .then(({ inView, animate }) => {
      clearTimeout(fallbackTimer);

      targets.forEach((el, i) => {
        const stop = inView(
          el,
          () => {
            animate(
              el,
              { opacity: [0, 1], y: [24, 0] },
              {
                duration: 0.6,
                delay: (i % 5) * 0.06,
                easing: [0.22, 1, 0.36, 1],
              }
            );
            // 一度表示したら監視を止める（スクロールで往復しても再アニメーションしない）
            if (stop) stop();
          },
          { margin: "0px 0px -10% 0px" }
        );
      });
    })
    .catch((err) => {
      console.error("[site-motion] Motionの読み込みに失敗しました", err);
      showAllInstantly();
    });
})();
