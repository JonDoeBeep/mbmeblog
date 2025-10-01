import chroma from "https://cdn.jsdelivr.net/npm/chroma-js@3.1.2/+esm";
import tinycolor2 from "https://esm.sh/tinycolor2";

const select = (selector) => document.querySelector(selector);
const selectAll = (selector) => document.querySelectorAll(selector);

const dateLabel = select("#spacer01 .col-4.text-center");
const wrapper = select(".range");
const line = wrapper ? select(".range #line") : null;
const resetButton = select("#reset");
const cTabs = selectAll(".cTab");

const STORAGE_KEY = "monochromeColor";

const tea = [63, 225, 326, 365];
const coffee = [425, 431, 755, 766];
const brookline = [1062];

if (dateLabel) {
  const theDate = new Date();
  const options = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric"
  };
  dateLabel.innerHTML = theDate.toLocaleDateString(undefined, options);
}

const storedColor = getStoredColor();
let newColor = storedColor && isHexColor(storedColor)
  ? tinycolor2(storedColor).toHexString()
  : chroma.random().hex();

if (!storedColor || !isHexColor(storedColor)) {
  setStoredColor(newColor);
}

let offset = 20;

applyTheme();

if (wrapper && line) {
  const resizeObserver = new ResizeObserver(() => applyTheme());
  resizeObserver.observe(wrapper);

  const feOffsetAll = selectAll("#outline feOffset");
  const footerBanner = select("#footerBanner");
  const jitterFace = select("#jittersFace");

  const hasFooterBanner = Boolean(footerBanner);
  const hasJitterFace = Boolean(jitterFace);
  const hasFeOffsets = feOffsetAll.length > 0;

  let tl1 = null;
  if (hasFooterBanner) {
    resetDunkTimeline();
    tl1 = gsap
      .timeline({ paused: true, defaults: { duration: 0.5 } })
      .set("#hand", { opacity: 0, y: -150 })
      .set("#hand1", { morphSVG: "#hand1b" })
      .to("#footerBanner", { opacity: 1, scale: 1 })
      .to("#hand", { opacity: 1, y: 0 })
      .set(".wetbiscuit", { fillOpacity: 0.15 })
      .to("#hand", { opacity: 1, y: -50 }, 3.5)
      .to("#biscuit", { y: 100, duration: 0.25 })
      .to("#hand1", { morphSVG: "#hand2b", duration: 0.25 }, "+=0.5")
      .to("#biscuitwrapper", { y: 120, duration: 0.25 }, "-=0.25")
      .to("#biscuit", { y: 0, duration: 0.25 }, "<")
      .to("#maskDown", { y: 120, duration: 0.25 }, "<")
      .to("#biscuitwrapper", { x: -25 })
      .to("#teaBag", { rotate: 190, transformOrigin: "top 50%" }, "<")
      .to("#biscuitwrapper", { x: -5 })
      .to("#teaBag", { rotate: 175, transformOrigin: "top 50%" }, "<")
      .to("#biscuitwrapper", { x: -15 })
      .to("#teaBag", { rotate: 180, transformOrigin: "top 50%" }, "<");

    ScrollTrigger.create({
      trigger: "#footerBanner",
      start: "bottom 95%",
      onEnter: () => {
        resetDunkTimeline();
        tl1.play(0);
      }
    });

    ScrollTrigger.create({
      trigger: "#footerBanner",
      start: "top 100%",
      onLeaveBack: () => {
        tl1.pause(0);
        resetDunkTimeline();
      }
    });
  }

  let tl2 = null;
  if (hasFeOffsets) {
    tl2 = gsap
      .timeline({ repeat: -1, duration: 0.2, ease: "steps(2)" })
      .call(oIndexUpdate)
      .to(feOffsetAll[0], { duration: 0.2 });
  }

  let tl3 = null;
  const resetJitterTimeline = hasJitterFace
    ? () => {
        offset = 20;
        gsap.set("#mouth", { morphSVG: "#mouth1b" });
        gsap.set("#head", { morphSVG: "#head1b" });
        gsap.set("#lEye", { morphSVG: "#lEye1b" });
        gsap.set("#rEye", { morphSVG: "#rEye1b" });

        ScrollTrigger.create({
          trigger: "#jittersFace",
          start: "center center",
          once: true,
          onEnter: () => {
            tl3?.play(0);
          }
        });
      }
    : () => {};

  if (hasJitterFace) {
    tl3 = gsap
      .timeline({ paused: true, defaults: { duration: 1, ease: "none" } })
      .fromTo(
        "#mouth",
        { morphSVG: "#mouth1b", onUpdate: updateVar },
        { morphSVG: "#mouth2b" }
      )
      .fromTo(
        "#mouth",
        { morphSVG: "#mouth2b", onUpdate: updateVar },
        { morphSVG: "#mouth3b" }
      )
      .fromTo(
        "#head",
        { morphSVG: "#head1b" },
        { morphSVG: "#head2b", duration: 2 },
        0
      )
      .fromTo(
        "#lEye",
        { morphSVG: "#lEye1b" },
        { morphSVG: "#lEye2b", duration: 2 },
        0
      )
      .fromTo(
        "#rEye",
        { morphSVG: "#rEye1b" },
        { morphSVG: "#rEye2b", duration: 2 },
        0
      )
      .to("#mouth", { onUpdate: updateVar, duration: 3 }, 0);

    resetJitterTimeline();
  }

  if (cTabs.length) {
    cTabs.forEach((cTab) => {
      cTab.addEventListener("click", () => {
        if (!cTab.classList.contains("active")) {
          const tabColor = cTab.style.backgroundColor;
          if (tabColor) {
            setPaletteColor(tabColor);
            if (tl3) {
              tl3.pause(0);
              resetJitterTimeline();
            }
          }
        }
      });
    });
  }

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      animateReset();
      setPaletteColor(chroma.random().hex());
      if (tl3) {
        tl3.pause(0);
        resetJitterTimeline();
      }
    });
  }

  function animateReset() {
    gsap
      .timeline()
      .fromTo(
        "#resetWrapper",
        { rotation: 0 },
        { rotation: 360, transformOrigin: "50% 50%", duration: 0.5 }
      )
      .to("#reset", { repeat: 1, yoyo: true, duration: 0.25 }, 0)
      .to("#reset", { repeat: 1, yoyo: true, duration: 0.25 });
  }

  function resetDunkTimeline() {
    gsap.set("#hand", { opacity: 0, y: -150 });
    gsap.set(".wetbiscuit", { fillOpacity: 0 });
    gsap.set("#biscuit", { y: 0, x: 0 });
    gsap.set("#biscuitwrapper", { y: 0, x: 0 });
    gsap.set("#maskDown", { y: 0, x: 0 });
    gsap.set("#hand1", { morphSVG: "#hand1b" });
  }

  function oIndexUpdate() {
    feOffsetAll.forEach((target) => {
      gsap.to(target, {
        attr: {
          dx: gsap.utils.random(-offset, offset, 1),
          dy: gsap.utils.random(-offset, offset, 1),
          ease: "steps(2)"
        }
      });
    });
  }

  function updateVar() {
    if (offset > 0) offset -= 0.15;
  }
}

function applyTheme() {
  if (!isHexColor(newColor)) {
    return;
  }

  const colorInstance = tinycolor2(newColor);
  const rgb = colorInstance.toRgbString();
  const hsl = colorInstance.toHslString();
  const hsv = colorInstance.toHsvString();
  const name = colorInstance.toName();

  let headlineCopy = `${newColor}<br><sup>${rgb}<br>${hsl}<br>${hsv}`;
  if (name) headlineCopy += `<br>${name}`;
  headlineCopy += "</sup>";

  const headlineElement = select("[data-color-headline]");
  if (headlineElement) {
    headlineElement.innerHTML = headlineCopy;
  }

  gsap.set(".newsPhoto#main", {
    backgroundImage: `url(https://picsum.photos/id/${tea[gsap.utils.random(0, tea.length - 1, 1)]}/800/800)`
  });
  gsap.set(".newsPhoto#new1", {
    backgroundImage: `url(https://picsum.photos/id/${coffee[gsap.utils.random(0, coffee.length - 1, 1)]}/400/400)`
  });
  gsap.set(".newsPhoto#new2", {
    backgroundImage: `url(https://picsum.photos/id/${brookline[gsap.utils.random(0, brookline.length - 1, 1)]}/400/400)`
  });

  const colors = colorInstance.monochromatic(12);
  const colorsSorted = sortColors(colors);
  let targetIndex = 0;

  for (let i = 0; i < 12; i++) {
    const tab = select(`#tb${i}`);
    const hexColor = colorsSorted[i].toHexString();
    if (hexColor === newColor) targetIndex = i;
    if (tab) {
      tab.className = "cTab";
      gsap.set(tab, { backgroundColor: hexColor });
    }
  }

  const targetTab = select(`#tb${targetIndex}`);
  if (targetTab) {
    targetTab.classList.add("active");
    if (!targetTab.classList.contains("txtTab")) {
      gsap.set(targetTab, { className: "cTab active" });
    }
  }

  let textColor = colorsSorted[0].toHexString();
  let textColorIndex = 0;
  if (colorInstance.isLight()) {
    if (
      tinycolor2.readability(newColor, colorsSorted[11].toHexString()) >
      tinycolor2.readability(newColor, textColor)
    ) {
      textColor = colorsSorted[11].toHexString();
      textColorIndex = 11;
    }
  } else {
    textColor = colorsSorted[11].toHexString();
    textColorIndex = 11;
    if (
      tinycolor2.readability(newColor, colorsSorted[0].toHexString()) >
      tinycolor2.readability(newColor, textColor)
    ) {
      textColor = colorsSorted[0].toHexString();
      textColorIndex = 0;
    }
  }

  const midBgColor = chroma.scale([newColor, textColor]).mode("rgb").colors(3);
  let midTextColor = colorsSorted[0].toHexString();
  if (
    tinycolor2.readability(midBgColor[1], colorsSorted[11].toHexString()) >
    tinycolor2.readability(midBgColor[1], midTextColor)
  ) {
    midTextColor = colorsSorted[11].toHexString();
  }

  let lowC = colorsSorted[9].toHexString();
  if (targetIndex === 9) lowC = colorsSorted[11].toHexString();

  let highC = colorsSorted[2].toHexString();
  if (targetIndex === 2) {
    highC = colorsSorted[0].toHexString();
  }

  const textTab = select(`#tb${textColorIndex}`);
  if (textTab) {
    textTab.classList.add("txtTab");
  }

  if (targetTab && wrapper && line) {
    sortTab(targetTab);
  }

  gsap.set("body", {
    "--bgC": newColor,
    "--textC": textColor,
    "--lowC": lowC,
    "--highC": highC,
    "--midBgC": midBgColor[1],
    "--midTextC": midTextColor,
    "--bgImgC": colorsSorted[9].toHexString()
  });
}

function sortTab(cTab) {
  if (!wrapper || !line || !cTab) return;

  const wrapperRect = wrapper.getBoundingClientRect();
  const wrapperXLeft = wrapperRect.left;
  const wrapperXRight = wrapperRect.right;
  const lineXLeft = line.getBoundingClientRect().left - wrapperXLeft;

  const rect = cTab.getBoundingClientRect();
  const startX = rect.left - wrapperXLeft;
  const endX = wrapperXRight - rect.right;

  if (lineXLeft < startX) {
    gsap
      .timeline()
      .to(line, { right: endX, width: "auto", duration: 0.3, ease: "sine" })
      .to(line, { left: startX, ease: "elastic.out(0.6,0.4,0.2)" }, "-=0.1")
      .to(line, { width: "8.333%", ease: "elastic.out(0.6,0.4,0.2)" }, "-=0.3")
      .to(line, { opacity: 1 });
  } else if (lineXLeft > startX) {
    gsap
      .timeline()
      .to(line, { left: startX, width: "auto", duration: 0.3, ease: "sine" })
      .to(line, { right: endX, ease: "elastic.out(0.6,0.4,0.2)" }, "-=0.1")
      .to(line, { width: "8.333%", ease: "elastic.out(0.6,0.4,0.2)" }, "-=0.3")
      .to(line, { opacity: 1, duration: 1 });
  }
}

function sortColors(colors) {
  return colors.sort((c1, c2) => {
    const c1Lum = chroma(c1.toHexString()).luminance();
    const c2Lum = chroma(c2.toHexString()).luminance();

    if (c1Lum < c2Lum) return -1;
    if (c1Lum > c2Lum) return 1;
    return 0;
  });
}

function setPaletteColor(color) {
  if (!color) return;
  let normalized;
  try {
    normalized = tinycolor2(color).toHexString();
  } catch (error) {
    return;
  }

  if (!isHexColor(normalized)) return;

  newColor = normalized;
  setStoredColor(newColor);
  applyTheme();
}

function isHexColor(value) {
  if (typeof value !== "string") return false;
  const hexRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  return hexRegex.test(value.trim());
}

function getStoredColor() {
  let stored = null;

  try {
    stored = window.localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    stored = null;
  }

  if (!isHexColor(stored)) {
    stored = getCookie(STORAGE_KEY);
  }

  return isHexColor(stored) ? tinycolor2(stored).toHexString() : null;
}

function setStoredColor(color) {
  if (!isHexColor(color)) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, color);
  } catch (error) {
    // Ignore storage errors (e.g., privacy mode)
  }

  setCookie(STORAGE_KEY, color, 365);
}

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.substring(name.length + 1));
    }
  }
  return null;
}

function setCookie(name, value, days) {
  if (typeof document === "undefined") return;
  const maxAge = days ? days * 24 * 60 * 60 : 31536000;
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge}`;
}
