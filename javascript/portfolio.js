(() => {
  "use strict";

  /* ---------------------------------------------------------
     Dark mode — toggled by the logo-dot button in the header.
     Persists the choice so it sticks across page loads.
  --------------------------------------------------------- */
  const THEME_KEY = "ellendamazio-theme";
  const logoDots = document.querySelectorAll(".logo-dot");

  const applyTheme = (isDark) => {
    document.body.classList.toggle("is-dark", isDark);
    logoDots.forEach((dot) => dot.setAttribute("aria-pressed", String(isDark)));
  };

  let storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem(THEME_KEY);
  } catch (err) {
    storedTheme = null;
  }
  applyTheme(storedTheme === "dark");

  logoDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const isDark = !document.body.classList.contains("is-dark");
      applyTheme(isDark);
      try {
        window.localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
      } catch (err) {
        /* localStorage unavailable — theme just won't persist */
      }
    });
  });

  /* ---------------------------------------------------------
     Mobile navigation — hamburger toggle (tablet and below)
  --------------------------------------------------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  const navOverlay = document.querySelector(".nav-overlay");
  const desktopNavQuery = window.matchMedia("(min-width: 1025px)");

  if (navToggle && mobileNav) {
    const closeNav = () => {
      document.body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    const openNav = () => {
      document.body.classList.add("nav-open");
      navToggle.setAttribute("aria-expanded", "true");
    };

    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("nav-open");
      if (isOpen) {
        closeNav();
        navToggle.focus();
      } else {
        openNav();
        const firstLink = mobileNav.querySelector(".mobile-nav__link");
        if (firstLink) firstLink.focus();
      }
    });

    if (navOverlay) {
      navOverlay.addEventListener("click", closeNav);
    }

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    // Resizing past the tablet breakpoint should always leave
    // the drawer closed, so it never gets stuck open behind
    // the desktop nav.
    desktopNavQuery.addEventListener("change", (event) => {
      if (event.matches) closeNav();
    });
  }

  /* ---------------------------------------------------------
     Index page — "Index View" / "Thumbnail View" toggle.
     Clicking it flips the work grid between the varied-size
     masonry layout and a single-column list of uniform rows
     (thumbnail left, info beside it). "Filter" is a separate,
     unrelated control and isn't touched by this.
  --------------------------------------------------------- */
  const viewToggle = document.getElementById("view-toggle");
  const viewToggleLabel = viewToggle ? viewToggle.querySelector(".view-toggle__label") : null;
  const workSection = document.querySelector(".work");

  if (viewToggle && workSection) {
    viewToggle.addEventListener("click", () => {
      const isThumbnail = workSection.classList.toggle("is-thumbnail");
      if (viewToggleLabel) {
        viewToggleLabel.textContent = isThumbnail ? "Thumbnails View" : "Index View";
      }
      viewToggle.setAttribute("data-view", isThumbnail ? "thumbnail" : "index");
    });
  }

  /* ---------------------------------------------------------
     Index page — Filter panel (Category / Year).
     "Filter" opens/closes the panel; each Category or Year
     option is a multi-select toggle. Projects are shown when
     they match at least one selected value in every group
     that has a selection (empty group = no restriction).
  --------------------------------------------------------- */
  const filterToggle = document.getElementById("filter-toggle");
  const filterPanel = document.getElementById("filter-panel");
  const filterItems = document.querySelectorAll(".filter-panel__item");
  const filterableProjects = document.querySelectorAll(".project[data-project]");

  if (filterToggle && filterPanel) {
    filterToggle.addEventListener("click", () => {
      const isOpen = !filterPanel.hasAttribute("hidden");
      if (isOpen) {
        filterPanel.setAttribute("hidden", "");
        filterToggle.setAttribute("aria-expanded", "false");
        filterToggle.classList.remove("is-active");
      } else {
        filterPanel.removeAttribute("hidden");
        filterToggle.setAttribute("aria-expanded", "true");
        filterToggle.classList.add("is-active");
      }
    });
  }

  const applyFilters = () => {
    const selectedCategories = Array.from(
      document.querySelectorAll(".filter-panel__item[data-filter-category].is-selected")
    ).map((el) => el.dataset.filterCategory);

    const selectedYears = Array.from(
      document.querySelectorAll(".filter-panel__item[data-filter-year].is-selected")
    ).map((el) => el.dataset.filterYear);

    filterableProjects.forEach((project) => {
      const categories = (project.dataset.categories || "").split(" ");
      const year = project.dataset.year || "";

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.some((cat) => categories.includes(cat));
      const matchesYear = selectedYears.length === 0 || selectedYears.includes(year);

      project.style.display = matchesCategory && matchesYear ? "" : "none";
    });
  };

  filterItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("is-selected");
      applyFilters();
    });
  });

  /* ---------------------------------------------------------
     Scroll-reveal for project cards
  --------------------------------------------------------- */
  const projects = document.querySelectorAll(".project");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    projects.forEach((project) => revealObserver.observe(project));
  } else {
    projects.forEach((project) => project.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------
     Custom cursor — small dot everywhere, grows into a solid
     ball with "View" written inside it over project cards
  --------------------------------------------------------- */
  const cursorBall = document.querySelector(".cursor-ball");
  const cursorLabel = document.querySelector(".cursor-label");
  const supportsFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;

  if (cursorBall && supportsFinePointer && !prefersReducedMotion) {
    document.body.classList.add("has-custom-cursor");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ballX = mouseX;
    let ballY = mouseY;
    let raf = null;

    const render = () => {
      // Ease the ball toward the pointer for a soft, weighted feel.
      ballX += (mouseX - ballX) * 0.25;
      ballY += (mouseY - ballY) * 0.25;
      cursorBall.style.transform = `translate(${ballX}px, ${ballY}px)`;
      raf = requestAnimationFrame(render);
    };

    window.addEventListener(
      "mousemove",
      (event) => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        if (raf === null) {
          raf = requestAnimationFrame(render);
        }
      },
      { passive: true }
    );

    if (cursorLabel) cursorLabel.textContent = "View";

    projects.forEach((project) => {
      if (project.classList.contains("project--soon")) return;

      project.addEventListener("mouseenter", () => {
        cursorBall.classList.add("is-active");
      });
      project.addEventListener("mouseleave", () => {
        cursorBall.classList.remove("is-active");
      });
    });
  } else if (cursorBall) {
    cursorBall.remove();
  }

  /* ---------------------------------------------------------
     Generic "scroll to top" links — used by plain text links
     like the project page nav (always clickable, no show/hide)
  --------------------------------------------------------- */
  document.querySelectorAll("[data-scroll-top]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  });

  /* ---------------------------------------------------------
     Project page — section nav scroll-spy (tech/interaction
     template). Highlights the sidebar link matching whichever
     .project-section is currently in view.
  --------------------------------------------------------- */
  const sectionLinks = document.querySelectorAll(".project-nav__section-link");

  if (sectionLinks.length && "IntersectionObserver" in window) {
    const sections = Array.from(sectionLinks)
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const setActiveLink = (id) => {
      sectionLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length) {
          setActiveLink(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------------------------------------------------------
     About page — bouncing photo, DVD-screensaver style.
     The photo drifts inside its stage and swaps to the next
     image every time it touches an edge.
  --------------------------------------------------------- */
  const stage = document.getElementById("about-stage");
  const photo = document.getElementById("about-photo");
  const arena = stage ? stage.parentElement : null;

  if (stage && photo && arena) {
    const photos = [
      "img/profile.jpeg",
      "img/ceramica.JPG",
      "img/jmj.jpg",
      "img/obidos.JPG",
      "img/riso.jpg",
    ];

    let photoIndex = 0;
    const nextPhoto = () => {
      photoIndex = (photoIndex + 1) % photos.length;
      photo.src = photos[photoIndex];
    };

    if (prefersReducedMotion) {
      // Keep it still and simple — no motion, no cycling.
      photo.src = photos[0];
    } else {
      const SPEED = 90; // pixels per second
      let x = 0;
      let y = 0;
      let vx = SPEED;
      let vy = SPEED * 0.7;
      let maxX = 1;
      let maxY = 1;
      let lastTime = null;
      let raf = null;
      let running = true;

      const measure = () => {
        const arenaRect = arena.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        maxX = Math.max(arenaRect.width - stageRect.width, 0);
        maxY = Math.max(arenaRect.height - stageRect.height, 0);
        x = Math.min(x, maxX);
        y = Math.min(y, maxY);
      };

      const randomStart = () => {
        x = Math.random() * maxX;
        y = Math.random() * maxY;
        const angle = (Math.PI / 4) + Math.random() * (Math.PI / 6);
        vx = SPEED * Math.cos(angle) * (Math.random() < 0.5 ? 1 : -1);
        vy = SPEED * Math.sin(angle) * (Math.random() < 0.5 ? 1 : -1);
      };

      const tick = (time) => {
        if (!running) {
          raf = null;
          return;
        }

        if (lastTime === null) lastTime = time;
        const dt = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;

        x += vx * dt;
        y += vy * dt;

        let bounced = false;

        if (x <= 0) {
          x = 0;
          vx = Math.abs(vx);
          bounced = true;
        } else if (x >= maxX) {
          x = maxX;
          vx = -Math.abs(vx);
          bounced = true;
        }

        if (y <= 0) {
          y = 0;
          vy = Math.abs(vy);
          bounced = true;
        } else if (y >= maxY) {
          y = maxY;
          vy = -Math.abs(vy);
          bounced = true;
        }

        if (bounced) nextPhoto();

        stage.style.transform = `translate(${x}px, ${y}px)`;
        raf = requestAnimationFrame(tick);
      };

      measure();
      randomStart();
      photo.src = photos[0];
      raf = requestAnimationFrame(tick);

      window.addEventListener(
        "resize",
        () => {
          measure();
        },
        { passive: true }
      );

      document.addEventListener("visibilitychange", () => {
        running = !document.hidden;
        lastTime = null;
        if (running && raf === null) {
          raf = requestAnimationFrame(tick);
        }
      });
    }
  }

  /* ---------------------------------------------------------
     Fun page — infinite draggable canvas.
     INFINITE: nearest-copy algorithm — each card always picks
     the tile instance geometrically closest to the viewport
     centre, so dragging never runs out of content.
     TILT: a smooth rotateX/Y applied to each card's inner
     wrapper, proportional to velocity, easing back to flat.
  --------------------------------------------------------- */
  const funViewport = document.getElementById("fun-viewport");
  const funHint = document.getElementById("fun-hint");
  const funCards = funViewport ? Array.from(funViewport.querySelectorAll(".fun-card")) : [];

  if (funViewport && funCards.length) {
    document.documentElement.classList.add("has-fun");

    if (window.matchMedia("(max-width: 768px)").matches) {
      // Mobile: plain single-column scroll, no canvas.
      funCards.forEach((card) => card.classList.add("is-visible"));
    } else {
      const TILE_W = 2180;
      const TILE_H = 1550;
      const FRICTION = 0.96;
      const MIN_VEL = 0.08;
      const STAGGER = 55;
      const TILT_FACTOR = 0.32;
      const MAX_TILT = 5;
      const TILT_LERP = 0.09;
      const TILT_DONE = 0.015;

      const worldPos = funCards.map((card) => ({
        wx: parseFloat(card.dataset.sx) || 0,
        wy: parseFloat(card.dataset.sy) || 0,
      }));
      const inners = funCards.map((c) => c.querySelector(".fun-card-inner"));

      let viewOffsetX = 0;
      let viewOffsetY = 0;
      let smoothTiltX = 0;
      let smoothTiltY = 0;

      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let vx = 0;
      let vy = 0;
      let rafId = null;
      let hintHidden = false;

      const renderCards = () => {
        const vw = window.innerWidth;
        const vh = funViewport.offsetHeight || window.innerHeight;
        const cx = vw * 0.5;
        const cy = vh * 0.5;

        const tTargX = Math.max(-MAX_TILT, Math.min(MAX_TILT, -vy * TILT_FACTOR));
        const tTargY = Math.max(-MAX_TILT, Math.min(MAX_TILT, vx * TILT_FACTOR));
        smoothTiltX += (tTargX - smoothTiltX) * TILT_LERP;
        smoothTiltY += (tTargY - smoothTiltY) * TILT_LERP;

        const tiltStr = `rotateX(${smoothTiltX.toFixed(2)}deg) rotateY(${smoothTiltY.toFixed(2)}deg)`;

        for (let i = 0; i < funCards.length; i++) {
          const { wx, wy } = worldPos[i];
          const rawX = wx + viewOffsetX;
          const rawY = wy + viewOffsetY;

          const kx = -Math.round((rawX - cx) / TILE_W);
          const ky = -Math.round((rawY - cy) / TILE_H);

          funCards[i].style.transform = `translate(${rawX + kx * TILE_W}px, ${rawY + ky * TILE_H}px)`;
          if (inners[i]) inners[i].style.transform = tiltStr;
        }
      };

      renderCards();
      requestAnimationFrame(() => {
        funCards.forEach((card, i) => setTimeout(() => card.classList.add("is-visible"), i * STAGGER));
      });

      const getXY = (event) => {
        const src = event.touches ? event.touches[0] : event;
        return { x: src.clientX, y: src.clientY };
      };

      const applyDelta = (dx, dy) => {
        viewOffsetX += dx;
        viewOffsetY += dy;
        renderCards();
      };

      const hideHint = () => {
        if (hintHidden || !funHint) return;
        hintHidden = true;
        funHint.classList.add("hidden");
      };

      const setCursorGrabbing = (on) => {
        if (!cursorBall) return;
        if (on) {
          cursorBall.classList.add("is-grabbing");
          cursorBall.classList.remove("is-photo-hover");
        } else {
          cursorBall.classList.remove("is-grabbing");
        }
      };

      const startInertia = () => {
        cancelAnimationFrame(rafId);
        (function tick() {
          vx *= FRICTION;
          vy *= FRICTION;
          if (Math.abs(vx) < MIN_VEL) vx = 0;
          if (Math.abs(vy) < MIN_VEL) vy = 0;

          applyDelta(vx, vy);

          const tiltGone = Math.abs(smoothTiltX) < TILT_DONE && Math.abs(smoothTiltY) < TILT_DONE;

          if (vx !== 0 || vy !== 0 || !tiltGone) {
            rafId = requestAnimationFrame(tick);
          }
        })();
      };

      funViewport.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;
        dragging = true;
        ({ x: lastX, y: lastY } = getXY(event));
        vx = vy = 0;
        cancelAnimationFrame(rafId);
        hideHint();
        setCursorGrabbing(true);
      });

      window.addEventListener("mousemove", (event) => {
        if (dragging) {
          const { x, y } = getXY(event);
          vx = x - lastX;
          vy = y - lastY;
          lastX = x;
          lastY = y;
          applyDelta(vx, vy);
        } else {
          if (Math.abs(vx) >= 1 || Math.abs(vy) >= 1) return;
          const vw = window.innerWidth;
          const vh = funViewport.offsetHeight || window.innerHeight;
          const rx = (event.clientX / vw - 0.5) * 2;
          const ry = (event.clientY / vh - 0.5) * 2;
          const tX = -ry * 2;
          const tY = rx * 2;
          smoothTiltX += (tX - smoothTiltX) * 0.07;
          smoothTiltY += (tY - smoothTiltY) * 0.07;
          const str = `rotateX(${smoothTiltX.toFixed(2)}deg) rotateY(${smoothTiltY.toFixed(2)}deg)`;
          inners.forEach((inner) => {
            if (inner) inner.style.transform = str;
          });
        }
      });

      window.addEventListener("mouseup", () => {
        if (!dragging) return;
        dragging = false;
        setCursorGrabbing(false);
        startInertia();
      });

      funViewport.addEventListener(
        "touchstart",
        (event) => {
          dragging = true;
          ({ x: lastX, y: lastY } = getXY(event));
          vx = vy = 0;
          cancelAnimationFrame(rafId);
          hideHint();
        },
        { passive: true }
      );

      funViewport.addEventListener(
        "touchmove",
        (event) => {
          if (!dragging) return;
          event.preventDefault();
          const { x, y } = getXY(event);
          vx = x - lastX;
          vy = y - lastY;
          lastX = x;
          lastY = y;
          applyDelta(vx, vy);
        },
        { passive: false }
      );

      funViewport.addEventListener(
        "touchend",
        () => {
          if (!dragging) return;
          dragging = false;
          startInertia();
        },
        { passive: true }
      );

      funViewport.addEventListener(
        "wheel",
        (event) => {
          event.preventDefault();
          hideHint();
          const mul = event.deltaMode === 1 ? 20 : 1;
          const dx = -event.deltaX * mul;
          const dy = -event.deltaY * mul;

          if (event.deltaMode === 1) {
            cancelAnimationFrame(rafId);
            vx = dx * 0.35;
            vy = dy * 0.35;
            applyDelta(dx, dy);
            startInertia();
          } else {
            vx = dx * 0.4;
            vy = dy * 0.4;
            applyDelta(dx, dy);
            startInertia();
          }
        },
        { passive: false }
      );

      if (cursorBall) {
        funCards.forEach((card) => {
          card.addEventListener("mouseenter", () => {
            if (!dragging) cursorBall.classList.add("is-photo-hover");
          });
          card.addEventListener("mouseleave", () => {
            cursorBall.classList.remove("is-photo-hover");
          });
        });
      }

      funViewport.addEventListener("dragstart", (event) => event.preventDefault());
      funViewport.addEventListener("contextmenu", (event) => event.preventDefault());
    }
  }
})();