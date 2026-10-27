// In-page UI audit for drive.mjs: eval "$(cat .claude/skills/verify-cebu-map/scripts/ui-audit.js)"
// Checks everything visible on screen right now, with no component exemptions:
//   font  text not set in the app font (Noto Sans TC)
//   edge  text closer than 8px to the side of a button-like box
//   tap   tap target under 44px on the phone viewport (hit area includes a ::before hit slop;
//         half a pixel of sub-pixel layout rounding is tolerated)
//   over  text overflowing its box
// Only what is on screen is checked, so run it in every state you want covered.
(() => {
  const issues = [];
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
    (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const visible = el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth &&
      s.visibility !== 'hidden' && Number(s.opacity) > 0.05;
  };
  const textRect = el => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect();
  };
  // Tap area = the box, grown by an absolutely positioned ::before with negative insets
  const hitSize = el => {
    const r = el.getBoundingClientRect();
    const b = getComputedStyle(el, '::before');
    if (b.content === 'none' || b.position !== 'absolute') return [r.width, r.height];
    const grow = v => Math.max(0, -parseFloat(v) || 0);
    return [r.width + grow(b.left) + grow(b.right), r.height + grow(b.top) + grow(b.bottom)];
  };
  const tappable = 'button, a[href], .marker-pin';
  const buttonLike = 'button, a.maps-link, a.hotel-action, a.emergency-row, .chip, .seg, .mode, .sort, .tab, .action, .share-btn';

  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el) || el.closest('.maplibregl-canvas-container')) continue;
    const s = getComputedStyle(el);
    const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());

    if (ownText && !s.fontFamily.includes('Noto Sans TC') && el.tagName !== 'INPUT') {
      issues.push(`font  ${name(el)}: ${s.fontFamily.slice(0, 40)}`);
    }
    if (el.matches(buttonLike) && el.innerText.trim()) { // icon-only buttons have no text to crowd
      const r = el.getBoundingClientRect();
      const t = textRect(el);
      const left = t.left - r.left, right = r.right - t.right;
      if (t.width && (left < 8 || right < 8)) issues.push(`edge  ${name(el)}: text ${left.toFixed(0)}px / ${right.toFixed(0)}px from sides`);
    }
    if (innerWidth <= 768 && el.matches(tappable)) {
      const [w, h] = hitSize(el);
      if (w < 43.5 || h < 43.5) issues.push(`tap   ${name(el)}: ${w.toFixed(1)}×${h.toFixed(1)}`);
    }
    // Compare the text itself with the content box; scrollWidth would also count a ::before hit slop
    if (ownText && s.overflowX === 'visible' && s.whiteSpace.startsWith('nowrap') !== false) {
      const inner = el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
      const text = textRect(el).width;
      if (inner > 0 && text > inner + 1) issues.push(`over  ${name(el)}: text ${text.toFixed(0)}px in ${inner.toFixed(0)}px`);
    }
  }
  return [...new Set(issues)];
})()
