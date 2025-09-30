import chroma from "https://cdn.jsdelivr.net/npm/chroma-js@3.1.2/+esm";
import tinycolor2 from "https://esm.sh/tinycolor2";

const select = (selector) => document.querySelector(selector);
const selectAll = (selector) => document.querySelectorAll(selector);

const dateLabel = select("#spacer01 .col-4.text-center");
const wrapper = select(".range");
const line = wrapper ? select(".range #line") : null;
const resetButton = select("#reset");

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

if (wrapper && line) {
  let newColor = chroma.random().hex();
  let offset = 20;

  const resizeObserver = new ResizeObserver(() => updateColor());
  resizeObserver.observe(wrapper);

  updateColor();

  const cTabs = selectAll(".cTab");
  cTabs.forEach((cTab) => {
    cTab.addEventListener("click", () => {
      if (!cTab.classList.contains("active")) {
        const tabColor = cTab.style.backgroundColor;
        newColor = tinycolor2(tabColor).toHexString();
        updateColor();
        resetJitter();
      }
    });
  });

  resetDunkTimeline();

  const tl1 = gsap
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

  const feOffsetAll = selectAll("#outline feOffset");
  const tl2 = feOffsetAll.length
    ? gsap
        .timeline({ repeat: -1, duration: 0.2, ease: "steps(2)" })
        .call(oIndexUpdate)
        .to(feOffsetAll[0], { duration: 0.2 })
    : null;

  const tl3 = gsap
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

  resetJitter();

  if (resetButton) {
    resetButton.addEventListener("click", resetPalette);
  }

  function updateColor() {
    const rgb = tinycolor2(newColor).toRgbString();
    const hsl = tinycolor2(newColor).toHslString();
    const hsv = tinycolor2(newColor).toHsvString();
    const name = tinycolor2(newColor).toName();
    let h2Text = `${newColor}<br><sup>${rgb}<br>${hsl}<br>${hsv}`;
    if (name) h2Text += `<br>${name}`;
    h2Text += "</sup>";

    const headlineElement = select("h2");
    if (headlineElement) {
      headlineElement.innerHTML = h2Text;
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

    const colors = tinycolor2(newColor).monochromatic(12);
    const colorsSorted = sortColors(colors);
    let targetIndex = 0;

    for (let i = 0; i < 12; i++) {
      const hexColor = colorsSorted[i].toHexString();
      if (hexColor === newColor) targetIndex = i;
      gsap.set(`#tb${i}`, { className: "cTab" });
      gsap.set(`#tb${i}`, { backgroundColor: hexColor });
    }

    gsap.set(`#tb${targetIndex}`, { className: "cTab active" });
    sortTab(select(`#tb${targetIndex}`));

    let textColor = colorsSorted[0].toHexString();
    let textColorIndex = 0;
    if (tinycolor2(newColor).isLight()) {
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

    gsap.set(`#tb${textColorIndex}`, { className: "cTab txtTab" });
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
    if (!cTab) return;

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

  function resetJitter() {
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
        tl3.play(0);
      }
    });
  }

  function resetPalette() {
    gsap
      .timeline()
      .fromTo(
        "#resetWrapper",
        { rotation: 0 },
        { rotation: 360, transformOrigin: "50% 50%", duration: 0.5 }
      )
      .to("#reset", { repeat: 1, yoyo: true, duration: 0.25 }, 0)
      .to("#reset", { repeat: 1, yoyo: true, duration: 0.25 });

    newColor = chroma.random().hex();
    updateColor();

    tl3.pause(0);
    resetJitter();
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
