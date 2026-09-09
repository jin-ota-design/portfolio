/**
 * JIN OTA PORTFOLIO — トップページ限定のローディング演出（派手バージョン）
 * Powered by Motion (https://motion.dev)
 *
 * 流れ:
 *   1. ロゴが回転しながら弾んで登場 → ドン！と光る(フラッシュ)
 *   2. ローディング画面が斜めに勢いよく吹き飛ぶ
 *   3. それと同時に、白いフラッシュが画面全体をパッと照らして消える
 *   4. カード群がそれぞれバラバラの角度・距離から、3D回転を伴って
 *      右下から弾みながら（オーバーシュートしながら）飛び込んでくる
 *   5. 着地の瞬間、画面全体がわずかに揺れる（衝撃演出）
 *
 * 安全策:
 * - 同じセッション内での再訪問時は演出を省略（毎回だと鬱陶しいため）
 * - prefers-reduced-motion が有効な場合はスキップ
 * - CDNの読み込み失敗/遅延時は強制的に通常表示へフォールバックし、
 *   ローディング画面で止まったままになることはない
 */

(() => {
  const loader = document.getElementById("intro-loader");
  const flash = document.getElementById("intro-flash");
  const topGrid = document.querySelector(".top-grid");
  const heroItems = Array.from(
    document.querySelectorAll(
      ".top-section .symbol-card, .top-section .feature-card, .top-section .feature-card-about"
    )
  );

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const alreadyPlayed = sessionStorage.getItem("jinotaIntroPlayed") === "1";

  function skipIntro() {
    if (loader) loader.remove();
    if (flash) flash.remove();
    document.body.classList.remove("intro-lock");
    heroItems.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
    });
  }

  if (!loader || !heroItems.length || prefersReducedMotion || alreadyPlayed) {
    skipIntro();
    return;
  }

  document.body.classList.add("intro-lock");

  // CDNが遅い/失敗した場合、3.5秒後には強制的に通常表示へ
  const hardFallback = setTimeout(skipIntro, 3500);

  // バラバラの方向・角度から飛んでくるように、要素ごとに個性をつける
  // （右下寄りを基本にしつつ、値にばらつきを持たせてカオス感を出す）
  const flightPattern = [
    { x: 260, y: 220, rotate: 26, rotateY: -35 },
    { x: 420, y: 160, rotate: -18, rotateY: 45 },
    { x: 180, y: 320, rotate: 34, rotateY: -50 },
    { x: 340, y: 260, rotate: -28, rotateY: 40 },
    { x: 240, y: 380, rotate: 20, rotateY: -30 },
    { x: 400, y: 200, rotate: -34, rotateY: 55 },
    { x: 300, y: 300, rotate: 30, rotateY: -45 },
  ];

  import("https://cdn.jsdelivr.net/npm/motion@13/+esm")
    .then(({ animate, stagger }) => {
      const logo = loader.querySelector("img");

      // 1. ロゴが回転しながら弾んで登場
      animate(
        logo,
        { opacity: [0, 1], scale: [0.2, 1.2, 1], rotate: [-220, 10, 0] },
        { duration: 0.75, easing: [0.34, 1.56, 0.64, 1] }
      ).finished
        .then(() =>
          // ドン！と光る
          animate(
            logo,
            { scale: [1, 1.35, 1], filter: ["brightness(1)", "brightness(2)", "brightness(1)"] },
            { duration: 0.35, easing: "ease-out" }
          ).finished
        )
        .then(() => {
          // 2. ローディング画面が斜めに勢いよく吹き飛ぶ
          const loaderExit = animate(
            loader,
            {
              x: ["0%", "40%"],
              y: ["0%", "-130%"],
              rotate: [0, -10],
              opacity: [1, 1, 0],
            },
            { duration: 0.6, easing: [0.6, 0, 0.3, 1] }
          );

          // 3. 白フラッシュ
          animate(
            flash,
            { opacity: [0, 0.9, 0] },
            { duration: 0.5, easing: "ease-out" }
          );

          // 4. カード群がバラバラの角度・距離から弾みながら飛び込んでくる
          heroItems.forEach((el, i) => {
            const p = flightPattern[i % flightPattern.length];
            animate(
              el,
              {
                opacity: [0, 1],
                x: [p.x, 0],
                y: [p.y, 0],
                rotate: [p.rotate, 0],
                rotateY: [p.rotateY, 0],
                scale: [0.35, 1],
                filter: ["blur(6px)", "blur(0px)"],
              },
              {
                type: "spring",
                stiffness: 160,
                damping: 12,
                mass: 0.9,
                delay: stagger(0.08, { startDelay: 0.18 })(i, heroItems.length),
              }
            );
          });

          // 5. 着地の瞬間、画面全体がわずかに揺れる
          if (topGrid) {
            setTimeout(() => {
              animate(
                topGrid,
                { x: [0, -6, 5, -3, 0], y: [0, 4, -3, 2, 0] },
                { duration: 0.35, easing: "ease-out" }
              );
            }, 550);
          }

          loaderExit.finished.then(() => {
            clearTimeout(hardFallback);
            loader.remove();
            if (flash) setTimeout(() => flash.remove(), 500);
            document.body.classList.remove("intro-lock");
            sessionStorage.setItem("jinotaIntroPlayed", "1");
          });
        });
    })
    .catch((err) => {
      console.error("[home-intro] Motionの読み込みに失敗しました", err);
      clearTimeout(hardFallback);
      skipIntro();
    });
})();
