UI.AddSubTab(["Visuals", "SUBTAB_MGR"], "Indicator")
const dropdown = UI.AddDropdown(["Visuals", "Indicator", "Indicator"], "Version", ["Off", "Outlined", "Text Glow", "Scrolling Shimmer", "Scrolling Shimmer w/ Glow"], 0)
const mindmgIndicator = UI.AddCheckbox(["Visuals", "Indicator", "Indicator"], "Min Dmg Indicator")
const size = UI.AddSliderInt(["Visuals", "Indicator", "Indicator"], "Text Glow Size", 0, 5)
const color_picker = UI.AddColorPicker(["Visuals", "Indicator", "Indicator"], "Indicator Color"); UI.SetColor(["Visuals", "Indicator", "Indicator"], "Indicator Color", [255, 255, 255, 50])
const steps = UI.AddSliderInt(["Visuals", "Indicator", "Indicator"], "Scrolling Speed (# of Steps)", 10, 100)
UI.AddHotkey(["Rage", "Anti Aim", "General", "Key assignment"], "Freestanding", "Freestanding");


function drawInd() {
  if (UI.GetValue(dropdown) == 0) { //Off selected
    //do nothing
  }
  else if (UI.GetValue(dropdown) == 1) { //Outline selected
    IndicatorsAndRenderTextGlow("outline");
  }
  else if (UI.GetValue(dropdown) == 2) { //TextGlow selected
    IndicatorsAndRenderTextGlow("textglow");
  }
  else if (UI.GetValue(dropdown) == 3) { //Scrolling selected
    IndicatorsAndRenderTextGlow("Scrolling");
  }
  else if (UI.GetValue(dropdown) == 4) { //Scrolling Glow selected
    IndicatorsAndRenderTextGlow("ScrollingGlow")
  }
  if (UI.GetValue(mindmgIndicator)) { //MinDmg Toggle
    onDraw();
  }
}

function FreestandOnKey() {
  var getHotkey = UI.GetValue(["Rage", "Anti Aim", "General", "Key assignment", "Freestanding"]);
  if (getHotkey) {
    UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 1);
  } else {
    UI.SetValue(["Rage", "Anti Aim", "Directions", "Auto direction"], 0);
  }
}

//Outline Text Function
function outline_string(x, y, alignid, text, color, font) {
  Render.String(x - 1, y, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x + 1, y, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x, y - 1, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x, y + 1, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x - 1, y - 1, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x + 1, y + 1, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x - 1, y + 1, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x + 1, y - 1, alignid, text, [0, 0, 0, color[3]], font);
  Render.String(x, y, alignid, text, color, font);
}

//Text Glow Function By Pushed#0001
//Try to keep the glow values down as they'll cause more and more lag the higher the values are
//which is why i limited it from 0-5 in the menu
//P.S. This will crash if you put the glow size above the font size since they are dependent on each other
function addTextGlow(x, y, align, text, color, font, glowColor, glowSize) {
  var glowSizeSquared = glowSize * glowSize;
  for (var i = -glowSize; i <= glowSize; i++) {
    for (var j = -glowSize; j <= glowSize; j++) {
      // Check if the squared distance between the current position and the center is within a certain range
      var distanceSquared = i * i + j * j;
      if (distanceSquared <= glowSizeSquared && (i !== 0 || j !== 0)) {
        Render.String(x + i, y + j, align, text, glowColor, font);
      }
    }
  }
  Render.String(x, y, align, text, color, font);
}


function IndicatorsAndRenderTextGlow(indicatorType) {
  //Checks
  if (Entity.GetLocalPlayer() == null || !Entity.IsAlive(Entity.GetLocalPlayer())) return
  if (!UI.GetValue(dropdown)) return

  //Getting Values
  const checkonshot = UI.GetValue(["Rage", "Exploits", "Keys", "Key assignment", "Hide shots"]);
  const freestand = UI.GetValue(["Rage", "Anti Aim", "Directions", "Auto direction"]);
  const baim = UI.GetValue(["Rage", "General", "General", "Key assignment", "Force body aim"])
  const dmg = UI.GetValue(["Rage", "General", "General", "Key assignment", "Damage override"])
  const checkdt = UI.GetValue(["Rage", "Exploits", "Keys", "Key assignment", "Double tap"])
  const charge = Exploit.GetCharge() === 1

  //Font
  const small = Render.GetFont("smallest_pixel-7.ttf", 10, true)

  //Screensize so we can center
  const sx = Render.GetScreenSize()[0] / 2
  const sy = Render.GetScreenSize()[1] / 2

  //Color for Fading Alpha / Colors
  const r = UI.GetColor(color_picker)[0]
  const g = UI.GetColor(color_picker)[1]
  const b = UI.GetColor(color_picker)[2]
  const dt_color = [0, 255, 0, 255]
  const charge_color = [255, 0, 0, 255]
  const white = [255, 255, 255, 255]
  const lightBlue = [0, 180, 255, 255]
  const yellow = [255, 255, 0, 255]
  const pink = [255, 0, 255, 255]
  const orange = [255, 110, 0, 255]
  const transparent = [255, 255, 255, 125]
  const glow = [255, 255, 255, 4]

  //Stuff for Scrolling Text
  time += Globals.Frametime();
  if (lastTime + 0.02 < time) {
    weights.push(weights.shift());
    lastTime = time;
  }

  //Fade Function for "Alpha"
  const fade_factor = Math.abs((Math.PI * -1) + (Globals.Curtime() * 1.5) % (Math.PI * 2));
  const alpha = Math.sin(fade_factor) * 255;

  //Desync Bar
  const real = Local.GetRealYaw(), fake = Local.GetFakeYaw();
  var dsy = (Math.min(Math.abs(real - fake), 60) / 60) * 28
  Render.FilledRect(sx - 15, sy + 30, 30, 3, [0, 0, 0, 255]);
  Render.FilledRect(sx - 14, sy + 31, dsy, 1, [255, 255, 255, 255]);


  // Indicator Type
  if (indicatorType === "outline") {
    // Text Render
    outline_string(sx - 14, sy + 20, 0, "ONETAP", [r, g, b, 255], small);
    outline_string(sx + 2, sy + 32, 0, "FS", freestand ? yellow : transparent, small);
    outline_string(sx + 14, sy + 32, 0, "BA", baim ? pink : transparent, small);
    outline_string(sx - 7, sy + 40, 0, "DMG", dmg ? orange : transparent, small);

    // Onshot Render
    const onShotColor = checkonshot ? (charge ? (checkonshot ? lightBlue : transparent) : (checkonshot ? charge_color : transparent)) : transparent;
    outline_string(sx - 10, sy + 32, 0, "OS", onShotColor, small);

    // Double Tap Render
    const dtColor = checkdt ? (charge ? (checkdt ? dt_color : transparent) : (checkdt ? charge_color : transparent)) : transparent;
    outline_string(sx - 21, sy + 32, 0, "DT", dtColor, small);

  } else if (indicatorType === "textglow") {
    // Text Render
    addTextGlow(sx - 14, sy + 20, 0, "ONETAP", [r, g, b, 255], small, [r, g, b, 4], UI.GetValue(size));

    // Onshot Render
    const onShotColor = checkonshot ? (charge ? (checkonshot ? lightBlue : transparent) : (checkonshot ? charge_color : transparent)) : transparent;
    const onShotGlowColor = checkonshot ? charge ? [0, 180, 255, 5] : [255, 0, 0, 5] : glow;
    addTextGlow(sx - 10, sy + 32, 0, "OS", onShotColor, small, onShotGlowColor, UI.GetValue(size));

    // Double Tap Render
    const dtColor = checkdt ? (charge ? (checkdt ? dt_color : transparent) : (checkdt ? charge_color : transparent)) : transparent;
    const dtGlowColor = checkdt ? charge ? [0, 255, 0, 5] : [255, 0, 0, 5] : glow;
    addTextGlow(sx - 21, sy + 32, 0, "DT", dtColor, small, dtGlowColor, UI.GetValue(size));

    // Freestand Render
    const freestandColor = freestand ? yellow : transparent;
    addTextGlow(sx + 2, sy + 32, 0, "FS", freestandColor, small, freestand ? [255, 255, 0, 5] : glow, UI.GetValue(size));

    // Body Aim Render
    const baimColor = baim ? pink : transparent;
    addTextGlow(sx + 14, sy + 32, 0, "BA", baimColor, small, baim ? [255, 0, 255, 5] : glow, UI.GetValue(size));

    // Damage Override Render
    const dmgColor = dmg ? orange : transparent;
    addTextGlow(sx - 7, sy + 40, 0, "DMG", dmgColor, small, dmg ? [255, 110, 0, 5] : glow, UI.GetValue(size));

  } else if (indicatorType === 'Scrolling') {
    // Text Render
    renderShimmerText(sx - 14, sy + 20, 0, "ONETAP", [r, g, b, 255], weights, small);
    outline_string(sx + 2, sy + 32, 0, "FS", freestand ? yellow : transparent, small);
    outline_string(sx + 14, sy + 32, 0, "BA", baim ? pink : transparent, small);
    outline_string(sx - 7, sy + 40, 0, "DMG", dmg ? orange : transparent, small);

    // Onshot Render
    const onShotColor = checkonshot ? (charge ? (checkonshot ? lightBlue : transparent) : (checkonshot ? charge_color : transparent)) : transparent;
    outline_string(sx - 10, sy + 32, 0, "OS", onShotColor, small);

    // Double Tap Render
    const dtColor = checkdt ? (charge ? (checkdt ? dt_color : transparent) : (checkdt ? charge_color : transparent)) : transparent;
    outline_string(sx - 21, sy + 32, 0, "DT", dtColor, small);

  } else if (indicatorType === 'ScrollingGlow') {
    // Text Render
    renderShimmeringGlowText(sx - 14, sy + 20, 0, "ONETAP", [r, g, b, 255], weights, small, [r, g, b, 5], UI.GetValue(size));

    // Onshot Render
    const onShotColor = checkonshot ? (charge ? (checkonshot ? lightBlue : transparent) : (checkonshot ? charge_color : transparent)) : transparent;
    const onShotGlowColor = checkonshot ? charge ? [0, 180, 255, 5] : [255, 0, 0, 5] : glow;
    addTextGlow(sx - 10, sy + 32, 0, "OS", onShotColor, small, onShotGlowColor, UI.GetValue(size));

    // Double Tap Render
    const dtColor = checkdt ? (charge ? (checkdt ? dt_color : transparent) : (checkdt ? charge_color : transparent)) : transparent;
    const dtGlowColor = checkdt ? charge ? [0, 255, 0, 5] : [255, 0, 0, 5] : glow;
    addTextGlow(sx - 21, sy + 32, 0, "DT", dtColor, small, dtGlowColor, UI.GetValue(size));

    // Freestand Render
    const freestandColor = freestand ? yellow : transparent;
    addTextGlow(sx + 2, sy + 32, 0, "FS", freestandColor, small, freestand ? [255, 255, 0, 5] : glow, UI.GetValue(size));

    // Body Aim Render
    const baimColor = baim ? pink : transparent;
    addTextGlow(sx + 14, sy + 32, 0, "BA", baimColor, small, baim ? [255, 0, 255, 5] : glow, UI.GetValue(size));

    // Damage Override Render
    const dmgColor = dmg ? orange : transparent;
    addTextGlow(sx - 7, sy + 40, 0, "DMG", dmgColor, small, dmg ? [255, 110, 0, 5] : glow, UI.GetValue(size));
  }
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        if (h >= 6) h -= 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    if (h == 1) h = 0; // Fix for red color glitch
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


function lerp(start, end, frac) {
  return start * (1 - frac) + end * frac;
}

function renderShimmerText(x, y, align, text, color, shimmerWeights, font) {
  const original_color_hsl = rgbToHsl(color[0], color[1], color[2]);

  const textLength = text.length;
  for (var i = 0; i < textLength; i++) {
    const char = text[i];

    if (char == " ") {
      Render.String(x, y, align, " ", color, font);
      x += Render.TextSize(char, font)[0];
      continue;
    }

    var charColor = color.slice();

    if (shimmerWeights[i] != -1) {
      const weight = shimmerWeights[i];

      const h1 = original_color_hsl[0];
      const s1 = original_color_hsl[1];
      const l1 = original_color_hsl[2];

      // Calculate a random hue value within a range for the sheen color
      const hueRange = 0.01; // The range in which the hue can vary from the original color hue
      const hueOffset = (hueRange) - (hueRange / 2);
      const h2 = (h1 + hueOffset + 1) % 1; // Make sure the hue value is within [0, 1)
      const s2 = 1;
      const l2 = 1;

      // Lerp the color values towards the target color
      const h = lerp(h1, h2, weight);
      const s = lerp(s1, s2, weight);
      const l = lerp(l1, l2, weight);

      charColor = hslToRgb(h, s, l);
      charColor[3] = color[3];
    }
    Render.String(x - 1, y, align, char, [0, 0, 0, color[3]], font);
    Render.String(x + 1, y, align, char, [0, 0, 0, color[3]], font);
    Render.String(x, y - 1, align, char, [0, 0, 0, color[3]], font);
    Render.String(x, y + 1, align, char, [0, 0, 0, color[3]], font);
    Render.String(x - 1, y - 1, align, char, [0, 0, 0, color[3]], font);
    Render.String(x + 1, y + 1, align, char, [0, 0, 0, color[3]], font);
    Render.String(x - 1, y + 1, align, char, [0, 0, 0, color[3]], font);
    Render.String(x + 1, y - 1, align, char, [0, 0, 0, color[3]], font);
    Render.String(x, y, align, char, charColor, font);

    x += Render.TextSize(char, font)[0];
  }
}

function generateWeights(numSteps) {
  const stepSize = 2 / (numSteps - 1);
  const weights = [];
  for (var i = 0; i < numSteps; i++) {
    const weight = i * stepSize - 1;
    const absWeight = Math.abs(weight);
    weights.push(absWeight);
  }
  return weights;
}

function regenerate() {
  weights = generateWeights(UI.GetValue(steps));
}

var weights = generateWeights(UI.GetValue(steps));
var shimmeredText = "ONETAP";
var amount = shimmeredText.length - weights.length;
for (var i = 0; i < amount; i++) {
  weights.push(-1);
}

var time = Globals.Realtime();
var lastTime = time;

function renderShimmeringGlowText(x, y, align, text, color, shimmerWeights, font, glowColor, glowSize) {
  const original_color_hsl = rgbToHsl(color[0], color[1], color[2]);
  const glow_color_hsl = rgbToHsl(glowColor[0], glowColor[1], glowColor[2]);
  const textLength = text.length;
  var x_offset = 0;

  for (var i = 0; i < textLength; i++) {
    const char = text[i];

    if (char == " ") {
      x_offset += Render.TextSize(char, font)[0];
      continue;
    }

    var charColor = color.slice();
    var glowCharColor = glowColor.slice();

    if (shimmerWeights[i] != -1) {
      const weight = shimmerWeights[i];

      const h1 = original_color_hsl[0];
      const s1 = original_color_hsl[1];
      const l1 = original_color_hsl[2];

      // Calculate a random hue value within a range for the sheen color
      const hueRange = 0.01; // The range in which the hue can vary from the original color hue
      const hueOffset = (hueRange) - (hueRange / 2);
      const h2 = (h1 + hueOffset + 1) % 1; // Make sure the hue value is within [0, 1)
      const s2 = 1;
      const l2 = 1;

      // Lerp the color values towards the target color
      const h = lerp(h1, h2, weight);
      const s = lerp(s1, s2, weight);
      const l = lerp(l1, l2, weight);

      charColor = hslToRgb(h, s, l);
      charColor[3] = color[3];

      const h_glow = lerp(glow_color_hsl[0], h2, weight);
      const s_glow = lerp(glow_color_hsl[1], s2, weight);
      const l_glow = lerp(glow_color_hsl[2], l2, weight);

      glowCharColor = hslToRgb(h_glow, s_glow, l_glow);
      glowCharColor[3] = glowColor[3];
    }

    for (var j = -glowSize; j <= glowSize; j++) {
      for (var k = -glowSize; k <= glowSize; k++) {
        // Check if the squared distance between the current position and the center is within a certain range
        var distanceSquared = j * j + k * k;
        if (distanceSquared <= (glowSize * glowSize) && (j !== 0 || k !== 0)) {
          Render.String(x + j + x_offset, y + k, align, char, glowCharColor, font);
        }
      }
    }

    Render.String(x + x_offset, y, align, char, charColor, font);

    x_offset += Render.TextSize(char, font)[0];
  }
}

//An Optimized version of Wrath's MinDmg Indicator
//Clean Outline instead of using outline_string from above
function ss(x, y, string, color, font) {
  Render.String(x + 1, y + 1, 0, string.toString(), [0, 0, 0, 255], font);
  Render.String(x, y, 0, string.toString(), color, font);
}

//Self Explanatory
var cleanWeaponNames = {
  "usp s": "USP",
  "glock 18": "Glock",
  "dual berettas": "Dualies",
  "r8 revolver": "Revolver",
  "desert eagle": "Deagle",
  "p250": "P250",
  "tec 9": "Tec-9",
  "mp9": "MP9",
  "mac 10": "Mac10",
  "pp bizon": "PP-Bizon",
  "ump 45": "UMP45",
  "ak 47": "AK47",
  "sg 553": "SG553",
  "aug": "AUG",
  "m4a1 s": "M4A1-S",
  "m4a4": "M4A4",
  "ssg 08": "SSG08",
  "awp": "AWP",
  "g3sg1": "G3SG1",
  "scar 20": "SCAR20",
  "xm1014": "XM1014",
  "mag 7": "MAG7",
  "m249": "M249",
  "negev": "Negev",
  "p2000": "P2000",
  "famas": "FAMAS",
  "five seven": "Five Seven",
  "mp7": "MP7",
  "ump 45": "UMP45",
  "p90": "P90",
  "cz75 auto": "CZ-75",
  "mp5 sd": "MP5",
  "galil ar": "GALIL",
  "sawed off": "Sawed off",
  "nova": "Nova",
};

function onDraw() {
  //Checks
  const localPlayer = Entity.GetLocalPlayer();
  if (!Entity.IsAlive(localPlayer)) return;
  const localPlayerWeapon = Entity.GetWeapon(localPlayer);
  const weaponName = cleanWeaponNames[Entity.GetName(localPlayerWeapon)]
  //Fonts and Colors
  const font = Render.GetFont("smallest_pixel-7.ttf", 10, true);
  const color = [255, 255, 255, 225]
  //Screensize so we can center
  const baseX = (Render.GetScreenSize()[0] / 2) + 14
  const baseY = (Render.GetScreenSize()[1] / 2) - 25
  //Actual Function Here
  if (weaponName) {
    var damage = 0;
    if (UI.GetValue(["Rage", "General", "General", "Damage override"])) {
      damage = UI.GetValue(["Rage", "Overrides", weaponName, "Minimum damage (on key)"]) || UI.GetValue(["Rage", "Overrides", "General", "Minimum damage (on key)"]);
    } else {
      damage = UI.GetValue(["Rage", "Target", weaponName, "Minimum damage"]) || UI.GetValue(["Rage", "Target", "General", "Minimum damage"]);
    }
    if (damage == 0) {
      damage = "Dynamic";
    } else if (damage > 100) {
      var remainder = damage % 100;
      damage = "HP+" + remainder;
    }
    ss(baseX, baseY, damage.toString(), color, font)
  }
}
Cheat.RegisterCallback("Draw", "drawInd")
Cheat.RegisterCallback("CreateMove", "FreestandOnKey");
UI.RegisterCallback(steps, "regenerate");