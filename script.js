(() => {
  const TOTAL_PAGES = 5;
  const book = document.getElementById("book");
  const pages = Array.from(book.querySelectorAll(".page"));
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const dotsWrap = document.getElementById("page-dots");
  const celebration = document.getElementById("celebration");

  let current = 0;
  let isAnimating = false;

  function refreshStack(flippingIndex) {
    pages.forEach((page, index) => {
      page.classList.toggle("is-interactive", index === current && !isAnimating);

      if (typeof flippingIndex === "number" && index === flippingIndex) {
        page.style.zIndex = "100";
        return;
      }
      if (page.classList.contains("flipped")) {
        page.style.zIndex = String(index + 1);
      } else {
        page.style.zIndex = String(pages.length * 2 - index);
      }
    });
  }

  refreshStack();

  for (let i = 0; i < TOTAL_PAGES; i += 1) {
    const dot = document.createElement("span");
    if (i === 0) dot.classList.add("active");
    dotsWrap.appendChild(dot);
  }
  const dots = Array.from(dotsWrap.children);

  function updateUI() {
    prevBtn.disabled = current === 0 || isAnimating;
    nextBtn.disabled = current === TOTAL_PAGES - 1 || isAnimating;
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
    refreshStack();
  }

  function waitForFlip(page) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        page.removeEventListener("transitionend", onEnd);
        resolve();
      };
      const onEnd = (event) => {
        if (event.target === page && event.propertyName === "transform") done();
      };
      page.addEventListener("transitionend", onEnd);
      setTimeout(done, 1100);
    });
  }

  async function flipTo(target) {
    if (isAnimating || target < 0 || target > TOTAL_PAGES - 1 || target === current) {
      return;
    }

    isAnimating = true;
    updateUI();

    if (target > current) {
      for (let i = current; i < target; i += 1) {
        refreshStack(i);
        pages[i].classList.add("flipped");
        await waitForFlip(pages[i]);
        refreshStack();
      }
    } else {
      for (let i = current - 1; i >= target; i -= 1) {
        refreshStack(i);
        pages[i].classList.remove("flipped");
        await waitForFlip(pages[i]);
        refreshStack();
      }
    }

    current = target;
    isAnimating = false;
    updateUI();
  }

  prevBtn.addEventListener("click", (event) => {
    event.preventDefault();
    flipTo(current - 1);
  });
  nextBtn.addEventListener("click", (event) => {
    event.preventDefault();
    flipTo(current + 1);
  });

  // Cover slideshow crossfade through couple photos
  const slides = Array.from(document.querySelectorAll(".slideshow .slide"));
  let slideIndex = 0;
  if (slides.length > 1) {
    setInterval(() => {
      slides[slideIndex].classList.remove("is-active");
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex].classList.add("is-active");
    }, 3500);
  }

  // Page 4 — runaway "No"
  const foreverNo = document.getElementById("forever-no");
  const foreverYes = document.getElementById("forever-yes");
  const foreverReply = document.getElementById("forever-reply");
  const foreverChoices = document.getElementById("forever-choices");

  function moveRunawayButton(btn, container) {
    const bounds = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const pad = 8;
    const maxX = Math.max(pad, bounds.width - btnRect.width - pad);
    const maxY = Math.max(pad, bounds.height - btnRect.height - pad);

    let x = Math.random() * maxX;
    let y = Math.random() * maxY;

    // Prefer a noticeably different spot from the current position
    const curLeft = btn.offsetLeft || 0;
    const curTop = btn.offsetTop || 0;
    if (Math.hypot(x - curLeft, y - curTop) < 48) {
      x = (curLeft + maxX / 2) % maxX;
      y = (curTop + maxY / 2) % maxY;
    }

    btn.style.position = "absolute";
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.style.right = "auto";
    btn.style.bottom = "auto";
  }

  function armRunaway(btn, container) {
    const flee = (event) => {
      if (event) event.preventDefault();
      moveRunawayButton(btn, container);
    };
    ["pointerenter", "pointerdown", "mouseenter", "mouseover", "touchstart"].forEach((type) => {
      btn.addEventListener(type, flee, { passive: false });
    });
    btn.addEventListener("click", flee);
    btn.addEventListener("focus", flee);
  }

  armRunaway(foreverNo, foreverChoices);

  foreverYes.addEventListener("click", () => {
    foreverReply.hidden = false;
    foreverNo.style.visibility = "hidden";
  });

  // Page 5 — funny fleeing "No" + celebration
  const promiseNo = document.getElementById("promise-no");
  const promiseYes = document.getElementById("promise-yes");
  const promiseReply = document.getElementById("promise-reply");

  function fleePromiseNo(event) {
    if (event) event.preventDefault();
    if (promiseNo.classList.contains("is-fleeing") || promiseNo.style.visibility === "hidden") {
      return;
    }
    promiseNo.classList.add("is-fleeing");
    setTimeout(() => {
      promiseNo.style.visibility = "hidden";
    }, 900);
  }

  ["pointerenter", "pointerdown", "pointerover", "mouseenter", "mouseover", "touchstart", "click", "focus"].forEach(
    (type) => {
      promiseNo.addEventListener(type, fleePromiseNo, { passive: false });
    }
  );

  // If the pointer is already over the button after a page flip, force the flee.
  document.addEventListener("pointermove", (event) => {
    if (current !== 4 || promiseNo.classList.contains("is-fleeing")) return;
    if (promiseNo.style.visibility === "hidden") return;
    const rect = promiseNo.getBoundingClientRect();
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      fleePromiseNo(event);
    }
  });

  const EMOJIS = ["💖", "💍", "💕", "💗", "💝", "💞", "❤️", "🥰", "💘", "✨"];

  function celebrate() {
    celebration.innerHTML = "";
    const count = 72;
    for (let i = 0; i < count; i += 1) {
      const span = document.createElement("span");
      span.className = "floating-emoji";
      span.textContent = EMOJIS[i % EMOJIS.length];
      span.style.setProperty("--x", `${Math.random() * 100}%`);
      span.style.setProperty("--size", `${1.2 + Math.random() * 2.2}rem`);
      span.style.setProperty("--dur", `${2.4 + Math.random() * 2.8}s`);
      span.style.setProperty("--rot", `${(Math.random() * 720 - 360).toFixed(0)}deg`);
      span.style.animationDelay = `${Math.random() * 0.9}s`;
      celebration.appendChild(span);
    }
    setTimeout(() => {
      celebration.innerHTML = "";
    }, 5600);
  }

  promiseYes.addEventListener("click", () => {
    promiseReply.hidden = false;
    celebrate();
  });

  updateUI();
})();
