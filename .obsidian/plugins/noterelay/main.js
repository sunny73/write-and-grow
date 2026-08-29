var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NoteRelayPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/defaults.ts
var DEFAULT_SETTINGS = {
  accounts: [],
  activeAccountIds: {},
  activeThemeIds: {
    wechat: "moyu-green",
    rednote: "default",
    x: "x-clean"
  },
  rednoteSplitHeading: 2,
  rednoteCopyScale: 2,
  rednoteTemplateId: "default",
  rednoteFontFamily: "Optima-Regular,Optima,PingFangSC-light,PingFangTC-light,'PingFang SC',serif",
  rednoteFontSize: 16,
  rednoteBackgroundImage: "",
  rednoteBackgroundScale: 1,
  rednoteBackgroundPosition: { x: 0, y: 0 },
  rednoteImageWidths: {},
  rednoteImageRadii: {},
  xIncludeTitle: true
};

// src/ui/settingsTab.ts
var import_obsidian = require("obsidian");

// src/core/imageData.ts
function imageMimeType(extension) {
  const types = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    avif: "image/avif"
  };
  return types[extension.toLowerCase()] ?? "application/octet-stream";
}
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 32768;
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length)));
  }
  return btoa(binary);
}
function blobToDataUrl(blob, errorMessage = "\u56FE\u7247\u8BFB\u53D6\u5931\u8D25") {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error(errorMessage)));
    reader.addEventListener("error", () => reject(reader.error ?? new Error(errorMessage)));
    reader.readAsDataURL(blob);
  });
}

// src/core/avatar.ts
var AVATAR_OUTPUT_SIZE = 256;
var AVATAR_MAX_FILE_BYTES = 8 * 1024 * 1024;
var AVATAR_MIN_EDGE = 64;
var AVATAR_ALLOWED_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
async function normalizeAvatar(file) {
  const bitmap = await createImageBitmap(file);
  try {
    if (Math.min(bitmap.width, bitmap.height) < AVATAR_MIN_EDGE) {
      throw new Error(`\u5934\u50CF\u5C3A\u5BF8\u8FC7\u5C0F\uFF0C\u5BBD\u548C\u9AD8\u90FD\u4E0D\u80FD\u5C11\u4E8E ${AVATAR_MIN_EDGE} \u50CF\u7D20`);
    }
    const canvas = createEl("canvas");
    canvas.width = AVATAR_OUTPUT_SIZE;
    canvas.height = AVATAR_OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("\u5F53\u524D\u73AF\u5883\u65E0\u6CD5\u5904\u7406\u5934\u50CF\u56FE\u7247");
    const sourceSize = Math.min(bitmap.width, bitmap.height);
    const sourceX = (bitmap.width - sourceSize) / 2;
    const sourceY = (bitmap.height - sourceSize) / 2;
    context.drawImage(bitmap, sourceX, sourceY, sourceSize, sourceSize, 0, 0, AVATAR_OUTPUT_SIZE, AVATAR_OUTPUT_SIZE);
    return blobToDataUrl(await canvasToBlob(canvas, "image/webp", 0.84), "\u5934\u50CF\u8BFB\u53D6\u5931\u8D25");
  } finally {
    bitmap.close();
  }
}
function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("\u5934\u50CF\u538B\u7F29\u5931\u8D25\uFF0C\u8BF7\u66F4\u6362\u56FE\u7247\u540E\u91CD\u8BD5")), type, quality));
}

// src/core/platforms.ts
var PLATFORM_IDS = ["wechat", "rednote", "x"];
var PLATFORM_LABELS = {
  wechat: "\u516C\u4F17\u53F7",
  rednote: "\u5C0F\u7EA2\u4E66",
  x: "X"
};
var ACCOUNT_LABELS = {
  wechat: "\u516C\u4F17\u53F7\u540D\u79F0",
  rednote: "\u5C0F\u7EA2\u4E66\u8D26\u53F7",
  x: "X \u8D26\u53F7"
};

// src/ui/settingsTab.ts
var ACCOUNT_FIELD_USAGE = {
  wechat: { handle: false, avatar: false, signature: true },
  rednote: { handle: true, avatar: true, signature: true },
  x: { handle: true, avatar: false, signature: true }
};
var NoteRelaySettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  plugin;
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("p", { text: "\u8D26\u53F7\u4EC5\u7528\u4E8E\u9884\u89C8\u7F72\u540D\u548C\u590D\u5236\u5185\u5BB9\uFF0C\u4E0D\u4FDD\u5B58\u5BC6\u7801\u3001Cookie \u6216\u53D1\u5E03\u51ED\u636E\u3002" });
    new import_obsidian.Setting(containerEl).setName("\u81EA\u5A92\u4F53\u8D26\u53F7").setHeading();
    for (const platform of PLATFORM_IDS) {
      const section = containerEl.createDiv({ cls: `noterelay-account-section is-${platform}` });
      new import_obsidian.Setting(section).setName(`${PLATFORM_LABELS[platform]}\u8D26\u53F7`).setHeading();
      const accounts = this.plugin.settings.accounts.filter((account) => account.platform === platform);
      if (!accounts.length) section.createEl("p", { cls: "noterelay-account-empty", text: `\u5C1A\u672A\u914D\u7F6E${PLATFORM_LABELS[platform]}\u8D26\u53F7` });
      for (const account of accounts) this.renderAccount(account, section);
      new import_obsidian.Setting(section).setName(`\u6DFB\u52A0${PLATFORM_LABELS[platform]}\u8D26\u53F7`).setDesc("\u53EF\u4EE5\u914D\u7F6E\u591A\u4E2A\u8D26\u53F7\u5E76\u5728\u9884\u89C8\u9875\u5207\u6362").addButton((button) => button.setButtonText("\u6DFB\u52A0").setCta().onClick(async () => {
        this.plugin.settings.accounts.push({ id: crypto.randomUUID(), platform, name: "\u65B0\u8D26\u53F7", handle: "", avatarUrl: "", signature: "", variables: {}, enabled: true });
        await this.plugin.saveSettings();
        this.display();
      }));
    }
    new import_obsidian.Setting(containerEl).setName("\u5C0F\u7EA2\u4E66\u5361\u7247").setHeading();
    new import_obsidian.Setting(containerEl).setName("\u5206\u9875\u6807\u9898\u7EA7\u522B").addDropdown((dropdown) => dropdown.addOption("2", "\u4E8C\u7EA7\u6807\u9898 ##").addOption("1", "\u4E00\u7EA7\u6807\u9898 #").setValue(String(this.plugin.settings.rednoteSplitHeading)).onChange(async (value) => {
      this.plugin.settings.rednoteSplitHeading = value === "1" ? 1 : 2;
      await this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("\u590D\u5236\u6E05\u6670\u5EA6").setDesc("\u63A8\u8350 2 \u500D\uFF1B\u66F4\u9AD8\u500D\u6570\u4F1A\u5360\u7528\u66F4\u591A\u5185\u5B58").addSlider((slider) => slider.setLimits(1, 3, 1).setValue(this.plugin.settings.rednoteCopyScale).onChange(async (value) => {
      this.plugin.settings.rednoteCopyScale = value;
      await this.plugin.saveSettings();
    }));
  }
  renderAccount(account, parent) {
    const card = parent.createDiv({ cls: "noterelay-account-card" });
    const isRednote = account.platform === "rednote";
    const isX = account.platform === "x";
    const fields = ACCOUNT_FIELD_USAGE[account.platform];
    const heading2 = new import_obsidian.Setting(card).setName(account.name || "\u672A\u547D\u540D\u8D26\u53F7").setDesc(account.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u505C\u7528");
    heading2.addToggle((toggle) => toggle.setValue(account.enabled).setTooltip("\u662F\u5426\u5728\u9884\u89C8\u9875\u663E\u793A").onChange(async (value) => {
      account.enabled = value;
      await this.plugin.saveSettings();
      this.display();
    }));
    heading2.addButton((button) => button.setWarning().setButtonText("\u5220\u9664").onClick(async () => {
      this.plugin.settings.accounts = this.plugin.settings.accounts.filter((item) => item.id !== account.id);
      await this.plugin.saveSettings();
      this.display();
    }));
    new import_obsidian.Setting(card).setName(isRednote ? "\u535A\u4E3B\u540D\u79F0" : isX ? "X \u6635\u79F0" : "\u8D26\u53F7\u540D\u79F0").setDesc("\u7528\u4E8E\u7F72\u540D\u548C\u6A21\u677F\u53D8\u91CF").addText((text2) => text2.setPlaceholder(isRednote ? "\u4F8B\u5982\uFF1A\u8D85\u7EA7\u731B" : isX ? "\u4F8B\u5982\uFF1ANoteRelay" : "\u8D26\u53F7\u540D\u79F0").setValue(account.name).onChange(async (value) => {
      account.name = value;
      await this.plugin.saveSettings();
    }));
    if (fields.handle) {
      new import_obsidian.Setting(card).setName(isRednote ? "\u535A\u4E3B ID" : "X \u7528\u6237\u540D / ID").setDesc(isRednote ? "\u5C0F\u7EA2\u4E66 ID \u4E3A\u7A7A\u65F6\u4E0D\u4F1A\u5728\u5361\u7247\u4E2D\u663E\u793A" : "\u663E\u793A\u5728 X \u9884\u89C8\u9876\u90E8\uFF0C\u5EFA\u8BAE\u586B\u5199 @ \u5F00\u5934\u7684\u7528\u6237\u540D\uFF0C\u4F8B\u5982 @noterelay").addText((text2) => text2.setPlaceholder(isRednote ? "\u4F8B\u5982\uFF1Axiaohongshu_888" : "\u4F8B\u5982\uFF1A@noterelay").setValue(account.handle).onChange(async (value) => {
        account.handle = value;
        await this.plugin.saveSettings();
      }));
    }
    if (fields.avatar) this.renderAvatarSetting(card, account);
    if (fields.signature) {
      new import_obsidian.Setting(card).setName(isRednote ? "\u535A\u4E3B\u7B80\u4ECB / \u5BA3\u4F20\u8BED" : isX ? "X \u4E2A\u4EBA\u7B80\u4ECB / \u6587\u672B\u7B7E\u540D" : "\u8D26\u53F7\u4ECB\u7ECD / \u7B7E\u540D").addTextArea((area) => area.setValue(account.signature).setPlaceholder(isRednote ? "\u663E\u793A\u5728\u5361\u7247\u5E95\u90E8\uFF0C\u4F8B\u5982\uFF1A\u4E13\u6CE8 AI \u6548\u7387\u4E0E\u521B\u4F5C" : isX ? "\u4F8B\u5982\uFF1A\u5173\u6CE8 AI\u3001\u6548\u7387\u5DE5\u5177\u4E0E\u72EC\u7ACB\u5F00\u53D1\uFF1B\u590D\u5236 X \u957F\u6587\u65F6\u663E\u793A\u5728\u672B\u5C3E" : "\u590D\u5236\u5185\u5BB9\u672B\u5C3E\u663E\u793A\u7684\u7B7E\u540D").onChange(async (value) => {
        account.signature = value;
        await this.plugin.saveSettings();
      }));
    }
    const variablesSetting = new import_obsidian.Setting(card).setName(isX ? "X \u81EA\u5B9A\u4E49\u53D8\u91CF\uFF08\u73AF\u5883\u53D8\u91CF\uFF09" : "\u81EA\u5B9A\u4E49\u53D8\u91CF").setDesc("\u6BCF\u884C\u4E00\u4E2A\u201C\u53D8\u91CF\u540D=\u503C\u201D\uFF1B\u6587\u7AE0\u548C\u6D77\u62A5\u6A21\u677F\u4E2D\u4F7F\u7528 {{\u53D8\u91CF\u540D}}\uFF0C\u672A\u586B\u5199\u65F6\u4FDD\u7559\u539F\u5360\u4F4D\u7B26").addTextArea((area) => area.setPlaceholder(isX ? "\u680F\u76EE=AI \u89C2\u5BDF\n\u4F5C\u8005\u79F0\u547C=NoteRelay\n\u6587\u672B\u5F15\u5BFC=\u5173\u6CE8\u6211\uFF0C\u6301\u7EED\u5206\u4EAB AI \u5B9E\u6218\n\u8BDD\u9898=#AI #Obsidian" : "\u680F\u76EE=AI \u89C2\u5BDF\n\u9876\u90E8\u6807\u7B7E=CLAUDE \xB7 AGENTS\n\u91CD\u70B9=\u505A Agent \u6700\u96BE\u7684\u90A3\u5C42\uFF0C\u7EC8\u4E8E\u6709\u4EBA\u66FF\u4F60\u642D\u4E86\n\u8BDD\u9898=#Claude #Agents").setValue(formatVariables(account.variables)).onChange(async (value) => {
      account.variables = parseVariables(value);
      await this.plugin.saveSettings();
    }));
    variablesSetting.settingEl.addClass("noterelay-account-variables");
  }
  renderAvatarSetting(card, account) {
    const setting = new import_obsidian.Setting(card).setName("\u5934\u50CF").setDesc("\u7528\u4E8E\u5C0F\u7EA2\u4E66\u5361\u7247\u5934\u50CF\u3002\u5EFA\u8BAE\u4F7F\u7528 1:1 \u65B9\u56FE\uFF0C\u81F3\u5C11 64\xD764\uFF1B\u672C\u5730\u56FE\u7247\u6700\u5927 8 MB\uFF0C\u4E0A\u4F20\u540E\u81EA\u52A8\u5C45\u4E2D\u88C1\u526A\u5E76\u538B\u7F29\u4E3A 256\xD7256\u3002");
    const preview = setting.controlEl.createEl("img", {
      cls: "noterelay-avatar-preview",
      attr: { alt: "\u5F53\u524D\u5934\u50CF\u9884\u89C8" }
    });
    preview.addEventListener("load", () => preview.removeClass("is-invalid"));
    preview.addEventListener("error", () => preview.addClass("is-invalid"));
    this.updateAvatarPreview(preview, account.avatarUrl);
    setting.addText((text2) => text2.setPlaceholder("https://\u2026").setValue(account.avatarUrl).onChange(async (value) => {
      account.avatarUrl = value;
      this.updateAvatarPreview(preview, value);
      await this.plugin.saveSettings();
    })).addButton((button) => button.setButtonText("\u9009\u62E9\u56FE\u7247").onClick(() => this.chooseAvatar(account)));
  }
  updateAvatarPreview(preview, source) {
    const value = source.trim();
    preview.toggleClass("is-visible", Boolean(value));
    preview.toggleClass("is-invalid", false);
    if (value) preview.src = value;
    else preview.removeAttribute("src");
  }
  chooseAvatar(account) {
    const input = createEl("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!AVATAR_ALLOWED_TYPES.has(file.type)) {
        new import_obsidian.Notice("\u5934\u50CF\u683C\u5F0F\u4E0D\u652F\u6301\uFF0C\u8BF7\u9009\u62E9 JPG\u3001PNG\u3001WebP \u6216 GIF \u56FE\u7247");
        return;
      }
      if (file.size > AVATAR_MAX_FILE_BYTES) {
        new import_obsidian.Notice("\u5934\u50CF\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 8 MB\uFF0C\u8BF7\u5148\u538B\u7F29\u540E\u518D\u4E0A\u4F20");
        return;
      }
      new import_obsidian.Notice("\u6B63\u5728\u5904\u7406\u5934\u50CF\u2026");
      void normalizeAvatar(file).then(async (dataUrl) => {
        account.avatarUrl = dataUrl;
        await this.plugin.saveSettings();
        this.display();
        new import_obsidian.Notice(`\u5934\u50CF\u5DF2\u538B\u7F29\u4E3A ${AVATAR_OUTPUT_SIZE}\xD7${AVATAR_OUTPUT_SIZE}`);
      }).catch((error2) => {
        console.error("NoteRelay avatar processing failed", error2);
        new import_obsidian.Notice(error2 instanceof Error ? error2.message : "\u5934\u50CF\u5904\u7406\u5931\u8D25\uFF0C\u8BF7\u66F4\u6362\u56FE\u7247\u540E\u91CD\u8BD5");
      });
    });
    input.click();
  }
};
function formatVariables(variables) {
  return Object.entries(variables ?? {}).map(([key, value]) => `${key}=${value}`).join("\n");
}
function parseVariables(input) {
  const variables = {};
  input.split(/\r?\n/).forEach((line) => {
    const match2 = line.match(/^\s*([^=：:]+?)\s*(?:=|：|:)\s*(.*?)\s*$/);
    if (!match2) return;
    const key = match2[1]?.trim();
    const value = match2[2]?.trim();
    if (key && value) variables[key] = value;
  });
  return variables;
}

// src/ui/noteRelayView.ts
var import_obsidian6 = require("obsidian");

// src/core/dom.ts
var import_obsidian2 = require("obsidian");
function setSanitizedHtml(element, html) {
  element.empty();
  element.append((0, import_obsidian2.sanitizeHTMLToDom)(html));
}
function createSanitizedHost(html, tag = "div") {
  const element = createEl(tag);
  element.append((0, import_obsidian2.sanitizeHTMLToDom)(html));
  return element;
}

// node_modules/markdown-it/lib/common/utils.mjs
var utils_exports = {};
__export(utils_exports, {
  arrayReplaceAt: () => arrayReplaceAt,
  asciiTrim: () => asciiTrim,
  assign: () => assign,
  escapeHtml: () => escapeHtml,
  escapeRE: () => escapeRE,
  fromCodePoint: () => fromCodePoint2,
  has: () => has,
  isMdAsciiPunct: () => isMdAsciiPunct,
  isPunctChar: () => isPunctChar,
  isPunctCharCode: () => isPunctCharCode,
  isSpace: () => isSpace,
  isString: () => isString,
  isValidEntityCode: () => isValidEntityCode,
  isWhiteSpace: () => isWhiteSpace,
  lib: () => lib,
  normalizeReference: () => normalizeReference,
  unescapeAll: () => unescapeAll,
  unescapeMd: () => unescapeMd
});

// node_modules/mdurl/index.mjs
var mdurl_exports = {};
__export(mdurl_exports, {
  decode: () => decode_default,
  encode: () => encode_default,
  format: () => format,
  parse: () => parse_default
});

// node_modules/mdurl/lib/decode.mjs
var decodeCache = {};
function getDecodeCache(exclude) {
  let cache2 = decodeCache[exclude];
  if (cache2) {
    return cache2;
  }
  cache2 = decodeCache[exclude] = [];
  for (let i = 0; i < 128; i++) {
    const ch = String.fromCharCode(i);
    cache2.push(ch);
  }
  for (let i = 0; i < exclude.length; i++) {
    const ch = exclude.charCodeAt(i);
    cache2[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
  }
  return cache2;
}
function decode(string, exclude) {
  if (typeof exclude !== "string") {
    exclude = decode.defaultChars;
  }
  const cache2 = getDecodeCache(exclude);
  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    let result = "";
    for (let i = 0, l = seq.length; i < l; i += 3) {
      const b1 = parseInt(seq.slice(i + 1, i + 3), 16);
      if (b1 < 128) {
        result += cache2[b1];
        continue;
      }
      if ((b1 & 224) === 192 && i + 3 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        if ((b2 & 192) === 128) {
          const chr = b1 << 6 & 1984 | b2 & 63;
          if (chr < 128) {
            result += "\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i += 3;
          continue;
        }
      }
      if ((b1 & 240) === 224 && i + 6 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128) {
          const chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63;
          if (chr < 2048 || chr >= 55296 && chr <= 57343) {
            result += "\uFFFD\uFFFD\uFFFD";
          } else {
            result += String.fromCharCode(chr);
          }
          i += 6;
          continue;
        }
      }
      if ((b1 & 248) === 240 && i + 9 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        const b4 = parseInt(seq.slice(i + 10, i + 12), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
          let chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63;
          if (chr < 65536 || chr > 1114111) {
            result += "\uFFFD\uFFFD\uFFFD\uFFFD";
          } else {
            chr -= 65536;
            result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
          }
          i += 9;
          continue;
        }
      }
      result += "\uFFFD";
    }
    return result;
  });
}
decode.defaultChars = ";/?:@&=+$,#";
decode.componentChars = "";
var decode_default = decode;

// node_modules/mdurl/lib/encode.mjs
var encodeCache = {};
function getEncodeCache(exclude) {
  let cache2 = encodeCache[exclude];
  if (cache2) {
    return cache2;
  }
  cache2 = encodeCache[exclude] = [];
  for (let i = 0; i < 128; i++) {
    const ch = String.fromCharCode(i);
    if (/^[0-9a-z]$/i.test(ch)) {
      cache2.push(ch);
    } else {
      cache2.push("%" + ("0" + i.toString(16).toUpperCase()).slice(-2));
    }
  }
  for (let i = 0; i < exclude.length; i++) {
    cache2[exclude.charCodeAt(i)] = exclude[i];
  }
  return cache2;
}
function encode(string, exclude, keepEscaped) {
  if (typeof exclude !== "string") {
    keepEscaped = exclude;
    exclude = encode.defaultChars;
  }
  if (typeof keepEscaped === "undefined") {
    keepEscaped = true;
  }
  const cache2 = getEncodeCache(exclude);
  let result = "";
  for (let i = 0, l = string.length; i < l; i++) {
    const code2 = string.charCodeAt(i);
    if (keepEscaped && code2 === 37 && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;
        continue;
      }
    }
    if (code2 < 128) {
      result += cache2[code2];
      continue;
    }
    if (code2 >= 55296 && code2 <= 57343) {
      if (code2 >= 55296 && code2 <= 56319 && i + 1 < l) {
        const nextCode = string.charCodeAt(i + 1);
        if (nextCode >= 56320 && nextCode <= 57343) {
          result += encodeURIComponent(string[i] + string[i + 1]);
          i++;
          continue;
        }
      }
      result += "%EF%BF%BD";
      continue;
    }
    result += encodeURIComponent(string[i]);
  }
  return result;
}
encode.defaultChars = ";/?:@&=+$,-_.!~*'()#";
encode.componentChars = "-_.!~*'()";
var encode_default = encode;

// node_modules/mdurl/lib/format.mjs
function format(url) {
  let result = "";
  result += url.protocol || "";
  result += url.slashes ? "//" : "";
  result += url.auth ? url.auth + "@" : "";
  if (url.hostname && url.hostname.indexOf(":") !== -1) {
    result += "[" + url.hostname + "]";
  } else {
    result += url.hostname || "";
  }
  result += url.port ? ":" + url.port : "";
  result += url.pathname || "";
  result += url.search || "";
  result += url.hash || "";
  return result;
}

// node_modules/mdurl/lib/parse.mjs
function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}
var protocolPattern = /^([a-z0-9.+-]+:)/i;
var portPattern = /:[0-9]*$/;
var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
var delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"];
var unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
var autoEscape = ["'"].concat(unwise);
var nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
var hostEndingChars = ["/", "?", "#"];
var hostnameMaxLen = 255;
var hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
var hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
var hostlessProtocol = {
  javascript: true,
  "javascript:": true
};
var slashedProtocol = {
  http: true,
  https: true,
  ftp: true,
  gopher: true,
  file: true,
  "http:": true,
  "https:": true,
  "ftp:": true,
  "gopher:": true,
  "file:": true
};
function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) return url;
  const u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}
Url.prototype.parse = function(url, slashesDenoteHost) {
  let lowerProto, hec, slashes;
  let rest = url;
  rest = rest.trim();
  if (!slashesDenoteHost && url.split("#").length === 1) {
    const simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }
  let proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === "//";
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }
  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
    let hostEnd = -1;
    for (let i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    let auth, atSign;
    if (hostEnd === -1) {
      atSign = rest.lastIndexOf("@");
    } else {
      atSign = rest.lastIndexOf("@", hostEnd);
    }
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }
    hostEnd = -1;
    for (let i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }
    if (rest[hostEnd - 1] === ":") {
      hostEnd--;
    }
    const host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost(host);
    this.hostname = this.hostname || "";
    const ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!ipv6Hostname) {
      const hostparts = this.hostname.split(/\./);
      for (let i = 0, l = hostparts.length; i < l; i++) {
        const part = hostparts[i];
        if (!part) {
          continue;
        }
        if (!part.match(hostnamePartPattern)) {
          let newpart = "";
          for (let j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              newpart += "x";
            } else {
              newpart += part[j];
            }
          }
          if (!newpart.match(hostnamePartPattern)) {
            const validParts = hostparts.slice(0, i);
            const notHost = hostparts.slice(i + 1);
            const bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join(".") + rest;
            }
            this.hostname = validParts.join(".");
            break;
          }
        }
      }
    }
    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = "";
    }
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }
  const hash = rest.indexOf("#");
  if (hash !== -1) {
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  const qm = rest.indexOf("?");
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) {
    this.pathname = rest;
  }
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = "";
  }
  return this;
};
Url.prototype.parseHost = function(host) {
  let port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ":") {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) {
    this.hostname = host;
  }
};
var parse_default = urlParse;

// node_modules/uc.micro/index.mjs
var uc_exports = {};
__export(uc_exports, {
  Any: () => regex_default,
  Cc: () => regex_default2,
  Cf: () => regex_default3,
  P: () => regex_default4,
  S: () => regex_default5,
  Z: () => regex_default6
});

// node_modules/uc.micro/properties/Any/regex.mjs
var regex_default = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;

// node_modules/uc.micro/categories/Cc/regex.mjs
var regex_default2 = /[\0-\x1F\x7F-\x9F]/;

// node_modules/uc.micro/categories/Cf/regex.mjs
var regex_default3 = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;

// node_modules/uc.micro/categories/P/regex.mjs
var regex_default4 = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;

// node_modules/uc.micro/categories/S/regex.mjs
var regex_default5 = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;

// node_modules/uc.micro/categories/Z/regex.mjs
var regex_default6 = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;

// node_modules/entities/lib/esm/generated/decode-data-html.js
var decode_data_html_default = new Uint16Array(
  // prettier-ignore
  '\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\0\0\0\0\0\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\0\0\0\u0342\u0354\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\0\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\0\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\0\u0446\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\0\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\0\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\0\u05BF\0\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\0\u1005bleBracket;\u67E7n\u01D4\u100A\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\0\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\0\u132C\u1331\0\0\0\0\0\u1338\u133D\u1377\u1385\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\0\u15B0\u15B6\u15BF\0\0\0\0\u15C6\u15DB\u15EB\u165F\u166D\0\u1695\u169B\u16B2\u16B9\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\0\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\0\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\0\u1833\u01B2\u182F\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\0\u19E8\u1A11\u1A15\u1A32\0\u1A37\u1A50\0\0\u1AB4\0\0\u1AC1\0\0\u1B21\u1B2E\u1B4D\u1B52\0\u1BFD\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\0\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\0\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\0\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\0\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\0\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\0\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\0\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\0\u1F9E\0\u1FA1\u1FA7\0\0\u1FC6\u1FCC\0\u1FD3\0\u1FE6\u1FEA\u2000\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\0\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\0\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\0\u22AA\0\u22B8\u22C5\u22CE\0\u22D5\u22F3\0\0\u22F8\u2322\u2367\u2362\u237F\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\0\u24AA\0\u24B1\0\0\0\0\0\u24B5\u24BA\0\u24C6\u24C8\u24CD\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\0\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\0\0\0\0\0\0\0\0\0\0\0\0\0\u2D2D\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\0\0\u2D8D\u2DAB\0\u2DC8\u2DCE\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\0\0\u2D7C\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\0\u2E7D\0\u2E80\u2E9D\0\u2EA2\u2EB9\0\0\u2ECB\u0E9C\0\u2F13\0\0\u2F2B\u2FBC\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\0\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\0\u337A\u33A4\0\0\u33EC\u33F0\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\0\u3616\0\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\0\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\0\u367E\u36C2\0\0\0\0\0\u36DB\u3703\0\u3709\u376C\0\0\0\u3787\u0272\u3656\0\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\0\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\0\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\0\u3A8B\0\u3A90\u3A9B\0\0\u3A9D\u3AA8\u3AAB\u3AAF\0\0\u3AC3\u3ACE\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C'.split("").map((c) => c.charCodeAt(0))
);

// node_modules/entities/lib/esm/generated/decode-data-xml.js
var decode_data_xml_default = new Uint16Array(
  // prettier-ignore
  "\u0200aglq	\x1B\u026D\0\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map((c) => c.charCodeAt(0))
);

// node_modules/entities/lib/esm/decode_codepoint.js
var _a;
var decodeMap = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]);
var fromCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
    let output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  }
);
function replaceCodePoint(codePoint) {
  var _a3;
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return (_a3 = decodeMap.get(codePoint)) !== null && _a3 !== void 0 ? _a3 : codePoint;
}

// node_modules/entities/lib/esm/decode.js
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
  CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
  CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
  CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes || (CharCodes = {}));
var TO_LOWER_BIT = 32;
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));
function isNumber(code2) {
  return code2 >= CharCodes.ZERO && code2 <= CharCodes.NINE;
}
function isHexadecimalCharacter(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_F || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_Z || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_Z || isNumber(code2);
}
function isEntityInAttributeInvalidEnd(code2) {
  return code2 === CharCodes.EQUALS || isAsciiAlphaNumeric(code2);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
var EntityDecoder = class {
  constructor(decodeTree, emitCodePoint, errors2) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors2;
    this.state = EntityDecoderState.EntityStart;
    this.consumed = 1;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.decodeMode = DecodingMode.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(decodeMode) {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(str, offset) {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (str.charCodeAt(offset) === CharCodes.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(str, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(str, offset);
      }
      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(str, offset);
      }
      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(str, offset);
      }
      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(str, offset);
      }
      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(str, offset);
      }
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(str, offset) {
    if (offset >= str.length) {
      return -1;
    }
    if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(str, offset + 1);
    }
    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(str, offset);
  }
  addToNumericResult(str, start, end, base2) {
    if (start !== end) {
      const digitCount = end - start;
      this.result = this.result * Math.pow(base2, digitCount) + parseInt(str.substr(start, digitCount), base2);
      this.consumed += digitCount;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(str, offset) {
    const startIdx = offset;
    while (offset < str.length) {
      const char = str.charCodeAt(offset);
      if (isNumber(char) || isHexadecimalCharacter(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str, startIdx, offset, 16);
        return this.emitNumericEntity(char, 3);
      }
    }
    this.addToNumericResult(str, startIdx, offset, 16);
    return -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(str, offset) {
    const startIdx = offset;
    while (offset < str.length) {
      const char = str.charCodeAt(offset);
      if (isNumber(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str, startIdx, offset, 10);
        return this.emitNumericEntity(char, 2);
      }
    }
    this.addToNumericResult(str, startIdx, offset, 10);
    return -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(lastCp, expectedLength) {
    var _a3;
    if (this.consumed <= expectedLength) {
      (_a3 = this.errors) === null || _a3 === void 0 ? void 0 : _a3.absenceOfDigitsInNumericCharacterReference(this.consumed);
      return 0;
    }
    if (lastCp === CharCodes.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }
    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
    if (this.errors) {
      if (lastCp !== CharCodes.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }
      this.errors.validateNumericCharacterReference(this.result);
    }
    return this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(str, offset) {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
    for (; offset < str.length; offset++, this.excess++) {
      const char = str.charCodeAt(offset);
      this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
      if (this.treeIndex < 0) {
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
        (valueLength === 0 || // And there should be no invalid characters.
        isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
      }
      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      if (valueLength !== 0) {
        if (char === CharCodes.SEMI) {
          return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
        }
        if (this.decodeMode !== DecodingMode.Strict) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var _a3;
    const { result, decodeTree } = this;
    const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
    this.emitNamedEntityData(result, valueLength, this.consumed);
    (_a3 = this.errors) === null || _a3 === void 0 ? void 0 : _a3.missingSemicolonAfterCharacterReference();
    return this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(result, valueLength, consumed) {
    const { decodeTree } = this;
    this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }
    return consumed;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var _a3;
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      }
      // Otherwise, emit a numeric entity if we have one.
      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        (_a3 = this.errors) === null || _a3 === void 0 ? void 0 : _a3.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
};
function getDecoder(decodeTree) {
  let ret = "";
  const decoder = new EntityDecoder(decodeTree, (str) => ret += fromCodePoint(str));
  return function decodeWithTrie(str, decodeMode) {
    let lastIndex = 0;
    let offset = 0;
    while ((offset = str.indexOf("&", offset)) >= 0) {
      ret += str.slice(lastIndex, offset);
      decoder.startEntity(decodeMode);
      const len = decoder.write(
        str,
        // Skip the "&"
        offset + 1
      );
      if (len < 0) {
        lastIndex = offset + decoder.end();
        break;
      }
      lastIndex = offset + len;
      offset = len === 0 ? lastIndex + 1 : lastIndex;
    }
    const result = ret + str.slice(lastIndex);
    ret = "";
    return result;
  };
}
function determineBranch(decodeTree, current, nodeIdx, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
  }
  let lo = nodeIdx;
  let hi = lo + branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const midVal = decodeTree[mid];
    if (midVal < char) {
      lo = mid + 1;
    } else if (midVal > char) {
      hi = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }
  return -1;
}
var htmlDecoder = getDecoder(decode_data_html_default);
var xmlDecoder = getDecoder(decode_data_xml_default);
function decodeHTML(str, mode = DecodingMode.Legacy) {
  return htmlDecoder(str, mode);
}
function decodeHTMLStrict(str) {
  return htmlDecoder(str, DecodingMode.Strict);
}

// node_modules/entities/lib/esm/generated/encode-html.js
function restoreDiff(arr) {
  for (let i = 1; i < arr.length; i++) {
    arr[i][0] += arr[i - 1][0] + 1;
  }
  return arr;
}
var encode_html_default = new Map(/* @__PURE__ */ restoreDiff([[9, "&Tab;"], [0, "&NewLine;"], [22, "&excl;"], [0, "&quot;"], [0, "&num;"], [0, "&dollar;"], [0, "&percnt;"], [0, "&amp;"], [0, "&apos;"], [0, "&lpar;"], [0, "&rpar;"], [0, "&ast;"], [0, "&plus;"], [0, "&comma;"], [1, "&period;"], [0, "&sol;"], [10, "&colon;"], [0, "&semi;"], [0, { v: "&lt;", n: 8402, o: "&nvlt;" }], [0, { v: "&equals;", n: 8421, o: "&bne;" }], [0, { v: "&gt;", n: 8402, o: "&nvgt;" }], [0, "&quest;"], [0, "&commat;"], [26, "&lbrack;"], [0, "&bsol;"], [0, "&rbrack;"], [0, "&Hat;"], [0, "&lowbar;"], [0, "&DiacriticalGrave;"], [5, { n: 106, o: "&fjlig;" }], [20, "&lbrace;"], [0, "&verbar;"], [0, "&rbrace;"], [34, "&nbsp;"], [0, "&iexcl;"], [0, "&cent;"], [0, "&pound;"], [0, "&curren;"], [0, "&yen;"], [0, "&brvbar;"], [0, "&sect;"], [0, "&die;"], [0, "&copy;"], [0, "&ordf;"], [0, "&laquo;"], [0, "&not;"], [0, "&shy;"], [0, "&circledR;"], [0, "&macr;"], [0, "&deg;"], [0, "&PlusMinus;"], [0, "&sup2;"], [0, "&sup3;"], [0, "&acute;"], [0, "&micro;"], [0, "&para;"], [0, "&centerdot;"], [0, "&cedil;"], [0, "&sup1;"], [0, "&ordm;"], [0, "&raquo;"], [0, "&frac14;"], [0, "&frac12;"], [0, "&frac34;"], [0, "&iquest;"], [0, "&Agrave;"], [0, "&Aacute;"], [0, "&Acirc;"], [0, "&Atilde;"], [0, "&Auml;"], [0, "&angst;"], [0, "&AElig;"], [0, "&Ccedil;"], [0, "&Egrave;"], [0, "&Eacute;"], [0, "&Ecirc;"], [0, "&Euml;"], [0, "&Igrave;"], [0, "&Iacute;"], [0, "&Icirc;"], [0, "&Iuml;"], [0, "&ETH;"], [0, "&Ntilde;"], [0, "&Ograve;"], [0, "&Oacute;"], [0, "&Ocirc;"], [0, "&Otilde;"], [0, "&Ouml;"], [0, "&times;"], [0, "&Oslash;"], [0, "&Ugrave;"], [0, "&Uacute;"], [0, "&Ucirc;"], [0, "&Uuml;"], [0, "&Yacute;"], [0, "&THORN;"], [0, "&szlig;"], [0, "&agrave;"], [0, "&aacute;"], [0, "&acirc;"], [0, "&atilde;"], [0, "&auml;"], [0, "&aring;"], [0, "&aelig;"], [0, "&ccedil;"], [0, "&egrave;"], [0, "&eacute;"], [0, "&ecirc;"], [0, "&euml;"], [0, "&igrave;"], [0, "&iacute;"], [0, "&icirc;"], [0, "&iuml;"], [0, "&eth;"], [0, "&ntilde;"], [0, "&ograve;"], [0, "&oacute;"], [0, "&ocirc;"], [0, "&otilde;"], [0, "&ouml;"], [0, "&div;"], [0, "&oslash;"], [0, "&ugrave;"], [0, "&uacute;"], [0, "&ucirc;"], [0, "&uuml;"], [0, "&yacute;"], [0, "&thorn;"], [0, "&yuml;"], [0, "&Amacr;"], [0, "&amacr;"], [0, "&Abreve;"], [0, "&abreve;"], [0, "&Aogon;"], [0, "&aogon;"], [0, "&Cacute;"], [0, "&cacute;"], [0, "&Ccirc;"], [0, "&ccirc;"], [0, "&Cdot;"], [0, "&cdot;"], [0, "&Ccaron;"], [0, "&ccaron;"], [0, "&Dcaron;"], [0, "&dcaron;"], [0, "&Dstrok;"], [0, "&dstrok;"], [0, "&Emacr;"], [0, "&emacr;"], [2, "&Edot;"], [0, "&edot;"], [0, "&Eogon;"], [0, "&eogon;"], [0, "&Ecaron;"], [0, "&ecaron;"], [0, "&Gcirc;"], [0, "&gcirc;"], [0, "&Gbreve;"], [0, "&gbreve;"], [0, "&Gdot;"], [0, "&gdot;"], [0, "&Gcedil;"], [1, "&Hcirc;"], [0, "&hcirc;"], [0, "&Hstrok;"], [0, "&hstrok;"], [0, "&Itilde;"], [0, "&itilde;"], [0, "&Imacr;"], [0, "&imacr;"], [2, "&Iogon;"], [0, "&iogon;"], [0, "&Idot;"], [0, "&imath;"], [0, "&IJlig;"], [0, "&ijlig;"], [0, "&Jcirc;"], [0, "&jcirc;"], [0, "&Kcedil;"], [0, "&kcedil;"], [0, "&kgreen;"], [0, "&Lacute;"], [0, "&lacute;"], [0, "&Lcedil;"], [0, "&lcedil;"], [0, "&Lcaron;"], [0, "&lcaron;"], [0, "&Lmidot;"], [0, "&lmidot;"], [0, "&Lstrok;"], [0, "&lstrok;"], [0, "&Nacute;"], [0, "&nacute;"], [0, "&Ncedil;"], [0, "&ncedil;"], [0, "&Ncaron;"], [0, "&ncaron;"], [0, "&napos;"], [0, "&ENG;"], [0, "&eng;"], [0, "&Omacr;"], [0, "&omacr;"], [2, "&Odblac;"], [0, "&odblac;"], [0, "&OElig;"], [0, "&oelig;"], [0, "&Racute;"], [0, "&racute;"], [0, "&Rcedil;"], [0, "&rcedil;"], [0, "&Rcaron;"], [0, "&rcaron;"], [0, "&Sacute;"], [0, "&sacute;"], [0, "&Scirc;"], [0, "&scirc;"], [0, "&Scedil;"], [0, "&scedil;"], [0, "&Scaron;"], [0, "&scaron;"], [0, "&Tcedil;"], [0, "&tcedil;"], [0, "&Tcaron;"], [0, "&tcaron;"], [0, "&Tstrok;"], [0, "&tstrok;"], [0, "&Utilde;"], [0, "&utilde;"], [0, "&Umacr;"], [0, "&umacr;"], [0, "&Ubreve;"], [0, "&ubreve;"], [0, "&Uring;"], [0, "&uring;"], [0, "&Udblac;"], [0, "&udblac;"], [0, "&Uogon;"], [0, "&uogon;"], [0, "&Wcirc;"], [0, "&wcirc;"], [0, "&Ycirc;"], [0, "&ycirc;"], [0, "&Yuml;"], [0, "&Zacute;"], [0, "&zacute;"], [0, "&Zdot;"], [0, "&zdot;"], [0, "&Zcaron;"], [0, "&zcaron;"], [19, "&fnof;"], [34, "&imped;"], [63, "&gacute;"], [65, "&jmath;"], [142, "&circ;"], [0, "&caron;"], [16, "&breve;"], [0, "&DiacriticalDot;"], [0, "&ring;"], [0, "&ogon;"], [0, "&DiacriticalTilde;"], [0, "&dblac;"], [51, "&DownBreve;"], [127, "&Alpha;"], [0, "&Beta;"], [0, "&Gamma;"], [0, "&Delta;"], [0, "&Epsilon;"], [0, "&Zeta;"], [0, "&Eta;"], [0, "&Theta;"], [0, "&Iota;"], [0, "&Kappa;"], [0, "&Lambda;"], [0, "&Mu;"], [0, "&Nu;"], [0, "&Xi;"], [0, "&Omicron;"], [0, "&Pi;"], [0, "&Rho;"], [1, "&Sigma;"], [0, "&Tau;"], [0, "&Upsilon;"], [0, "&Phi;"], [0, "&Chi;"], [0, "&Psi;"], [0, "&ohm;"], [7, "&alpha;"], [0, "&beta;"], [0, "&gamma;"], [0, "&delta;"], [0, "&epsi;"], [0, "&zeta;"], [0, "&eta;"], [0, "&theta;"], [0, "&iota;"], [0, "&kappa;"], [0, "&lambda;"], [0, "&mu;"], [0, "&nu;"], [0, "&xi;"], [0, "&omicron;"], [0, "&pi;"], [0, "&rho;"], [0, "&sigmaf;"], [0, "&sigma;"], [0, "&tau;"], [0, "&upsi;"], [0, "&phi;"], [0, "&chi;"], [0, "&psi;"], [0, "&omega;"], [7, "&thetasym;"], [0, "&Upsi;"], [2, "&phiv;"], [0, "&piv;"], [5, "&Gammad;"], [0, "&digamma;"], [18, "&kappav;"], [0, "&rhov;"], [3, "&epsiv;"], [0, "&backepsilon;"], [10, "&IOcy;"], [0, "&DJcy;"], [0, "&GJcy;"], [0, "&Jukcy;"], [0, "&DScy;"], [0, "&Iukcy;"], [0, "&YIcy;"], [0, "&Jsercy;"], [0, "&LJcy;"], [0, "&NJcy;"], [0, "&TSHcy;"], [0, "&KJcy;"], [1, "&Ubrcy;"], [0, "&DZcy;"], [0, "&Acy;"], [0, "&Bcy;"], [0, "&Vcy;"], [0, "&Gcy;"], [0, "&Dcy;"], [0, "&IEcy;"], [0, "&ZHcy;"], [0, "&Zcy;"], [0, "&Icy;"], [0, "&Jcy;"], [0, "&Kcy;"], [0, "&Lcy;"], [0, "&Mcy;"], [0, "&Ncy;"], [0, "&Ocy;"], [0, "&Pcy;"], [0, "&Rcy;"], [0, "&Scy;"], [0, "&Tcy;"], [0, "&Ucy;"], [0, "&Fcy;"], [0, "&KHcy;"], [0, "&TScy;"], [0, "&CHcy;"], [0, "&SHcy;"], [0, "&SHCHcy;"], [0, "&HARDcy;"], [0, "&Ycy;"], [0, "&SOFTcy;"], [0, "&Ecy;"], [0, "&YUcy;"], [0, "&YAcy;"], [0, "&acy;"], [0, "&bcy;"], [0, "&vcy;"], [0, "&gcy;"], [0, "&dcy;"], [0, "&iecy;"], [0, "&zhcy;"], [0, "&zcy;"], [0, "&icy;"], [0, "&jcy;"], [0, "&kcy;"], [0, "&lcy;"], [0, "&mcy;"], [0, "&ncy;"], [0, "&ocy;"], [0, "&pcy;"], [0, "&rcy;"], [0, "&scy;"], [0, "&tcy;"], [0, "&ucy;"], [0, "&fcy;"], [0, "&khcy;"], [0, "&tscy;"], [0, "&chcy;"], [0, "&shcy;"], [0, "&shchcy;"], [0, "&hardcy;"], [0, "&ycy;"], [0, "&softcy;"], [0, "&ecy;"], [0, "&yucy;"], [0, "&yacy;"], [1, "&iocy;"], [0, "&djcy;"], [0, "&gjcy;"], [0, "&jukcy;"], [0, "&dscy;"], [0, "&iukcy;"], [0, "&yicy;"], [0, "&jsercy;"], [0, "&ljcy;"], [0, "&njcy;"], [0, "&tshcy;"], [0, "&kjcy;"], [1, "&ubrcy;"], [0, "&dzcy;"], [7074, "&ensp;"], [0, "&emsp;"], [0, "&emsp13;"], [0, "&emsp14;"], [1, "&numsp;"], [0, "&puncsp;"], [0, "&ThinSpace;"], [0, "&hairsp;"], [0, "&NegativeMediumSpace;"], [0, "&zwnj;"], [0, "&zwj;"], [0, "&lrm;"], [0, "&rlm;"], [0, "&dash;"], [2, "&ndash;"], [0, "&mdash;"], [0, "&horbar;"], [0, "&Verbar;"], [1, "&lsquo;"], [0, "&CloseCurlyQuote;"], [0, "&lsquor;"], [1, "&ldquo;"], [0, "&CloseCurlyDoubleQuote;"], [0, "&bdquo;"], [1, "&dagger;"], [0, "&Dagger;"], [0, "&bull;"], [2, "&nldr;"], [0, "&hellip;"], [9, "&permil;"], [0, "&pertenk;"], [0, "&prime;"], [0, "&Prime;"], [0, "&tprime;"], [0, "&backprime;"], [3, "&lsaquo;"], [0, "&rsaquo;"], [3, "&oline;"], [2, "&caret;"], [1, "&hybull;"], [0, "&frasl;"], [10, "&bsemi;"], [7, "&qprime;"], [7, { v: "&MediumSpace;", n: 8202, o: "&ThickSpace;" }], [0, "&NoBreak;"], [0, "&af;"], [0, "&InvisibleTimes;"], [0, "&ic;"], [72, "&euro;"], [46, "&tdot;"], [0, "&DotDot;"], [37, "&complexes;"], [2, "&incare;"], [4, "&gscr;"], [0, "&hamilt;"], [0, "&Hfr;"], [0, "&Hopf;"], [0, "&planckh;"], [0, "&hbar;"], [0, "&imagline;"], [0, "&Ifr;"], [0, "&lagran;"], [0, "&ell;"], [1, "&naturals;"], [0, "&numero;"], [0, "&copysr;"], [0, "&weierp;"], [0, "&Popf;"], [0, "&Qopf;"], [0, "&realine;"], [0, "&real;"], [0, "&reals;"], [0, "&rx;"], [3, "&trade;"], [1, "&integers;"], [2, "&mho;"], [0, "&zeetrf;"], [0, "&iiota;"], [2, "&bernou;"], [0, "&Cayleys;"], [1, "&escr;"], [0, "&Escr;"], [0, "&Fouriertrf;"], [1, "&Mellintrf;"], [0, "&order;"], [0, "&alefsym;"], [0, "&beth;"], [0, "&gimel;"], [0, "&daleth;"], [12, "&CapitalDifferentialD;"], [0, "&dd;"], [0, "&ee;"], [0, "&ii;"], [10, "&frac13;"], [0, "&frac23;"], [0, "&frac15;"], [0, "&frac25;"], [0, "&frac35;"], [0, "&frac45;"], [0, "&frac16;"], [0, "&frac56;"], [0, "&frac18;"], [0, "&frac38;"], [0, "&frac58;"], [0, "&frac78;"], [49, "&larr;"], [0, "&ShortUpArrow;"], [0, "&rarr;"], [0, "&darr;"], [0, "&harr;"], [0, "&updownarrow;"], [0, "&nwarr;"], [0, "&nearr;"], [0, "&LowerRightArrow;"], [0, "&LowerLeftArrow;"], [0, "&nlarr;"], [0, "&nrarr;"], [1, { v: "&rarrw;", n: 824, o: "&nrarrw;" }], [0, "&Larr;"], [0, "&Uarr;"], [0, "&Rarr;"], [0, "&Darr;"], [0, "&larrtl;"], [0, "&rarrtl;"], [0, "&LeftTeeArrow;"], [0, "&mapstoup;"], [0, "&map;"], [0, "&DownTeeArrow;"], [1, "&hookleftarrow;"], [0, "&hookrightarrow;"], [0, "&larrlp;"], [0, "&looparrowright;"], [0, "&harrw;"], [0, "&nharr;"], [1, "&lsh;"], [0, "&rsh;"], [0, "&ldsh;"], [0, "&rdsh;"], [1, "&crarr;"], [0, "&cularr;"], [0, "&curarr;"], [2, "&circlearrowleft;"], [0, "&circlearrowright;"], [0, "&leftharpoonup;"], [0, "&DownLeftVector;"], [0, "&RightUpVector;"], [0, "&LeftUpVector;"], [0, "&rharu;"], [0, "&DownRightVector;"], [0, "&dharr;"], [0, "&dharl;"], [0, "&RightArrowLeftArrow;"], [0, "&udarr;"], [0, "&LeftArrowRightArrow;"], [0, "&leftleftarrows;"], [0, "&upuparrows;"], [0, "&rightrightarrows;"], [0, "&ddarr;"], [0, "&leftrightharpoons;"], [0, "&Equilibrium;"], [0, "&nlArr;"], [0, "&nhArr;"], [0, "&nrArr;"], [0, "&DoubleLeftArrow;"], [0, "&DoubleUpArrow;"], [0, "&DoubleRightArrow;"], [0, "&dArr;"], [0, "&DoubleLeftRightArrow;"], [0, "&DoubleUpDownArrow;"], [0, "&nwArr;"], [0, "&neArr;"], [0, "&seArr;"], [0, "&swArr;"], [0, "&lAarr;"], [0, "&rAarr;"], [1, "&zigrarr;"], [6, "&larrb;"], [0, "&rarrb;"], [15, "&DownArrowUpArrow;"], [7, "&loarr;"], [0, "&roarr;"], [0, "&hoarr;"], [0, "&forall;"], [0, "&comp;"], [0, { v: "&part;", n: 824, o: "&npart;" }], [0, "&exist;"], [0, "&nexist;"], [0, "&empty;"], [1, "&Del;"], [0, "&Element;"], [0, "&NotElement;"], [1, "&ni;"], [0, "&notni;"], [2, "&prod;"], [0, "&coprod;"], [0, "&sum;"], [0, "&minus;"], [0, "&MinusPlus;"], [0, "&dotplus;"], [1, "&Backslash;"], [0, "&lowast;"], [0, "&compfn;"], [1, "&radic;"], [2, "&prop;"], [0, "&infin;"], [0, "&angrt;"], [0, { v: "&ang;", n: 8402, o: "&nang;" }], [0, "&angmsd;"], [0, "&angsph;"], [0, "&mid;"], [0, "&nmid;"], [0, "&DoubleVerticalBar;"], [0, "&NotDoubleVerticalBar;"], [0, "&and;"], [0, "&or;"], [0, { v: "&cap;", n: 65024, o: "&caps;" }], [0, { v: "&cup;", n: 65024, o: "&cups;" }], [0, "&int;"], [0, "&Int;"], [0, "&iiint;"], [0, "&conint;"], [0, "&Conint;"], [0, "&Cconint;"], [0, "&cwint;"], [0, "&ClockwiseContourIntegral;"], [0, "&awconint;"], [0, "&there4;"], [0, "&becaus;"], [0, "&ratio;"], [0, "&Colon;"], [0, "&dotminus;"], [1, "&mDDot;"], [0, "&homtht;"], [0, { v: "&sim;", n: 8402, o: "&nvsim;" }], [0, { v: "&backsim;", n: 817, o: "&race;" }], [0, { v: "&ac;", n: 819, o: "&acE;" }], [0, "&acd;"], [0, "&VerticalTilde;"], [0, "&NotTilde;"], [0, { v: "&eqsim;", n: 824, o: "&nesim;" }], [0, "&sime;"], [0, "&NotTildeEqual;"], [0, "&cong;"], [0, "&simne;"], [0, "&ncong;"], [0, "&ap;"], [0, "&nap;"], [0, "&ape;"], [0, { v: "&apid;", n: 824, o: "&napid;" }], [0, "&backcong;"], [0, { v: "&asympeq;", n: 8402, o: "&nvap;" }], [0, { v: "&bump;", n: 824, o: "&nbump;" }], [0, { v: "&bumpe;", n: 824, o: "&nbumpe;" }], [0, { v: "&doteq;", n: 824, o: "&nedot;" }], [0, "&doteqdot;"], [0, "&efDot;"], [0, "&erDot;"], [0, "&Assign;"], [0, "&ecolon;"], [0, "&ecir;"], [0, "&circeq;"], [1, "&wedgeq;"], [0, "&veeeq;"], [1, "&triangleq;"], [2, "&equest;"], [0, "&ne;"], [0, { v: "&Congruent;", n: 8421, o: "&bnequiv;" }], [0, "&nequiv;"], [1, { v: "&le;", n: 8402, o: "&nvle;" }], [0, { v: "&ge;", n: 8402, o: "&nvge;" }], [0, { v: "&lE;", n: 824, o: "&nlE;" }], [0, { v: "&gE;", n: 824, o: "&ngE;" }], [0, { v: "&lnE;", n: 65024, o: "&lvertneqq;" }], [0, { v: "&gnE;", n: 65024, o: "&gvertneqq;" }], [0, { v: "&ll;", n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nLtv;"], [7577, "&nLt;"]])) }], [0, { v: "&gg;", n: new Map(/* @__PURE__ */ restoreDiff([[824, "&nGtv;"], [7577, "&nGt;"]])) }], [0, "&between;"], [0, "&NotCupCap;"], [0, "&nless;"], [0, "&ngt;"], [0, "&nle;"], [0, "&nge;"], [0, "&lesssim;"], [0, "&GreaterTilde;"], [0, "&nlsim;"], [0, "&ngsim;"], [0, "&LessGreater;"], [0, "&gl;"], [0, "&NotLessGreater;"], [0, "&NotGreaterLess;"], [0, "&pr;"], [0, "&sc;"], [0, "&prcue;"], [0, "&sccue;"], [0, "&PrecedesTilde;"], [0, { v: "&scsim;", n: 824, o: "&NotSucceedsTilde;" }], [0, "&NotPrecedes;"], [0, "&NotSucceeds;"], [0, { v: "&sub;", n: 8402, o: "&NotSubset;" }], [0, { v: "&sup;", n: 8402, o: "&NotSuperset;" }], [0, "&nsub;"], [0, "&nsup;"], [0, "&sube;"], [0, "&supe;"], [0, "&NotSubsetEqual;"], [0, "&NotSupersetEqual;"], [0, { v: "&subne;", n: 65024, o: "&varsubsetneq;" }], [0, { v: "&supne;", n: 65024, o: "&varsupsetneq;" }], [1, "&cupdot;"], [0, "&UnionPlus;"], [0, { v: "&sqsub;", n: 824, o: "&NotSquareSubset;" }], [0, { v: "&sqsup;", n: 824, o: "&NotSquareSuperset;" }], [0, "&sqsube;"], [0, "&sqsupe;"], [0, { v: "&sqcap;", n: 65024, o: "&sqcaps;" }], [0, { v: "&sqcup;", n: 65024, o: "&sqcups;" }], [0, "&CirclePlus;"], [0, "&CircleMinus;"], [0, "&CircleTimes;"], [0, "&osol;"], [0, "&CircleDot;"], [0, "&circledcirc;"], [0, "&circledast;"], [1, "&circleddash;"], [0, "&boxplus;"], [0, "&boxminus;"], [0, "&boxtimes;"], [0, "&dotsquare;"], [0, "&RightTee;"], [0, "&dashv;"], [0, "&DownTee;"], [0, "&bot;"], [1, "&models;"], [0, "&DoubleRightTee;"], [0, "&Vdash;"], [0, "&Vvdash;"], [0, "&VDash;"], [0, "&nvdash;"], [0, "&nvDash;"], [0, "&nVdash;"], [0, "&nVDash;"], [0, "&prurel;"], [1, "&LeftTriangle;"], [0, "&RightTriangle;"], [0, { v: "&LeftTriangleEqual;", n: 8402, o: "&nvltrie;" }], [0, { v: "&RightTriangleEqual;", n: 8402, o: "&nvrtrie;" }], [0, "&origof;"], [0, "&imof;"], [0, "&multimap;"], [0, "&hercon;"], [0, "&intcal;"], [0, "&veebar;"], [1, "&barvee;"], [0, "&angrtvb;"], [0, "&lrtri;"], [0, "&bigwedge;"], [0, "&bigvee;"], [0, "&bigcap;"], [0, "&bigcup;"], [0, "&diam;"], [0, "&sdot;"], [0, "&sstarf;"], [0, "&divideontimes;"], [0, "&bowtie;"], [0, "&ltimes;"], [0, "&rtimes;"], [0, "&leftthreetimes;"], [0, "&rightthreetimes;"], [0, "&backsimeq;"], [0, "&curlyvee;"], [0, "&curlywedge;"], [0, "&Sub;"], [0, "&Sup;"], [0, "&Cap;"], [0, "&Cup;"], [0, "&fork;"], [0, "&epar;"], [0, "&lessdot;"], [0, "&gtdot;"], [0, { v: "&Ll;", n: 824, o: "&nLl;" }], [0, { v: "&Gg;", n: 824, o: "&nGg;" }], [0, { v: "&leg;", n: 65024, o: "&lesg;" }], [0, { v: "&gel;", n: 65024, o: "&gesl;" }], [2, "&cuepr;"], [0, "&cuesc;"], [0, "&NotPrecedesSlantEqual;"], [0, "&NotSucceedsSlantEqual;"], [0, "&NotSquareSubsetEqual;"], [0, "&NotSquareSupersetEqual;"], [2, "&lnsim;"], [0, "&gnsim;"], [0, "&precnsim;"], [0, "&scnsim;"], [0, "&nltri;"], [0, "&NotRightTriangle;"], [0, "&nltrie;"], [0, "&NotRightTriangleEqual;"], [0, "&vellip;"], [0, "&ctdot;"], [0, "&utdot;"], [0, "&dtdot;"], [0, "&disin;"], [0, "&isinsv;"], [0, "&isins;"], [0, { v: "&isindot;", n: 824, o: "&notindot;" }], [0, "&notinvc;"], [0, "&notinvb;"], [1, { v: "&isinE;", n: 824, o: "&notinE;" }], [0, "&nisd;"], [0, "&xnis;"], [0, "&nis;"], [0, "&notnivc;"], [0, "&notnivb;"], [6, "&barwed;"], [0, "&Barwed;"], [1, "&lceil;"], [0, "&rceil;"], [0, "&LeftFloor;"], [0, "&rfloor;"], [0, "&drcrop;"], [0, "&dlcrop;"], [0, "&urcrop;"], [0, "&ulcrop;"], [0, "&bnot;"], [1, "&profline;"], [0, "&profsurf;"], [1, "&telrec;"], [0, "&target;"], [5, "&ulcorn;"], [0, "&urcorn;"], [0, "&dlcorn;"], [0, "&drcorn;"], [2, "&frown;"], [0, "&smile;"], [9, "&cylcty;"], [0, "&profalar;"], [7, "&topbot;"], [6, "&ovbar;"], [1, "&solbar;"], [60, "&angzarr;"], [51, "&lmoustache;"], [0, "&rmoustache;"], [2, "&OverBracket;"], [0, "&bbrk;"], [0, "&bbrktbrk;"], [37, "&OverParenthesis;"], [0, "&UnderParenthesis;"], [0, "&OverBrace;"], [0, "&UnderBrace;"], [2, "&trpezium;"], [4, "&elinters;"], [59, "&blank;"], [164, "&circledS;"], [55, "&boxh;"], [1, "&boxv;"], [9, "&boxdr;"], [3, "&boxdl;"], [3, "&boxur;"], [3, "&boxul;"], [3, "&boxvr;"], [7, "&boxvl;"], [7, "&boxhd;"], [7, "&boxhu;"], [7, "&boxvh;"], [19, "&boxH;"], [0, "&boxV;"], [0, "&boxdR;"], [0, "&boxDr;"], [0, "&boxDR;"], [0, "&boxdL;"], [0, "&boxDl;"], [0, "&boxDL;"], [0, "&boxuR;"], [0, "&boxUr;"], [0, "&boxUR;"], [0, "&boxuL;"], [0, "&boxUl;"], [0, "&boxUL;"], [0, "&boxvR;"], [0, "&boxVr;"], [0, "&boxVR;"], [0, "&boxvL;"], [0, "&boxVl;"], [0, "&boxVL;"], [0, "&boxHd;"], [0, "&boxhD;"], [0, "&boxHD;"], [0, "&boxHu;"], [0, "&boxhU;"], [0, "&boxHU;"], [0, "&boxvH;"], [0, "&boxVh;"], [0, "&boxVH;"], [19, "&uhblk;"], [3, "&lhblk;"], [3, "&block;"], [8, "&blk14;"], [0, "&blk12;"], [0, "&blk34;"], [13, "&square;"], [8, "&blacksquare;"], [0, "&EmptyVerySmallSquare;"], [1, "&rect;"], [0, "&marker;"], [2, "&fltns;"], [1, "&bigtriangleup;"], [0, "&blacktriangle;"], [0, "&triangle;"], [2, "&blacktriangleright;"], [0, "&rtri;"], [3, "&bigtriangledown;"], [0, "&blacktriangledown;"], [0, "&dtri;"], [2, "&blacktriangleleft;"], [0, "&ltri;"], [6, "&loz;"], [0, "&cir;"], [32, "&tridot;"], [2, "&bigcirc;"], [8, "&ultri;"], [0, "&urtri;"], [0, "&lltri;"], [0, "&EmptySmallSquare;"], [0, "&FilledSmallSquare;"], [8, "&bigstar;"], [0, "&star;"], [7, "&phone;"], [49, "&female;"], [1, "&male;"], [29, "&spades;"], [2, "&clubs;"], [1, "&hearts;"], [0, "&diamondsuit;"], [3, "&sung;"], [2, "&flat;"], [0, "&natural;"], [0, "&sharp;"], [163, "&check;"], [3, "&cross;"], [8, "&malt;"], [21, "&sext;"], [33, "&VerticalSeparator;"], [25, "&lbbrk;"], [0, "&rbbrk;"], [84, "&bsolhsub;"], [0, "&suphsol;"], [28, "&LeftDoubleBracket;"], [0, "&RightDoubleBracket;"], [0, "&lang;"], [0, "&rang;"], [0, "&Lang;"], [0, "&Rang;"], [0, "&loang;"], [0, "&roang;"], [7, "&longleftarrow;"], [0, "&longrightarrow;"], [0, "&longleftrightarrow;"], [0, "&DoubleLongLeftArrow;"], [0, "&DoubleLongRightArrow;"], [0, "&DoubleLongLeftRightArrow;"], [1, "&longmapsto;"], [2, "&dzigrarr;"], [258, "&nvlArr;"], [0, "&nvrArr;"], [0, "&nvHarr;"], [0, "&Map;"], [6, "&lbarr;"], [0, "&bkarow;"], [0, "&lBarr;"], [0, "&dbkarow;"], [0, "&drbkarow;"], [0, "&DDotrahd;"], [0, "&UpArrowBar;"], [0, "&DownArrowBar;"], [2, "&Rarrtl;"], [2, "&latail;"], [0, "&ratail;"], [0, "&lAtail;"], [0, "&rAtail;"], [0, "&larrfs;"], [0, "&rarrfs;"], [0, "&larrbfs;"], [0, "&rarrbfs;"], [2, "&nwarhk;"], [0, "&nearhk;"], [0, "&hksearow;"], [0, "&hkswarow;"], [0, "&nwnear;"], [0, "&nesear;"], [0, "&seswar;"], [0, "&swnwar;"], [8, { v: "&rarrc;", n: 824, o: "&nrarrc;" }], [1, "&cudarrr;"], [0, "&ldca;"], [0, "&rdca;"], [0, "&cudarrl;"], [0, "&larrpl;"], [2, "&curarrm;"], [0, "&cularrp;"], [7, "&rarrpl;"], [2, "&harrcir;"], [0, "&Uarrocir;"], [0, "&lurdshar;"], [0, "&ldrushar;"], [2, "&LeftRightVector;"], [0, "&RightUpDownVector;"], [0, "&DownLeftRightVector;"], [0, "&LeftUpDownVector;"], [0, "&LeftVectorBar;"], [0, "&RightVectorBar;"], [0, "&RightUpVectorBar;"], [0, "&RightDownVectorBar;"], [0, "&DownLeftVectorBar;"], [0, "&DownRightVectorBar;"], [0, "&LeftUpVectorBar;"], [0, "&LeftDownVectorBar;"], [0, "&LeftTeeVector;"], [0, "&RightTeeVector;"], [0, "&RightUpTeeVector;"], [0, "&RightDownTeeVector;"], [0, "&DownLeftTeeVector;"], [0, "&DownRightTeeVector;"], [0, "&LeftUpTeeVector;"], [0, "&LeftDownTeeVector;"], [0, "&lHar;"], [0, "&uHar;"], [0, "&rHar;"], [0, "&dHar;"], [0, "&luruhar;"], [0, "&ldrdhar;"], [0, "&ruluhar;"], [0, "&rdldhar;"], [0, "&lharul;"], [0, "&llhard;"], [0, "&rharul;"], [0, "&lrhard;"], [0, "&udhar;"], [0, "&duhar;"], [0, "&RoundImplies;"], [0, "&erarr;"], [0, "&simrarr;"], [0, "&larrsim;"], [0, "&rarrsim;"], [0, "&rarrap;"], [0, "&ltlarr;"], [1, "&gtrarr;"], [0, "&subrarr;"], [1, "&suplarr;"], [0, "&lfisht;"], [0, "&rfisht;"], [0, "&ufisht;"], [0, "&dfisht;"], [5, "&lopar;"], [0, "&ropar;"], [4, "&lbrke;"], [0, "&rbrke;"], [0, "&lbrkslu;"], [0, "&rbrksld;"], [0, "&lbrksld;"], [0, "&rbrkslu;"], [0, "&langd;"], [0, "&rangd;"], [0, "&lparlt;"], [0, "&rpargt;"], [0, "&gtlPar;"], [0, "&ltrPar;"], [3, "&vzigzag;"], [1, "&vangrt;"], [0, "&angrtvbd;"], [6, "&ange;"], [0, "&range;"], [0, "&dwangle;"], [0, "&uwangle;"], [0, "&angmsdaa;"], [0, "&angmsdab;"], [0, "&angmsdac;"], [0, "&angmsdad;"], [0, "&angmsdae;"], [0, "&angmsdaf;"], [0, "&angmsdag;"], [0, "&angmsdah;"], [0, "&bemptyv;"], [0, "&demptyv;"], [0, "&cemptyv;"], [0, "&raemptyv;"], [0, "&laemptyv;"], [0, "&ohbar;"], [0, "&omid;"], [0, "&opar;"], [1, "&operp;"], [1, "&olcross;"], [0, "&odsold;"], [1, "&olcir;"], [0, "&ofcir;"], [0, "&olt;"], [0, "&ogt;"], [0, "&cirscir;"], [0, "&cirE;"], [0, "&solb;"], [0, "&bsolb;"], [3, "&boxbox;"], [3, "&trisb;"], [0, "&rtriltri;"], [0, { v: "&LeftTriangleBar;", n: 824, o: "&NotLeftTriangleBar;" }], [0, { v: "&RightTriangleBar;", n: 824, o: "&NotRightTriangleBar;" }], [11, "&iinfin;"], [0, "&infintie;"], [0, "&nvinfin;"], [4, "&eparsl;"], [0, "&smeparsl;"], [0, "&eqvparsl;"], [5, "&blacklozenge;"], [8, "&RuleDelayed;"], [1, "&dsol;"], [9, "&bigodot;"], [0, "&bigoplus;"], [0, "&bigotimes;"], [1, "&biguplus;"], [1, "&bigsqcup;"], [5, "&iiiint;"], [0, "&fpartint;"], [2, "&cirfnint;"], [0, "&awint;"], [0, "&rppolint;"], [0, "&scpolint;"], [0, "&npolint;"], [0, "&pointint;"], [0, "&quatint;"], [0, "&intlarhk;"], [10, "&pluscir;"], [0, "&plusacir;"], [0, "&simplus;"], [0, "&plusdu;"], [0, "&plussim;"], [0, "&plustwo;"], [1, "&mcomma;"], [0, "&minusdu;"], [2, "&loplus;"], [0, "&roplus;"], [0, "&Cross;"], [0, "&timesd;"], [0, "&timesbar;"], [1, "&smashp;"], [0, "&lotimes;"], [0, "&rotimes;"], [0, "&otimesas;"], [0, "&Otimes;"], [0, "&odiv;"], [0, "&triplus;"], [0, "&triminus;"], [0, "&tritime;"], [0, "&intprod;"], [2, "&amalg;"], [0, "&capdot;"], [1, "&ncup;"], [0, "&ncap;"], [0, "&capand;"], [0, "&cupor;"], [0, "&cupcap;"], [0, "&capcup;"], [0, "&cupbrcap;"], [0, "&capbrcup;"], [0, "&cupcup;"], [0, "&capcap;"], [0, "&ccups;"], [0, "&ccaps;"], [2, "&ccupssm;"], [2, "&And;"], [0, "&Or;"], [0, "&andand;"], [0, "&oror;"], [0, "&orslope;"], [0, "&andslope;"], [1, "&andv;"], [0, "&orv;"], [0, "&andd;"], [0, "&ord;"], [1, "&wedbar;"], [6, "&sdote;"], [3, "&simdot;"], [2, { v: "&congdot;", n: 824, o: "&ncongdot;" }], [0, "&easter;"], [0, "&apacir;"], [0, { v: "&apE;", n: 824, o: "&napE;" }], [0, "&eplus;"], [0, "&pluse;"], [0, "&Esim;"], [0, "&Colone;"], [0, "&Equal;"], [1, "&ddotseq;"], [0, "&equivDD;"], [0, "&ltcir;"], [0, "&gtcir;"], [0, "&ltquest;"], [0, "&gtquest;"], [0, { v: "&leqslant;", n: 824, o: "&nleqslant;" }], [0, { v: "&geqslant;", n: 824, o: "&ngeqslant;" }], [0, "&lesdot;"], [0, "&gesdot;"], [0, "&lesdoto;"], [0, "&gesdoto;"], [0, "&lesdotor;"], [0, "&gesdotol;"], [0, "&lap;"], [0, "&gap;"], [0, "&lne;"], [0, "&gne;"], [0, "&lnap;"], [0, "&gnap;"], [0, "&lEg;"], [0, "&gEl;"], [0, "&lsime;"], [0, "&gsime;"], [0, "&lsimg;"], [0, "&gsiml;"], [0, "&lgE;"], [0, "&glE;"], [0, "&lesges;"], [0, "&gesles;"], [0, "&els;"], [0, "&egs;"], [0, "&elsdot;"], [0, "&egsdot;"], [0, "&el;"], [0, "&eg;"], [2, "&siml;"], [0, "&simg;"], [0, "&simlE;"], [0, "&simgE;"], [0, { v: "&LessLess;", n: 824, o: "&NotNestedLessLess;" }], [0, { v: "&GreaterGreater;", n: 824, o: "&NotNestedGreaterGreater;" }], [1, "&glj;"], [0, "&gla;"], [0, "&ltcc;"], [0, "&gtcc;"], [0, "&lescc;"], [0, "&gescc;"], [0, "&smt;"], [0, "&lat;"], [0, { v: "&smte;", n: 65024, o: "&smtes;" }], [0, { v: "&late;", n: 65024, o: "&lates;" }], [0, "&bumpE;"], [0, { v: "&PrecedesEqual;", n: 824, o: "&NotPrecedesEqual;" }], [0, { v: "&sce;", n: 824, o: "&NotSucceedsEqual;" }], [2, "&prE;"], [0, "&scE;"], [0, "&precneqq;"], [0, "&scnE;"], [0, "&prap;"], [0, "&scap;"], [0, "&precnapprox;"], [0, "&scnap;"], [0, "&Pr;"], [0, "&Sc;"], [0, "&subdot;"], [0, "&supdot;"], [0, "&subplus;"], [0, "&supplus;"], [0, "&submult;"], [0, "&supmult;"], [0, "&subedot;"], [0, "&supedot;"], [0, { v: "&subE;", n: 824, o: "&nsubE;" }], [0, { v: "&supE;", n: 824, o: "&nsupE;" }], [0, "&subsim;"], [0, "&supsim;"], [2, { v: "&subnE;", n: 65024, o: "&varsubsetneqq;" }], [0, { v: "&supnE;", n: 65024, o: "&varsupsetneqq;" }], [2, "&csub;"], [0, "&csup;"], [0, "&csube;"], [0, "&csupe;"], [0, "&subsup;"], [0, "&supsub;"], [0, "&subsub;"], [0, "&supsup;"], [0, "&suphsub;"], [0, "&supdsub;"], [0, "&forkv;"], [0, "&topfork;"], [0, "&mlcp;"], [8, "&Dashv;"], [1, "&Vdashl;"], [0, "&Barv;"], [0, "&vBar;"], [0, "&vBarv;"], [1, "&Vbar;"], [0, "&Not;"], [0, "&bNot;"], [0, "&rnmid;"], [0, "&cirmid;"], [0, "&midcir;"], [0, "&topcir;"], [0, "&nhpar;"], [0, "&parsim;"], [9, { v: "&parsl;", n: 8421, o: "&nparsl;" }], [44343, { n: new Map(/* @__PURE__ */ restoreDiff([[56476, "&Ascr;"], [1, "&Cscr;"], [0, "&Dscr;"], [2, "&Gscr;"], [2, "&Jscr;"], [0, "&Kscr;"], [2, "&Nscr;"], [0, "&Oscr;"], [0, "&Pscr;"], [0, "&Qscr;"], [1, "&Sscr;"], [0, "&Tscr;"], [0, "&Uscr;"], [0, "&Vscr;"], [0, "&Wscr;"], [0, "&Xscr;"], [0, "&Yscr;"], [0, "&Zscr;"], [0, "&ascr;"], [0, "&bscr;"], [0, "&cscr;"], [0, "&dscr;"], [1, "&fscr;"], [1, "&hscr;"], [0, "&iscr;"], [0, "&jscr;"], [0, "&kscr;"], [0, "&lscr;"], [0, "&mscr;"], [0, "&nscr;"], [1, "&pscr;"], [0, "&qscr;"], [0, "&rscr;"], [0, "&sscr;"], [0, "&tscr;"], [0, "&uscr;"], [0, "&vscr;"], [0, "&wscr;"], [0, "&xscr;"], [0, "&yscr;"], [0, "&zscr;"], [52, "&Afr;"], [0, "&Bfr;"], [1, "&Dfr;"], [0, "&Efr;"], [0, "&Ffr;"], [0, "&Gfr;"], [2, "&Jfr;"], [0, "&Kfr;"], [0, "&Lfr;"], [0, "&Mfr;"], [0, "&Nfr;"], [0, "&Ofr;"], [0, "&Pfr;"], [0, "&Qfr;"], [1, "&Sfr;"], [0, "&Tfr;"], [0, "&Ufr;"], [0, "&Vfr;"], [0, "&Wfr;"], [0, "&Xfr;"], [0, "&Yfr;"], [1, "&afr;"], [0, "&bfr;"], [0, "&cfr;"], [0, "&dfr;"], [0, "&efr;"], [0, "&ffr;"], [0, "&gfr;"], [0, "&hfr;"], [0, "&ifr;"], [0, "&jfr;"], [0, "&kfr;"], [0, "&lfr;"], [0, "&mfr;"], [0, "&nfr;"], [0, "&ofr;"], [0, "&pfr;"], [0, "&qfr;"], [0, "&rfr;"], [0, "&sfr;"], [0, "&tfr;"], [0, "&ufr;"], [0, "&vfr;"], [0, "&wfr;"], [0, "&xfr;"], [0, "&yfr;"], [0, "&zfr;"], [0, "&Aopf;"], [0, "&Bopf;"], [1, "&Dopf;"], [0, "&Eopf;"], [0, "&Fopf;"], [0, "&Gopf;"], [1, "&Iopf;"], [0, "&Jopf;"], [0, "&Kopf;"], [0, "&Lopf;"], [0, "&Mopf;"], [1, "&Oopf;"], [3, "&Sopf;"], [0, "&Topf;"], [0, "&Uopf;"], [0, "&Vopf;"], [0, "&Wopf;"], [0, "&Xopf;"], [0, "&Yopf;"], [1, "&aopf;"], [0, "&bopf;"], [0, "&copf;"], [0, "&dopf;"], [0, "&eopf;"], [0, "&fopf;"], [0, "&gopf;"], [0, "&hopf;"], [0, "&iopf;"], [0, "&jopf;"], [0, "&kopf;"], [0, "&lopf;"], [0, "&mopf;"], [0, "&nopf;"], [0, "&oopf;"], [0, "&popf;"], [0, "&qopf;"], [0, "&ropf;"], [0, "&sopf;"], [0, "&topf;"], [0, "&uopf;"], [0, "&vopf;"], [0, "&wopf;"], [0, "&xopf;"], [0, "&yopf;"], [0, "&zopf;"]])) }], [8906, "&fflig;"], [0, "&filig;"], [0, "&fllig;"], [0, "&ffilig;"], [0, "&ffllig;"]]));

// node_modules/entities/lib/esm/escape.js
var xmlCodeMap = /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [39, "&apos;"],
  [60, "&lt;"],
  [62, "&gt;"]
]);
var getCodePoint = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  String.prototype.codePointAt != null ? (str, index) => str.codePointAt(index) : (
    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    (c, index) => (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index)
  )
);
function getEscaper(regex, map2) {
  return function escape3(data) {
    let match2;
    let lastIdx = 0;
    let result = "";
    while (match2 = regex.exec(data)) {
      if (lastIdx !== match2.index) {
        result += data.substring(lastIdx, match2.index);
      }
      result += map2.get(match2[0].charCodeAt(0));
      lastIdx = match2.index + 1;
    }
    return result + data.substring(lastIdx);
  };
}
var escapeUTF8 = getEscaper(/[&<>'"]/g, xmlCodeMap);
var escapeAttribute = getEscaper(/["&\u00A0]/g, /* @__PURE__ */ new Map([
  [34, "&quot;"],
  [38, "&amp;"],
  [160, "&nbsp;"]
]));
var escapeText = getEscaper(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
  [38, "&amp;"],
  [60, "&lt;"],
  [62, "&gt;"],
  [160, "&nbsp;"]
]));

// node_modules/entities/lib/esm/index.js
var EntityLevel;
(function(EntityLevel2) {
  EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
  EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
})(EntityLevel || (EntityLevel = {}));
var EncodingMode;
(function(EncodingMode2) {
  EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
  EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
  EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
  EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
  EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
})(EncodingMode || (EncodingMode = {}));

// node_modules/markdown-it/lib/common/utils.mjs
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function isString(obj) {
  return _class(obj) === "[object String]";
}
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function has(object, key) {
  return _hasOwnProperty.call(object, key);
}
function assign(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (!source) {
      return;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be object");
    }
    Object.keys(source).forEach(function(key) {
      obj[key] = source[key];
    });
  });
  return obj;
}
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}
function isValidEntityCode(c) {
  if (c >= 55296 && c <= 57343) {
    return false;
  }
  if (c >= 64976 && c <= 65007) {
    return false;
  }
  if ((c & 65535) === 65535 || (c & 65535) === 65534) {
    return false;
  }
  if (c >= 0 && c <= 8) {
    return false;
  }
  if (c === 11) {
    return false;
  }
  if (c >= 14 && c <= 31) {
    return false;
  }
  if (c >= 127 && c <= 159) {
    return false;
  }
  if (c > 1114111) {
    return false;
  }
  return true;
}
function fromCodePoint2(c) {
  if (c > 65535) {
    c -= 65536;
    const surrogate1 = 55296 + (c >> 10);
    const surrogate2 = 56320 + (c & 1023);
    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}
var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source, "gi");
var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function replaceEntityPattern(match2, name) {
  if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) {
    const code2 = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    if (isValidEntityCode(code2)) {
      return fromCodePoint2(code2);
    }
    return match2;
  }
  const decoded = decodeHTML(match2);
  if (decoded !== match2) {
    return decoded;
  }
  return match2;
}
function unescapeMd(str) {
  if (str.indexOf("\\") < 0) {
    return str;
  }
  return str.replace(UNESCAPE_MD_RE, "$1");
}
function unescapeAll(str) {
  if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) {
    return str;
  }
  return str.replace(UNESCAPE_ALL_RE, function(match2, escaped, entity2) {
    if (escaped) {
      return escaped;
    }
    return replaceEntityPattern(match2, entity2);
  });
}
var HTML_ESCAPE_TEST_RE = /[&<>"]/;
var HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
var HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}
var REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
function escapeRE(str) {
  return str.replace(REGEXP_ESCAPE_RE, "\\$&");
}
function isSpace(code2) {
  switch (code2) {
    case 9:
    case 32:
      return true;
  }
  return false;
}
function isWhiteSpace(code2) {
  if (code2 >= 8192 && code2 <= 8202) {
    return true;
  }
  switch (code2) {
    case 9:
    // \t
    case 10:
    // \n
    case 11:
    // \v
    case 12:
    // \f
    case 13:
    // \r
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return true;
  }
  return false;
}
function isPunctChar(ch) {
  return regex_default4.test(ch) || regex_default5.test(ch);
}
function isPunctCharCode(code2) {
  return isPunctChar(fromCodePoint2(code2));
}
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function normalizeReference(str) {
  str = str.trim().replace(/\s+/g, " ");
  if ("\u1E9E".toLowerCase() === "\u1E7E") {
    str = str.replace(/ẞ/g, "\xDF");
  }
  return str.toLowerCase().toUpperCase();
}
function isAsciiTrimmable(c) {
  return c === 32 || c === 9 || c === 10 || c === 13;
}
function asciiTrim(str) {
  let start = 0;
  for (; start < str.length; start++) {
    if (!isAsciiTrimmable(str.charCodeAt(start))) {
      break;
    }
  }
  let end = str.length - 1;
  for (; end >= start; end--) {
    if (!isAsciiTrimmable(str.charCodeAt(end))) {
      break;
    }
  }
  return str.slice(start, end + 1);
}
var lib = { mdurl: mdurl_exports, ucmicro: uc_exports };

// node_modules/markdown-it/lib/helpers/index.mjs
var helpers_exports = {};
__export(helpers_exports, {
  parseLinkDestination: () => parseLinkDestination,
  parseLinkLabel: () => parseLinkLabel,
  parseLinkTitle: () => parseLinkTitle
});

// node_modules/markdown-it/lib/helpers/parse_link_label.mjs
function parseLinkLabel(state, start, disableNested) {
  let level, found, marker, prevPos;
  const max = state.posMax;
  const oldPos = state.pos;
  state.pos = start + 1;
  level = 1;
  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 93) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }
    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 91) {
      if (prevPos === state.pos - 1) {
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }
  let labelEnd = -1;
  if (found) {
    labelEnd = state.pos;
  }
  state.pos = oldPos;
  return labelEnd;
}

// node_modules/markdown-it/lib/helpers/parse_link_destination.mjs
function parseLinkDestination(str, start, max) {
  let code2;
  let pos = start;
  const result = {
    ok: false,
    pos: 0,
    str: ""
  };
  if (str.charCodeAt(pos) === 60) {
    pos++;
    while (pos < max) {
      code2 = str.charCodeAt(pos);
      if (code2 === 10) {
        return result;
      }
      if (code2 === 60) {
        return result;
      }
      if (code2 === 62) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code2 === 92 && pos + 1 < max) {
        pos += 2;
        continue;
      }
      pos++;
    }
    return result;
  }
  let level = 0;
  while (pos < max) {
    code2 = str.charCodeAt(pos);
    if (code2 === 32) {
      break;
    }
    if (code2 < 32 || code2 === 127) {
      break;
    }
    if (code2 === 92 && pos + 1 < max) {
      if (str.charCodeAt(pos + 1) === 32) {
        break;
      }
      pos += 2;
      continue;
    }
    if (code2 === 40) {
      level++;
      if (level > 32) {
        return result;
      }
    }
    if (code2 === 41) {
      if (level === 0) {
        break;
      }
      level--;
    }
    pos++;
  }
  if (start === pos) {
    return result;
  }
  if (level !== 0) {
    return result;
  }
  result.str = unescapeAll(str.slice(start, pos));
  result.pos = pos;
  result.ok = true;
  return result;
}

// node_modules/markdown-it/lib/helpers/parse_link_title.mjs
function parseLinkTitle(str, start, max, prev_state) {
  let code2;
  let pos = start;
  const state = {
    // if `true`, this is a valid link title
    ok: false,
    // if `true`, this link can be continued on the next line
    can_continue: false,
    // if `ok`, it's the position of the first character after the closing marker
    pos: 0,
    // if `ok`, it's the unescaped title
    str: "",
    // expected closing marker character code
    marker: 0
  };
  if (prev_state) {
    state.str = prev_state.str;
    state.marker = prev_state.marker;
  } else {
    if (pos >= max) {
      return state;
    }
    let marker = str.charCodeAt(pos);
    if (marker !== 34 && marker !== 39 && marker !== 40) {
      return state;
    }
    start++;
    pos++;
    if (marker === 40) {
      marker = 41;
    }
    state.marker = marker;
  }
  while (pos < max) {
    code2 = str.charCodeAt(pos);
    if (code2 === state.marker) {
      state.pos = pos + 1;
      state.str += unescapeAll(str.slice(start, pos));
      state.ok = true;
      return state;
    } else if (code2 === 40 && state.marker === 41) {
      return state;
    } else if (code2 === 92 && pos + 1 < max) {
      pos++;
    }
    pos++;
  }
  state.can_continue = true;
  state.str += unescapeAll(str.slice(start, pos));
  return state;
}

// node_modules/markdown-it/lib/renderer.mjs
var default_rules = {};
default_rules.code_inline = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return "<code" + slf.renderAttrs(token) + ">" + escapeHtml(token.content) + "</code>";
};
default_rules.code_block = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return "<pre" + slf.renderAttrs(token) + "><code>" + escapeHtml(tokens[idx].content) + "</code></pre>\n";
};
default_rules.fence = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? unescapeAll(token.info).trim() : "";
  let langName = "";
  let langAttrs = "";
  if (info) {
    const arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join("");
  }
  let highlighted;
  if (options.highlight) {
    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml(token.content);
  } else {
    highlighted = escapeHtml(token.content);
  }
  if (highlighted.indexOf("<pre") === 0) {
    return highlighted + "\n";
  }
  if (info) {
    const i = token.attrIndex("class");
    const tmpAttrs = token.attrs ? token.attrs.slice() : [];
    if (i < 0) {
      tmpAttrs.push(["class", options.langPrefix + langName]);
    } else {
      tmpAttrs[i] = tmpAttrs[i].slice();
      tmpAttrs[i][1] += " " + options.langPrefix + langName;
    }
    const tmpToken = {
      attrs: tmpAttrs
    };
    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>
`;
  }
  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>
`;
};
default_rules.image = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
  return slf.renderToken(tokens, idx, options);
};
default_rules.hardbreak = function(tokens, idx, options) {
  return options.xhtmlOut ? "<br />\n" : "<br>\n";
};
default_rules.softbreak = function(tokens, idx, options) {
  return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
};
default_rules.text = function(tokens, idx) {
  return escapeHtml(tokens[idx].content);
};
default_rules.html_block = function(tokens, idx) {
  return tokens[idx].content;
};
default_rules.html_inline = function(tokens, idx) {
  return tokens[idx].content;
};
function Renderer() {
  this.rules = assign({}, default_rules);
}
Renderer.prototype.renderAttrs = function renderAttrs(token) {
  let i, l, result;
  if (!token.attrs) {
    return "";
  }
  result = "";
  for (i = 0, l = token.attrs.length; i < l; i++) {
    result += " " + escapeHtml(token.attrs[i][0]) + '="' + escapeHtml(token.attrs[i][1]) + '"';
  }
  return result;
};
Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
  const token = tokens[idx];
  let result = "";
  if (token.hidden) {
    return "";
  }
  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += "\n";
  }
  result += (token.nesting === -1 ? "</" : "<") + token.tag;
  result += this.renderAttrs(token);
  if (token.nesting === 0 && options.xhtmlOut) {
    result += " /";
  }
  let needLf = false;
  if (token.block) {
    needLf = true;
    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        const nextToken = tokens[idx + 1];
        if (nextToken.type === "inline" || nextToken.hidden) {
          needLf = false;
        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          needLf = false;
        }
      }
    }
  }
  result += needLf ? ">\n" : ">";
  return result;
};
Renderer.prototype.renderInline = function(tokens, options, env) {
  let result = "";
  const rules = this.rules;
  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type;
    if (typeof rules[type] !== "undefined") {
      result += rules[type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options);
    }
  }
  return result;
};
Renderer.prototype.renderInlineAsText = function(tokens, options, env) {
  let result = "";
  for (let i = 0, len = tokens.length; i < len; i++) {
    switch (tokens[i].type) {
      case "text":
        result += tokens[i].content;
        break;
      case "image":
        result += this.renderInlineAsText(tokens[i].children, options, env);
        break;
      case "html_inline":
      case "html_block":
        result += tokens[i].content;
        break;
      case "softbreak":
      case "hardbreak":
        result += "\n";
        break;
      default:
    }
  }
  return result;
};
Renderer.prototype.render = function(tokens, options, env) {
  let result = "";
  const rules = this.rules;
  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type;
    if (type === "inline") {
      result += this.renderInline(tokens[i].children, options, env);
    } else if (typeof rules[type] !== "undefined") {
      result += rules[type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options, env);
    }
  }
  return result;
};
var renderer_default = Renderer;

// node_modules/markdown-it/lib/ruler.mjs
function Ruler() {
  this.__rules__ = [];
  this.__cache__ = null;
}
Ruler.prototype.__find__ = function(name) {
  for (let i = 0; i < this.__rules__.length; i++) {
    if (this.__rules__[i].name === name) {
      return i;
    }
  }
  return -1;
};
Ruler.prototype.__compile__ = function() {
  const self = this;
  const chains = [""];
  self.__rules__.forEach(function(rule) {
    if (!rule.enabled) {
      return;
    }
    rule.alt.forEach(function(altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });
  self.__cache__ = {};
  chains.forEach(function(chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function(rule) {
      if (!rule.enabled) {
        return;
      }
      if (chain && rule.alt.indexOf(chain) < 0) {
        return;
      }
      self.__cache__[chain].push(rule.fn);
    });
  });
};
Ruler.prototype.at = function(name, fn, options) {
  const index = this.__find__(name);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + name);
  }
  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = opt.alt || [];
  this.__cache__ = null;
};
Ruler.prototype.before = function(beforeName, ruleName, fn, options) {
  const index = this.__find__(beforeName);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + beforeName);
  }
  this.__rules__.splice(index, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.after = function(afterName, ruleName, fn, options) {
  const index = this.__find__(afterName);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + afterName);
  }
  this.__rules__.splice(index + 1, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.push = function(ruleName, fn, options) {
  const opt = options || {};
  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.enable = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  const result = [];
  list2.forEach(function(name) {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) {
        return;
      }
      throw new Error("Rules manager: invalid rule name " + name);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  }, this);
  this.__cache__ = null;
  return result;
};
Ruler.prototype.enableOnly = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  this.__rules__.forEach(function(rule) {
    rule.enabled = false;
  });
  this.enable(list2, ignoreInvalid);
};
Ruler.prototype.disable = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  const result = [];
  list2.forEach(function(name) {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) {
        return;
      }
      throw new Error("Rules manager: invalid rule name " + name);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  }, this);
  this.__cache__ = null;
  return result;
};
Ruler.prototype.getRules = function(chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }
  return this.__cache__[chainName] || [];
};
var ruler_default = Ruler;

// node_modules/markdown-it/lib/token.mjs
function Token(type, tag, nesting) {
  this.type = type;
  this.tag = tag;
  this.attrs = null;
  this.map = null;
  this.nesting = nesting;
  this.level = 0;
  this.children = null;
  this.content = "";
  this.markup = "";
  this.info = "";
  this.meta = null;
  this.block = false;
  this.hidden = false;
}
Token.prototype.attrIndex = function attrIndex(name) {
  if (!this.attrs) {
    return -1;
  }
  const attrs = this.attrs;
  for (let i = 0, len = attrs.length; i < len; i++) {
    if (attrs[i][0] === name) {
      return i;
    }
  }
  return -1;
};
Token.prototype.attrPush = function attrPush(attrData) {
  if (this.attrs) {
    this.attrs.push(attrData);
  } else {
    this.attrs = [attrData];
  }
};
Token.prototype.attrSet = function attrSet(name, value) {
  const idx = this.attrIndex(name);
  const attrData = [name, value];
  if (idx < 0) {
    this.attrPush(attrData);
  } else {
    this.attrs[idx] = attrData;
  }
};
Token.prototype.attrGet = function attrGet(name) {
  const idx = this.attrIndex(name);
  let value = null;
  if (idx >= 0) {
    value = this.attrs[idx][1];
  }
  return value;
};
Token.prototype.attrJoin = function attrJoin(name, value) {
  const idx = this.attrIndex(name);
  if (idx < 0) {
    this.attrPush([name, value]);
  } else {
    this.attrs[idx][1] = this.attrs[idx][1] + " " + value;
  }
};
var token_default = Token;

// node_modules/markdown-it/lib/rules_core/state_core.mjs
function StateCore(src, md2, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md2;
}
StateCore.prototype.Token = token_default;
var state_core_default = StateCore;

// node_modules/markdown-it/lib/rules_core/normalize.mjs
var NEWLINES_RE = /\r\n?|\n/g;
var NULL_RE = /\0/g;
function normalize(state) {
  let str;
  str = state.src.replace(NEWLINES_RE, "\n");
  str = str.replace(NULL_RE, "\uFFFD");
  state.src = str;
}

// node_modules/markdown-it/lib/rules_core/block.mjs
function block(state) {
  let token;
  if (state.inlineMode) {
    token = new state.Token("inline", "", 0);
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
}

// node_modules/markdown-it/lib/rules_core/inline.mjs
function inline(state) {
  const tokens = state.tokens;
  for (let i = 0, l = tokens.length; i < l; i++) {
    const tok = tokens[i];
    if (tok.type === "inline") {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
}

// node_modules/markdown-it/lib/rules_core/linkify.mjs
function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}
function linkify(state) {
  const blockTokens = state.tokens;
  if (!state.md.options.linkify) {
    return;
  }
  for (let j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== "inline" || !state.md.linkify.pretest(blockTokens[j].content)) {
      continue;
    }
    let tokens = blockTokens[j].children;
    let htmlLinkLevel = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const currentToken = tokens[i];
      if (currentToken.type === "link_close") {
        i--;
        while (tokens[i].level !== currentToken.level && tokens[i].type !== "link_open") {
          i--;
        }
        continue;
      }
      if (currentToken.type === "html_inline") {
        if (isLinkOpen(currentToken.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose(currentToken.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) {
        continue;
      }
      if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
        const text2 = currentToken.content;
        let links = state.md.linkify.match(text2);
        const nodes = [];
        let level = currentToken.level;
        let lastPos = 0;
        if (links.length > 0 && links[0].index === 0 && i > 0 && tokens[i - 1].type === "text_special") {
          links = links.slice(1);
        }
        for (let ln2 = 0; ln2 < links.length; ln2++) {
          const url = links[ln2].url;
          const fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) {
            continue;
          }
          let urlText = links[ln2].text;
          if (!links[ln2].schema) {
            urlText = state.md.normalizeLinkText("http://" + urlText).replace(/^http:\/\//, "");
          } else if (links[ln2].schema === "mailto:" && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText("mailto:" + urlText).replace(/^mailto:/, "");
          } else {
            urlText = state.md.normalizeLinkText(urlText);
          }
          const pos = links[ln2].index;
          if (pos > lastPos) {
            const token = new state.Token("text", "", 0);
            token.content = text2.slice(lastPos, pos);
            token.level = level;
            nodes.push(token);
          }
          const token_o = new state.Token("link_open", "a", 1);
          token_o.attrs = [["href", fullUrl]];
          token_o.level = level++;
          token_o.markup = "linkify";
          token_o.info = "auto";
          nodes.push(token_o);
          const token_t = new state.Token("text", "", 0);
          token_t.content = urlText;
          token_t.level = level;
          nodes.push(token_t);
          const token_c = new state.Token("link_close", "a", -1);
          token_c.level = --level;
          token_c.markup = "linkify";
          token_c.info = "auto";
          nodes.push(token_c);
          lastPos = links[ln2].lastIndex;
        }
        if (lastPos < text2.length) {
          const token = new state.Token("text", "", 0);
          token.content = text2.slice(lastPos);
          token.level = level;
          nodes.push(token);
        }
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }
}

// node_modules/markdown-it/lib/rules_core/replacements.mjs
var RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
var SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
var SCOPED_ABBR_RE = /\((c|tm|r)\)/ig;
var SCOPED_ABBR = {
  c: "\xA9",
  r: "\xAE",
  tm: "\u2122"
};
function replaceFn(match2, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}
function replace_scoped(inlineTokens) {
  let inside_autolink = 0;
  for (let i = inlineTokens.length - 1; i >= 0; i--) {
    const token = inlineTokens[i];
    if (token.type === "text" && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }
    if (token.type === "link_open" && token.info === "auto") {
      inside_autolink--;
    }
    if (token.type === "link_close" && token.info === "auto") {
      inside_autolink++;
    }
  }
}
function replace_rare(inlineTokens) {
  let inside_autolink = 0;
  for (let i = inlineTokens.length - 1; i >= 0; i--) {
    const token = inlineTokens[i];
    if (token.type === "text" && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content.replace(/\+-/g, "\xB1").replace(/\.{2,}/g, "\u2026").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/mg, "$1\u2014").replace(/(^|\s)--(?=\s|$)/mg, "$1\u2013").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, "$1\u2013");
      }
    }
    if (token.type === "link_open" && token.info === "auto") {
      inside_autolink--;
    }
    if (token.type === "link_close" && token.info === "auto") {
      inside_autolink++;
    }
  }
}
function replace(state) {
  let blkIdx;
  if (!state.md.options.typographer) {
    return;
  }
  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") {
      continue;
    }
    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
      replace_scoped(state.tokens[blkIdx].children);
    }
    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replace_rare(state.tokens[blkIdx].children);
    }
  }
}

// node_modules/markdown-it/lib/rules_core/smartquotes.mjs
var QUOTE_TEST_RE = /['"]/;
var QUOTE_RE = /['"]/g;
var APOSTROPHE = "\u2019";
function addReplacement(replacements, tokenIdx, pos, ch) {
  if (!replacements[tokenIdx]) {
    replacements[tokenIdx] = [];
  }
  replacements[tokenIdx].push({ pos, ch });
}
function applyReplacements(str, replacements) {
  let result = "";
  let lastPos = 0;
  replacements.sort((a, b) => a.pos - b.pos);
  for (let i = 0; i < replacements.length; i++) {
    const replacement = replacements[i];
    result += str.slice(lastPos, replacement.pos) + replacement.ch;
    lastPos = replacement.pos + 1;
  }
  return result + str.slice(lastPos);
}
function process_inlines(tokens, state) {
  let j;
  const stack = [];
  const replacements = {};
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const thisLevel = tokens[i].level;
    for (j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= thisLevel) {
        break;
      }
    }
    stack.length = j + 1;
    if (token.type !== "text") {
      continue;
    }
    const text2 = token.content;
    let pos = 0;
    const max = text2.length;
    OUTER:
      while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        const t = QUOTE_RE.exec(text2);
        if (!t) {
          break;
        }
        let canOpen = true;
        let canClose = true;
        pos = t.index + 1;
        const isSingle = t[0] === "'";
        let lastChar = 32;
        if (t.index - 1 >= 0) {
          lastChar = text2.charCodeAt(t.index - 1);
        } else {
          for (j = i - 1; j >= 0; j--) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
            if (!tokens[j].content) continue;
            lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
            break;
          }
        }
        let nextChar = 32;
        if (pos < max) {
          nextChar = text2.charCodeAt(pos);
        } else {
          for (j = i + 1; j < tokens.length; j++) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
            if (!tokens[j].content) continue;
            nextChar = tokens[j].content.charCodeAt(0);
            break;
          }
        }
        const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
        const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
        const isLastWhiteSpace = isWhiteSpace(lastChar);
        const isNextWhiteSpace = isWhiteSpace(nextChar);
        if (isNextWhiteSpace) {
          canOpen = false;
        } else if (isNextPunctChar) {
          if (!(isLastWhiteSpace || isLastPunctChar)) {
            canOpen = false;
          }
        }
        if (isLastWhiteSpace) {
          canClose = false;
        } else if (isLastPunctChar) {
          if (!(isNextWhiteSpace || isNextPunctChar)) {
            canClose = false;
          }
        }
        if (nextChar === 34 && t[0] === '"') {
          if (lastChar >= 48 && lastChar <= 57) {
            canClose = canOpen = false;
          }
        }
        if (canOpen && canClose) {
          canOpen = isLastPunctChar;
          canClose = isNextPunctChar;
        }
        if (!canOpen && !canClose) {
          if (isSingle) {
            addReplacement(replacements, i, t.index, APOSTROPHE);
          }
          continue;
        }
        if (canClose) {
          for (j = stack.length - 1; j >= 0; j--) {
            let item = stack[j];
            if (stack[j].level < thisLevel) {
              break;
            }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];
              let openQuote;
              let closeQuote;
              if (isSingle) {
                openQuote = state.md.options.quotes[2];
                closeQuote = state.md.options.quotes[3];
              } else {
                openQuote = state.md.options.quotes[0];
                closeQuote = state.md.options.quotes[1];
              }
              addReplacement(replacements, i, t.index, closeQuote);
              addReplacement(replacements, item.token, item.pos, openQuote);
              stack.length = j;
              continue OUTER;
            }
          }
        }
        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          addReplacement(replacements, i, t.index, APOSTROPHE);
        }
      }
  }
  Object.keys(replacements).forEach(function(tokenIdx) {
    tokens[tokenIdx].content = applyReplacements(tokens[tokenIdx].content, replacements[tokenIdx]);
  });
}
function smartquotes(state) {
  if (!state.md.options.typographer) {
    return;
  }
  for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
      continue;
    }
    process_inlines(state.tokens[blkIdx].children, state);
  }
}

// node_modules/markdown-it/lib/rules_core/text_join.mjs
function text_join(state) {
  let curr, last;
  const blockTokens = state.tokens;
  const l = blockTokens.length;
  for (let j = 0; j < l; j++) {
    if (blockTokens[j].type !== "inline") continue;
    const tokens = blockTokens[j].children;
    const max = tokens.length;
    for (curr = 0; curr < max; curr++) {
      if (tokens[curr].type === "text_special") {
        tokens[curr].type = "text";
      }
    }
    for (curr = last = 0; curr < max; curr++) {
      if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      } else {
        if (curr !== last) {
          tokens[last] = tokens[curr];
        }
        last++;
      }
    }
    if (curr !== last) {
      tokens.length = last;
    }
  }
}

// node_modules/markdown-it/lib/parser_core.mjs
var _rules = [
  ["normalize", normalize],
  ["block", block],
  ["inline", inline],
  ["linkify", linkify],
  ["replacements", replace],
  ["smartquotes", smartquotes],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ["text_join", text_join]
];
function Core() {
  this.ruler = new ruler_default();
  for (let i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
}
Core.prototype.process = function(state) {
  const rules = this.ruler.getRules("");
  for (let i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};
Core.prototype.State = state_core_default;
var parser_core_default = Core;

// node_modules/markdown-it/lib/rules_block/state_block.mjs
function StateBlock(src, md2, env, tokens) {
  this.src = src;
  this.md = md2;
  this.env = env;
  this.tokens = tokens;
  this.bMarks = [];
  this.eMarks = [];
  this.tShift = [];
  this.sCount = [];
  this.bsCount = [];
  this.blkIndent = 0;
  this.line = 0;
  this.lineMax = 0;
  this.tight = false;
  this.ddIndent = -1;
  this.listIndent = -1;
  this.parentType = "root";
  this.level = 0;
  const s = this.src;
  for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
    const ch = s.charCodeAt(pos);
    if (!indent_found) {
      if (isSpace(ch)) {
        indent++;
        if (ch === 9) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
        continue;
      } else {
        indent_found = true;
      }
    }
    if (ch === 10 || pos === len - 1) {
      if (ch !== 10) {
        pos++;
      }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      this.sCount.push(offset);
      this.bsCount.push(0);
      indent_found = false;
      indent = 0;
      offset = 0;
      start = pos + 1;
    }
  }
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.sCount.push(0);
  this.bsCount.push(0);
  this.lineMax = this.bMarks.length - 1;
}
StateBlock.prototype.push = function(type, tag, nesting) {
  const token = new token_default(type, tag, nesting);
  token.block = true;
  if (nesting < 0) this.level--;
  token.level = this.level;
  if (nesting > 0) this.level++;
  this.tokens.push(token);
  return token;
};
StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};
StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (let max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (let max = this.src.length; pos < max; pos++) {
    const ch = this.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
  if (pos <= min) {
    return pos;
  }
  while (pos > min) {
    if (!isSpace(this.src.charCodeAt(--pos))) {
      return pos + 1;
    }
  }
  return pos;
};
StateBlock.prototype.skipChars = function skipChars(pos, code2) {
  for (let max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code2) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code2, min) {
  if (pos <= min) {
    return pos;
  }
  while (pos > min) {
    if (code2 !== this.src.charCodeAt(--pos)) {
      return pos + 1;
    }
  }
  return pos;
};
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  if (begin >= end) {
    return "";
  }
  const queue = new Array(end - begin);
  for (let i = 0, line = begin; line < end; line++, i++) {
    let lineIndent = 0;
    const lineStart = this.bMarks[line];
    let first = lineStart;
    let last;
    if (line + 1 < end || keepLastLF) {
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }
    while (first < last && lineIndent < indent) {
      const ch = this.src.charCodeAt(first);
      if (isSpace(ch)) {
        if (ch === 9) {
          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
        } else {
          lineIndent++;
        }
      } else if (first - lineStart < this.tShift[line]) {
        lineIndent++;
      } else {
        break;
      }
      first++;
    }
    if (lineIndent > indent) {
      queue[i] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last);
    } else {
      queue[i] = this.src.slice(first, last);
    }
  }
  return queue.join("");
};
StateBlock.prototype.Token = token_default;
var state_block_default = StateBlock;

// node_modules/markdown-it/lib/rules_block/table.mjs
var MAX_AUTOCOMPLETED_CELLS = 65536;
function getLine(state, line) {
  const pos = state.bMarks[line] + state.tShift[line];
  const max = state.eMarks[line];
  return state.src.slice(pos, max);
}
function escapedSplit(str) {
  const result = [];
  const max = str.length;
  let pos = 0;
  let ch = str.charCodeAt(pos);
  let isEscaped = false;
  let lastPos = 0;
  let current = "";
  while (pos < max) {
    if (ch === 124) {
      if (!isEscaped) {
        result.push(current + str.substring(lastPos, pos));
        current = "";
        lastPos = pos + 1;
      } else {
        current += str.substring(lastPos, pos - 1);
        lastPos = pos;
      }
    }
    isEscaped = ch === 92;
    pos++;
    ch = str.charCodeAt(pos);
  }
  result.push(current + str.substring(lastPos));
  return result;
}
function table(state, startLine, endLine, silent) {
  if (startLine + 2 > endLine) {
    return false;
  }
  let nextLine = startLine + 1;
  if (state.sCount[nextLine] < state.blkIndent) {
    return false;
  }
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }
  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }
  const firstCh = state.src.charCodeAt(pos++);
  if (firstCh !== 124 && firstCh !== 45 && firstCh !== 58) {
    return false;
  }
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }
  const secondCh = state.src.charCodeAt(pos++);
  if (secondCh !== 124 && secondCh !== 45 && secondCh !== 58 && !isSpace(secondCh)) {
    return false;
  }
  if (firstCh === 45 && isSpace(secondCh)) {
    return false;
  }
  while (pos < state.eMarks[nextLine]) {
    const ch = state.src.charCodeAt(pos);
    if (ch !== 124 && ch !== 45 && ch !== 58 && !isSpace(ch)) {
      return false;
    }
    pos++;
  }
  let lineText = getLine(state, startLine + 1);
  let columns = lineText.split("|");
  const aligns = [];
  for (let i = 0; i < columns.length; i++) {
    const t = columns[i].trim();
    if (!t) {
      if (i === 0 || i === columns.length - 1) {
        continue;
      } else {
        return false;
      }
    }
    if (!/^:?-+:?$/.test(t)) {
      return false;
    }
    if (t.charCodeAt(t.length - 1) === 58) {
      aligns.push(t.charCodeAt(0) === 58 ? "center" : "right");
    } else if (t.charCodeAt(0) === 58) {
      aligns.push("left");
    } else {
      aligns.push("");
    }
  }
  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf("|") === -1) {
    return false;
  }
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  columns = escapedSplit(lineText);
  if (columns.length && columns[0] === "") columns.shift();
  if (columns.length && columns[columns.length - 1] === "") columns.pop();
  const columnCount = columns.length;
  if (columnCount === 0 || columnCount !== aligns.length) {
    return false;
  }
  if (silent) {
    return true;
  }
  const oldParentType = state.parentType;
  state.parentType = "table";
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const token_to = state.push("table_open", "table", 1);
  const tableLines = [startLine, 0];
  token_to.map = tableLines;
  const token_tho = state.push("thead_open", "thead", 1);
  token_tho.map = [startLine, startLine + 1];
  const token_htro = state.push("tr_open", "tr", 1);
  token_htro.map = [startLine, startLine + 1];
  for (let i = 0; i < columns.length; i++) {
    const token_ho = state.push("th_open", "th", 1);
    if (aligns[i]) {
      token_ho.attrs = [["style", "text-align:" + aligns[i]]];
    }
    const token_il = state.push("inline", "", 0);
    token_il.content = columns[i].trim();
    token_il.children = [];
    state.push("th_close", "th", -1);
  }
  state.push("tr_close", "tr", -1);
  state.push("thead_close", "thead", -1);
  let tbodyLines;
  let autocompletedCells = 0;
  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    lineText = getLine(state, nextLine).trim();
    if (!lineText) {
      break;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();
    autocompletedCells += columnCount - columns.length;
    if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) {
      break;
    }
    if (nextLine === startLine + 2) {
      const token_tbo = state.push("tbody_open", "tbody", 1);
      token_tbo.map = tbodyLines = [startLine + 2, 0];
    }
    const token_tro = state.push("tr_open", "tr", 1);
    token_tro.map = [nextLine, nextLine + 1];
    for (let i = 0; i < columnCount; i++) {
      const token_tdo = state.push("td_open", "td", 1);
      if (aligns[i]) {
        token_tdo.attrs = [["style", "text-align:" + aligns[i]]];
      }
      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i] ? columns[i].trim() : "";
      token_il.children = [];
      state.push("td_close", "td", -1);
    }
    state.push("tr_close", "tr", -1);
  }
  if (tbodyLines) {
    state.push("tbody_close", "tbody", -1);
    tbodyLines[1] = nextLine;
  }
  state.push("table_close", "table", -1);
  tableLines[1] = nextLine;
  state.parentType = oldParentType;
  state.line = nextLine;
  return true;
}

// node_modules/markdown-it/lib/rules_block/code.mjs
function code(state, startLine, endLine) {
  if (state.sCount[startLine] - state.blkIndent < 4) {
    return false;
  }
  let nextLine = startLine + 1;
  let last = nextLine;
  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }
  state.line = last;
  const token = state.push("code_block", "code", 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n";
  token.map = [startLine, state.line];
  return true;
}

// node_modules/markdown-it/lib/rules_block/fence.mjs
function fence(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (pos + 3 > max) {
    return false;
  }
  const marker = state.src.charCodeAt(pos);
  if (marker !== 126 && marker !== 96) {
    return false;
  }
  let mem = pos;
  pos = state.skipChars(pos, marker);
  let len = pos - mem;
  if (len < 3) {
    return false;
  }
  const markup = state.src.slice(mem, pos);
  const params = state.src.slice(pos, max);
  if (marker === 96) {
    if (params.indexOf(String.fromCharCode(marker)) >= 0) {
      return false;
    }
  }
  if (silent) {
    return true;
  }
  let nextLine = startLine;
  let haveEndMarker = false;
  for (; ; ) {
    nextLine++;
    if (nextLine >= endLine) {
      break;
    }
    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    if (state.src.charCodeAt(pos) !== marker) {
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      continue;
    }
    pos = state.skipChars(pos, marker);
    if (pos - mem < len) {
      continue;
    }
    pos = state.skipSpaces(pos);
    if (pos < max) {
      continue;
    }
    haveEndMarker = true;
    break;
  }
  len = state.sCount[startLine];
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  const token = state.push("fence", "code", 0);
  token.info = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup = markup;
  token.map = [startLine, state.line];
  return true;
}

// node_modules/markdown-it/lib/rules_block/blockquote.mjs
function blockquote(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  const oldLineMax = state.lineMax;
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 62) {
    return false;
  }
  if (silent) {
    return true;
  }
  const oldBMarks = [];
  const oldBSCount = [];
  const oldSCount = [];
  const oldTShift = [];
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const oldParentType = state.parentType;
  state.parentType = "blockquote";
  let lastLineEmpty = false;
  let nextLine;
  for (nextLine = startLine; nextLine < endLine; nextLine++) {
    const isOutdented = state.sCount[nextLine] < state.blkIndent;
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos >= max) {
      break;
    }
    if (state.src.charCodeAt(pos++) === 62 && !isOutdented) {
      let initial = state.sCount[nextLine] + 1;
      let spaceAfterMarker;
      let adjustTab;
      if (state.src.charCodeAt(pos) === 32) {
        pos++;
        initial++;
        adjustTab = false;
        spaceAfterMarker = true;
      } else if (state.src.charCodeAt(pos) === 9) {
        spaceAfterMarker = true;
        if ((state.bsCount[nextLine] + initial) % 4 === 3) {
          pos++;
          initial++;
          adjustTab = false;
        } else {
          adjustTab = true;
        }
      } else {
        spaceAfterMarker = false;
      }
      let offset = initial;
      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;
      while (pos < max) {
        const ch = state.src.charCodeAt(pos);
        if (isSpace(ch)) {
          if (ch === 9) {
            offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
          } else {
            offset++;
          }
        } else {
          break;
        }
        pos++;
      }
      lastLineEmpty = pos >= max;
      oldBSCount.push(state.bsCount[nextLine]);
      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;
      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }
    if (lastLineEmpty) {
      break;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      state.lineMax = nextLine;
      if (state.blkIndent !== 0) {
        oldBMarks.push(state.bMarks[nextLine]);
        oldBSCount.push(state.bsCount[nextLine]);
        oldTShift.push(state.tShift[nextLine]);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] -= state.blkIndent;
      }
      break;
    }
    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);
    state.sCount[nextLine] = -1;
  }
  const oldIndent = state.blkIndent;
  state.blkIndent = 0;
  const token_o = state.push("blockquote_open", "blockquote", 1);
  token_o.markup = ">";
  const lines = [startLine, 0];
  token_o.map = lines;
  state.md.block.tokenize(state, startLine, nextLine);
  const token_c = state.push("blockquote_close", "blockquote", -1);
  token_c.markup = ">";
  state.lineMax = oldLineMax;
  state.parentType = oldParentType;
  lines[1] = state.line;
  for (let i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
    state.bsCount[i + startLine] = oldBSCount[i];
  }
  state.blkIndent = oldIndent;
  return true;
}

// node_modules/markdown-it/lib/rules_block/hr.mjs
function hr(state, startLine, endLine, silent) {
  const max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 95) {
    return false;
  }
  let cnt = 1;
  while (pos < max) {
    const ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) {
      return false;
    }
    if (ch === marker) {
      cnt++;
    }
  }
  if (cnt < 3) {
    return false;
  }
  if (silent) {
    return true;
  }
  state.line = startLine + 1;
  const token = state.push("hr", "hr", 0);
  token.map = [startLine, state.line];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
  return true;
}

// node_modules/markdown-it/lib/rules_block/list.mjs
function skipBulletListMarker(state, startLine) {
  const max = state.eMarks[startLine];
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 43) {
    return -1;
  }
  if (pos < max) {
    const ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      return -1;
    }
  }
  return pos;
}
function skipOrderedListMarker(state, startLine) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  let pos = start;
  if (pos + 1 >= max) {
    return -1;
  }
  let ch = state.src.charCodeAt(pos++);
  if (ch < 48 || ch > 57) {
    return -1;
  }
  for (; ; ) {
    if (pos >= max) {
      return -1;
    }
    ch = state.src.charCodeAt(pos++);
    if (ch >= 48 && ch <= 57) {
      if (pos - start >= 10) {
        return -1;
      }
      continue;
    }
    if (ch === 41 || ch === 46) {
      break;
    }
    return -1;
  }
  if (pos < max) {
    ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      return -1;
    }
  }
  return pos;
}
function markTightParagraphs(state, idx) {
  const level = state.level + 2;
  for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
      state.tokens[i + 2].hidden = true;
      state.tokens[i].hidden = true;
      i += 2;
    }
  }
}
function list(state, startLine, endLine, silent) {
  let max, pos, start, token;
  let nextLine = startLine;
  let tight = true;
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) {
    return false;
  }
  let isTerminatingParagraph = false;
  if (silent && state.parentType === "paragraph") {
    if (state.sCount[nextLine] >= state.blkIndent) {
      isTerminatingParagraph = true;
    }
  }
  let isOrdered;
  let markerValue;
  let posAfterMarker;
  if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[nextLine] + state.tShift[nextLine];
    markerValue = Number(state.src.slice(start, posAfterMarker - 1));
    if (isTerminatingParagraph && markerValue !== 1) return false;
  } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
  }
  if (silent) {
    return true;
  }
  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
  const listTokIdx = state.tokens.length;
  if (isOrdered) {
    token = state.push("ordered_list_open", "ol", 1);
    if (markerValue !== 1) {
      token.attrs = [["start", markerValue]];
    }
  } else {
    token = state.push("bullet_list_open", "ul", 1);
  }
  const listLines = [nextLine, 0];
  token.map = listLines;
  token.markup = String.fromCharCode(markerCharCode);
  let prevEmptyEnd = false;
  const terminatorRules = state.md.block.ruler.getRules("list");
  const oldParentType = state.parentType;
  state.parentType = "list";
  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];
    const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
    let offset = initial;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos);
      if (ch === 9) {
        offset += 4 - (offset + state.bsCount[nextLine]) % 4;
      } else if (ch === 32) {
        offset++;
      } else {
        break;
      }
      pos++;
    }
    const contentStart = pos;
    let indentAfterMarker;
    if (contentStart >= max) {
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = offset - initial;
    }
    if (indentAfterMarker > 4) {
      indentAfterMarker = 1;
    }
    const indent = initial + indentAfterMarker;
    token = state.push("list_item_open", "li", 1);
    token.markup = String.fromCharCode(markerCharCode);
    const itemLines = [nextLine, 0];
    token.map = itemLines;
    if (isOrdered) {
      token.info = state.src.slice(start, posAfterMarker - 1);
    }
    const oldTight = state.tight;
    const oldTShift = state.tShift[nextLine];
    const oldSCount = state.sCount[nextLine];
    const oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;
    state.tight = true;
    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
    state.sCount[nextLine] = offset;
    if (contentStart >= max && state.isEmpty(nextLine + 1)) {
      state.line = Math.min(state.line + 2, endLine);
    } else {
      state.md.block.tokenize(state, nextLine, endLine, true);
    }
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[nextLine] = oldTShift;
    state.sCount[nextLine] = oldSCount;
    state.tight = oldTight;
    token = state.push("list_item_close", "li", -1);
    token.markup = String.fromCharCode(markerCharCode);
    nextLine = state.line;
    itemLines[1] = nextLine;
    if (nextLine >= endLine) {
      break;
    }
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
      start = state.bMarks[nextLine] + state.tShift[nextLine];
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
    }
    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
      break;
    }
  }
  if (isOrdered) {
    token = state.push("ordered_list_close", "ol", -1);
  } else {
    token = state.push("bullet_list_close", "ul", -1);
  }
  token.markup = String.fromCharCode(markerCharCode);
  listLines[1] = nextLine;
  state.line = nextLine;
  state.parentType = oldParentType;
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }
  return true;
}

// node_modules/markdown-it/lib/rules_block/reference.mjs
function reference(state, startLine, _endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  let nextLine = startLine + 1;
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 91) {
    return false;
  }
  function getNextLine(nextLine2) {
    const endLine = state.lineMax;
    if (nextLine2 >= endLine || state.isEmpty(nextLine2)) {
      return null;
    }
    let isContinuation = false;
    if (state.sCount[nextLine2] - state.blkIndent > 3) {
      isContinuation = true;
    }
    if (state.sCount[nextLine2] < 0) {
      isContinuation = true;
    }
    if (!isContinuation) {
      const terminatorRules = state.md.block.ruler.getRules("reference");
      const oldParentType = state.parentType;
      state.parentType = "reference";
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine2, endLine, true)) {
          terminate = true;
          break;
        }
      }
      state.parentType = oldParentType;
      if (terminate) {
        return null;
      }
    }
    const pos2 = state.bMarks[nextLine2] + state.tShift[nextLine2];
    const max2 = state.eMarks[nextLine2];
    return state.src.slice(pos2, max2 + 1);
  }
  let str = state.src.slice(pos, max + 1);
  max = str.length;
  let labelEnd = -1;
  for (pos = 1; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 91) {
      return false;
    } else if (ch === 93) {
      labelEnd = pos;
      break;
    } else if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (ch === 92) {
      pos++;
      if (pos < max && str.charCodeAt(pos) === 10) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      }
    }
  }
  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 58) {
    return false;
  }
  for (pos = labelEnd + 2; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (isSpace(ch)) {
    } else {
      break;
    }
  }
  const destRes = state.md.helpers.parseLinkDestination(str, pos, max);
  if (!destRes.ok) {
    return false;
  }
  const href = state.md.normalizeLink(destRes.str);
  if (!state.md.validateLink(href)) {
    return false;
  }
  pos = destRes.pos;
  const destEndPos = pos;
  const destEndLineNo = nextLine;
  const start = pos;
  for (; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (isSpace(ch)) {
    } else {
      break;
    }
  }
  let titleRes = state.md.helpers.parseLinkTitle(str, pos, max);
  while (titleRes.can_continue) {
    const lineContent = getNextLine(nextLine);
    if (lineContent === null) break;
    str += lineContent;
    pos = max;
    max = str.length;
    nextLine++;
    titleRes = state.md.helpers.parseLinkTitle(str, pos, max, titleRes);
  }
  let title;
  if (pos < max && start !== pos && titleRes.ok) {
    title = titleRes.str;
    pos = titleRes.pos;
  } else {
    title = "";
    pos = destEndPos;
    nextLine = destEndLineNo;
  }
  while (pos < max) {
    const ch = str.charCodeAt(pos);
    if (!isSpace(ch)) {
      break;
    }
    pos++;
  }
  if (pos < max && str.charCodeAt(pos) !== 10) {
    if (title) {
      title = "";
      pos = destEndPos;
      nextLine = destEndLineNo;
      while (pos < max) {
        const ch = str.charCodeAt(pos);
        if (!isSpace(ch)) {
          break;
        }
        pos++;
      }
    }
  }
  if (pos < max && str.charCodeAt(pos) !== 10) {
    return false;
  }
  const label = normalizeReference(str.slice(1, labelEnd));
  if (!label) {
    return false;
  }
  if (silent) {
    return true;
  }
  if (typeof state.env.references === "undefined") {
    state.env.references = {};
  }
  if (typeof state.env.references[label] === "undefined") {
    state.env.references[label] = { title, href };
  }
  state.line = nextLine;
  return true;
}

// node_modules/markdown-it/lib/common/html_blocks.mjs
var html_blocks_default = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
];

// node_modules/markdown-it/lib/common/html_re.mjs
var attr_name = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
var unquoted = "[^\"'=<>`\\x00-\\x20]+";
var single_quoted = "'[^']*'";
var double_quoted = '"[^"]*"';
var attr_value = "(?:" + unquoted + "|" + single_quoted + "|" + double_quoted + ")";
var attribute = "(?:\\s+" + attr_name + "(?:\\s*=\\s*" + attr_value + ")?)";
var open_tag = "<[A-Za-z][A-Za-z0-9\\-]*" + attribute + "*\\s*\\/?>";
var close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
var comment = "<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->";
var processing = "<[?][\\s\\S]*?[?]>";
var declaration = "<![A-Za-z][^>]*>";
var cdata = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
var HTML_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + "|" + comment + "|" + processing + "|" + declaration + "|" + cdata + ")");
var HTML_OPEN_CLOSE_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + ")");

// node_modules/markdown-it/lib/rules_block/html_block.mjs
var HTML_SEQUENCES = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true],
  [/^<!--/, /-->/, true],
  [/^<\?/, /\?>/, true],
  [/^<![A-Z]/, />/, true],
  [/^<!\[CDATA\[/, /\]\]>/, true],
  [new RegExp("^</?(" + html_blocks_default.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, true],
  [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + "\\s*$"), /^$/, false]
];
function html_block(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (!state.md.options.html) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  let lineText = state.src.slice(pos, max);
  let i = 0;
  for (; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) {
      break;
    }
  }
  if (i === HTML_SEQUENCES.length) {
    return false;
  }
  if (silent) {
    return HTML_SEQUENCES[i][2];
  }
  let nextLine = startLine + 1;
  const endsOnBlankLine = HTML_SEQUENCES[i][1].test("");
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        if (endsOnBlankLine || !state.isEmpty(nextLine)) {
          break;
        }
      }
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);
      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) {
          nextLine++;
        }
        break;
      }
    }
  }
  state.line = nextLine;
  const token = state.push("html_block", "", 0);
  token.map = [startLine, nextLine];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
  return true;
}

// node_modules/markdown-it/lib/rules_block/heading.mjs
function heading(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  let ch = state.src.charCodeAt(pos);
  if (ch !== 35 || pos >= max) {
    return false;
  }
  let level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 35 && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }
  if (level > 6 || pos < max && !isSpace(ch)) {
    return false;
  }
  if (silent) {
    return true;
  }
  max = state.skipSpacesBack(max, pos);
  const tmp = state.skipCharsBack(max, 35, pos);
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }
  state.line = startLine + 1;
  const token_o = state.push("heading_open", "h" + String(level), 1);
  token_o.markup = "########".slice(0, level);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = asciiTrim(state.src.slice(pos, max));
  token_i.map = [startLine, state.line];
  token_i.children = [];
  const token_c = state.push("heading_close", "h" + String(level), -1);
  token_c.markup = "########".slice(0, level);
  return true;
}

// node_modules/markdown-it/lib/rules_block/lheading.mjs
function lheading(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  const oldParentType = state.parentType;
  state.parentType = "paragraph";
  let level = 0;
  let marker;
  let nextLine = startLine + 1;
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) {
      continue;
    }
    if (state.sCount[nextLine] >= state.blkIndent) {
      let pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];
      if (pos < max) {
        marker = state.src.charCodeAt(pos);
        if (marker === 45 || marker === 61) {
          pos = state.skipChars(pos, marker);
          pos = state.skipSpaces(pos);
          if (pos >= max) {
            level = marker === 61 ? 1 : 2;
            break;
          }
        }
      }
    }
    if (state.sCount[nextLine] < 0) {
      continue;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
  }
  if (!level) {
    state.parentType = oldParentType;
    return false;
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine + 1;
  const token_o = state.push("heading_open", "h" + String(level), 1);
  token_o.markup = String.fromCharCode(marker);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line - 1];
  token_i.children = [];
  const token_c = state.push("heading_close", "h" + String(level), -1);
  token_c.markup = String.fromCharCode(marker);
  state.parentType = oldParentType;
  return true;
}

// node_modules/markdown-it/lib/rules_block/paragraph.mjs
function paragraph(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  const oldParentType = state.parentType;
  let nextLine = startLine + 1;
  state.parentType = "paragraph";
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) {
      continue;
    }
    if (state.sCount[nextLine] < 0) {
      continue;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine;
  const token_o = state.push("paragraph_open", "p", 1);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line];
  token_i.children = [];
  state.push("paragraph_close", "p", -1);
  state.parentType = oldParentType;
  return true;
}

// node_modules/markdown-it/lib/parser_block.mjs
var _rules2 = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  ["table", table, ["paragraph", "reference"]],
  ["code", code],
  ["fence", fence, ["paragraph", "reference", "blockquote", "list"]],
  ["blockquote", blockquote, ["paragraph", "reference", "blockquote", "list"]],
  ["hr", hr, ["paragraph", "reference", "blockquote", "list"]],
  ["list", list, ["paragraph", "reference", "blockquote"]],
  ["reference", reference],
  ["html_block", html_block, ["paragraph", "reference", "blockquote"]],
  ["heading", heading, ["paragraph", "reference", "blockquote"]],
  ["lheading", lheading],
  ["paragraph", paragraph]
];
function ParserBlock() {
  this.ruler = new ruler_default();
  for (let i = 0; i < _rules2.length; i++) {
    this.ruler.push(_rules2[i][0], _rules2[i][1], { alt: (_rules2[i][2] || []).slice() });
  }
}
ParserBlock.prototype.tokenize = function(state, startLine, endLine) {
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const maxNesting = state.md.options.maxNesting;
  let line = startLine;
  let hasEmptyLines = false;
  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) {
      break;
    }
    if (state.sCount[line] < state.blkIndent) {
      break;
    }
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }
    const prevLine = state.line;
    let ok = false;
    for (let i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) {
        if (prevLine >= state.line) {
          throw new Error("block rule didn't increment state.line");
        }
        break;
      }
    }
    if (!ok) throw new Error("none of the block rules matched");
    state.tight = !hasEmptyLines;
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }
    line = state.line;
    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;
      state.line = line;
    }
  }
};
ParserBlock.prototype.parse = function(src, md2, env, outTokens) {
  if (!src) {
    return;
  }
  const state = new this.State(src, md2, env, outTokens);
  this.tokenize(state, state.line, state.lineMax);
};
ParserBlock.prototype.State = state_block_default;
var parser_block_default = ParserBlock;

// node_modules/markdown-it/lib/rules_inline/state_inline.mjs
function StateInline(src, md2, env, outTokens) {
  this.src = src;
  this.env = env;
  this.md = md2;
  this.tokens = outTokens;
  this.tokens_meta = Array(outTokens.length);
  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = "";
  this.pendingLevel = 0;
  this.cache = {};
  this.delimiters = [];
  this._prev_delimiters = [];
  this.backticks = {};
  this.backticksScanned = false;
  this.linkLevel = 0;
}
StateInline.prototype.pushPending = function() {
  const token = new token_default("text", "", 0);
  token.content = this.pending;
  token.level = this.pendingLevel;
  this.tokens.push(token);
  this.pending = "";
  return token;
};
StateInline.prototype.push = function(type, tag, nesting) {
  if (this.pending) {
    this.pushPending();
  }
  const token = new token_default(type, tag, nesting);
  let token_meta = null;
  if (nesting < 0) {
    this.level--;
    this.delimiters = this._prev_delimiters.pop();
  }
  token.level = this.level;
  if (nesting > 0) {
    this.level++;
    this._prev_delimiters.push(this.delimiters);
    this.delimiters = [];
    token_meta = { delimiters: this.delimiters };
  }
  this.pendingLevel = this.level;
  this.tokens.push(token);
  this.tokens_meta.push(token_meta);
  return token;
};
StateInline.prototype.scanDelims = function(start, canSplitWord) {
  const max = this.posMax;
  const marker = this.src.charCodeAt(start);
  let lastChar;
  if (start === 0) {
    lastChar = 32;
  } else if (start === 1) {
    lastChar = this.src.charCodeAt(0);
    if ((lastChar & 63488) === 55296) {
      lastChar = 65533;
    }
  } else {
    lastChar = this.src.charCodeAt(start - 1);
    if ((lastChar & 64512) === 56320) {
      const highSurr = this.src.charCodeAt(start - 2);
      lastChar = (highSurr & 64512) === 55296 ? 65536 + (highSurr - 55296 << 10) + (lastChar - 56320) : 65533;
    } else if ((lastChar & 64512) === 55296) {
      lastChar = 65533;
    }
  }
  let pos = start;
  while (pos < max && this.src.charCodeAt(pos) === marker) {
    pos++;
  }
  const count = pos - start;
  let nextChar = pos < max ? this.src.charCodeAt(pos) : 32;
  if ((nextChar & 64512) === 55296) {
    const lowSurr = this.src.charCodeAt(pos + 1);
    nextChar = (lowSurr & 64512) === 56320 ? 65536 + (nextChar - 55296 << 10) + (lowSurr - 56320) : 65533;
  } else if ((nextChar & 64512) === 56320) {
    nextChar = 65533;
  }
  const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
  const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
  const isLastWhiteSpace = isWhiteSpace(lastChar);
  const isNextWhiteSpace = isWhiteSpace(nextChar);
  const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
  const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
  const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
  const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);
  return { can_open, can_close, length: count };
};
StateInline.prototype.Token = token_default;
var state_inline_default = StateInline;

// node_modules/markdown-it/lib/rules_inline/text.mjs
function isTerminatorChar(ch) {
  switch (ch) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function text(state, silent) {
  let pos = state.pos;
  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }
  if (pos === state.pos) {
    return false;
  }
  if (!silent) {
    state.pending += state.src.slice(state.pos, pos);
  }
  state.pos = pos;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/linkify.mjs
var SCHEME_RE = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
function linkify2(state, silent) {
  if (!state.md.options.linkify) return false;
  if (state.linkLevel > 0) return false;
  const pos = state.pos;
  const max = state.posMax;
  if (pos + 3 > max) return false;
  if (state.src.charCodeAt(pos) !== 58) return false;
  if (state.src.charCodeAt(pos + 1) !== 47) return false;
  if (state.src.charCodeAt(pos + 2) !== 47) return false;
  const match2 = state.pending.match(SCHEME_RE);
  if (!match2) return false;
  const proto = match2[1];
  const link2 = state.md.linkify.matchAtStart(state.src.slice(pos - proto.length));
  if (!link2) return false;
  let url = link2.url;
  if (url.length <= proto.length) return false;
  let urlEnd = url.length;
  while (urlEnd > 0 && url.charCodeAt(urlEnd - 1) === 42) {
    urlEnd--;
  }
  if (urlEnd !== url.length) {
    url = url.slice(0, urlEnd);
  }
  const fullUrl = state.md.normalizeLink(url);
  if (!state.md.validateLink(fullUrl)) return false;
  if (!silent) {
    state.pending = state.pending.slice(0, -proto.length);
    const token_o = state.push("link_open", "a", 1);
    token_o.attrs = [["href", fullUrl]];
    token_o.markup = "linkify";
    token_o.info = "auto";
    const token_t = state.push("text", "", 0);
    token_t.content = state.md.normalizeLinkText(url);
    const token_c = state.push("link_close", "a", -1);
    token_c.markup = "linkify";
    token_c.info = "auto";
  }
  state.pos += url.length - proto.length;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/newline.mjs
function newline(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 10) {
    return false;
  }
  const pmax = state.pending.length - 1;
  const max = state.posMax;
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
        let ws = pmax - 1;
        while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--;
        state.pending = state.pending.slice(0, ws);
        state.push("hardbreak", "br", 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push("softbreak", "br", 0);
      }
    } else {
      state.push("softbreak", "br", 0);
    }
  }
  pos++;
  while (pos < max && isSpace(state.src.charCodeAt(pos))) {
    pos++;
  }
  state.pos = pos;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/escape.mjs
var ESCAPED = [];
for (let i = 0; i < 256; i++) {
  ESCAPED.push(0);
}
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
  ESCAPED[ch.charCodeAt(0)] = 1;
});
function escape2(state, silent) {
  let pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 92) return false;
  pos++;
  if (pos >= max) return false;
  let ch1 = state.src.charCodeAt(pos);
  if (ch1 === 10) {
    if (!silent) {
      state.push("hardbreak", "br", 0);
    }
    pos++;
    while (pos < max) {
      ch1 = state.src.charCodeAt(pos);
      if (!isSpace(ch1)) break;
      pos++;
    }
    state.pos = pos;
    return true;
  }
  if (ch1 === 32) {
    if (!silent) {
      const token = state.push("text_special", "", 0);
      token.content = "\\";
      token.markup = "\\";
      token.info = "escape";
    }
    state.pos = pos;
    return true;
  }
  let escapedStr = state.src[pos];
  if (ch1 >= 55296 && ch1 <= 56319 && pos + 1 < max) {
    const ch2 = state.src.charCodeAt(pos + 1);
    if (ch2 >= 56320 && ch2 <= 57343) {
      escapedStr += state.src[pos + 1];
      pos++;
    }
  }
  const origStr = "\\" + escapedStr;
  if (!silent) {
    const token = state.push("text_special", "", 0);
    if (ch1 < 256 && ESCAPED[ch1] !== 0) {
      token.content = escapedStr;
    } else {
      token.content = origStr;
    }
    token.markup = origStr;
    token.info = "escape";
  }
  state.pos = pos + 1;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/backticks.mjs
function backtick(state, silent) {
  let pos = state.pos;
  const ch = state.src.charCodeAt(pos);
  if (ch !== 96) {
    return false;
  }
  const start = pos;
  pos++;
  const max = state.posMax;
  while (pos < max && state.src.charCodeAt(pos) === 96) {
    pos++;
  }
  const marker = state.src.slice(start, pos);
  const openerLength = marker.length;
  if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) {
    if (!silent) state.pending += marker;
    state.pos += openerLength;
    return true;
  }
  let matchEnd = pos;
  let matchStart;
  while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
    matchEnd = matchStart + 1;
    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 96) {
      matchEnd++;
    }
    const closerLength = matchEnd - matchStart;
    if (closerLength === openerLength) {
      if (!silent) {
        const token = state.push("code_inline", "code", 0);
        token.markup = marker;
        token.content = state.src.slice(pos, matchStart).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
      }
      state.pos = matchEnd;
      return true;
    }
    state.backticks[closerLength] = matchStart;
  }
  state.backticksScanned = true;
  if (!silent) state.pending += marker;
  state.pos += openerLength;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/strikethrough.mjs
function strikethrough_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) {
    return false;
  }
  if (marker !== 126) {
    return false;
  }
  const scanned = state.scanDelims(state.pos, true);
  let len = scanned.length;
  const ch = String.fromCharCode(marker);
  if (len < 2) {
    return false;
  }
  let token;
  if (len % 2) {
    token = state.push("text", "", 0);
    token.content = ch;
    len--;
  }
  for (let i = 0; i < len; i += 2) {
    token = state.push("text", "", 0);
    token.content = ch + ch;
    state.delimiters.push({
      marker,
      length: 0,
      // disable "rule of 3" length checks meant for emphasis
      token: state.tokens.length - 1,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess(state, delimiters) {
  let token;
  const loneMarkers = [];
  const max = delimiters.length;
  for (let i = 0; i < max; i++) {
    const startDelim = delimiters[i];
    if (startDelim.marker !== 126) {
      continue;
    }
    if (startDelim.end === -1) {
      continue;
    }
    const endDelim = delimiters[startDelim.end];
    token = state.tokens[startDelim.token];
    token.type = "s_open";
    token.tag = "s";
    token.nesting = 1;
    token.markup = "~~";
    token.content = "";
    token = state.tokens[endDelim.token];
    token.type = "s_close";
    token.tag = "s";
    token.nesting = -1;
    token.markup = "~~";
    token.content = "";
    if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") {
      loneMarkers.push(endDelim.token - 1);
    }
  }
  while (loneMarkers.length) {
    const i = loneMarkers.pop();
    let j = i + 1;
    while (j < state.tokens.length && state.tokens[j].type === "s_close") {
      j++;
    }
    j--;
    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
}
function strikethrough_postProcess(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess(state, tokens_meta[curr].delimiters);
    }
  }
}
var strikethrough_default = {
  tokenize: strikethrough_tokenize,
  postProcess: strikethrough_postProcess
};

// node_modules/markdown-it/lib/rules_inline/emphasis.mjs
function emphasis_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) {
    return false;
  }
  if (marker !== 95 && marker !== 42) {
    return false;
  }
  const scanned = state.scanDelims(state.pos, marker === 42);
  for (let i = 0; i < scanned.length; i++) {
    const token = state.push("text", "", 0);
    token.content = String.fromCharCode(marker);
    state.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker,
      // Total length of these series of delimiters.
      //
      length: scanned.length,
      // A position of the token this delimiter corresponds to.
      //
      token: state.tokens.length - 1,
      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end: -1,
      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess2(state, delimiters) {
  const max = delimiters.length;
  for (let i = max - 1; i >= 0; i--) {
    const startDelim = delimiters[i];
    if (startDelim.marker !== 95 && startDelim.marker !== 42) {
      continue;
    }
    if (startDelim.end === -1) {
      continue;
    }
    const endDelim = delimiters[startDelim.end];
    const isStrong = i > 0 && delimiters[i - 1].end === startDelim.end + 1 && // check that first two markers match and adjacent
    delimiters[i - 1].marker === startDelim.marker && delimiters[i - 1].token === startDelim.token - 1 && // check that last two markers are adjacent (we can safely assume they match)
    delimiters[startDelim.end + 1].token === endDelim.token + 1;
    const ch = String.fromCharCode(startDelim.marker);
    const token_o = state.tokens[startDelim.token];
    token_o.type = isStrong ? "strong_open" : "em_open";
    token_o.tag = isStrong ? "strong" : "em";
    token_o.nesting = 1;
    token_o.markup = isStrong ? ch + ch : ch;
    token_o.content = "";
    const token_c = state.tokens[endDelim.token];
    token_c.type = isStrong ? "strong_close" : "em_close";
    token_c.tag = isStrong ? "strong" : "em";
    token_c.nesting = -1;
    token_c.markup = isStrong ? ch + ch : ch;
    token_c.content = "";
    if (isStrong) {
      state.tokens[delimiters[i - 1].token].content = "";
      state.tokens[delimiters[startDelim.end + 1].token].content = "";
      i--;
    }
  }
}
function emphasis_post_process(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess2(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess2(state, tokens_meta[curr].delimiters);
    }
  }
}
var emphasis_default = {
  tokenize: emphasis_tokenize,
  postProcess: emphasis_post_process
};

// node_modules/markdown-it/lib/rules_inline/link.mjs
function link(state, silent) {
  let code2, label, res, ref;
  let href = "";
  let title = "";
  let start = state.pos;
  let parseReference = true;
  if (state.src.charCodeAt(state.pos) !== 91) {
    return false;
  }
  const oldPos = state.pos;
  const max = state.posMax;
  const labelStart = state.pos + 1;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
  if (labelEnd < 0) {
    return false;
  }
  let pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    parseReference = false;
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    if (pos >= max) {
      return false;
    }
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = "";
      }
      start = pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) {
          break;
        }
      }
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;
        for (; pos < max; pos++) {
          code2 = state.src.charCodeAt(pos);
          if (!isSpace(code2) && code2 !== 10) {
            break;
          }
        }
      }
    }
    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
      parseReference = true;
    }
    pos++;
  }
  if (parseReference) {
    if (typeof state.env.references === "undefined") {
      return false;
    }
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }
    if (!label) {
      label = state.src.slice(labelStart, labelEnd);
    }
    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;
    const token_o = state.push("link_open", "a", 1);
    const attrs = [["href", href]];
    token_o.attrs = attrs;
    if (title) {
      attrs.push(["title", title]);
    }
    state.linkLevel++;
    state.md.inline.tokenize(state);
    state.linkLevel--;
    state.push("link_close", "a", -1);
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/image.mjs
function image(state, silent) {
  let code2, content, label, pos, ref, res, title, start;
  let href = "";
  const oldPos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(state.pos) !== 33) {
    return false;
  }
  if (state.src.charCodeAt(state.pos + 1) !== 91) {
    return false;
  }
  const labelStart = state.pos + 2;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
  if (labelEnd < 0) {
    return false;
  }
  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    if (pos >= max) {
      return false;
    }
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = "";
      }
    }
    start = pos;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) {
          break;
        }
      }
    } else {
      title = "";
    }
    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    if (typeof state.env.references === "undefined") {
      return false;
    }
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }
    if (!label) {
      label = state.src.slice(labelStart, labelEnd);
    }
    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    content = state.src.slice(labelStart, labelEnd);
    const tokens = [];
    state.md.inline.parse(
      content,
      state.md,
      state.env,
      tokens
    );
    const token = state.push("image", "img", 0);
    const attrs = [["src", href], ["alt", ""]];
    token.attrs = attrs;
    token.children = tokens;
    token.content = content;
    if (title) {
      attrs.push(["title", title]);
    }
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/autolink.mjs
var EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
var AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function autolink(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  const start = state.pos;
  const max = state.posMax;
  for (; ; ) {
    if (++pos >= max) return false;
    const ch = state.src.charCodeAt(pos);
    if (ch === 60) return false;
    if (ch === 62) break;
  }
  const url = state.src.slice(start + 1, pos);
  if (AUTOLINK_RE.test(url)) {
    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) {
      return false;
    }
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  if (EMAIL_RE.test(url)) {
    const fullUrl = state.md.normalizeLink("mailto:" + url);
    if (!state.md.validateLink(fullUrl)) {
      return false;
    }
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  return false;
}

// node_modules/markdown-it/lib/rules_inline/html_inline.mjs
function isLinkOpen2(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose2(str) {
  return /^<\/a\s*>/i.test(str);
}
function isLetter(ch) {
  const lc2 = ch | 32;
  return lc2 >= 97 && lc2 <= 122;
}
function html_inline(state, silent) {
  if (!state.md.options.html) {
    return false;
  }
  const max = state.posMax;
  const pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max) {
    return false;
  }
  const ch = state.src.charCodeAt(pos + 1);
  if (ch !== 33 && ch !== 63 && ch !== 47 && !isLetter(ch)) {
    return false;
  }
  const match2 = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match2) {
    return false;
  }
  if (!silent) {
    const token = state.push("html_inline", "", 0);
    token.content = match2[0];
    if (isLinkOpen2(token.content)) state.linkLevel++;
    if (isLinkClose2(token.content)) state.linkLevel--;
  }
  state.pos += match2[0].length;
  return true;
}

// node_modules/markdown-it/lib/rules_inline/entity.mjs
var DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
var NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
function entity(state, silent) {
  const pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 38) return false;
  if (pos + 1 >= max) return false;
  const ch = state.src.charCodeAt(pos + 1);
  if (ch === 35) {
    const match2 = state.src.slice(pos).match(DIGITAL_RE);
    if (match2) {
      if (!silent) {
        const code2 = match2[1][0].toLowerCase() === "x" ? parseInt(match2[1].slice(1), 16) : parseInt(match2[1], 10);
        const token = state.push("text_special", "", 0);
        token.content = isValidEntityCode(code2) ? fromCodePoint2(code2) : fromCodePoint2(65533);
        token.markup = match2[0];
        token.info = "entity";
      }
      state.pos += match2[0].length;
      return true;
    }
  } else {
    const match2 = state.src.slice(pos).match(NAMED_RE);
    if (match2) {
      const decoded = decodeHTMLStrict(match2[0]);
      if (decoded !== match2[0]) {
        if (!silent) {
          const token = state.push("text_special", "", 0);
          token.content = decoded;
          token.markup = match2[0];
          token.info = "entity";
        }
        state.pos += match2[0].length;
        return true;
      }
    }
  }
  return false;
}

// node_modules/markdown-it/lib/rules_inline/balance_pairs.mjs
function processDelimiters(delimiters) {
  const openersBottom = {};
  const max = delimiters.length;
  if (!max) return;
  let headerIdx = 0;
  let lastTokenIdx = -2;
  const jumps = [];
  for (let closerIdx = 0; closerIdx < max; closerIdx++) {
    const closer = delimiters[closerIdx];
    jumps.push(0);
    if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) {
      headerIdx = closerIdx;
    }
    lastTokenIdx = closer.token;
    closer.length = closer.length || 0;
    if (!closer.close) continue;
    if (!openersBottom.hasOwnProperty(closer.marker)) {
      openersBottom[closer.marker] = [-1, -1, -1, -1, -1, -1];
    }
    const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
    let openerIdx = headerIdx - jumps[headerIdx] - 1;
    let newMinOpenerIdx = openerIdx;
    for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
      const opener = delimiters[openerIdx];
      if (opener.marker !== closer.marker) continue;
      if (opener.open && opener.end < 0) {
        let isOddMatch = false;
        if (opener.close || closer.open) {
          if ((opener.length + closer.length) % 3 === 0) {
            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
              isOddMatch = true;
            }
          }
        }
        if (!isOddMatch) {
          const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
          jumps[closerIdx] = closerIdx - openerIdx + lastJump;
          jumps[openerIdx] = lastJump;
          closer.open = false;
          opener.end = closerIdx;
          opener.close = false;
          newMinOpenerIdx = -1;
          lastTokenIdx = -2;
          break;
        }
      }
    }
    if (newMinOpenerIdx !== -1) {
      openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
    }
  }
}
function link_pairs(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  processDelimiters(state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      processDelimiters(tokens_meta[curr].delimiters);
    }
  }
}

// node_modules/markdown-it/lib/rules_inline/fragments_join.mjs
function fragments_join(state) {
  let curr, last;
  let level = 0;
  const tokens = state.tokens;
  const max = state.tokens.length;
  for (curr = last = 0; curr < max; curr++) {
    if (tokens[curr].nesting < 0) level--;
    tokens[curr].level = level;
    if (tokens[curr].nesting > 0) level++;
    if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    } else {
      if (curr !== last) {
        tokens[last] = tokens[curr];
      }
      last++;
    }
  }
  if (curr !== last) {
    tokens.length = last;
  }
}

// node_modules/markdown-it/lib/parser_inline.mjs
var _rules3 = [
  ["text", text],
  ["linkify", linkify2],
  ["newline", newline],
  ["escape", escape2],
  ["backticks", backtick],
  ["strikethrough", strikethrough_default.tokenize],
  ["emphasis", emphasis_default.tokenize],
  ["link", link],
  ["image", image],
  ["autolink", autolink],
  ["html_inline", html_inline],
  ["entity", entity]
];
var _rules22 = [
  ["balance_pairs", link_pairs],
  ["strikethrough", strikethrough_default.postProcess],
  ["emphasis", emphasis_default.postProcess],
  // rules for pairs separate '**' into its own text tokens, which may be left unused,
  // rule below merges unused segments back with the rest of the text
  ["fragments_join", fragments_join]
];
function ParserInline() {
  this.ruler = new ruler_default();
  for (let i = 0; i < _rules3.length; i++) {
    this.ruler.push(_rules3[i][0], _rules3[i][1]);
  }
  this.ruler2 = new ruler_default();
  for (let i = 0; i < _rules22.length; i++) {
    this.ruler2.push(_rules22[i][0], _rules22[i][1]);
  }
}
ParserInline.prototype.skipToken = function(state) {
  const pos = state.pos;
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const maxNesting = state.md.options.maxNesting;
  const cache2 = state.cache;
  if (typeof cache2[pos] !== "undefined") {
    state.pos = cache2[pos];
    return;
  }
  let ok = false;
  if (state.level < maxNesting) {
    for (let i = 0; i < len; i++) {
      state.level++;
      ok = rules[i](state, true);
      state.level--;
      if (ok) {
        if (pos >= state.pos) {
          throw new Error("inline rule didn't increment state.pos");
        }
        break;
      }
    }
  } else {
    state.pos = state.posMax;
  }
  if (!ok) {
    state.pos++;
  }
  cache2[pos] = state.pos;
};
ParserInline.prototype.tokenize = function(state) {
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const end = state.posMax;
  const maxNesting = state.md.options.maxNesting;
  while (state.pos < end) {
    const prevPos = state.pos;
    let ok = false;
    if (state.level < maxNesting) {
      for (let i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) {
          if (prevPos >= state.pos) {
            throw new Error("inline rule didn't increment state.pos");
          }
          break;
        }
      }
    }
    if (ok) {
      if (state.pos >= end) {
        break;
      }
      continue;
    }
    state.pending += state.src[state.pos++];
  }
  if (state.pending) {
    state.pushPending();
  }
};
ParserInline.prototype.parse = function(str, md2, env, outTokens) {
  const state = new this.State(str, md2, env, outTokens);
  this.tokenize(state);
  const rules = this.ruler2.getRules("");
  const len = rules.length;
  for (let i = 0; i < len; i++) {
    rules[i](state);
  }
};
ParserInline.prototype.State = state_inline_default;
var parser_inline_default = ParserInline;

// node_modules/linkify-it/lib/re.mjs
function re_default(opts) {
  const re = {};
  opts = opts || {};
  re.src_Any = regex_default.source;
  re.src_Cc = regex_default2.source;
  re.src_Z = regex_default6.source;
  re.src_P = regex_default4.source;
  re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join("|");
  re.src_ZCc = [re.src_Z, re.src_Cc].join("|");
  const text_separators = "[><\uFF5C]";
  re.src_pseudo_letter = `(?:(?!${text_separators}|${re.src_ZPCc})${re.src_Any})`;
  re.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
  re.src_auth = `(?:(?:(?!${re.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`;
  re.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?";
  re.src_host_terminator = `(?=$|${text_separators}|${re.src_ZPCc})(?!${opts["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${re.src_ZPCc}))`;
  re.src_path = `(?:[/?#](?:(?!${re.src_ZCc}|${text_separators}|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!${re.src_ZCc}|\\]).)*\\]|\\((?:(?!${re.src_ZCc}|[)]).)*\\)|\\{(?:(?!${re.src_ZCc}|[}]).)*\\}|\\"(?:(?!${re.src_ZCc}|["]).)+\\"|\\'(?:(?!${re.src_ZCc}|[']).)+\\'|\\'(?=${re.src_pseudo_letter}|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!${re.src_ZCc}|[.]|$)|` + (opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + // allow `,,,` in paths
  `,(?!${re.src_ZCc}|$)|;(?!${re.src_ZCc}|$)|\\!+(?!${re.src_ZCc}|[!]|$)|\\?(?!${re.src_ZCc}|[?]|$))+|\\/)?`;
  re.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]{0,63}';
  re.src_xn = "xn--[a-z0-9\\-]{1,59}";
  re.src_domain_root = // Allow letters & digits (http://test1)
  "(?:" + re.src_xn + `|${re.src_pseudo_letter}{1,63})`;
  re.src_domain = "(?:" + re.src_xn + `|(?:${re.src_pseudo_letter})|(?:${re.src_pseudo_letter}(?:-|${re.src_pseudo_letter}){0,61}${re.src_pseudo_letter}))`;
  re.src_host = `(?:(?:(?:(?:${re.src_domain})\\.)*${re.src_domain}))`;
  re.tpl_host_fuzzy = "(?:" + re.src_ip4 + `|(?:(?:(?:${re.src_domain})\\.)+(?:%TLDS%)))`;
  re.tpl_host_no_ip_fuzzy = `(?:(?:(?:${re.src_domain})\\.)+(?:%TLDS%))`;
  re.src_host_strict = re.src_host + re.src_host_terminator;
  re.tpl_host_fuzzy_strict = re.tpl_host_fuzzy + re.src_host_terminator;
  re.src_host_port_strict = re.src_host + re.src_port + re.src_host_terminator;
  re.tpl_host_port_fuzzy_strict = re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;
  re.tpl_host_port_no_ip_fuzzy_strict = re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;
  re.tpl_host_fuzzy_test = `localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:${re.src_ZPCc}|>|$))`;
  re.tpl_email_fuzzy = `(^|${text_separators}|"|\\(|${re.src_ZCc})(${re.src_email_name}@${re.tpl_host_fuzzy_strict})`;
  re.tpl_link_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${re.src_ZPCc}))((?![$+<=>^\`|\uFF5C])${re.tpl_host_port_fuzzy_strict}${re.src_path})`;
  re.tpl_link_no_ip_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|\uFF5C]|${re.src_ZPCc}))((?![$+<=>^\`|\uFF5C])${re.tpl_host_port_no_ip_fuzzy_strict}${re.src_path})`;
  return re;
}

// node_modules/linkify-it/index.mjs
function assign2(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (!source) {
      return;
    }
    Object.keys(source).forEach(function(key) {
      obj[key] = source[key];
    });
  });
  return obj;
}
function _class2(obj) {
  return Object.prototype.toString.call(obj);
}
function isString2(obj) {
  return _class2(obj) === "[object String]";
}
function isObject(obj) {
  return _class2(obj) === "[object Object]";
}
function isRegExp(obj) {
  return _class2(obj) === "[object RegExp]";
}
function isFunction(obj) {
  return _class2(obj) === "[object Function]";
}
function escapeRE2(str) {
  return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}
var defaultOptions = {
  fuzzyLink: true,
  fuzzyEmail: true,
  fuzzyIP: false
};
function isOptionsObj(obj) {
  return Object.keys(obj || {}).reduce(function(acc, k) {
    return acc || defaultOptions.hasOwnProperty(k);
  }, false);
}
var defaultSchemas = {
  "http:": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.http) {
        self.re.http = new RegExp(
          `^\\/\\/${self.re.src_auth}${self.re.src_host_port_strict}${self.re.src_path}`,
          "i"
        );
      }
      if (self.re.http.test(tail)) {
        return tail.match(self.re.http)[0].length;
      }
      return 0;
    }
  },
  "https:": "http:",
  "ftp:": "http:",
  "//": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.no_http) {
        self.re.no_http = new RegExp(
          "^" + self.re.src_auth + // Don't allow single-level domains, because of false positives like '//test'
          // with code comments
          `(?:localhost|(?:(?:${self.re.src_domain})\\.)+${self.re.src_domain_root})` + self.re.src_port + self.re.src_host_terminator + self.re.src_path,
          "i"
        );
      }
      if (self.re.no_http.test(tail)) {
        if (pos >= 3 && text2[pos - 3] === ":") {
          return 0;
        }
        if (pos >= 3 && text2[pos - 3] === "/") {
          return 0;
        }
        return tail.match(self.re.no_http)[0].length;
      }
      return 0;
    }
  },
  "mailto:": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.mailto) {
        self.re.mailto = new RegExp(
          `^${self.re.src_email_name}@${self.re.src_host_strict}`,
          "i"
        );
      }
      if (self.re.mailto.test(tail)) {
        return tail.match(self.re.mailto)[0].length;
      }
      return 0;
    }
  }
};
var tlds_2ch_src_re = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]";
var tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|");
function createValidator(re) {
  return function(text2, pos) {
    const tail = text2.slice(pos);
    if (re.test(tail)) {
      return tail.match(re)[0].length;
    }
    return 0;
  };
}
function createNormalizer() {
  return function(match2, self) {
    self.normalize(match2);
  };
}
function compile(self) {
  const re = self.re = re_default(self.__opts__);
  const tlds2 = self.__tlds__.slice();
  self.onCompile();
  if (!self.__tlds_replaced__) {
    tlds2.push(tlds_2ch_src_re);
  }
  tlds2.push(re.src_xn);
  re.src_tlds = tlds2.join("|");
  function untpl(tpl) {
    return tpl.replace("%TLDS%", re.src_tlds);
  }
  re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), "i");
  re.email_fuzzy_global = RegExp(untpl(re.tpl_email_fuzzy), "ig");
  re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), "i");
  re.link_fuzzy_global = RegExp(untpl(re.tpl_link_fuzzy), "ig");
  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "i");
  re.link_no_ip_fuzzy_global = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "ig");
  re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), "i");
  const aliases = [];
  self.__compiled__ = {};
  function schemaError(name, val) {
    throw new Error(`(LinkifyIt) Invalid schema "${name}": ${val}`);
  }
  Object.keys(self.__schemas__).forEach(function(name) {
    const val = self.__schemas__[name];
    if (val === null) {
      return;
    }
    const compiled = { validate: null, link: null };
    self.__compiled__[name] = compiled;
    if (isObject(val)) {
      if (isRegExp(val.validate)) {
        compiled.validate = createValidator(val.validate);
      } else if (isFunction(val.validate)) {
        compiled.validate = val.validate;
      } else {
        schemaError(name, val);
      }
      if (isFunction(val.normalize)) {
        compiled.normalize = val.normalize;
      } else if (!val.normalize) {
        compiled.normalize = createNormalizer();
      } else {
        schemaError(name, val);
      }
      return;
    }
    if (isString2(val)) {
      aliases.push(name);
      return;
    }
    schemaError(name, val);
  });
  aliases.forEach(function(alias) {
    if (!self.__compiled__[self.__schemas__[alias]]) {
      return;
    }
    self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate;
    self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
  });
  self.__compiled__[""] = { validate: null, normalize: createNormalizer() };
  const slist = Object.keys(self.__compiled__).filter(function(name) {
    return name.length > 0 && self.__compiled__[name];
  }).map(escapeRE2).join("|");
  self.re.schema_test = RegExp(`(^|(?!_)(?:[><\uFF5C]|${re.src_ZPCc}))(${slist})`, "i");
  self.re.schema_search = RegExp(`(^|(?!_)(?:[><\uFF5C]|${re.src_ZPCc}))(${slist})`, "ig");
  self.re.schema_at_start = RegExp(`^${self.re.schema_search.source}`, "i");
  self.re.pretest = RegExp(
    `(${self.re.schema_test.source})|(${self.re.host_fuzzy_test.source})|@`,
    "i"
  );
}
function Match(text2, schema, index, lastIndex) {
  const raw = text2.slice(index, lastIndex);
  this.schema = schema.toLowerCase();
  this.index = index;
  this.lastIndex = lastIndex;
  this.raw = raw;
  this.text = raw;
  this.url = raw;
}
function LinkifyIt(schemas, options) {
  if (!(this instanceof LinkifyIt)) {
    return new LinkifyIt(schemas, options);
  }
  if (!options) {
    if (isOptionsObj(schemas)) {
      options = schemas;
      schemas = {};
    }
  }
  this.__opts__ = assign2({}, defaultOptions, options);
  this.__schemas__ = assign2({}, defaultSchemas, schemas);
  this.__compiled__ = {};
  this.__tlds__ = tlds_default;
  this.__tlds_replaced__ = false;
  this.re = {};
  compile(this);
}
LinkifyIt.prototype.add = function add(schema, definition) {
  this.__schemas__[schema] = definition;
  compile(this);
  return this;
};
LinkifyIt.prototype.set = function set(options) {
  this.__opts__ = assign2(this.__opts__, options);
  return this;
};
LinkifyIt.prototype.test = function test(text2) {
  if (!text2.length) {
    return false;
  }
  let m, re;
  if (this.re.schema_test.test(text2)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      if (this.testSchemaAt(text2, m[2], re.lastIndex)) {
        return true;
      }
    }
  }
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
    if (text2.search(this.re.host_fuzzy_test) >= 0) {
      if (text2.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy) !== null) {
        return true;
      }
    }
  }
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
    if (text2.indexOf("@") >= 0) {
      if (text2.match(this.re.email_fuzzy) !== null) {
        return true;
      }
    }
  }
  return false;
};
LinkifyIt.prototype.pretest = function pretest(text2) {
  return this.re.pretest.test(text2);
};
LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text2, schema, pos) {
  if (!this.__compiled__[schema.toLowerCase()]) {
    return 0;
  }
  return this.__compiled__[schema.toLowerCase()].validate(text2, pos, this);
};
LinkifyIt.prototype.match = function match(text2) {
  const result = [];
  const type_schemed = [];
  const type_fuzzy_link = [];
  const type_fuzzy_email = [];
  let m, len, re;
  function choose(a, b) {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    if (a.index !== b.index) {
      return a.index < b.index ? a : b;
    }
    return a.lastIndex >= b.lastIndex ? a : b;
  }
  if (!text2.length) {
    return null;
  }
  if (this.re.schema_test.test(text2)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      len = this.testSchemaAt(text2, m[2], re.lastIndex);
      if (len) {
        type_schemed.push({
          schema: m[2],
          index: m.index + m[1].length,
          lastIndex: m.index + m[0].length + len
        });
      }
    }
  }
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
    re = this.__opts__.fuzzyIP ? this.re.link_fuzzy_global : this.re.link_no_ip_fuzzy_global;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      type_fuzzy_link.push({
        schema: "",
        index: m.index + m[1].length,
        lastIndex: m.index + m[0].length
      });
    }
  }
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
    re = this.re.email_fuzzy_global;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      type_fuzzy_email.push({
        schema: "mailto:",
        index: m.index + m[1].length,
        lastIndex: m.index + m[0].length
      });
    }
  }
  const indexes = [0, 0, 0];
  let lastIndex = 0;
  for (; ; ) {
    const candidates = [
      type_schemed[indexes[0]],
      type_fuzzy_email[indexes[1]],
      type_fuzzy_link[indexes[2]]
    ];
    const candidate = choose(choose(candidates[0], candidates[1]), candidates[2]);
    if (!candidate) {
      break;
    }
    if (candidate === candidates[0]) {
      indexes[0]++;
    } else if (candidate === candidates[1]) {
      indexes[1]++;
    } else {
      indexes[2]++;
    }
    if (candidate.index < lastIndex) {
      continue;
    }
    const match2 = new Match(text2, candidate.schema, candidate.index, candidate.lastIndex);
    this.__compiled__[match2.schema].normalize(match2, this);
    result.push(match2);
    lastIndex = candidate.lastIndex;
  }
  if (result.length) {
    return result;
  }
  return null;
};
LinkifyIt.prototype.matchAtStart = function matchAtStart(text2) {
  if (!text2.length) return null;
  const m = this.re.schema_at_start.exec(text2);
  if (!m) return null;
  const len = this.testSchemaAt(text2, m[2], m[0].length);
  if (!len) return null;
  const match2 = new Match(text2, m[2], m.index + m[1].length, m.index + m[0].length + len);
  this.__compiled__[match2.schema].normalize(match2, this);
  return match2;
};
LinkifyIt.prototype.tlds = function tlds(list2, keepOld) {
  list2 = Array.isArray(list2) ? list2 : [list2];
  if (!keepOld) {
    this.__tlds__ = list2.slice();
    this.__tlds_replaced__ = true;
    compile(this);
    return this;
  }
  this.__tlds__ = this.__tlds__.concat(list2).sort().filter(function(el, idx, arr) {
    return el !== arr[idx - 1];
  }).reverse();
  compile(this);
  return this;
};
LinkifyIt.prototype.normalize = function normalize2(match2) {
  if (!match2.schema) {
    match2.url = `http://${match2.url}`;
  }
  if (match2.schema === "mailto:" && !/^mailto:/i.test(match2.url)) {
    match2.url = `mailto:${match2.url}`;
  }
};
LinkifyIt.prototype.onCompile = function onCompile() {
};
var linkify_it_default = LinkifyIt;

// node_modules/punycode.js/punycode.es6.js
var maxInt = 2147483647;
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128;
var delimiter = "-";
var regexPunycode = /^xn--/;
var regexNonASCII = /[^\0-\x7F]/;
var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
var errors = {
  "overflow": "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
};
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;
function error(type) {
  throw new RangeError(errors[type]);
}
function map(array, callback) {
  const result = [];
  let length = array.length;
  while (length--) {
    result[length] = callback(array[length]);
  }
  return result;
}
function mapDomain(domain, callback) {
  const parts = domain.split("@");
  let result = "";
  if (parts.length > 1) {
    result = parts[0] + "@";
    domain = parts[1];
  }
  domain = domain.replace(regexSeparators, ".");
  const labels = domain.split(".");
  const encoded = map(labels, callback).join(".");
  return result + encoded;
}
function ucs2decode(string) {
  const output = [];
  let counter = 0;
  const length = string.length;
  while (counter < length) {
    const value = string.charCodeAt(counter++);
    if (value >= 55296 && value <= 56319 && counter < length) {
      const extra = string.charCodeAt(counter++);
      if ((extra & 64512) == 56320) {
        output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
      } else {
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}
var ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
var basicToDigit = function(codePoint) {
  if (codePoint >= 48 && codePoint < 58) {
    return 26 + (codePoint - 48);
  }
  if (codePoint >= 65 && codePoint < 91) {
    return codePoint - 65;
  }
  if (codePoint >= 97 && codePoint < 123) {
    return codePoint - 97;
  }
  return base;
};
var digitToBasic = function(digit, flag) {
  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};
var adapt = function(delta, numPoints, firstTime) {
  let k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};
var decode2 = function(input) {
  const output = [];
  const inputLength = input.length;
  let i = 0;
  let n = initialN;
  let bias = initialBias;
  let basic = input.lastIndexOf(delimiter);
  if (basic < 0) {
    basic = 0;
  }
  for (let j = 0; j < basic; ++j) {
    if (input.charCodeAt(j) >= 128) {
      error("not-basic");
    }
    output.push(input.charCodeAt(j));
  }
  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (index >= inputLength) {
        error("invalid-input");
      }
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= base) {
        error("invalid-input");
      }
      if (digit > floor((maxInt - i) / w)) {
        error("overflow");
      }
      i += digit * w;
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (digit < t) {
        break;
      }
      const baseMinusT = base - t;
      if (w > floor(maxInt / baseMinusT)) {
        error("overflow");
      }
      w *= baseMinusT;
    }
    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi == 0);
    if (floor(i / out) > maxInt - n) {
      error("overflow");
    }
    n += floor(i / out);
    i %= out;
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
};
var encode2 = function(input) {
  const output = [];
  input = ucs2decode(input);
  const inputLength = input.length;
  let n = initialN;
  let delta = 0;
  let bias = initialBias;
  for (const currentValue of input) {
    if (currentValue < 128) {
      output.push(stringFromCharCode(currentValue));
    }
  }
  const basicLength = output.length;
  let handledCPCount = basicLength;
  if (basicLength) {
    output.push(delimiter);
  }
  while (handledCPCount < inputLength) {
    let m = maxInt;
    for (const currentValue of input) {
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }
    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      error("overflow");
    }
    delta += (m - n) * handledCPCountPlusOne;
    n = m;
    for (const currentValue of input) {
      if (currentValue < n && ++delta > maxInt) {
        error("overflow");
      }
      if (currentValue === n) {
        let q = delta;
        for (let k = base; ; k += base) {
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (q < t) {
            break;
          }
          const qMinusT = q - t;
          const baseMinusT = base - t;
          output.push(
            stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
          );
          q = floor(qMinusT / baseMinusT);
        }
        output.push(stringFromCharCode(digitToBasic(q, 0)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }
    ++delta;
    ++n;
  }
  return output.join("");
};
var toUnicode = function(input) {
  return mapDomain(input, function(string) {
    return regexPunycode.test(string) ? decode2(string.slice(4).toLowerCase()) : string;
  });
};
var toASCII = function(input) {
  return mapDomain(input, function(string) {
    return regexNonASCII.test(string) ? "xn--" + encode2(string) : string;
  });
};
var punycode = {
  /**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
  "version": "2.3.1",
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
  "ucs2": {
    "decode": ucs2decode,
    "encode": ucs2encode
  },
  "decode": decode2,
  "encode": encode2,
  "toASCII": toASCII,
  "toUnicode": toUnicode
};
var punycode_es6_default = punycode;

// node_modules/markdown-it/lib/presets/default.mjs
var default_default = {
  options: {
    // Enable HTML tags in source
    html: false,
    // Use '/' to close single tags (<br />)
    xhtmlOut: false,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "\u201C\u201D\u2018\u2019",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 100
  },
  components: {
    core: {},
    block: {},
    inline: {}
  }
};

// node_modules/markdown-it/lib/presets/zero.mjs
var zero_default = {
  options: {
    // Enable HTML tags in source
    html: false,
    // Use '/' to close single tags (<br />)
    xhtmlOut: false,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "\u201C\u201D\u2018\u2019",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "text"
      ],
      rules2: [
        "balance_pairs",
        "fragments_join"
      ]
    }
  }
};

// node_modules/markdown-it/lib/presets/commonmark.mjs
var commonmark_default = {
  options: {
    // Enable HTML tags in source
    html: true,
    // Use '/' to close single tags (<br />)
    xhtmlOut: true,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "\u201C\u201D\u2018\u2019",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "emphasis",
        "entity",
        "escape",
        "html_inline",
        "image",
        "link",
        "newline",
        "text"
      ],
      rules2: [
        "balance_pairs",
        "emphasis",
        "fragments_join"
      ]
    }
  }
};

// node_modules/markdown-it/lib/index.mjs
var config = {
  default: default_default,
  zero: zero_default,
  commonmark: commonmark_default
};
var BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
var GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
function validateLink(url) {
  const str = url.trim().toLowerCase();
  return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true;
}
var RECODE_HOSTNAME_FOR = ["http:", "https:", "mailto:"];
function normalizeLink(url) {
  const parsed = parse_default(url, true);
  if (parsed.hostname) {
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode_es6_default.toASCII(parsed.hostname);
      } catch (er) {
      }
    }
  }
  return encode_default(format(parsed));
}
function normalizeLinkText(url) {
  const parsed = parse_default(url, true);
  if (parsed.hostname) {
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode_es6_default.toUnicode(parsed.hostname);
      } catch (er) {
      }
    }
  }
  return decode_default(format(parsed), decode_default.defaultChars + "%");
}
function MarkdownIt(presetName, options) {
  if (!(this instanceof MarkdownIt)) {
    return new MarkdownIt(presetName, options);
  }
  if (!options) {
    if (!isString(presetName)) {
      options = presetName || {};
      presetName = "default";
    }
  }
  this.inline = new parser_inline_default();
  this.block = new parser_block_default();
  this.core = new parser_core_default();
  this.renderer = new renderer_default();
  this.linkify = new linkify_it_default();
  this.validateLink = validateLink;
  this.normalizeLink = normalizeLink;
  this.normalizeLinkText = normalizeLinkText;
  this.utils = utils_exports;
  this.helpers = assign({}, helpers_exports);
  this.options = {};
  this.configure(presetName);
  if (options) {
    this.set(options);
  }
}
MarkdownIt.prototype.set = function(options) {
  assign(this.options, options);
  return this;
};
MarkdownIt.prototype.configure = function(presets) {
  const self = this;
  if (isString(presets)) {
    const presetName = presets;
    presets = config[presetName];
    if (!presets) {
      throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
    }
  }
  if (!presets) {
    throw new Error("Wrong `markdown-it` preset, can't be empty");
  }
  if (presets.options) {
    self.set(presets.options);
  }
  if (presets.components) {
    Object.keys(presets.components).forEach(function(name) {
      if (presets.components[name].rules) {
        self[name].ruler.enableOnly(presets.components[name].rules);
      }
      if (presets.components[name].rules2) {
        self[name].ruler2.enableOnly(presets.components[name].rules2);
      }
    });
  }
  return this;
};
MarkdownIt.prototype.enable = function(list2, ignoreInvalid) {
  let result = [];
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  ["core", "block", "inline"].forEach(function(chain) {
    result = result.concat(this[chain].ruler.enable(list2, true));
  }, this);
  result = result.concat(this.inline.ruler2.enable(list2, true));
  const missed = list2.filter(function(name) {
    return result.indexOf(name) < 0;
  });
  if (missed.length && !ignoreInvalid) {
    throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + missed);
  }
  return this;
};
MarkdownIt.prototype.disable = function(list2, ignoreInvalid) {
  let result = [];
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  ["core", "block", "inline"].forEach(function(chain) {
    result = result.concat(this[chain].ruler.disable(list2, true));
  }, this);
  result = result.concat(this.inline.ruler2.disable(list2, true));
  const missed = list2.filter(function(name) {
    return result.indexOf(name) < 0;
  });
  if (missed.length && !ignoreInvalid) {
    throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + missed);
  }
  return this;
};
MarkdownIt.prototype.use = function(plugin) {
  const args = [this].concat(Array.prototype.slice.call(arguments, 1));
  plugin.apply(plugin, args);
  return this;
};
MarkdownIt.prototype.parse = function(src, env) {
  if (typeof src !== "string") {
    throw new Error("Input data should be a String");
  }
  const state = new this.core.State(src, this, env);
  this.core.process(state);
  return state.tokens;
};
MarkdownIt.prototype.render = function(src, env) {
  env = env || {};
  return this.renderer.render(this.parse(src, env), this.options, env);
};
MarkdownIt.prototype.parseInline = function(src, env) {
  const state = new this.core.State(src, this, env);
  state.inlineMode = true;
  this.core.process(state);
  return state.tokens;
};
MarkdownIt.prototype.renderInline = function(src, env) {
  env = env || {};
  return this.renderer.render(this.parseInline(src, env), this.options, env);
};
var lib_default = MarkdownIt;

// src/core/markdown.ts
var parser = new lib_default({ html: false, linkify: true, typographer: true });
function normalizeObsidianMarkdown(markdown3) {
  return markdown3.replace(/^---\n[\s\S]*?\n---\n?/, "").replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_all, path, alt) => {
    const cleanPath = path.trim();
    const label = alt?.trim() || cleanPath;
    return `![${label}](${markdownImageDestination(cleanPath)})`;
  }).replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "[$2]($1)").replace(/\[\[([^\]]+)\]\]/g, "[$1]($1)");
}
function markdownImageDestination(src) {
  if (!/[\s()<>]/.test(src)) return src;
  return `<${src.replace(/>/g, "%3E")}>`;
}
function stripMarkdown(markdown3) {
  const parsed = new DOMParser().parseFromString(parser.render(markdown3), "text/html");
  return (parsed.body.textContent ?? "").replace(/\n{3,}/g, "\n\n").trim();
}
function parseNote(source, fallbackTitle) {
  const markdown3 = normalizeObsidianMarkdown(source);
  const heading2 = markdown3.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return {
    title: heading2 ?? fallbackTitle,
    source,
    markdown: markdown3,
    html: parser.render(markdown3),
    plainText: stripMarkdown(markdown3)
  };
}

// node_modules/html-to-image/es/util.js
function resolveUrl(url, baseUrl) {
  if (url.match(/^[a-z]+:\/\//i)) {
    return url;
  }
  if (url.match(/^\/\//)) {
    return window.location.protocol + url;
  }
  if (url.match(/^[a-z]+:/i)) {
    return url;
  }
  const doc = document.implementation.createHTMLDocument();
  const base2 = doc.createElement("base");
  const a = doc.createElement("a");
  doc.head.appendChild(base2);
  doc.body.appendChild(a);
  if (baseUrl) {
    base2.href = baseUrl;
  }
  a.href = url;
  return a.href;
}
var uuid = /* @__PURE__ */ (() => {
  let counter = 0;
  const random = () => (
    // eslint-disable-next-line no-bitwise
    `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
  );
  return () => {
    counter += 1;
    return `u${random()}${counter}`;
  };
})();
function toArray(arrayLike) {
  const arr = [];
  for (let i = 0, l = arrayLike.length; i < l; i++) {
    arr.push(arrayLike[i]);
  }
  return arr;
}
var styleProps = null;
function getStyleProperties(options = {}) {
  if (styleProps) {
    return styleProps;
  }
  if (options.includeStyleProperties) {
    styleProps = options.includeStyleProperties;
    return styleProps;
  }
  styleProps = toArray(window.getComputedStyle(document.documentElement));
  return styleProps;
}
function px(node, styleProperty) {
  const win = node.ownerDocument.defaultView || window;
  const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
  return val ? parseFloat(val.replace("px", "")) : 0;
}
function getNodeWidth(node) {
  const leftBorder = px(node, "border-left-width");
  const rightBorder = px(node, "border-right-width");
  return node.clientWidth + leftBorder + rightBorder;
}
function getNodeHeight(node) {
  const topBorder = px(node, "border-top-width");
  const bottomBorder = px(node, "border-bottom-width");
  return node.clientHeight + topBorder + bottomBorder;
}
function getImageSize(targetNode, options = {}) {
  const width = options.width || getNodeWidth(targetNode);
  const height = options.height || getNodeHeight(targetNode);
  return { width, height };
}
function getPixelRatio() {
  let ratio;
  let FINAL_PROCESS;
  try {
    FINAL_PROCESS = process;
  } catch (e) {
  }
  const val = FINAL_PROCESS && FINAL_PROCESS.env ? FINAL_PROCESS.env.devicePixelRatio : null;
  if (val) {
    ratio = parseInt(val, 10);
    if (Number.isNaN(ratio)) {
      ratio = 1;
    }
  }
  return ratio || window.devicePixelRatio || 1;
}
var canvasDimensionLimit = 16384;
function checkCanvasDimensions(canvas) {
  if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
    if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvas.height) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    } else if (canvas.width > canvasDimensionLimit) {
      canvas.height *= canvasDimensionLimit / canvas.width;
      canvas.width = canvasDimensionLimit;
    } else {
      canvas.width *= canvasDimensionLimit / canvas.height;
      canvas.height = canvasDimensionLimit;
    }
  }
}
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      img.decode().then(() => {
        requestAnimationFrame(() => resolve(img));
      });
    };
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = url;
  });
}
async function svgToDataURL(svg) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg)).then(encodeURIComponent).then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
}
async function nodeToDataURL(node, width, height) {
  const xmlns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(xmlns, "svg");
  const foreignObject = document.createElementNS(xmlns, "foreignObject");
  svg.setAttribute("width", `${width}`);
  svg.setAttribute("height", `${height}`);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  foreignObject.setAttribute("width", "100%");
  foreignObject.setAttribute("height", "100%");
  foreignObject.setAttribute("x", "0");
  foreignObject.setAttribute("y", "0");
  foreignObject.setAttribute("externalResourcesRequired", "true");
  svg.appendChild(foreignObject);
  foreignObject.appendChild(node);
  return svgToDataURL(svg);
}
var isInstanceOfElement = (node, instance) => {
  if (node instanceof instance)
    return true;
  const nodePrototype = Object.getPrototypeOf(node);
  if (nodePrototype === null)
    return false;
  return nodePrototype.constructor.name === instance.name || isInstanceOfElement(nodePrototype, instance);
};

// node_modules/html-to-image/es/clone-pseudos.js
function formatCSSText(style) {
  const content = style.getPropertyValue("content");
  return `${style.cssText} content: '${content.replace(/'|"/g, "")}';`;
}
function formatCSSProperties(style, options) {
  return getStyleProperties(options).map((name) => {
    const value = style.getPropertyValue(name);
    const priority = style.getPropertyPriority(name);
    return `${name}: ${value}${priority ? " !important" : ""};`;
  }).join(" ");
}
function getPseudoElementStyle(className, pseudo, style, options) {
  const selector = `.${className}:${pseudo}`;
  const cssText = style.cssText ? formatCSSText(style) : formatCSSProperties(style, options);
  return document.createTextNode(`${selector}{${cssText}}`);
}
function clonePseudoElement(nativeNode, clonedNode, pseudo, options) {
  const style = window.getComputedStyle(nativeNode, pseudo);
  const content = style.getPropertyValue("content");
  if (content === "" || content === "none") {
    return;
  }
  const className = uuid();
  try {
    clonedNode.className = `${clonedNode.className} ${className}`;
  } catch (err2) {
    return;
  }
  const styleElement = document.createElement("style");
  styleElement.appendChild(getPseudoElementStyle(className, pseudo, style, options));
  clonedNode.appendChild(styleElement);
}
function clonePseudoElements(nativeNode, clonedNode, options) {
  clonePseudoElement(nativeNode, clonedNode, ":before", options);
  clonePseudoElement(nativeNode, clonedNode, ":after", options);
}

// node_modules/html-to-image/es/mimes.js
var WOFF = "application/font-woff";
var JPEG = "image/jpeg";
var mimes = {
  woff: WOFF,
  woff2: WOFF,
  ttf: "application/font-truetype",
  eot: "application/vnd.ms-fontobject",
  png: "image/png",
  jpg: JPEG,
  jpeg: JPEG,
  gif: "image/gif",
  tiff: "image/tiff",
  svg: "image/svg+xml",
  webp: "image/webp"
};
function getExtension(url) {
  const match2 = /\.([^./]*?)$/g.exec(url);
  return match2 ? match2[1] : "";
}
function getMimeType(url) {
  const extension = getExtension(url).toLowerCase();
  return mimes[extension] || "";
}

// node_modules/html-to-image/es/dataurl.js
function getContentFromDataUrl(dataURL) {
  return dataURL.split(/,/)[1];
}
function isDataUrl(url) {
  return url.search(/^(data:)/) !== -1;
}
function makeDataUrl(content, mimeType) {
  return `data:${mimeType};base64,${content}`;
}
async function fetchAsDataURL(url, init, process2) {
  const res = await fetch(url, init);
  if (res.status === 404) {
    throw new Error(`Resource "${res.url}" not found`);
  }
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      try {
        resolve(process2({ res, result: reader.result }));
      } catch (error2) {
        reject(error2);
      }
    };
    reader.readAsDataURL(blob);
  });
}
var cache = {};
function getCacheKey(url, contentType, includeQueryParams) {
  let key = url.replace(/\?.*/, "");
  if (includeQueryParams) {
    key = url;
  }
  if (/ttf|otf|eot|woff2?/i.test(key)) {
    key = key.replace(/.*\//, "");
  }
  return contentType ? `[${contentType}]${key}` : key;
}
async function resourceToDataURL(resourceUrl, contentType, options) {
  const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
  if (cache[cacheKey] != null) {
    return cache[cacheKey];
  }
  if (options.cacheBust) {
    resourceUrl += (/\?/.test(resourceUrl) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime();
  }
  let dataURL;
  try {
    const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({ res, result }) => {
      if (!contentType) {
        contentType = res.headers.get("Content-Type") || "";
      }
      return getContentFromDataUrl(result);
    });
    dataURL = makeDataUrl(content, contentType);
  } catch (error2) {
    dataURL = options.imagePlaceholder || "";
    let msg = `Failed to fetch resource: ${resourceUrl}`;
    if (error2) {
      msg = typeof error2 === "string" ? error2 : error2.message;
    }
    if (msg) {
      console.warn(msg);
    }
  }
  cache[cacheKey] = dataURL;
  return dataURL;
}

// node_modules/html-to-image/es/clone-node.js
async function cloneCanvasElement(canvas) {
  const dataURL = canvas.toDataURL();
  if (dataURL === "data:,") {
    return canvas.cloneNode(false);
  }
  return createImage(dataURL);
}
async function cloneVideoElement(video, options) {
  if (video.currentSrc) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL2 = canvas.toDataURL();
    return createImage(dataURL2);
  }
  const poster = video.poster;
  const contentType = getMimeType(poster);
  const dataURL = await resourceToDataURL(poster, contentType, options);
  return createImage(dataURL);
}
async function cloneIFrameElement(iframe, options) {
  var _a3;
  try {
    if ((_a3 = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a3 === void 0 ? void 0 : _a3.body) {
      return await cloneNode(iframe.contentDocument.body, options, true);
    }
  } catch (_b2) {
  }
  return iframe.cloneNode(false);
}
async function cloneSingleNode(node, options) {
  if (isInstanceOfElement(node, HTMLCanvasElement)) {
    return cloneCanvasElement(node);
  }
  if (isInstanceOfElement(node, HTMLVideoElement)) {
    return cloneVideoElement(node, options);
  }
  if (isInstanceOfElement(node, HTMLIFrameElement)) {
    return cloneIFrameElement(node, options);
  }
  return node.cloneNode(isSVGElement(node));
}
var isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SLOT";
var isSVGElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SVG";
async function cloneChildren(nativeNode, clonedNode, options) {
  var _a3, _b2;
  if (isSVGElement(clonedNode)) {
    return clonedNode;
  }
  let children = [];
  if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
    children = toArray(nativeNode.assignedNodes());
  } else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && ((_a3 = nativeNode.contentDocument) === null || _a3 === void 0 ? void 0 : _a3.body)) {
    children = toArray(nativeNode.contentDocument.body.childNodes);
  } else {
    children = toArray(((_b2 = nativeNode.shadowRoot) !== null && _b2 !== void 0 ? _b2 : nativeNode).childNodes);
  }
  if (children.length === 0 || isInstanceOfElement(nativeNode, HTMLVideoElement)) {
    return clonedNode;
  }
  await children.reduce((deferred, child) => deferred.then(() => cloneNode(child, options)).then((clonedChild) => {
    if (clonedChild) {
      clonedNode.appendChild(clonedChild);
    }
  }), Promise.resolve());
  return clonedNode;
}
function cloneCSSStyle(nativeNode, clonedNode, options) {
  const targetStyle = clonedNode.style;
  if (!targetStyle) {
    return;
  }
  const sourceStyle = window.getComputedStyle(nativeNode);
  if (sourceStyle.cssText) {
    targetStyle.cssText = sourceStyle.cssText;
    targetStyle.transformOrigin = sourceStyle.transformOrigin;
  } else {
    getStyleProperties(options).forEach((name) => {
      let value = sourceStyle.getPropertyValue(name);
      if (name === "font-size" && value.endsWith("px")) {
        const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
        value = `${reducedFont}px`;
      }
      if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && name === "display" && value === "inline") {
        value = "block";
      }
      if (name === "d" && clonedNode.getAttribute("d")) {
        value = `path(${clonedNode.getAttribute("d")})`;
      }
      targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
    });
  }
}
function cloneInputValue(nativeNode, clonedNode) {
  if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
    clonedNode.innerHTML = nativeNode.value;
  }
  if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
    clonedNode.setAttribute("value", nativeNode.value);
  }
}
function cloneSelectValue(nativeNode, clonedNode) {
  if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
    const clonedSelect = clonedNode;
    const selectedOption = Array.from(clonedSelect.children).find((child) => nativeNode.value === child.getAttribute("value"));
    if (selectedOption) {
      selectedOption.setAttribute("selected", "");
    }
  }
}
function decorate(nativeNode, clonedNode, options) {
  if (isInstanceOfElement(clonedNode, Element)) {
    cloneCSSStyle(nativeNode, clonedNode, options);
    clonePseudoElements(nativeNode, clonedNode, options);
    cloneInputValue(nativeNode, clonedNode);
    cloneSelectValue(nativeNode, clonedNode);
  }
  return clonedNode;
}
async function ensureSVGSymbols(clone, options) {
  const uses = clone.querySelectorAll ? clone.querySelectorAll("use") : [];
  if (uses.length === 0) {
    return clone;
  }
  const processedDefs = {};
  for (let i = 0; i < uses.length; i++) {
    const use = uses[i];
    const id = use.getAttribute("xlink:href");
    if (id) {
      const exist = clone.querySelector(id);
      const definition = document.querySelector(id);
      if (!exist && definition && !processedDefs[id]) {
        processedDefs[id] = await cloneNode(definition, options, true);
      }
    }
  }
  const nodes = Object.values(processedDefs);
  if (nodes.length) {
    const ns = "http://www.w3.org/1999/xhtml";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("xmlns", ns);
    svg.style.position = "absolute";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.overflow = "hidden";
    svg.style.display = "none";
    const defs = document.createElementNS(ns, "defs");
    svg.appendChild(defs);
    for (let i = 0; i < nodes.length; i++) {
      defs.appendChild(nodes[i]);
    }
    clone.appendChild(svg);
  }
  return clone;
}
async function cloneNode(node, options, isRoot) {
  if (!isRoot && options.filter && !options.filter(node)) {
    return null;
  }
  return Promise.resolve(node).then((clonedNode) => cloneSingleNode(clonedNode, options)).then((clonedNode) => cloneChildren(node, clonedNode, options)).then((clonedNode) => decorate(node, clonedNode, options)).then((clonedNode) => ensureSVGSymbols(clonedNode, options));
}

// node_modules/html-to-image/es/embed-resources.js
var URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
var URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
var FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function toRegex(url) {
  const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
  return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, "g");
}
function parseURLs(cssText) {
  const urls = [];
  cssText.replace(URL_REGEX, (raw, quotation, url) => {
    urls.push(url);
    return raw;
  });
  return urls.filter((url) => !isDataUrl(url));
}
async function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
  try {
    const resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
    const contentType = getMimeType(resourceURL);
    let dataURL;
    if (getContentFromUrl) {
      const content = await getContentFromUrl(resolvedURL);
      dataURL = makeDataUrl(content, contentType);
    } else {
      dataURL = await resourceToDataURL(resolvedURL, contentType, options);
    }
    return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
  } catch (error2) {
  }
  return cssText;
}
function filterPreferredFontFormat(str, { preferredFontFormat }) {
  return !preferredFontFormat ? str : str.replace(FONT_SRC_REGEX, (match2) => {
    while (true) {
      const [src, , format2] = URL_WITH_FORMAT_REGEX.exec(match2) || [];
      if (!format2) {
        return "";
      }
      if (format2 === preferredFontFormat) {
        return `src: ${src};`;
      }
    }
  });
}
function shouldEmbed(url) {
  return url.search(URL_REGEX) !== -1;
}
async function embedResources(cssText, baseUrl, options) {
  if (!shouldEmbed(cssText)) {
    return cssText;
  }
  const filteredCSSText = filterPreferredFontFormat(cssText, options);
  const urls = parseURLs(filteredCSSText);
  return urls.reduce((deferred, url) => deferred.then((css) => embed(css, url, baseUrl, options)), Promise.resolve(filteredCSSText));
}

// node_modules/html-to-image/es/embed-images.js
async function embedProp(propName, node, options) {
  var _a3;
  const propValue = (_a3 = node.style) === null || _a3 === void 0 ? void 0 : _a3.getPropertyValue(propName);
  if (propValue) {
    const cssString = await embedResources(propValue, null, options);
    node.style.setProperty(propName, cssString, node.style.getPropertyPriority(propName));
    return true;
  }
  return false;
}
async function embedBackground(clonedNode, options) {
  ;
  await embedProp("background", clonedNode, options) || await embedProp("background-image", clonedNode, options);
  await embedProp("mask", clonedNode, options) || await embedProp("-webkit-mask", clonedNode, options) || await embedProp("mask-image", clonedNode, options) || await embedProp("-webkit-mask-image", clonedNode, options);
}
async function embedImageNode(clonedNode, options) {
  const isImageElement = isInstanceOfElement(clonedNode, HTMLImageElement);
  if (!(isImageElement && !isDataUrl(clonedNode.src)) && !(isInstanceOfElement(clonedNode, SVGImageElement) && !isDataUrl(clonedNode.href.baseVal))) {
    return;
  }
  const url = isImageElement ? clonedNode.src : clonedNode.href.baseVal;
  const dataURL = await resourceToDataURL(url, getMimeType(url), options);
  await new Promise((resolve, reject) => {
    clonedNode.onload = resolve;
    clonedNode.onerror = options.onImageErrorHandler ? (...attributes) => {
      try {
        resolve(options.onImageErrorHandler(...attributes));
      } catch (error2) {
        reject(error2);
      }
    } : reject;
    const image2 = clonedNode;
    if (image2.decode) {
      image2.decode = resolve;
    }
    if (image2.loading === "lazy") {
      image2.loading = "eager";
    }
    if (isImageElement) {
      clonedNode.srcset = "";
      clonedNode.src = dataURL;
    } else {
      clonedNode.href.baseVal = dataURL;
    }
  });
}
async function embedChildren(clonedNode, options) {
  const children = toArray(clonedNode.childNodes);
  const deferreds = children.map((child) => embedImages(child, options));
  await Promise.all(deferreds).then(() => clonedNode);
}
async function embedImages(clonedNode, options) {
  if (isInstanceOfElement(clonedNode, Element)) {
    await embedBackground(clonedNode, options);
    await embedImageNode(clonedNode, options);
    await embedChildren(clonedNode, options);
  }
}

// node_modules/html-to-image/es/apply-style.js
function applyStyle(node, options) {
  const { style } = node;
  if (options.backgroundColor) {
    style.backgroundColor = options.backgroundColor;
  }
  if (options.width) {
    style.width = `${options.width}px`;
  }
  if (options.height) {
    style.height = `${options.height}px`;
  }
  const manual = options.style;
  if (manual != null) {
    Object.keys(manual).forEach((key) => {
      style[key] = manual[key];
    });
  }
  return node;
}

// node_modules/html-to-image/es/embed-webfonts.js
var cssFetchCache = {};
async function fetchCSS(url) {
  let cache2 = cssFetchCache[url];
  if (cache2 != null) {
    return cache2;
  }
  const res = await fetch(url);
  const cssText = await res.text();
  cache2 = { url, cssText };
  cssFetchCache[url] = cache2;
  return cache2;
}
async function embedFonts(data, options) {
  let cssText = data.cssText;
  const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
  const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
  const loadFonts = fontLocs.map(async (loc) => {
    let url = loc.replace(regexUrl, "$1");
    if (!url.startsWith("https://")) {
      url = new URL(url, data.url).href;
    }
    return fetchAsDataURL(url, options.fetchRequestInit, ({ result }) => {
      cssText = cssText.replace(loc, `url(${result})`);
      return [loc, result];
    });
  });
  return Promise.all(loadFonts).then(() => cssText);
}
function parseCSS(source) {
  if (source == null) {
    return [];
  }
  const result = [];
  const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
  let cssText = source.replace(commentsRegex, "");
  const keyframesRegex = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
  while (true) {
    const matches = keyframesRegex.exec(cssText);
    if (matches === null) {
      break;
    }
    result.push(matches[0]);
  }
  cssText = cssText.replace(keyframesRegex, "");
  const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
  const combinedCSSRegex = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})";
  const unifiedRegex = new RegExp(combinedCSSRegex, "gi");
  while (true) {
    let matches = importRegex.exec(cssText);
    if (matches === null) {
      matches = unifiedRegex.exec(cssText);
      if (matches === null) {
        break;
      } else {
        importRegex.lastIndex = unifiedRegex.lastIndex;
      }
    } else {
      unifiedRegex.lastIndex = importRegex.lastIndex;
    }
    result.push(matches[0]);
  }
  return result;
}
async function getCSSRules(styleSheets, options) {
  const ret = [];
  const deferreds = [];
  styleSheets.forEach((sheet) => {
    if ("cssRules" in sheet) {
      try {
        toArray(sheet.cssRules || []).forEach((item, index) => {
          if (item.type === CSSRule.IMPORT_RULE) {
            let importIndex = index + 1;
            const url = item.href;
            const deferred = fetchCSS(url).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
              try {
                sheet.insertRule(rule, rule.startsWith("@import") ? importIndex += 1 : sheet.cssRules.length);
              } catch (error2) {
                console.error("Error inserting rule from remote css", {
                  rule,
                  error: error2
                });
              }
            })).catch((e) => {
              console.error("Error loading remote css", e.toString());
            });
            deferreds.push(deferred);
          }
        });
      } catch (e) {
        const inline2 = styleSheets.find((a) => a.href == null) || document.styleSheets[0];
        if (sheet.href != null) {
          deferreds.push(fetchCSS(sheet.href).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
            inline2.insertRule(rule, inline2.cssRules.length);
          })).catch((err2) => {
            console.error("Error loading remote stylesheet", err2);
          }));
        }
        console.error("Error inlining remote css file", e);
      }
    }
  });
  return Promise.all(deferreds).then(() => {
    styleSheets.forEach((sheet) => {
      if ("cssRules" in sheet) {
        try {
          toArray(sheet.cssRules || []).forEach((item) => {
            ret.push(item);
          });
        } catch (e) {
          console.error(`Error while reading CSS rules from ${sheet.href}`, e);
        }
      }
    });
    return ret;
  });
}
function getWebFontRules(cssRules) {
  return cssRules.filter((rule) => rule.type === CSSRule.FONT_FACE_RULE).filter((rule) => shouldEmbed(rule.style.getPropertyValue("src")));
}
async function parseWebFontRules(node, options) {
  if (node.ownerDocument == null) {
    throw new Error("Provided element is not within a Document");
  }
  const styleSheets = toArray(node.ownerDocument.styleSheets);
  const cssRules = await getCSSRules(styleSheets, options);
  return getWebFontRules(cssRules);
}
function normalizeFontFamily(font) {
  return font.trim().replace(/["']/g, "");
}
function getUsedFonts(node) {
  const fonts = /* @__PURE__ */ new Set();
  function traverse(node2) {
    const fontFamily = node2.style.fontFamily || getComputedStyle(node2).fontFamily;
    fontFamily.split(",").forEach((font) => {
      fonts.add(normalizeFontFamily(font));
    });
    Array.from(node2.children).forEach((child) => {
      if (child instanceof HTMLElement) {
        traverse(child);
      }
    });
  }
  traverse(node);
  return fonts;
}
async function getWebFontCSS(node, options) {
  const rules = await parseWebFontRules(node, options);
  const usedFonts = getUsedFonts(node);
  const cssTexts = await Promise.all(rules.filter((rule) => usedFonts.has(normalizeFontFamily(rule.style.fontFamily))).map((rule) => {
    const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
    return embedResources(rule.cssText, baseUrl, options);
  }));
  return cssTexts.join("\n");
}
async function embedWebFonts(clonedNode, options) {
  const cssText = options.fontEmbedCSS != null ? options.fontEmbedCSS : options.skipFonts ? null : await getWebFontCSS(clonedNode, options);
  if (cssText) {
    const styleNode = document.createElement("style");
    const sytleContent = document.createTextNode(cssText);
    styleNode.appendChild(sytleContent);
    if (clonedNode.firstChild) {
      clonedNode.insertBefore(styleNode, clonedNode.firstChild);
    } else {
      clonedNode.appendChild(styleNode);
    }
  }
}

// node_modules/html-to-image/es/index.js
async function toSvg(node, options = {}) {
  const { width, height } = getImageSize(node, options);
  const clonedNode = await cloneNode(node, options, true);
  await embedWebFonts(clonedNode, options);
  await embedImages(clonedNode, options);
  applyStyle(clonedNode, options);
  const datauri = await nodeToDataURL(clonedNode, width, height);
  return datauri;
}
async function toCanvas(node, options = {}) {
  const { width, height } = getImageSize(node, options);
  const svg = await toSvg(node, options);
  const img = await createImage(svg);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const ratio = options.pixelRatio || getPixelRatio();
  const canvasWidth = options.canvasWidth || width;
  const canvasHeight = options.canvasHeight || height;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  if (!options.skipAutoScale) {
    checkCanvasDimensions(canvas);
  }
  canvas.style.width = `${canvasWidth}`;
  canvas.style.height = `${canvasHeight}`;
  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}
async function toPng(node, options = {}) {
  const canvas = await toCanvas(node, options);
  return canvas.toDataURL();
}

// node_modules/fflate/esm/browser.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a2 = freb(fleb, 2);
var fl = _a2.b;
var revfl = _a2.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i = 0; i < d.length; ++i) {
    if (d[i])
      t.push({ s: i, f: d[i] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i = 1; i < s; ++i) {
    if (t2[i].s > maxSym)
      maxSym = t2[i].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i < s; ++i) {
      var i2_1 = t2[i].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i;
    }
    for (; i >= 0 && dt; --i) {
      var i2_3 = t2[i].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i = 1; i <= s; ++i) {
    if (c[i] == cln && i != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i = 0; i < cl.length; ++i)
    l += cf[i] * cl[i];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    out[o + i + 4] = dat[i];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a3 = hTree(lf, 15), dlt = _a3.t, mlb = _a3.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i = 0; i < lclt.length; ++i)
    ++lcfreq[lclt[i] & 31];
  for (var i = 0; i < lcdt.length; ++i)
    ++lcfreq[lcdt[i] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i = 0; i < nlcc; ++i)
      wbits(out, p + 3 * i, lct[clim[i]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i = 0; i < clct.length; ++i) {
        var len = clct[i] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i = 0; i < li; ++i) {
    var sym = syms[i];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i2) {
      return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i + 2 < s; ++i) {
      var hv = hsh(i);
      var imod = i & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i) {
        var rem = s - i;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
          li = lc_1 = eb = 0, bs = i;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i + l] == dat[i + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md2 = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md2)
                    md2 = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i];
          ++lf[dat[i]];
        }
      }
    }
    for (i = Math.max(i, wi); i < s; ++i) {
      syms[li++] = dat[i];
      ++lf[dat[i]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i, st.w = wi;
    }
  } else {
    for (var i = st.w || 0; i < s + lst; i += 65535) {
      var e = i + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i = 0; i < 256; ++i) {
    var c = i, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i] = c;
  }
  return t;
})();
var crc = function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i = 0; i < d.length; ++i)
        cr = crct[cr & 255 ^ d[i]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var wbytes = function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (ArrayBuffer.isView(val))
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
function strToU8(str, latin1) {
  if (latin1) {
    var ar_1 = new u8(str.length);
    for (var i = 0; i < str.length; ++i)
      ar_1[i] = str.charCodeAt(i);
    return ar_1;
  }
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i = 0; i < l; ++i) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
var exfl = function(ex) {
  var le = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err(9);
      le += l + 4;
    }
  }
  return le;
};
var wzh = function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a3 = r[fn], file = _a3[0], p = _a3[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i = 0; i < files.length; ++i) {
    var f = files[i];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}

// src/platforms/rednote/adapter.ts
var import_obsidian3 = require("obsidian");

// src/core/accountVariables.ts
function getAccountVariables(account) {
  const values = { ...account?.variables ?? {} };
  const aliases = [
    ["\u535A\u4E3B\u540D\u79F0", account?.name],
    ["\u8D26\u53F7\u540D\u79F0", account?.name],
    ["\u4F5C\u8005\u540D", account?.name],
    ["\u535A\u4E3BID", account?.handle],
    ["\u8D26\u53F7ID", account?.handle],
    ["handle", account?.handle],
    ["\u535A\u4E3B\u7B80\u4ECB", account?.signature],
    ["\u8D26\u53F7\u4ECB\u7ECD", account?.signature],
    ["\u5BA3\u4F20\u8BED", account?.signature],
    ["\u5934\u50CF", account?.avatarUrl],
    ["\u8D26\u53F7\u5934\u50CF", account?.avatarUrl]
  ];
  for (const [key, value] of aliases) if (value?.trim()) values[key] = value.trim();
  return values;
}
function replaceAccountVariables(source, account) {
  const values = getAccountVariables(account);
  return source.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (placeholder, key) => values[key.trim()] || placeholder);
}

// src/core/clipboard.ts
async function copyRichHtml(html, plainText) {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" })
      })
    ]);
    return;
  }
  await navigator.clipboard.writeText(plainText);
}
async function copyPng(dataUrl) {
  const [header, payload] = dataUrl.split(",", 2);
  if (!header || !payload || !header.includes(";base64")) throw new Error("\u56FE\u7247\u6570\u636E\u683C\u5F0F\u65E0\u6548");
  const type = header.match(/^data:([^;]+)/)?.[1] ?? "image/png";
  const binary = atob(payload);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const blob = new Blob([bytes], { type });
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

// src/core/html.ts
function escapeHtml2(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escapeAttr(value) {
  return escapeHtml2(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// src/platforms/rednote/domPaginate.ts
function contentOverflows(content) {
  if (content.scrollHeight > content.clientHeight + 1) return true;
  const boundary = content.getBoundingClientRect().bottom;
  return Array.from(content.children).some((child) => child.getBoundingClientRect().bottom > boundary + 0.5);
}
function movableContentNodes(content) {
  const children = Array.from(content.children);
  return children.filter((child, index) => !(index === 0 && /H[12]/.test(child.tagName)));
}
function firstBodyNode(content) {
  const first = content.firstElementChild;
  return first && /H[12]/.test(first.tagName) ? first.nextSibling : first;
}
function compactTableToFit(content, table2) {
  for (const className of ["is-compact", "is-dense"]) {
    if (!table2.hasClass(className)) table2.addClass(className);
    if (!contentOverflows(content)) return true;
  }
  return !contentOverflows(content);
}
function splitElementToFit(content, element) {
  const original = element.cloneNode(true);
  const structuredSuffix = splitStructuredElementToFit(content, element, original);
  if (structuredSuffix) return structuredSuffix;
  if (!canSplitByText(original)) return void 0;
  const textLength = textNodes(original).reduce((total, node) => total + (node.textContent?.length ?? 0), 0);
  if (textLength < 2) return void 0;
  let candidate = element;
  let low = 1;
  let high = textLength - 1;
  let best = 0;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const prefix2 = cloneTextRange(original, 0, middle);
    candidate.replaceWith(prefix2);
    candidate = prefix2;
    if (contentOverflows(content)) {
      high = middle - 1;
    } else {
      best = middle;
      low = middle + 1;
    }
  }
  if (!best) {
    candidate.replaceWith(element);
    return void 0;
  }
  const safeBoundary = findSafeTextBoundary(original.textContent || "", best);
  const prefix = cloneTextRange(original, 0, safeBoundary);
  const suffix = cloneTextRange(original, safeBoundary, textLength);
  candidate.replaceWith(prefix);
  if (contentOverflows(content) || !(prefix.textContent || "").trim() || !(suffix.textContent || "").trim()) {
    prefix.replaceWith(element);
    return void 0;
  }
  return suffix;
}
function splitStructuredElementToFit(content, element, original) {
  if (original.instanceOf(HTMLTableElement)) return splitTableToFit(content, element, original);
  if (original.instanceOf(HTMLUListElement) || original.instanceOf(HTMLOListElement)) return splitListToFit(content, element, original);
  return void 0;
}
function splitTableToFit(content, element, original) {
  const rowCount = tableBodyRows(original).length;
  if (rowCount < 2) return void 0;
  return findStructuredSplit(content, element, rowCount, (start, end) => {
    const clone = original.cloneNode(true);
    const rows = tableBodyRows(clone);
    rows.forEach((row, index) => {
      if (index < start || index >= end) row.remove();
    });
    return clone;
  }, true);
}
function splitListToFit(content, element, original) {
  const itemCount = directListItems(original).length;
  if (itemCount < 2) return void 0;
  const orderedStart = original.instanceOf(HTMLOListElement) ? original.start : 1;
  return findStructuredSplit(content, element, itemCount, (start, end) => {
    const clone = original.cloneNode(false);
    directListItems(original).slice(start, end).forEach((item) => clone.appendChild(item.cloneNode(true)));
    if (clone.instanceOf(HTMLOListElement) && start > 0) clone.start = clone.reversed ? orderedStart - start : orderedStart + start;
    return clone;
  });
}
function findStructuredSplit(content, element, itemCount, cloneRange, forceFirstItem = false) {
  let candidate = element;
  let low = 1;
  let high = itemCount - 1;
  let best = 0;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const prefix2 = cloneRange(0, middle);
    candidate.replaceWith(prefix2);
    candidate = prefix2;
    if (contentOverflows(content)) {
      high = middle - 1;
    } else {
      best = middle;
      low = middle + 1;
    }
  }
  if (!best) {
    if (forceFirstItem) {
      const prefix2 = cloneRange(0, 1);
      const suffix2 = cloneRange(1, itemCount);
      candidate.replaceWith(prefix2);
      prefix2.addClass("is-forced-row");
      return suffix2;
    }
    candidate.replaceWith(element);
    return void 0;
  }
  const prefix = cloneRange(0, best);
  const suffix = cloneRange(best, itemCount);
  candidate.replaceWith(prefix);
  if (contentOverflows(content)) {
    prefix.replaceWith(element);
    return void 0;
  }
  return suffix;
}
function tableBodyRows(table2) {
  return Array.from(table2.tBodies).flatMap((body) => Array.from(body.rows));
}
function directListItems(list2) {
  return Array.from(list2.children).filter((child) => child.instanceOf(HTMLLIElement));
}
function canSplitByText(element) {
  return /^(P|PRE|BLOCKQUOTE|DIV)$/.test(element.tagName);
}
function findSafeTextBoundary(text2, maximum) {
  const floor2 = Math.max(1, maximum - 48);
  for (let index = maximum; index >= floor2; index -= 1) {
    if (/[\s，。！？；、,.!?;：:）)\]}]/.test(text2[index - 1] || "")) return index;
  }
  return maximum;
}
function cloneTextRange(source, start, end) {
  const clone = source.cloneNode(false);
  const nodes = textNodes(source);
  if (!nodes.length || start >= end) return clone;
  const range = document.createRange();
  const startPoint = textOffsetPoint(nodes, start);
  const endPoint = textOffsetPoint(nodes, end);
  range.setStart(startPoint.node, startPoint.offset);
  range.setEnd(endPoint.node, endPoint.offset);
  clone.appendChild(range.cloneContents());
  return clone;
}
function textNodes(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    nodes.push(node);
    node = walker.nextNode();
  }
  return nodes;
}
function textOffsetPoint(nodes, offset) {
  let remaining = offset;
  for (const node of nodes) {
    const length = node.textContent?.length ?? 0;
    if (remaining <= length) return { node, offset: remaining };
    remaining -= length;
  }
  const last = nodes[nodes.length - 1];
  return { node: last, offset: last.textContent?.length ?? 0 };
}

// src/platforms/rednote/paginate.ts
function splitByHeading(markdown3, level) {
  const lines = markdown3.split("\n");
  const pages = [];
  let current = [];
  let fence2;
  const heading2 = new RegExp(`^ {0,3}#{${level}}(?!#)[ \\t]+.+?(?:[ \\t]+#+)?[ \\t]*$`);
  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(```|~~~)/)?.[1];
    if (fenceMatch) fence2 = fence2 ? fence2 === fenceMatch ? void 0 : fence2 : fenceMatch;
    if (!fence2 && heading2.test(line) && current.some((item) => item.trim())) {
      pages.push(current.join("\n").trim());
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.some((item) => item.trim())) pages.push(current.join("\n").trim());
  return (pages.length ? pages : [markdown3]).flatMap(splitByHorizontalRule);
}
function splitByHorizontalRule(page) {
  const lines = page.split("\n");
  const heading2 = lines.find((line) => /^ {0,3}#{1,2}(?!#)[ \t]+/.test(line));
  const result = [];
  let current = [];
  let fence2;
  for (const line of lines) {
    const fenceMatch = line.match(/^ {0,3}(```|~~~)/)?.[1];
    if (fenceMatch) fence2 = fence2 ? fence2 === fenceMatch ? void 0 : fence2 : fenceMatch;
    const isRule = !fence2 && /^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(line);
    if (isRule && current.some((item) => item.trim())) {
      result.push(current.join("\n").trim());
      current = heading2 ? [heading2] : [];
    } else current.push(line);
  }
  if (current.some((item) => item.trim()) && !(current.length === 1 && current[0] === heading2)) result.push(current.join("\n").trim());
  return result.length ? result : [page];
}

// src/platforms/rednote/presets.ts
var REDNOTE_TEMPLATES = [
  { id: "default", name: "\u9ED8\u8BA4\u6A21\u677F" },
  { id: "notes", name: "\u5907\u5FD8\u5F55" }
];
var REDNOTE_FONTS = [
  { name: "\u9ED8\u8BA4\u5B57\u4F53", value: "Optima-Regular,Optima,PingFangSC-light,PingFangTC-light,'PingFang SC',serif" },
  { name: "\u5B8B\u4F53", value: "SimSun,'Songti SC',serif" },
  { name: "\u9ED1\u4F53", value: "SimHei,'PingFang SC',sans-serif" },
  { name: "\u6977\u4F53", value: "KaiTi,'Kaiti SC',serif" },
  { name: "\u5FAE\u8F6F\u96C5\u9ED1", value: "'Microsoft YaHei','\u5FAE\u8F6F\u96C5\u9ED1',sans-serif" }
];
var REDNOTE_BACKGROUNDS = [
  { id: "", name: "\u8DDF\u968F\u4E3B\u9898", image: "" },
  { id: "paper-grid", name: "\u5185\u7F6E\u80CC\u666F 1 \xB7 \u65B9\u683C\u7EB8", image: svgBackground("#f7f1e8", "#ded2c2", "grid") },
  { id: "pink-wave", name: "\u5185\u7F6E\u80CC\u666F 2 \xB7 \u7C89\u8272\u6D41\u5149", image: svgBackground("#fde8ee", "#f4a8bd", "wave") },
  { id: "blue-paper", name: "\u5185\u7F6E\u80CC\u666F 3 \xB7 \u84DD\u8272\u7EB8\u5F20", image: svgBackground("#e9f2f8", "#a9c9dc", "dots") },
  { id: "green-leaf", name: "\u5185\u7F6E\u80CC\u666F 4 \xB7 \u68EE\u6797\u6D45\u5F71", image: svgBackground("#e7f1e9", "#94b69c", "leaf") },
  { id: "purple-night", name: "\u5185\u7F6E\u80CC\u666F 5 \xB7 \u7D2B\u8272\u661F\u7A7A", image: svgBackground("#242238", "#8e7cc3", "stars") },
  { id: "warm-sun", name: "\u5185\u7F6E\u80CC\u666F 6 \xB7 \u6696\u9633\u6E10\u53D8", image: svgBackground("#fff0cf", "#dc9f55", "sun") }
];
var REDNOTE_IMAGE_SIZE = { id: "1242x1660", name: "3:4 \u9AD8\u6E05\uFF081242\xD71660\uFF09", width: 1242, height: 1660 };
function svgBackground(background, accent, pattern) {
  const patternMarkup = pattern === "grid" ? `<path d="M0 40H800M0 80H800M40 0V800M80 0V800" stroke="${accent}" opacity=".35"/>` : pattern === "dots" ? `<g fill="${accent}" opacity=".4"><circle cx="30" cy="30" r="3"/><circle cx="90" cy="90" r="3"/></g>` : pattern === "stars" ? `<g fill="${accent}" opacity=".65"><circle cx="70" cy="65" r="2"/><circle cx="180" cy="140" r="3"/><circle cx="310" cy="60" r="2"/></g>` : pattern === "leaf" ? `<path d="M40 120C100 20 190 40 220 100C150 130 90 160 40 120ZM580 670C640 570 730 590 760 650C690 680 630 710 580 670Z" fill="${accent}" opacity=".25"/>` : pattern === "sun" ? `<circle cx="650" cy="120" r="180" fill="${accent}" opacity=".25"/><circle cx="80" cy="700" r="230" fill="${accent}" opacity=".15"/>` : `<path d="M-20 180C180 40 340 300 820 80V240C380 460 180 180-20 340Z" fill="${accent}" opacity=".25"/>`;
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="${background}"/>${patternMarkup}</svg>`)}`;
}

// src/platforms/rednote/adapter.ts
var markdown = new lib_default({ html: false, linkify: true, typographer: true });
var PREVIEW_WIDTH = 450;
var TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
var layoutPromises = /* @__PURE__ */ new WeakMap();
var defaultImageRenderer = markdown.renderer.rules.image ?? ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
markdown.renderer.rules.image = (tokens, index, options, env, self) => {
  const srcIndex = tokens[index].attrIndex("src");
  if (srcIndex >= 0) {
    const raw = tokens[index].attrs[srcIndex][1];
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
    }
    tokens[index].attrs[srcIndex][1] = env.resolveImageSrc ? env.resolveImageSrc(decoded) : decoded;
    tokens[index].attrSet("data-noterelay-source", decoded);
    const imageIndex = env.imageIndex ?? 0;
    tokens[index].attrSet("data-noterelay-image-key", `${env.sectionIndex ?? 0}:${imageIndex}:${decoded}`);
    env.imageIndex = imageIndex + 1;
    tokens[index].attrSet("loading", "eager");
  }
  return defaultImageRenderer(tokens, index, options, env, self);
};
var RednoteAdapter = class {
  id = "rednote";
  label = "\u5C0F\u7EA2\u4E66";
  render(context) {
    const { note, account, settings } = context;
    const imageSize = REDNOTE_IMAGE_SIZE;
    const resolvedMarkdown = replaceAccountVariables(note.markdown, account);
    const pages = splitByHeading(resolvedMarkdown, settings.rednoteSplitHeading);
    const previewHeight = Math.round(PREVIEW_WIDTH * imageSize.height / imageSize.width);
    const root = createDiv();
    root.className = `noterelay-rednote noterelay-themed is-template-${settings.rednoteTemplateId}`;
    root.dataset.activeIndex = "0";
    const cards = createDiv();
    cards.className = "noterelay-rednote-cards";
    pages.forEach((page, index) => cards.appendChild(this.createCard(page, index, index, context, previewHeight)));
    const copyButtonHost = createDiv();
    setSanitizedHtml(copyButtonHost, copyIconButton());
    cards.append(...Array.from(copyButtonHost.childNodes));
    const nav = createDiv();
    nav.className = "noterelay-card-nav";
    setSanitizedHtml(nav, `<button type="button" data-direction="prev" aria-label="\u4E0A\u4E00\u9875">\u2190</button><span>${pages.length ? 1 : 0} / ${pages.length}</span><button type="button" data-direction="next" aria-label="\u4E0B\u4E00\u9875">\u2192</button>`);
    nav.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-direction]");
      if (!button) return;
      const total = cards.querySelectorAll("[data-card-index]").length;
      const current = Number(root.dataset.activeIndex || 0);
      const next = button.dataset.direction === "next" ? Math.min(total - 1, current + 1) : Math.max(0, current - 1);
      root.dataset.activeIndex = String(next);
      cards.querySelectorAll("[data-card-index]").forEach((item, itemIndex) => item.toggleClass("is-active", itemIndex === next));
      const label = nav.querySelector("span");
      if (label) label.textContent = `${next + 1} / ${total}`;
      this.updateNavigation(nav, next, total);
    });
    this.updateNavigation(nav, 0, pages.length);
    root.append(cards);
    this.attachImageControls(root, context);
    root.append(nav);
    root.querySelectorAll("img").forEach((image2) => {
      if (!image2.complete) image2.addEventListener("load", () => void this.ensureLayout(root, context).catch(() => void 0), { once: true });
    });
    window.requestAnimationFrame(() => void this.ensureLayout(root, context).catch(() => void 0));
    return root;
  }
  async copy(context, root) {
    await this.ensureLayout(root, context);
    await copyPng(await this.renderCurrentPng(root, context));
    return "\u5F53\u524D\u5C0F\u7EA2\u4E66\u5361\u7247\u5DF2\u590D\u5236\u4E3A PNG";
  }
  async downloadCurrent(context, root) {
    await this.ensureLayout(root, context);
    const active = Number(root.dataset.activeIndex || 0);
    downloadDataUrl(await this.renderCurrentPng(root, context), `${safeName(context.note.title)}-${active + 1}.png`);
    return "\u5F53\u524D\u9875\u5DF2\u4E0B\u8F7D";
  }
  async downloadAll(context, root) {
    await this.ensureLayout(root, context);
    const cards = Array.from(root.querySelectorAll(".noterelay-rednote-card"));
    if (!cards.length) throw new Error("\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u5361\u7247");
    const files = {};
    for (let index = 0; index < cards.length; index += 1) {
      const dataUrl = await this.renderCardPng(cards[index], context);
      const base64 = dataUrl.split(",", 2)[1];
      if (!base64) throw new Error(`\u7B2C ${index + 1} \u9875\u56FE\u7247\u6570\u636E\u65E0\u6548`);
      files[`${safeName(context.note.title)}-${String(index + 1).padStart(2, "0")}.png`] = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    }
    const blob = new Blob([zipSync(files, { level: 6 })], { type: "application/zip" });
    downloadBlob(blob, `${safeName(context.note.title)}-\u5168\u90E8\u9875\u9762.zip`);
    return `\u5DF2\u5C06 ${cards.length} \u9875\u56FE\u7247\u6253\u5305\u5BFC\u51FA`;
  }
  async renderCurrentPng(root, context) {
    const card = root.querySelector(".noterelay-rednote-card.is-active");
    if (!card) throw new Error("\u627E\u4E0D\u5230\u5F53\u524D\u5C0F\u7EA2\u4E66\u5361\u7247");
    return this.renderCardPng(card, context);
  }
  createCard(page, index, sectionIndex, context, previewHeight) {
    const { account, settings, theme } = context;
    const tokens = theme.tokens;
    const imageSize = REDNOTE_IMAGE_SIZE;
    const card = createEl("article");
    card.className = `noterelay-rednote-card red-image-preview${index === 0 ? " is-active" : ""}`;
    card.dataset.cardIndex = String(index);
    card.dataset.sectionIndex = String(sectionIndex);
    card.dataset.exportWidth = String(imageSize.width);
    card.dataset.exportHeight = String(imageSize.height);
    card.setCssProps({
      "--nr-card-width": `${PREVIEW_WIDTH}px`,
      "--nr-card-height": `${previewHeight}px`,
      "--nr-card-padding": `${tokens.cardPadding}px`,
      "--nr-card-background": settings.rednoteBackgroundImage ? "transparent" : tokens.background,
      "--nr-card-text": tokens.text,
      "--nr-card-font": settings.rednoteFontFamily,
      "--nr-card-font-size": `${settings.rednoteFontSize}px`,
      "--nr-card-line-height": String(tokens.lineHeight),
      "--nr-card-radius": `${tokens.radius}px`,
      "--nr-accent": tokens.accent,
      "--nr-surface": tokens.surface,
      "--nr-border": tokens.border,
      "--nr-muted": tokens.muted,
      "--nr-title": tokens.title ?? tokens.text,
      "--nr-code": tokens.code ?? tokens.surface,
      "--nr-quote-background": tokens.quoteBackground ?? "transparent",
      "--nr-card-shadow": tokens.glow ?? "0 4px 12px rgba(0,0,0,.1)"
    });
    const background = renderCardBackground(settings.rednoteBackgroundImage, settings.rednoteBackgroundScale, settings.rednoteBackgroundPosition);
    setSanitizedHtml(card, `${background}${renderCardHeader(settings.rednoteTemplateId, account?.name ?? "\u521B\u4F5C\u8005", account?.handle ?? "", account?.avatarUrl ?? "")}<section class="red-preview-content"><main class="noterelay-card-content red-content-section red-section-active">${markdown.render(page, { resolveImageSrc: context.resolveImageSrc, imageIndex: 0, sectionIndex })}</main></section>${renderCardFooter(settings.rednoteTemplateId, account?.signature || "\u591C\u534A\u8FC7\u540E\uFF0C\u5149\u660E\u4FBF\u542F\u7A0B", account?.handle || "\u6B22\u8FCE\u5173\u6CE8", account?.name || "\u521B\u4F5C\u8005")}`);
    const overrides = context.notePath ? settings.rednoteImageWidths[context.notePath] : void 0;
    const radii = context.notePath ? settings.rednoteImageRadii[context.notePath] : void 0;
    card.querySelectorAll(".noterelay-card-content img[data-noterelay-image-key]").forEach((image2) => {
      const imageKey = image2.dataset.noterelayImageKey || "";
      const width = overrides?.[imageKey];
      if (Number.isFinite(width)) this.applyImageWidth(image2, width);
      this.applyImageRadius(image2, radii?.[imageKey] ?? 0);
    });
    return card;
  }
  ensureLayout(root, context) {
    const existing = layoutPromises.get(root);
    if (existing) return existing;
    const promise = (async () => {
      if (!root.isConnected) await nextAnimationFrame();
      await document.fonts?.ready;
      await waitForImages(root);
      if (root.dataset.layoutBalanced === "true") return;
      this.balanceCards(root, context);
      root.dataset.layoutBalanced = "true";
      if (context.rednoteFocusImageKey) this.revealImage(root, context.rednoteFocusImageKey);
      root.dispatchEvent(new CustomEvent("noterelay-rednote-layout"));
    })();
    layoutPromises.set(root, promise);
    void promise.then(
      () => {
        if (layoutPromises.get(root) === promise) layoutPromises.delete(root);
      },
      () => {
        if (layoutPromises.get(root) === promise) layoutPromises.delete(root);
      }
    );
    return promise;
  }
  balanceCards(root, context) {
    const host = root.querySelector(".noterelay-rednote-cards");
    const nav = root.querySelector(".noterelay-card-nav");
    if (!host) return;
    let cardIndex = 0;
    let operations = 0;
    while (cardIndex < host.querySelectorAll(".noterelay-rednote-card").length && operations < 500) {
      const cards2 = Array.from(host.querySelectorAll(".noterelay-rednote-card"));
      const card = cards2[cardIndex];
      card.addClass("is-measuring");
      const content = card.querySelector(".noterelay-card-content");
      this.applyContentSafeHeight(card);
      while (content && contentOverflows(content) && operations < 500) {
        operations += 1;
        const bodyNodes = movableContentNodes(content);
        if (!bodyNodes.length) break;
        const last = bodyNodes[bodyNodes.length - 1];
        const isTable = last.instanceOf(HTMLTableElement);
        const hasOnlySectionHeadingsBefore = bodyNodes.slice(0, -1).every((node) => /^H[3-6]$/.test(node.tagName));
        const canFillCurrentCard = bodyNodes.length === 1 || isTable && hasOnlySectionHeadingsBefore;
        let overflowNode;
        if (isTable && canFillCurrentCard && compactTableToFit(content, last)) continue;
        if (canFillCurrentCard) overflowNode = splitElementToFit(content, last);
        if (canFillCurrentCard && !overflowNode) {
          last.addClass("is-overflow-fallback");
          break;
        }
        if (!overflowNode) {
          overflowNode = last;
          overflowNode.remove();
        }
        const nextCard = this.ensureContinuationCard(host, card, context);
        const nextContent = nextCard.querySelector(".noterelay-card-content");
        if (!nextContent) break;
        nextContent.insertBefore(overflowNode, firstBodyNode(nextContent));
        const trailing = movableContentNodes(content).at(-1);
        if (trailing && /^H[3-6]$/.test(trailing.tagName)) {
          trailing.remove();
          nextContent.insertBefore(trailing, firstBodyNode(nextContent));
        }
      }
      card.removeClass("is-measuring");
      cardIndex += 1;
    }
    const cards = Array.from(host.querySelectorAll(".noterelay-rednote-card"));
    cards.forEach((card, index) => {
      card.dataset.cardIndex = String(index);
      card.toggleClass("is-active", index === Number(root.dataset.activeIndex || 0));
    });
    const active = Math.min(Number(root.dataset.activeIndex || 0), Math.max(0, cards.length - 1));
    root.dataset.activeIndex = String(active);
    const label = nav?.querySelector("span");
    if (label) label.textContent = `${active + 1} / ${cards.length}`;
    if (nav) this.updateNavigation(nav, active, cards.length);
  }
  applyContentSafeHeight(card) {
    const content = card.querySelector(".noterelay-card-content");
    const footer = card.querySelector(".red-preview-footer");
    if (!content || !footer) return;
    footer.removeClass("is-wrapping");
    if (footer.scrollWidth > footer.clientWidth + 1) footer.addClass("is-wrapping");
    content.style.removeProperty("height");
    const layoutHeight = content.clientHeight;
    const footerSafeHeight = Math.floor(footer.getBoundingClientRect().top - content.getBoundingClientRect().top - 8);
    content.style.height = `${Math.max(1, Math.min(layoutHeight, footerSafeHeight))}px`;
  }
  ensureContinuationCard(host, current, context) {
    const sectionIndex = current.dataset.sectionIndex || "0";
    const next = current.nextElementSibling;
    if (next instanceof HTMLElement && next.matches(".noterelay-rednote-card") && next.dataset.sectionIndex === sectionIndex) return next;
    const total = host.querySelectorAll(".noterelay-rednote-card").length;
    const previewHeight = Math.round(PREVIEW_WIDTH * REDNOTE_IMAGE_SIZE.height / REDNOTE_IMAGE_SIZE.width);
    const card = this.createCard("", total, Number(sectionIndex), context, previewHeight);
    card.removeClass("is-active");
    const sourceHeading = current.querySelector(".noterelay-card-content > h1, .noterelay-card-content > h2");
    const target = card.querySelector(".noterelay-card-content");
    if (sourceHeading && target) {
      const heading2 = sourceHeading.cloneNode(true);
      const sectionCards = Array.from(host.querySelectorAll(`.noterelay-rednote-card[data-section-index="${sectionIndex}"]`));
      const baseTitle = (sourceHeading.textContent || "").replace(/（续(?:\s*\d+)?）$/, "");
      heading2.textContent = `${baseTitle}\uFF08\u7EED${sectionCards.length > 1 ? ` ${sectionCards.length}` : ""}\uFF09`;
      target.appendChild(heading2);
    }
    host.insertBefore(card, next);
    return card;
  }
  async renderCardPng(card, context) {
    const wasActive = card.hasClass("is-active");
    const selectedImages = Array.from(card.querySelectorAll("[data-noterelay-selected]"));
    selectedImages.forEach((image2) => image2.removeAttribute("data-noterelay-selected"));
    card.addClass("is-active");
    let restoreImages = () => {
    };
    try {
      await waitForImages(card);
      restoreImages = await inlineImagesForExport(card, context);
      const exportWidth = Number(card.dataset.exportWidth || PREVIEW_WIDTH);
      return await toPng(card, {
        pixelRatio: exportWidth / PREVIEW_WIDTH,
        cacheBust: false,
        backgroundColor: context.theme.tokens.background,
        imagePlaceholder: TRANSPARENT_PIXEL,
        onImageErrorHandler: () => void 0,
        filter: (node) => !(node.instanceOf(HTMLElement) && node.hasAttribute("data-rednote-copy"))
      });
    } finally {
      restoreImages();
      selectedImages.forEach((image2) => image2.setAttribute("data-noterelay-selected", ""));
      card.toggleClass("is-active", wasActive);
    }
  }
  updateNavigation(nav, active, total) {
    const prev = nav.querySelector("button[data-direction=prev]");
    const next = nav.querySelector("button[data-direction=next]");
    if (prev) prev.disabled = active <= 0;
    if (next) next.disabled = active >= total - 1;
  }
  attachImageControls(root, context) {
    const images = Array.from(root.querySelectorAll(".noterelay-card-content img[data-noterelay-image-key]"));
    if (!images.length) return;
    images.forEach((image2) => image2.addClass("is-adjustable-image"));
    const controls = createDiv({ cls: "noterelay-image-controls" });
    controls.createSpan({ cls: "noterelay-image-controls-label", text: "\u56FE\u7247" });
    const selector = controls.createEl("select", { attr: { "aria-label": "\u9009\u62E9\u6B63\u6587\u56FE\u7247", "data-rednote-image-select": "true" } });
    images.forEach((image2, index) => {
      const source = image2.dataset.noterelaySource || image2.alt || `\u56FE\u7247 ${index + 1}`;
      const filename = source.split(/[\\/]/).pop()?.replace(/[?#].*$/, "") || `\u56FE\u7247 ${index + 1}`;
      selector.createEl("option", { value: image2.dataset.noterelayImageKey || "", text: `${index + 1}. ${image2.alt || filename}` });
    });
    const autoButton = controls.createEl("button", { text: "\u81EA\u9002\u5E94", attr: { type: "button" } });
    const presets = [50, 75, 100].map((width) => controls.createEl("button", { text: `${width}%`, attr: { type: "button", "data-image-width": String(width) } }));
    controls.createSpan({ cls: "noterelay-image-control-row-label", text: "\u5BBD\u5EA6" });
    const slider = controls.createEl("input", { type: "range", attr: { min: "30", max: "100", step: "5", "aria-label": "\u56FE\u7247\u5BBD\u5EA6" } });
    const value = controls.createSpan({ cls: "noterelay-image-width-value" });
    controls.createSpan({ cls: "noterelay-image-control-row-label", text: "\u5706\u89D2" });
    const radiusSlider = controls.createEl("input", { type: "range", attr: { min: "0", max: "32", step: "1", "aria-label": "\u56FE\u7247\u5706\u89D2" } });
    const radiusValue = controls.createSpan({ cls: "noterelay-image-radius-value" });
    root.appendChild(controls);
    const noteOverrides = () => context.notePath ? context.settings.rednoteImageWidths[context.notePath] : void 0;
    const noteRadii = () => context.notePath ? context.settings.rednoteImageRadii[context.notePath] : void 0;
    const selectedImage = () => root.querySelector(`.noterelay-card-content img[data-noterelay-image-key="${CSS.escape(selector.value)}"]`);
    const measuredWidths = /* @__PURE__ */ new Map();
    const updateWidthStatus = () => {
      const image2 = selectedImage();
      if (!image2) return;
      const requested = noteOverrides()?.[selector.value];
      const actual = this.effectiveImageWidth(image2);
      if (actual !== void 0) measuredWidths.set(selector.value, actual);
      const displayedActual = actual ?? measuredWidths.get(selector.value);
      if (typeof requested === "number" && Number.isFinite(requested)) {
        slider.value = String(requested);
        value.textContent = displayedActual !== void 0 && Math.abs(displayedActual - requested) >= 2 ? `${requested}% \xB7 \u5B9E\u9645 ${displayedActual}%` : `${requested}%`;
      } else {
        if (displayedActual !== void 0) slider.value = String(displayedActual);
        value.textContent = displayedActual !== void 0 ? `\u81EA\u9002\u5E94 \xB7 ${displayedActual}%` : "\u81EA\u9002\u5E94";
      }
    };
    const scheduleWidthStatus = () => {
      window.requestAnimationFrame(() => window.requestAnimationFrame(updateWidthStatus));
    };
    const selectImage = (imageKey) => {
      selector.value = imageKey;
      images.forEach((image2) => image2.toggleAttribute("data-noterelay-selected", image2.dataset.noterelayImageKey === imageKey));
      updateWidthStatus();
      const radius = noteRadii()?.[imageKey] ?? 0;
      radiusSlider.value = String(radius);
      radiusValue.textContent = `${radius}px`;
    };
    const previewWidth = (width) => {
      const image2 = selectedImage();
      if (!image2) return;
      if (width === void 0) this.applyImageWidth(image2);
      else this.applyImageWidth(image2, width);
      value.textContent = width === void 0 ? "\u81EA\u9002\u5E94" : `${width}%`;
    };
    const commitWidth = (width) => {
      const save = context.onRednoteImageWidthChange?.(selector.value, width);
      if (save) void save.then(scheduleWidthStatus, scheduleWidthStatus);
      else scheduleWidthStatus();
    };
    const previewRadius = (radius) => {
      const image2 = selectedImage();
      if (!image2) return;
      this.applyImageRadius(image2, radius);
      radiusValue.textContent = `${radius}px`;
    };
    const commitRadius = (radius) => void context.onRednoteImageRadiusChange?.(selector.value, radius);
    images.forEach((image2) => image2.addEventListener("click", () => {
      selectImage(image2.dataset.noterelayImageKey || "");
      this.revealImage(root, image2.dataset.noterelayImageKey || "");
      scheduleWidthStatus();
    }));
    selector.addEventListener("change", () => {
      selectImage(selector.value);
      this.revealImage(root, selector.value);
      scheduleWidthStatus();
    });
    autoButton.addEventListener("click", () => {
      previewWidth();
      commitWidth();
    });
    presets.forEach((button) => button.addEventListener("click", () => {
      const width = Number(button.dataset.imageWidth);
      slider.value = String(width);
      previewWidth(width);
      commitWidth(width);
    }));
    slider.addEventListener("input", () => previewWidth(Number(slider.value)));
    slider.addEventListener("change", () => commitWidth(Number(slider.value)));
    radiusSlider.addEventListener("input", () => previewRadius(Number(radiusSlider.value)));
    radiusSlider.addEventListener("change", () => commitRadius(Number(radiusSlider.value)));
    images.forEach((image2) => {
      image2.addEventListener("load", scheduleWidthStatus, { once: true });
      if (image2.complete) scheduleWidthStatus();
    });
    root.addEventListener("noterelay-rednote-layout", scheduleWidthStatus);
    const initialImageKey = context.rednoteFocusImageKey && images.some((image2) => image2.dataset.noterelayImageKey === context.rednoteFocusImageKey) ? context.rednoteFocusImageKey : images[0].dataset.noterelayImageKey || "";
    selectImage(initialImageKey);
    this.revealImage(root, initialImageKey);
    scheduleWidthStatus();
  }
  applyImageWidth(image2, width) {
    if (width === void 0) {
      image2.style.removeProperty("--nr-image-width");
      image2.removeClass("has-custom-size");
      return;
    }
    image2.setCssProps({ "--nr-image-width": `${Math.max(30, Math.min(100, width))}%` });
    image2.addClass("has-custom-size");
  }
  applyImageRadius(image2, radius) {
    image2.setCssProps({ "--nr-image-radius": `${Math.max(0, Math.min(32, radius))}px` });
  }
  effectiveImageWidth(image2) {
    const content = image2.closest(".noterelay-card-content");
    const imageWidth = image2.getBoundingClientRect().width;
    const contentWidth = content?.getBoundingClientRect().width ?? 0;
    if (imageWidth <= 0 || contentWidth <= 0) return void 0;
    return Math.max(1, Math.min(100, Math.round(imageWidth / contentWidth * 100)));
  }
  revealImage(root, imageKey) {
    const image2 = root.querySelector(`.noterelay-card-content img[data-noterelay-image-key="${CSS.escape(imageKey)}"]`);
    const card = image2?.closest(".noterelay-rednote-card");
    if (!card) return;
    const cards = Array.from(root.querySelectorAll(".noterelay-rednote-card"));
    const active = cards.indexOf(card);
    if (active < 0) return;
    root.dataset.activeIndex = String(active);
    cards.forEach((item, index) => item.toggleClass("is-active", index === active));
    const nav = root.querySelector(".noterelay-card-nav");
    const label = nav?.querySelector("span");
    if (label) label.textContent = `${active + 1} / ${cards.length}`;
    if (nav) this.updateNavigation(nav, active, cards.length);
  }
};
function nextAnimationFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}
function renderCardHeader(template, name, handle, avatarUrl) {
  if (template === "notes") return `<header class="red-preview-header red-notes-header"><section class="red-notes-bar"><span class="red-notes-title"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg><span>\u5907\u5FD8\u5F55</span></span><span class="red-notes-actions"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></span><span class="red-notes-more"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></span></section></header>`;
  const avatar = avatarUrl ? `<img src="${escapeAttr(avatarUrl)}" alt="\u7528\u6237\u5934\u50CF">` : `<span class="red-avatar-placeholder"><span class="red-avatar-upload-icon">\u{1F4F7}</span></span>`;
  const userId = handle.trim() ? `<small class="red-user-id">${escapeHtml2(handle.trim())}</small>` : "";
  return `<header class="red-preview-header"><section class="red-user-info"><section class="red-user-left"><span class="red-user-avatar">${avatar}</span><span class="red-user-meta${userId ? "" : " is-name-only"}"><span class="red-user-name-container"><strong class="red-user-name">${escapeHtml2(name)}</strong><span class="red-verified-icon">\u2713</span></span>${userId}</span></section><span class="red-user-right"><small class="red-post-time">${escapeHtml2((/* @__PURE__ */ new Date()).toLocaleDateString("zh-CN"))}</small></span></section></header>`;
}
function renderCardFooter(template, left, right, authorName) {
  if (template === "notes") return `<footer class="red-preview-footer red-notes-footer"><span class="red-notes-author">${escapeHtml2(authorName)}</span></footer>`;
  return `<footer class="red-preview-footer"><span class="red-footer-text">${escapeHtml2(left)}</span><span class="red-footer-separator">|</span><span class="red-footer-text">${escapeHtml2(right)}</span></footer>`;
}
function copyIconButton() {
  return `<button type="button" class="red-copy-button" data-rednote-copy aria-label="\u590D\u5236\u56FE\u7247\u5230\u526A\u8D34\u677F" title="\u590D\u5236\u56FE\u7247"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 12.4316V7.8125C13 6.2592 14.2592 5 15.8125 5H40.1875C41.7408 5 43 6.2592 43 7.8125V32.1875C43 33.7408 41.7408 35 40.1875 35H35.5163" stroke="#9b9b9b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M32.1875 13H7.8125C6.2592 13 5 14.2592 5 15.8125V40.1875C5 41.7408 6.2592 43 7.8125 43H32.1875C33.7408 43 35 41.7408 35 40.1875V15.8125C35 14.2592 33.7408 13 32.1875 13Z" fill="none" stroke="#9b9b9b" stroke-width="4" stroke-linejoin="round"/></svg></button>`;
}
function renderCardBackground(image2, scale, position) {
  if (!image2) return "";
  const safeImage = escapeAttr(image2);
  const safeScale = Math.max(1, Math.min(2, scale));
  const x = Number.isFinite(position.x) ? position.x : 0;
  const y = Number.isFinite(position.y) ? position.y : 0;
  return `<span class="red-card-background" style="background-image:url(&quot;${safeImage}&quot;);transform:translate(${x}px,${y}px) scale(${safeScale})"></span>`;
}
function downloadDataUrl(dataUrl, filename) {
  const link2 = createEl("a");
  link2.href = dataUrl;
  link2.download = filename;
  document.body.appendChild(link2);
  link2.click();
  link2.remove();
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link2 = createEl("a");
  link2.href = url;
  link2.download = filename;
  document.body.appendChild(link2);
  link2.click();
  link2.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(images.map(async (image2) => {
    if (image2.complete) return;
    await Promise.race([
      image2.decode().catch(() => void 0),
      new Promise((resolve) => window.setTimeout(resolve, 3e3))
    ]);
  }));
}
async function inlineImagesForExport(root, context) {
  const changed = [];
  try {
    for (const image2 of Array.from(root.querySelectorAll("img"))) {
      const originalSrc = image2.src;
      if (!originalSrc || originalSrc.startsWith("data:")) continue;
      const source = image2.dataset.noterelaySource || originalSrc;
      let dataUrl;
      try {
        dataUrl = await context.resolveImageDataUrl?.(source);
      } catch {
      }
      if (!dataUrl) {
        try {
          dataUrl = await fetchImageAsDataUrl(originalSrc);
        } catch {
        }
      }
      if (!dataUrl) {
        try {
          dataUrl = imageToCanvasDataUrl(image2);
        } catch {
        }
      }
      const isAvatar = Boolean(image2.closest(".red-user-avatar"));
      if (!dataUrl && isAvatar) dataUrl = TRANSPARENT_PIXEL;
      if (!dataUrl) throw new Error(`\u6B63\u6587\u56FE\u7247\u65E0\u6CD5\u5199\u5165\u5BFC\u51FA\u6587\u4EF6\uFF1A${image2.alt || source}`);
      changed.push({ image: image2, src: originalSrc });
      image2.src = dataUrl;
      await image2.decode().catch(() => void 0);
    }
  } catch (error2) {
    changed.forEach(({ image: image2, src }) => {
      image2.src = src;
    });
    throw error2;
  }
  return () => changed.forEach(({ image: image2, src }) => {
    image2.src = src;
  });
}
async function fetchImageAsDataUrl(src) {
  const response = await (0, import_obsidian3.requestUrl)({ url: src, method: "GET" });
  if (response.status < 200 || response.status >= 300) return void 0;
  const type = response.headers["content-type"] ?? "image/png";
  return blobToDataUrl(new Blob([response.arrayBuffer], { type }));
}
function imageToCanvasDataUrl(image2) {
  if (!image2.naturalWidth || !image2.naturalHeight) return void 0;
  const canvas = createEl("canvas");
  canvas.width = image2.naturalWidth;
  canvas.height = image2.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return void 0;
  context.drawImage(image2, 0, 0);
  return canvas.toDataURL("image/png");
}
function safeName(value) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim() || "\u5C0F\u7EA2\u4E66\u5361\u7247";
}

// src/platforms/wechat/wenote/themeCss.ts
var THEMES = [
  {
    id: "moyu-green",
    label: "\u6478\u9C7C\u7EFF",
    accent: "#059669",
    light: "#ECFDF5",
    border: "#A7F3D0",
    title: "#064E3B",
    text: "#334155",
    muted: "#64748B",
    highlight: "#FEF3C7",
    deep: "#064E3B",
    codeBg: "#052E2B",
    signatureBg: "#F0FDF4",
    underlineCss: "border-bottom:2px solid #A7F3D0;font-weight:600;",
    maxWidth: 677,
    layout: "magazine",
    fontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif",
    css: ""
  },
  {
    id: "red-white",
    label: "\u7EA2\u767D\u8272\u7CFB",
    accent: "#DC2626",
    light: "#FEF2F2",
    border: "#FECACA",
    title: "#7F1D1D",
    text: "#333333",
    muted: "#737373",
    highlight: "#FFE4E6",
    deep: "#991B1B",
    codeBg: "#1F1717",
    signatureBg: "#FFF7F7",
    underlineCss: "border-bottom:2px solid #FECACA;font-weight:600;",
    maxWidth: 677,
    layout: "red-editorial",
    fontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif",
    css: ""
  },
  {
    id: "graphite-minimal",
    label: "\u77F3\u58A8\u6781\u7B80\u98CE",
    accent: "#52525B",
    light: "#FAFAFA",
    border: "#E4E4E7",
    title: "#27272A",
    text: "#52525B",
    muted: "#A1A1AA",
    highlight: "#F4F4F5",
    deep: "#27272A",
    codeBg: "#27272A",
    signatureBg: "#FFFFFF",
    underlineCss: "border-bottom:2px solid #52525B;font-weight:600;",
    maxWidth: 677,
    layout: "graphite",
    fontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif",
    css: ""
  },
  {
    id: "zen-whitespace",
    label: "\u7559\u767D\u7985\u610F\u98CE",
    accent: "#4A5D52",
    light: "#EEF3F0",
    border: "#B5C8BC",
    title: "#2B2B2B",
    text: "#525252",
    muted: "#A3A3A3",
    highlight: "#EEF3F0",
    deep: "#3D5046",
    codeBg: "#28342E",
    signatureBg: "#FAF9F4",
    underlineCss: "border-bottom:1.5px solid #B5C8BC;font-weight:500;",
    maxWidth: 677,
    layout: "zen",
    fontFamily: "'Songti SC','Noto Serif SC',Georgia,'Times New Roman',serif",
    css: ""
  },
  {
    id: "moyu-ticket",
    label: "\u6478\u9C7C\u7968\u636E\u98CE",
    accent: "#059669",
    light: "#F0FDF4",
    border: "#A7F3D0",
    title: "#1A1A1A",
    text: "#1F2937",
    muted: "#64748B",
    highlight: "#DCFCE7",
    deep: "#065F46",
    codeBg: "#052E16",
    signatureBg: "#FFFEF8",
    underlineCss: "border-bottom:2px solid #A7F3D0;font-weight:600;",
    maxWidth: 677,
    layout: "ticket",
    fontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif",
    css: ""
  },
  {
    id: "olive-journal",
    label: "\u6A44\u6984\u624B\u8BB0",
    accent: "#ED7B2F",
    light: "#EEEFE9",
    border: "#BFC1B7",
    title: "#23251D",
    text: "#4D4F46",
    muted: "#9EA096",
    highlight: "#EEEFE9",
    deep: "#1E1F23",
    codeBg: "#202124",
    signatureBg: "#FDFDF8",
    underlineCss: "border-bottom:2px solid #ED7B2F;font-weight:600;",
    maxWidth: 677,
    layout: "olive",
    fontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif",
    css: ""
  }
];
function isBuiltInTheme(value) {
  return THEMES.some((theme) => theme.id === value);
}
function getThemeInfo(theme) {
  const fallback = THEMES[0];
  if (!fallback) throw new Error("\u516C\u4F17\u53F7\u4E3B\u9898\u5217\u8868\u4E0D\u80FD\u4E3A\u7A7A");
  return THEMES.find((item) => item.id === theme) ?? fallback;
}

// src/platforms/wechat/wenote/wechatCompat.ts
function makeHtmlWeChatCompatible(html, options = {}) {
  if (typeof document === "undefined") return stripWenoteAttributesFallback(html);
  const content = createSanitizedHost(html);
  makeWenoteWeChatCompatible(content, options);
  if (options.stripInternalAttrs ?? true) {
    content.querySelectorAll("*").forEach(stripElementAttrs);
  }
  return content.innerHTML;
}
function makeWenoteWeChatCompatible(content, options = {}) {
  const shell = content.querySelector('[data-wenote-block="shell"]') ?? content.firstElementChild;
  const containerStyle = shell?.getAttribute("style") || "";
  content.querySelectorAll("*").forEach((element) => {
    normalizeWechatStyle(element);
    preventBoxOverflow(element);
    if (options.safeMode) applySafeMode(element);
  });
  forceTextInheritance(shell ?? content, containerStyle);
  keepCjkPunctuationTogether(shell ?? content);
}
function appendStyle(element, style) {
  for (const declaration2 of style.split(";")) {
    const separator = declaration2.indexOf(":");
    if (separator < 1) continue;
    const property = declaration2.slice(0, separator).trim();
    const value = declaration2.slice(separator + 1).trim();
    if (property && value) element.style.setProperty(property, value);
  }
}
function stripElementAttrs(element) {
  element.removeAttribute("data-wenote-block");
  element.removeAttribute("data-wenote-kind");
  element.removeAttribute("data-noterelay-source");
  element.removeAttribute("class");
  element.removeAttribute("id");
}
function stripWenoteAttributesFallback(html) {
  return html.replace(/\sdata-wenote-block="[^"]*"/g, "").replace(/\sdata-wenote-kind="[^"]*"/g, "").replace(/\sclass="[^"]*"/g, "").replace(/\sid="[^"]*"/g, "");
}
function normalizeWechatStyle(element) {
  const style = element.style;
  removeUnsupportedStyleNames(style);
  if (style.position === "fixed" || style.position === "sticky") style.removeProperty("position");
  if (style.display === "grid" || style.display === "inline-grid") {
    style.setProperty("display", "block");
  }
  if (element.tagName === "A") {
    element.setAttribute("target", "_blank");
  }
}
function removeUnsupportedStyleNames(style) {
  const exact = [
    "align-content",
    "align-self",
    "justify-items",
    "justify-self",
    "order",
    "grid",
    "grid-area",
    "grid-template",
    "grid-template-columns",
    "grid-template-rows",
    "grid-column",
    "grid-row",
    "transform"
  ];
  exact.forEach((name) => style.removeProperty(name));
  for (let index = style.length - 1; index >= 0; index--) {
    const name = style.item(index);
    if (/^(animation|transition)/.test(name)) style.removeProperty(name);
  }
}
function preventBoxOverflow(element) {
  const block2 = element.getAttribute("data-wenote-block");
  const tag = element.tagName;
  if (block2 === "list-marker") {
    appendStyle(element, "display:inline-block;width:30px;min-width:30px;height:26px;padding:0 3px;line-height:26px;box-sizing:border-box;text-align:center;white-space:nowrap;vertical-align:top;");
    return;
  }
  const isMarginBlock = Boolean(block2 && block2 !== "shell" && block2 !== "rule") || ["P", "H1", "H2", "H3", "H4", "H5", "H6", "PRE", "BLOCKQUOTE"].includes(tag);
  if (isMarginBlock) {
    element.style.removeProperty("width");
    element.style.removeProperty("min-width");
    element.style.removeProperty("max-width");
    element.setCssStyles({ boxSizing: "border-box" });
  }
  if (tag === "SECTION" || tag === "DIV" || tag === "P") {
    const overflow = element.style.overflow || "";
    if (overflow === "hidden" || overflow === "auto" || overflow === "scroll") element.setCssStyles({ overflow: "visible" });
    element.style.removeProperty("overflow-x");
    element.style.removeProperty("overflow-y");
  }
}
function applySafeMode(element) {
  element.style.removeProperty("box-shadow");
  element.style.removeProperty("filter");
  element.style.removeProperty("backdrop-filter");
  if (element.tagName === "IMG") {
    appendStyle(element, "display:block;max-width:100%;height:auto;margin-left:auto;margin-right:auto;");
  }
  if (element.tagName === "PRE" || element.tagName === "CODE") {
    appendStyle(element, "white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;");
  }
}
function forceTextInheritance(root, containerStyle) {
  const fontFamily = pickStyleValue(containerStyle, "font-family");
  const lineHeight = pickStyleValue(containerStyle, "line-height");
  const fontSize = pickStyleValue(containerStyle, "font-size");
  const color = pickStyleValue(containerStyle, "color");
  root.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th").forEach((element) => {
    if (element.closest("pre, code") && element.tagName === "SPAN") return;
    if (fontFamily && !element.style.fontFamily) element.style.setProperty("font-family", fontFamily);
    if (lineHeight && !element.style.lineHeight) element.style.setProperty("line-height", lineHeight);
    if (fontSize && !element.style.fontSize && ["P", "LI", "BLOCKQUOTE", "SPAN", "TD", "TH"].includes(element.tagName)) {
      element.style.setProperty("font-size", fontSize);
    }
    if (color && !element.style.color) element.style.setProperty("color", color);
  });
}
function keepCjkPunctuationTogether(root) {
  root.querySelectorAll("strong, b, em, span, a, code").forEach((element) => {
    if (element.getAttribute("data-wenote-block") === "list-marker") return;
    const next = element.nextSibling;
    if (!next || next.nodeType !== Node.TEXT_NODE) return;
    const text2 = next.textContent || "";
    const match2 = text2.match(/^\s*([：；，。！？、:])(.*)$/s);
    if (!match2) return;
    element.appendChild(document.createTextNode(match2[1]));
    if (match2[2]) {
      next.textContent = match2[2];
    } else {
      next.parentNode?.removeChild(next);
    }
  });
}
function pickStyleValue(style, property) {
  const match2 = style.match(new RegExp(`${property}\\s*:\\s*([^;]+)`, "i"));
  return match2?.[1]?.trim() || "";
}

// src/platforms/wechat/wenote/markdownParser.ts
var md = new lib_default({
  html: false,
  linkify: true,
  typographer: false,
  breaks: false
});
function parseMarkdown(input) {
  const { frontmatter, body } = extractFrontmatter(preprocessMarkdown(input.replace(/\r\n?/g, "\n")));
  const normalizedBody = normalizeObsidianSyntax(body);
  const tokens = md.parse(normalizedBody, {});
  return { frontmatter, blocks: tokensToBlocks(tokens) };
}
function tokensToBlocks(tokens) {
  const blocks = [];
  let index = 0;
  while (index < tokens.length) {
    const token = tokens[index];
    if (token.type === "heading_open") {
      const inlineToken = tokens[index + 1];
      blocks.push({
        type: "heading",
        level: Number(token.tag.replace("h", "")) || 2,
        text: inlineToken?.content?.trim() || "",
        html: renderInline(inlineToken?.content || "")
      });
      index += 3;
      continue;
    }
    if (token.type === "paragraph_open") {
      const inlineToken = tokens[index + 1];
      const image2 = singleImageFromInline(inlineToken);
      if (image2) {
        blocks.push(image2);
      } else if (inlineToken?.content?.trim()) {
        blocks.push({ type: "paragraph", text: inlineToken.content.trim(), html: renderInline(inlineToken.content) });
      }
      index = skipUntil(tokens, index, "paragraph_close") + 1;
      continue;
    }
    if (token.type === "bullet_list_open" || token.type === "ordered_list_open") {
      const end = findMatchingClose(tokens, index);
      blocks.push(parseList(tokens.slice(index, end + 1), token.type === "ordered_list_open"));
      index = end + 1;
      continue;
    }
    if (token.type === "blockquote_open") {
      const end = findMatchingClose(tokens, index);
      blocks.push(parseQuoteOrCallout(tokens.slice(index + 1, end)));
      index = end + 1;
      continue;
    }
    if (token.type === "fence" || token.type === "code_block") {
      blocks.push({
        type: "code",
        language: (token.info || "").trim().split(/\s+/)[0] || "",
        code: token.content.replace(/\n$/, "")
      });
      index++;
      continue;
    }
    if (token.type === "table_open") {
      const end = findMatchingClose(tokens, index);
      blocks.push(parseTable(tokens.slice(index, end + 1)));
      index = end + 1;
      continue;
    }
    if (token.type === "hr") {
      blocks.push({ type: "rule" });
      index++;
      continue;
    }
    index++;
  }
  return blocks;
}
function parseList(tokens, ordered) {
  const items = [];
  let depth = 0;
  let currentText = [];
  let currentHtml = [];
  const flush = () => {
    const text2 = currentText.join(" ").replace(/\s+/g, " ").trim();
    const html = currentHtml.join("<br>").trim();
    if (!text2 && !html) return;
    const task = text2.match(/^\[([ xX])]\s+(.+)$/);
    items.push(task ? { text: task[2].trim(), html: stripTaskMarker(html), checked: task[1].toLowerCase() === "x" } : { text: text2, html });
    currentText = [];
    currentHtml = [];
  };
  for (const token of tokens) {
    if (token.type === "list_item_open") {
      if (depth === 0) flush();
      depth++;
      continue;
    }
    if (token.type === "list_item_close") {
      depth--;
      if (depth === 0) flush();
      continue;
    }
    if (depth > 0 && token.type === "inline") {
      currentText.push(token.content);
      currentHtml.push(renderInline(token.content));
    }
  }
  flush();
  return { type: "list", ordered, items };
}
function parseQuoteOrCallout(tokens) {
  const lines = tokens.filter((token) => token.type === "inline").flatMap((token) => token.content.split("\n").map((line) => line.trim())).filter(Boolean);
  const first = lines[0] ?? "";
  const callout = first.match(/^\[!([\w-]+)]\s*([+-])?\s*(.*)$/);
  if (!callout) {
    return { type: "quote", text: lines.join("\n"), html: lines.map(renderInline).join("<br>") };
  }
  const kind = callout[1].toLowerCase();
  const title = callout[3]?.trim() || void 0;
  const attrs = {};
  const bodyLines = [];
  for (const line of lines.slice(1)) {
    const attr = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (attr) {
      attrs[attr[1]] = stripQuotes(attr[2].trim());
    } else {
      bodyLines.push(line);
    }
  }
  return { type: "callout", kind, title, attrs, body: bodyLines.join("\n").trim(), bodyHtml: bodyLines.map(renderInline).join("<br>") };
}
function parseTable(tokens) {
  const headers = [];
  const headerHtml = [];
  const rows = [];
  const rowsHtml = [];
  let inHead = false;
  let inBody = false;
  let currentRow = [];
  let currentRowHtml = [];
  for (const token of tokens) {
    if (token.type === "thead_open") inHead = true;
    if (token.type === "thead_close") inHead = false;
    if (token.type === "tbody_open") inBody = true;
    if (token.type === "tbody_close") inBody = false;
    if (token.type === "tr_open") {
      currentRow = [];
      currentRowHtml = [];
    }
    if (token.type === "inline") {
      if (inHead) {
        headers.push(token.content);
        headerHtml.push(renderInline(token.content));
      } else if (inBody) {
        currentRow.push(token.content);
        currentRowHtml.push(renderInline(token.content));
      }
    }
    if (token.type === "tr_close" && currentRow.length) {
      rows.push(currentRow);
      rowsHtml.push(currentRowHtml);
    }
  }
  return { type: "table", headers, rows, headerHtml, rowsHtml };
}
function singleImageFromInline(token) {
  const children = token?.children ?? [];
  const meaningful = children.filter((child) => child.type !== "softbreak" && child.type !== "hardbreak" && child.content.trim());
  const images = children.filter((child) => child.type === "image");
  if (images.length !== 1) return void 0;
  const image2 = images[0];
  const nonImageText = meaningful.filter((child) => child.type !== "image").map((child) => child.content).join(" ").trim();
  if (meaningful.length > 1 && !nonImageText) return void 0;
  if (meaningful.length > 1 && nonImageText && !token?.content.includes(image2.attrGet?.("src") || "")) return void 0;
  return {
    type: "image",
    src: image2.attrGet?.("src") || attrGet2(image2, "src") || "",
    alt: image2.content || attrGet2(image2, "alt") || "image",
    caption: nonImageText || void 0
  };
}
function renderInline(content) {
  return md.renderInline(content);
}
function stripTaskMarker(html) {
  return html.replace(/^\[[ xX]\]\s+/, "");
}
function skipUntil(tokens, start, closeType) {
  for (let index = start + 1; index < tokens.length; index++) {
    if (tokens[index].type === closeType) return index;
  }
  return start;
}
function findMatchingClose(tokens, start) {
  const open = tokens[start];
  const closeType = open.type.replace(/_open$/, "_close");
  let depth = 0;
  for (let index = start; index < tokens.length; index++) {
    if (tokens[index].type === open.type) depth++;
    if (tokens[index].type === closeType) {
      depth--;
      if (depth === 0) return index;
    }
  }
  return start;
}
function attrGet2(token, name) {
  return token.attrs?.find(([key]) => key === name)?.[1];
}
function preprocessMarkdown(input) {
  return input.replace(/^[ ]{0,3}(\*[ ]*\*[ ]*\*[* ]*)[ \t]*$/gm, "***").replace(/^[ ]{0,3}(-[ ]*-[ ]*-[- ]*)[ \t]*$/gm, "---").replace(/^[ ]{0,3}(_[ ]*_[ ]*_[_ ]*)[ \t]*$/gm, "___").replace(/\*\*[ \t]+\*\*/g, " ").replace(/\*{4,}/g, "");
}
function normalizeObsidianSyntax(input) {
  return input.replace(/!\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_all, src, alt) => `![${alt.trim()}](${markdownImageDestination2(src)})`).replace(/!\[\[([^\]]+)\]\]/g, (_all, src) => `![${src.trim()}](${markdownImageDestination2(src)})`).replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_all, _target, label) => label.trim()).replace(/\[\[([^\]]+)\]\]/g, (_all, label) => label.trim());
}
function markdownImageDestination2(src) {
  const clean = src.trim();
  if (!/[\s()<>]/.test(clean)) return clean;
  return `<${clean.replace(/>/g, "%3E")}>`;
}
function extractFrontmatter(input) {
  if (!input.startsWith("---\n")) return { frontmatter: {}, body: input };
  const end = input.indexOf("\n---", 4);
  if (end === -1) return { frontmatter: {}, body: input };
  const raw = input.slice(4, end).split("\n");
  const frontmatter = {};
  for (const line of raw) {
    const match2 = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match2) continue;
    frontmatter[match2[1]] = stripQuotes(match2[2].trim());
  }
  return { frontmatter, body: input.slice(end + 5).replace(/^\n/, "") };
}
function stripQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

// src/platforms/wechat/wenote/wechatRenderer.ts
var DEFAULT_SETTINGS2 = {
  defaultTheme: "moyu-green",
  accentColor: "#059669",
  contentWidth: 695,
  showCopyWarnings: true,
  customCss: "",
  useCustomCss: false,
  safeMode: true,
  lastPreviewTheme: "moyu-green",
  customCssPresets: [
    { id: "default", name: "\u9ED8\u8BA4\u6837\u5F0F", css: "" }
  ],
  activeCssPresetId: "default",
  authorName: "",
  authorBio: "\u70ED\u8877\u4E8E\u5206\u4EAB AI \u89C2\u5BDF\u4E0E\u5E72\u8D27",
  footerCta: "\u5982\u679C\u4F60\u89C9\u5F97\u4ECA\u5929\u8FD9\u7BC7\u6709\u6536\u83B7\uFF0C\u6B22\u8FCE**\u70B9\u8D5E\u3001\u5728\u770B\u3001\u8F6C\u53D1**\u4E09\u8FDE\uFF0C\u6211\u4EEC\u4E0B\u7BC7\u89C1\u3002",
  articleVariables: "",
  autoSignature: true,
  autoKeywordUnderline: true
};
function renderWechatHtml(markdown3, options = {}) {
  const settings = { ...DEFAULT_SETTINGS2, ...options };
  const parsed = parseMarkdown(markdown3);
  const theme = resolveTheme(parsed.frontmatter, settings);
  const themeInfo = getThemeInfo(theme);
  const warnings = [];
  const context = { settings, frontmatter: parsed.frontmatter, theme, themeInfo, warnings, sectionIndex: 0, hasHero: false, variables: {} };
  context.variables = buildArticleVariables(context);
  const blocks = [...parsed.blocks];
  const parts = [];
  const explicitHero = blocks.some((block2) => block2.type === "callout" && block2.kind === "hero");
  const firstHeading = blocks.find((block2) => block2.type === "heading" && block2.level === 1);
  const articleTitle = parsed.frontmatter.title || firstHeading?.text;
  const firstContentBlock = blocks.find((block2) => !(block2.type === "heading" && block2.level === 1));
  const startsWithQuote = firstContentBlock?.type === "quote";
  const coverTheme = ["magazine", "ticket", "olive"].includes(themeInfo.layout);
  if (articleTitle && !explicitHero && (coverTheme || !startsWithQuote)) {
    parts.push(renderArticleHeader(articleTitle, parsed.frontmatter.subtitle, parsed.frontmatter.kicker, context));
  }
  blocks.forEach((block2) => {
    parts.push(renderBlock(block2, context));
  });
  if (settings.autoSignature && shouldAppendSignature(parsed.blocks)) {
    parts.push(renderEndDivider(context));
    parts.push(renderSignature(context));
  }
  const html = renderShell(parts.filter(Boolean).join("\n"), settings.contentWidth, context);
  return { html, plainText: toPlainText(parsed.blocks, parsed.frontmatter, context), warnings };
}
function resolveTheme(frontmatter, settings) {
  const rawTheme = frontmatter.theme;
  if (settings.themeOverride && isBuiltInTheme(settings.themeOverride)) return settings.themeOverride;
  if (isBuiltInTheme(rawTheme)) return rawTheme;
  if (rawTheme === "tech-tutorial") return "moyu-green";
  if (rawTheme === "reference-tech") return "graphite-minimal";
  if (rawTheme === "minimal-business") return "red-white";
  return settings.defaultTheme;
}
function renderBlock(block2, context) {
  switch (block2.type) {
    case "heading":
      if (block2.level === 1) {
        return "";
      }
      if (block2.level === 2) return renderSectionHeading(block2.text, context);
      if (block2.level === 3) return renderMinorHeading(block2.text, context);
      return renderMinorHeading(block2.text, context);
    case "paragraph":
      return renderParagraph(block2.text, context);
    case "list":
      return renderList(block2.items, block2.ordered, context);
    case "quote":
      return context.hasHero ? renderQuote(block2.text, context, false) : renderLeadQuote(block2.text, context);
    case "code":
      return renderCode(block2.code, block2.language || "CODE", context);
    case "image":
      return renderImage(block2, context);
    case "table":
      return renderTable(block2, context);
    case "rule":
      return renderDivider(context);
    case "callout":
      return renderCallout(block2, context);
    default:
      return "";
  }
}
function renderCallout(block2, context) {
  const title = block2.attrs.title || block2.title;
  switch (block2.kind) {
    case "hero":
      context.hasHero = true;
      return renderHero(block2.attrs.title || block2.body.split("\n")[0] || "Untitled", block2.attrs.subtitle || block2.body.split("\n").slice(1).join("\n") || void 0, block2.attrs.kicker, context);
    case "section":
      return renderSectionHeading(block2.attrs.title || block2.body || title || "Section", context);
    case "step":
      return renderCard(title || block2.attrs.title || "\u6B65\u9AA4", block2.body, context, block2.attrs.number || block2.attrs.step || "\u6B65\u9AA4");
    case "command":
      return renderCode(block2.body || block2.attrs.command || "", block2.attrs.label || title || "COMMAND", context);
    case "quote":
      return context.hasHero ? renderQuote(block2.body || title || "", context, true) : renderLeadQuote(block2.body || title || "", context);
    case "cta":
      return renderCta(block2.body || title || "", context);
    case "figure":
      return renderFigureCallout(block2, context);
    case "warning":
    case "note":
    case "tip":
    default:
      return renderCard(title || labelForCallout(block2.kind), block2.body, context, labelForCallout(block2.kind));
  }
}
function renderShell(content, width, context) {
  const theme = context.themeInfo;
  return `<section data-wenote-block="shell" data-wenote-kind="${escapeAttr2(context.theme)}" style="max-width:${numberAttr(theme.maxWidth || width)}px;margin:0 auto;background:#FFFFFF;font-family:${escapeAttr2(theme.fontFamily)};color:${escapeAttr2(theme.text)};line-height:1.8;letter-spacing:0.3px;overflow-x:hidden;">
${content}
</section>`;
}
function renderArticleHeader(title, subtitle, kicker, context) {
  const theme = context.themeInfo;
  const label = kicker || theme.label;
  const author = context.frontmatter.author || context.settings.authorName || "";
  const meta = [author, theme.label].filter(Boolean).join(" \xB7 ");
  if (theme.layout === "magazine") {
    const column = kicker || variableOrPlaceholder(context, "\u680F\u76EE\u540D");
    const date = variableOrPlaceholder(context, "\u65E5\u671F");
    const summary = subtitle || variableOrPlaceholder(context, "\u526F\u6807\u9898");
    return `<section data-wenote-block="hero" data-wenote-kind="magazine" style="margin:0 0 32px;background:#FFFFFF;border:1.5px solid rgba(5,150,105,.15);border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.06);width:100%;box-sizing:border-box;">
  <section style="padding:32px 28px 28px;">
    <section style="display:flex;align-items:center;margin-bottom:28px;"><span style="width:6px;height:6px;background:#059669;border-radius:50%;margin-right:8px;">${leafBreak()}</span><span style="font-size:11px;font-weight:700;letter-spacing:3px;color:#059669;">${leaf(column)}</span><span style="flex:1;height:1px;background:linear-gradient(to right,rgba(5,150,105,.12),transparent);margin:0 8px;">${leafBreak()}</span><span style="font-size:10px;color:#D1D5DB;font-weight:600;">${leaf(date)}</span></section>
    <p style="font-size:15px;color:#D1D5DB;margin:0 0 6px;text-decoration:line-through;letter-spacing:.5px;">${leaf(summary)}</p>
    <h1 style="font-size:26px;font-weight:900;color:#111827;margin:0;line-height:1.1;letter-spacing:-1.5px;">${leaf(replaceArticleVariables(title, context))}</h1>
    <section style="width:48px;height:3px;background:linear-gradient(to right,#059669,#34D399);border-radius:2px;margin:16px 0 12px;">${leafBreak()}</section>
    <p style="font-size:13px;color:#9CA3AF;margin:0;line-height:1.7;letter-spacing:.5px;">${leaf(variableOrPlaceholder(context, "\u5173\u952E\u8BCD"))}</p>
  </section>
  <section style="background:linear-gradient(135deg,#059669,#10B981);padding:12px 28px;display:flex;align-items:center;justify-content:space-between;"><p style="font-size:12px;color:rgba(255,255,255,.9);margin:0;font-weight:600;">${leaf(author || variableOrPlaceholder(context, "\u8D26\u53F7\u540D\u79F0"))}</p><span style="background:rgba(255,255,255,.2);padding:1px 7px;border-radius:3px;font-size:8px;color:#FFFFFF;font-weight:600;">${leaf(variableOrPlaceholder(context, "\u6807\u7B7E"))}</span></section>
</section>`;
  }
  if (theme.layout === "ticket") {
    const issue = variableOrPlaceholder(context, "\u7968\u53F7");
    const summary = subtitle || variableOrPlaceholder(context, "\u526F\u6807\u9898");
    return `<section data-wenote-block="hero" data-wenote-kind="ticket" style="background:#FFFEF8;border:2px solid #1A1A1A;box-shadow:4px 4px 0 #1A1A1A;margin:0 4px 32px;box-sizing:border-box;overflow:hidden;">
  <section style="background:#059669;padding:12px 20px;display:flex;justify-content:space-between;align-items:center;"><span style="color:#FFFEF8;font-size:11px;letter-spacing:4px;font-weight:600;">${leaf(kicker || "AGENT ERA NOTE")}</span><span style="color:#FFFEF8;font-size:11px;letter-spacing:2px;">${leaf("\u2605\u2605\u2605\u2605\u2605")}</span></section>
  <section style="display:flex;"><section style="flex:1;padding:24px 20px;border-right:2px dashed #A7F3D0;min-width:0;"><h1 style="font-size:24px;font-weight:900;color:#1A1A1A;letter-spacing:.5px;margin:0 0 5px;line-height:1.2;">${leaf(replaceArticleVariables(title, context))}</h1><p style="font-size:14px;color:#666;letter-spacing:1px;margin:0 0 20px;">${inlineMarkdown(summary, context)}</p><section style="border-top:1px dashed #A7F3D0;margin-bottom:16px;">${leafBreak()}</section><p style="font-size:15px;color:#1A1A1A;font-weight:700;margin:0 0 3px;">${leaf(author || variableOrPlaceholder(context, "\u8D26\u53F7\u540D\u79F0"))}</p><p style="font-size:12px;color:#888;margin:0;">${leaf(context.settings.authorBio || variableOrPlaceholder(context, "\u8D26\u53F7\u4ECB\u7ECD"))}</p></section><section style="width:48px;padding:14px 4px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;background:#F0FDF4;box-sizing:border-box;"><section style="text-align:center;"><p style="font-size:7px;color:#999;margin:0;">${leaf("NO.")}</p><p style="font-size:15px;font-weight:900;color:#059669;margin:0;">${leaf(issue)}</p></section><p style="font-size:9px;color:#888;letter-spacing:1px;margin:16px 0;">${leaf(variableOrPlaceholder(context, "\u7968\u636E\u5206\u7C7B"))}</p><section style="text-align:center;"><p style="font-size:7px;color:#999;margin:0;">${leaf("GRADE")}</p><p style="font-size:14px;font-weight:900;color:#059669;margin:0;">${leaf(variableOrPlaceholder(context, "\u8BC4\u7EA7"))}</p></section></section></section>
  <section style="display:flex;align-items:center;padding:0 8px;"><span style="flex:1;border-top:2px dashed #A7F3D0;">${leafBreak()}</span><span style="padding:0 8px;font-size:10px;color:#A7F3D0;">${leaf("\u2702")}</span><span style="flex:1;border-top:2px dashed #A7F3D0;">${leafBreak()}</span></section>
  <section style="padding:10px 20px;display:flex;justify-content:space-between;"><span style="font-size:10px;color:#999;letter-spacing:1px;">${leaf("VALID FOR ONE READ")}</span><span style="font-size:10px;color:#999;letter-spacing:1px;">${leaf("ADMIT ONE \u{1F3AB}")}</span></section>
</section>`;
  }
  if (theme.layout === "olive") {
    const issue = variableOrPlaceholder(context, "\u671F\u53F7");
    const summary = subtitle || variableOrPlaceholder(context, "\u526F\u6807\u9898");
    return `<section data-wenote-block="hero" data-wenote-kind="olive" style="background:#FDFDF8;border:1px solid #BFC1B7;border-radius:6px;overflow:hidden;margin:0 0 32px;box-sizing:border-box;">
  <section style="padding:28px 24px 22px;"><section style="display:flex;align-items:center;margin-bottom:22px;"><span style="width:8px;height:8px;background:#1E1F23;border-radius:50%;margin-right:8px;">${leafBreak()}</span><span style="font-size:10px;font-weight:700;letter-spacing:3px;color:#65675E;">${leaf(kicker || "\u6A44\u6984\u624B\u8BB0 \xB7 \u7F16\u8F91\u90E8\u89C2\u5BDF")}</span><span style="flex:1;height:1px;background:#BFC1B7;margin:0 8px;">${leafBreak()}</span><span style="font-size:10px;color:#9EA096;font-weight:500;">${leaf(`ISSUE ${issue}`)}</span></section>
  <section style="display:flex;align-items:stretch;"><section style="flex:1;min-width:0;margin-right:18px;"><h1 style="font-size:24px;font-weight:800;color:#23251D;margin:0 0 10px;line-height:1.15;letter-spacing:-.75px;">${leaf(replaceArticleVariables(title, context))}</h1><section style="display:flex;align-items:center;margin-bottom:12px;"><span style="width:22px;height:3px;background:#1E1F23;border-radius:2px;margin-right:4px;">${leafBreak()}</span><span style="width:8px;height:3px;background:#BFC1B7;border-radius:2px;">${leafBreak()}</span></section><p style="font-size:13px;color:#65675E;margin:0;line-height:1.7;">${inlineMarkdown(summary, context)}</p></section><section style="flex-shrink:0;width:96px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#EEEFE9;border:1px dashed #BFC1B7;border-radius:6px;padding:8px;box-sizing:border-box;"><span style="font-size:34px;color:#4D4F46;">${leaf("\u25C9")}</span><span style="font-size:8px;font-weight:700;color:#9EA096;letter-spacing:1px;margin-top:4px;">${leaf("DOODLE")}</span></section></section></section>
  <section style="background:#1E1F23;padding:11px 24px;display:flex;align-items:center;justify-content:space-between;"><p style="font-size:12px;color:rgba(255,255,255,.92);margin:0;font-weight:600;">${leaf(variableOrPlaceholder(context, "\u5C01\u9762\u5BFC\u8BED"))}</p><span style="background:#E5E7E0;color:#23251D;padding:3px 8px;border-radius:4px;font-size:8px;font-weight:700;">${leaf(variableOrPlaceholder(context, "\u6807\u7B7E"))}</span></section>
</section>`;
  }
  if (theme.layout === "zen") {
    return `<section data-wenote-block="hero" data-wenote-kind="zen" style="margin:14px 18px 54px;padding:34px 12px 30px;border-top:1px solid ${escapeAttr2(theme.border)};border-bottom:1px solid ${escapeAttr2(theme.border)};text-align:center;">
  <p style="margin:0 0 18px;font-size:11px;color:${escapeAttr2(theme.muted)};letter-spacing:4px;">${leaf(kicker || label)}</p>
  <h1 style="margin:0;font-family:${escapeAttr2(theme.fontFamily)};font-size:28px;line-height:1.5;color:${escapeAttr2(theme.title)};font-weight:700;letter-spacing:1px;">${leaf(replaceArticleVariables(title, context))}</h1>
  ${subtitle ? `<p style="margin:20px auto 0;max-width:540px;font-size:15px;line-height:2;color:${escapeAttr2(theme.text)};">${inlineMarkdown(subtitle, context)}</p>` : ""}
</section>`;
  }
  if (theme.layout === "red-editorial") {
    return `<section data-wenote-block="hero" data-wenote-kind="red-editorial" style="margin:0 10px 38px;padding:26px 22px 24px;background:#FFFFFF;border-left:6px solid ${escapeAttr2(theme.accent)};border-top:1px solid ${escapeAttr2(theme.border)};border-bottom:1px solid ${escapeAttr2(theme.border)};box-sizing:border-box;">
  <p style="margin:0 0 12px;font-size:11px;color:${escapeAttr2(theme.accent)};font-weight:900;letter-spacing:2px;">${leaf(kicker || label)}</p>
  <h1 style="margin:0;font-size:29px;line-height:1.3;color:#1C1917;font-weight:950;">${leaf(replaceArticleVariables(title, context))}</h1>
  ${subtitle ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.8;color:${escapeAttr2(theme.text)};">${inlineMarkdown(subtitle, context)}</p>` : ""}
  ${author ? `<p style="margin:18px 0 0;color:${escapeAttr2(theme.muted)};font-size:12px;">${leaf(`\u2014\u2014 ${author}`)}</p>` : ""}
</section>`;
  }
  if (theme.layout === "graphite") {
    return `<section data-wenote-block="hero" data-wenote-kind="graphite" style="margin:10px 10px 42px;padding:30px 22px 26px;background:#FFFFFF;border-top:1px solid ${escapeAttr2(theme.border)};border-bottom:1px solid ${escapeAttr2(theme.border)};box-sizing:border-box;">
  <p style="margin:0 0 16px;font-size:10px;color:${escapeAttr2(theme.muted)};letter-spacing:3px;">${leaf(kicker || label)}</p>
  <h1 style="margin:0;font-size:30px;line-height:1.3;color:${escapeAttr2(theme.title)};font-weight:900;letter-spacing:-.5px;">${leaf(replaceArticleVariables(title, context))}</h1>
  ${subtitle ? `<p style="margin:18px 0 0;font-size:15px;line-height:1.9;color:${escapeAttr2(theme.text)};">${inlineMarkdown(subtitle, context)}</p>` : ""}
</section>`;
  }
  return `<section data-wenote-block="hero" data-wenote-kind="${escapeAttr2(context.theme)}" style="margin:0 10px 32px;padding:28px 22px 24px;border:1px solid ${escapeAttr2(theme.border)};border-top:6px solid ${escapeAttr2(theme.deep)};background:linear-gradient(135deg,${escapeAttr2(theme.light)} 0%,#FFFFFF 54%,#FFFFFF 100%);border-radius:22px;box-sizing:border-box;overflow:hidden;">
  <section style="margin:0 0 18px;">
    <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:#FFFFFF;border:1px solid ${escapeAttr2(theme.border)};font-size:11px;line-height:1.4;color:${escapeAttr2(theme.accent)};font-weight:800;letter-spacing:1.5px;">${leaf(label)}</span>
  </section>
  <h1 style="margin:0;font-size:30px;line-height:1.25;color:${escapeAttr2(theme.title)};font-weight:900;letter-spacing:-0.5px;">${leaf(replaceArticleVariables(title, context))}</h1>
  ${subtitle ? `<p style="margin:16px 0 0;font-size:15px;line-height:1.8;color:${escapeAttr2(theme.text)};font-weight:600;">${leaf(replaceArticleVariables(subtitle, context))}</p>` : ""}
  ${meta ? `<p style="margin:20px 0 0;padding-top:14px;border-top:1px solid ${escapeAttr2(theme.border)};font-size:12px;line-height:1.6;color:${escapeAttr2(theme.muted)};letter-spacing:0.8px;">${leaf(meta)}</p>` : ""}
</section>`;
}
function renderHero(title, subtitle, kicker, context) {
  const theme = context.themeInfo;
  const label = kicker || theme.label;
  return `<section data-wenote-block="hero" data-wenote-kind="${escapeAttr2(context.theme)}" style="margin:0 0 26px;padding:34px 22px 30px;background:${escapeAttr2(theme.light)};border:1px solid ${escapeAttr2(theme.border)};border-radius:0 0 24px 24px;box-sizing:border-box;text-align:center;">
  <p style="margin:0 0 12px;font-size:12px;line-height:1.4;color:${escapeAttr2(theme.accent)};font-weight:800;letter-spacing:2px;">${leaf(label)}</p>
  <h1 style="margin:0 auto;max-width:620px;font-size:32px;line-height:1.25;color:${escapeAttr2(theme.title)};font-weight:900;letter-spacing:-.4px;">${leaf(title)}</h1>
  ${subtitle ? `<p style="margin:16px auto 0;max-width:560px;font-size:16px;line-height:1.8;color:${escapeAttr2(theme.muted)};font-weight:600;">${inlineMarkdown(subtitle, context)}</p>` : ""}
</section>`;
}
function renderLeadQuote(text2, context) {
  context.hasHero = true;
  const theme = context.themeInfo;
  const author = context.frontmatter.author || context.settings.authorName;
  if (theme.layout === "zen") {
    return `<section data-wenote-block="quote" data-wenote-kind="lead" style="margin:16px 22px 54px;padding:30px 8px;text-align:center;">
  <p style="font-family:${escapeAttr2(theme.fontFamily)};font-size:18px;font-weight:600;color:${escapeAttr2(theme.title)};margin:0;line-height:2;letter-spacing:.5px;">${inlineMarkdown(text2, context)}</p>
  <p style="font-size:12px;color:${escapeAttr2(theme.muted)};margin:22px 0 0;letter-spacing:2px;">${leaf(`\u2014\u2014 ${author || variableOrPlaceholder(context, "\u4F5C\u8005\u540D")}`)}</p>
</section>`;
  }
  if (theme.layout === "magazine" || theme.layout === "ticket" || theme.layout === "olive") {
    return `<section data-wenote-block="quote" data-wenote-kind="lead" style="margin:0 10px 38px;padding:20px 20px;background:${escapeAttr2(theme.light)};border-left:5px solid ${escapeAttr2(theme.accent)};box-sizing:border-box;">
  <p style="font-size:17px;font-weight:800;color:${escapeAttr2(theme.title)};margin:0;line-height:1.8;">${inlineMarkdown(text2, context)}</p>
  <p style="text-align:right;font-size:12px;color:${escapeAttr2(theme.muted)};margin:14px 0 0;">${leaf(`\u2014\u2014 ${author || variableOrPlaceholder(context, "\u4F5C\u8005\u540D")}`)}</p>
</section>`;
  }
  return `<section data-wenote-block="quote" data-wenote-kind="lead" style="margin:10px 10px 40px;padding:32px 24px 24px;border-top:1px solid ${escapeAttr2(theme.border)};border-bottom:1px solid ${escapeAttr2(theme.border)};background:#FFFFFF;">
  <p style="font-size:18px;font-weight:700;color:${escapeAttr2(theme.title)};margin:0 0 8px;line-height:1.7;letter-spacing:0.5px;">${inlineMarkdown(text2, context)}</p>
  ${author ? `<p style="text-align:right;font-size:12px;color:${escapeAttr2(theme.muted)};margin:16px 0 0;letter-spacing:1px;">${leaf(`\u2014\u2014 ${author}`)}</p>` : ""}
</section>`;
}
function renderSectionHeading(text2, context) {
  context.sectionIndex += 1;
  const theme = context.themeInfo;
  const number = String(context.sectionIndex).padStart(2, "0");
  const marginTop = context.sectionIndex === 1 ? 16 : 56;
  if (theme.layout === "magazine") {
    return `<section data-wenote-block="section" data-wenote-kind="magazine" style="margin:${marginTop}px 10px 28px;padding:0;">
  <section style="display:flex;align-items:flex-end;border-bottom:3px solid ${escapeAttr2(theme.deep)};padding-bottom:12px;"><span style="font-size:34px;line-height:1;color:${escapeAttr2(theme.accent)};font-weight:950;margin-right:12px;">${leaf(number)}</span><h3 style="font-size:20px;color:${escapeAttr2(theme.title)};font-weight:900;margin:0;line-height:1.4;">${inlineMarkdown(text2, context)}</h3></section>
</section>`;
  }
  if (theme.layout === "red-editorial") {
    return `<section data-wenote-block="section" data-wenote-kind="red-editorial" style="margin:${marginTop}px 10px 30px;padding:0;">
  <section style="display:flex;align-items:center;margin-bottom:12px;"><span style="display:inline-block;background:${escapeAttr2(theme.accent)};color:#FFFFFF;font-size:13px;font-weight:900;padding:3px 10px;margin-right:12px;">${leaf(number)}</span><h3 style="font-size:21px;color:#1C1917;font-weight:900;margin:0;line-height:1.4;">${inlineMarkdown(text2, context)}</h3></section><section style="height:2px;background:linear-gradient(to right,${escapeAttr2(theme.accent)},#FECACA,transparent);">${leafBreak()}</section>
</section>`;
  }
  if (theme.layout === "zen") {
    return `<section data-wenote-block="section" data-wenote-kind="zen" style="margin:${marginTop + 10}px 18px 34px;text-align:center;">
  <p style="margin:0 0 12px;font-size:11px;color:${escapeAttr2(theme.accent)};letter-spacing:3px;">${leaf(number)}</p><h3 style="font-family:${escapeAttr2(theme.fontFamily)};font-size:22px;color:${escapeAttr2(theme.title)};font-weight:700;margin:0 0 16px;line-height:1.5;">${inlineMarkdown(text2, context)}</h3><section style="width:42px;height:1px;background:${escapeAttr2(theme.border)};margin:0 auto;">${leafBreak()}</section>
</section>`;
  }
  if (theme.layout === "ticket") {
    return `<section data-wenote-block="section" data-wenote-kind="ticket" style="margin:${marginTop}px 12px 30px;padding:17px 18px;background:#FFFEF8;border:2px solid ${escapeAttr2(theme.title)};box-shadow:5px 5px 0 ${escapeAttr2(theme.border)};">
  <p style="margin:0 0 7px;font-size:12px;color:${escapeAttr2(theme.accent)};font-weight:900;letter-spacing:2px;">${leaf(number)}</p><h3 style="font-size:20px;color:${escapeAttr2(theme.title)};font-weight:950;margin:0;line-height:1.4;">${inlineMarkdown(text2, context)}</h3>
</section>`;
  }
  if (theme.layout === "olive") {
    return `<section data-wenote-block="section" data-wenote-kind="olive" style="margin:${marginTop}px 10px 30px;padding:0 2px 14px;border-bottom:1px solid ${escapeAttr2(theme.border)};">
  <section style="display:flex;align-items:center;margin-bottom:7px;"><span style="font-size:28px;color:${escapeAttr2(theme.accent)};font-weight:900;margin-right:10px;">${leaf(number)}</span><span style="width:28px;height:2px;background:#ED7B2F;">${leafBreak()}</span></section><h3 style="font-size:20px;font-weight:800;color:${escapeAttr2(theme.title)};margin:0;line-height:1.4;">${inlineMarkdown(text2, context)}</h3>
</section>`;
  }
  return `<section data-wenote-block="section" data-wenote-kind="heading" style="margin-top:${marginTop}px;margin-bottom:32px;padding:0 10px;">
  <section style="position:relative;padding-bottom:20px;border-bottom:1px solid ${escapeAttr2(theme.border)};">
    <p style="font-size:48px;font-weight:900;color:${escapeAttr2(theme.border)};margin:0;line-height:1;letter-spacing:-2px;">${leaf(number)}</p>
    <section style="margin-top:-8px;">
      <h3 style="font-size:20px;font-weight:800;color:${escapeAttr2(theme.title)};margin:0;letter-spacing:0.5px;line-height:1.4;">${inlineMarkdown(text2, context)}</h3>
    </section>
  </section>
</section>`;
}
function renderMinorHeading(text2, context) {
  const theme = context.themeInfo;
  const borderWidth = theme.layout === "zen" ? 2 : theme.layout === "ticket" ? 4 : 3;
  const margin = theme.layout === "zen" ? "34px 22px 16px" : theme.layout === "olive" ? "30px 10px 14px" : "28px 10px 14px";
  return `<p data-wenote-block="minor-heading" style="font-size:${theme.layout === "magazine" || theme.layout === "ticket" || theme.layout === "olive" ? 14 : 15}px;font-weight:800;color:${escapeAttr2(theme.title)};margin:${margin};padding-left:12px;border-left:${borderWidth}px solid ${escapeAttr2(theme.accent)};line-height:1.5;">${inlineMarkdown(text2, context)}</p>`;
}
function renderParagraph(text2, context) {
  const theme = context.themeInfo;
  const content = context.settings.autoKeywordUnderline ? underlineKeywordIfPlain(text2) : text2;
  const styles = {
    magazine: "margin:0 20px 20px;font-size:14px;line-height:1.9;text-align:justify;letter-spacing:.2px;",
    "red-editorial": "margin:0 10px 24px;font-size:15px;line-height:1.85;text-align:justify;letter-spacing:.25px;",
    graphite: "margin:0 10px 26px;font-size:15px;line-height:1.9;text-align:justify;letter-spacing:.3px;",
    zen: "margin:0 22px 28px;font-size:15px;line-height:2;text-align:justify;letter-spacing:.45px;",
    ticket: "margin:0 20px 20px;font-size:14px;line-height:1.9;text-align:justify;letter-spacing:.15px;",
    olive: "margin:0 10px 21px;font-size:14px;line-height:1.9;text-align:justify;letter-spacing:.2px;"
  };
  return `<p data-wenote-block="paragraph" style="${styles[theme.layout]}color:${escapeAttr2(theme.text)};">${inlineMarkdown(content, context).replace(/\n/g, "<br>")}</p>`;
}
function renderList(items, ordered, context) {
  const theme = context.themeInfo;
  const rows = items.map((item, index) => {
    const marker = typeof item.checked === "boolean" ? item.checked ? "\u2713" : "" : ordered ? String(index + 1) : "\u2022";
    const text2 = item.checked ? `~~${item.text}~~` : item.text;
    if (theme.layout === "olive") return `<section data-wenote-block="list-item" style="display:flex;align-items:flex-start;margin:0 0 13px;"><span style="width:7px;height:7px;border-radius:50%;background:${index % 2 ? "#ED7B2F" : "#1E1F23"};margin:10px 12px 0 0;flex-shrink:0;">${leafBreak()}</span><p style="font-size:14px;color:${escapeAttr2(theme.text)};margin:0;line-height:1.9;flex:1;">${inlineMarkdown(text2, context)}</p></section>`;
    if (theme.layout === "zen") return `<section data-wenote-block="list-item" style="display:flex;align-items:flex-start;padding:${index === 0 ? 0 : 15}px 0 15px;border-bottom:1px solid ${escapeAttr2(theme.border)};"><span style="font-size:11px;color:${escapeAttr2(theme.accent)};letter-spacing:1px;margin:5px 16px 0 0;">${leaf(ordered ? String(index + 1).padStart(2, "0") : "\u2014")}</span><p style="font-size:15px;color:${escapeAttr2(theme.text)};margin:0;line-height:1.9;flex:1;">${inlineMarkdown(text2, context)}</p></section>`;
    if (theme.layout === "ticket") return `<section data-wenote-block="list-item" style="display:flex;align-items:flex-start;padding:12px 0;border-bottom:${index === items.length - 1 ? 0 : "1px dashed #A7F3D0"};"><span leaf="" style="display:inline-block;width:24px;height:24px;line-height:24px;background:#059669;color:#FFFEF8;text-align:center;font-size:11px;font-weight:900;margin-right:10px;flex-shrink:0;">${escapeHtml3(marker)}</span><p style="font-size:14px;color:${escapeAttr2(theme.text)};margin:0;line-height:1.9;flex:1;">${inlineMarkdown(text2, context)}</p></section>`;
    const markerStyle = theme.layout === "red-editorial" ? `background:#DC2626;color:#FFFFFF;border-radius:50%;` : theme.layout === "magazine" ? `background:#ECFDF5;color:#059669;border-radius:999px;` : `background:#FAFAFA;color:#52525B;border:1px solid #E4E4E7;border-radius:50%;`;
    return `<section data-wenote-block="list-item" style="display:flex;align-items:flex-start;margin:0 0 12px;"><span leaf="" style="display:inline-block;width:22px;height:22px;line-height:22px;${markerStyle}text-align:center;font-size:11px;font-weight:800;margin-right:10px;flex-shrink:0;">${escapeHtml3(marker)}</span><p style="font-size:${theme.layout === "magazine" ? 14 : 15}px;color:${escapeAttr2(theme.text)};margin:0;line-height:1.85;flex:1;">${inlineMarkdown(text2, context)}</p></section>`;
  }).join("");
  if (theme.layout === "ticket") {
    return `<section data-wenote-block="list" data-wenote-kind="${ordered ? "ordered" : "unordered"}" style="margin:0 20px 26px;padding:4px 16px;background:#FFFEF8;border-left:1px dashed #059669;border-right:1px dashed #059669;">${rows}</section>`;
  }
  if (theme.layout === "zen") {
    return `<section data-wenote-block="list" data-wenote-kind="${ordered ? "ordered" : "unordered"}" style="margin:0 22px 34px;padding:0;border-top:1px solid ${escapeAttr2(theme.border)};">${rows}</section>`;
  }
  if (theme.layout === "olive") {
    return `<section data-wenote-block="list" data-wenote-kind="${ordered ? "ordered" : "unordered"}" style="margin:0 10px 26px;padding:18px 20px;background:#FDFDF8;border:1px solid #BFC1B7;border-radius:6px;">${rows}</section>`;
  }
  return `<section data-wenote-block="list" data-wenote-kind="${ordered ? "ordered" : "unordered"}" style="margin:0 ${theme.layout === "magazine" ? 20 : 10}px 26px;padding:18px 20px;background:${escapeAttr2(theme.light)};border-top:1px solid ${escapeAttr2(theme.border)};">
  ${rows}
</section>`;
}
function renderTable(block2, context) {
  const theme = context.themeInfo;
  const headers = block2.headers.map((header) => `<th style="padding:10px 10px;text-align:left;font-size:13px;line-height:1.5;color:${escapeAttr2(theme.title)};background:${escapeAttr2(theme.light)};border:1px solid ${escapeAttr2(theme.border)};font-weight:850;word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;">${inlineMarkdown(header, context)}</th>`).join("");
  const rows = block2.rows.map((row) => `<tr>${row.map((cell) => `<td style="padding:10px 10px;font-size:13px;line-height:1.65;color:${escapeAttr2(theme.text)};border:1px solid ${escapeAttr2(theme.border)};word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;">${inlineMarkdown(cell, context)}</td>`).join("")}</tr>`).join("");
  return `<section data-wenote-block="table" style="margin:20px 16px;box-sizing:border-box;overflow:visible;">
  <table style="width:100%;max-width:100%;border-collapse:collapse;border-spacing:0;table-layout:fixed;word-break:break-word;overflow-wrap:anywhere;box-sizing:border-box;">
    <thead><tr>${headers}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
</section>`;
}
function renderQuote(text2, context, prominent = false) {
  const theme = context.themeInfo;
  if (theme.layout === "magazine") return `<section data-wenote-block="quote" data-wenote-kind="${prominent ? "prominent" : "normal"}" style="margin:0 20px 26px;padding:18px 20px;background:#F9FAFB;border:1px dashed #D1D5DB;border-radius:10px;"><p style="font-size:14px;font-weight:700;color:#374151;margin:0;line-height:1.9;">${inlineMarkdown(text2, context)}</p></section>`;
  if (theme.layout === "red-editorial") return `<section data-wenote-block="quote" data-wenote-kind="${prominent ? "prominent" : "normal"}" style="margin:0 10px 28px;padding:18px 20px;background:#FEF2F2;border-left:4px solid #DC2626;"><p style="font-size:15px;font-weight:700;color:#1C1917;margin:0;line-height:1.8;">${inlineMarkdown(text2, context)}</p></section>`;
  if (theme.layout === "zen") return `<section data-wenote-block="quote" data-wenote-kind="${prominent ? "prominent" : "normal"}" style="margin:8px 22px 38px;padding:28px 12px;border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;text-align:center;"><p style="font-family:Georgia,serif;font-size:18px;color:#2B2B2B;margin:0;line-height:2;letter-spacing:.5px;">${inlineMarkdown(text2, context)}</p></section>`;
  if (theme.layout === "ticket") return `<section data-wenote-block="quote" data-wenote-kind="${prominent ? "prominent" : "normal"}" style="margin:0 20px 28px;padding:18px;background:#F0FDF4;border:1px solid #A7F3D0;"><p style="font-size:14px;font-weight:800;color:#1A1A1A;margin:0;line-height:1.9;">${inlineMarkdown(text2, context)}</p></section>`;
  if (theme.layout === "olive") return `<section data-wenote-block="quote" data-wenote-kind="${prominent ? "prominent" : "normal"}" style="margin:0 10px 28px;background:#EEEFE9;border-radius:5px;overflow:hidden;"><p style="margin:0;padding:7px 16px;background:#1E1F23;color:#FFFFFF;font-size:11px;font-weight:700;letter-spacing:1px;">${leaf("\u7F16\u8005\u6309")}</p><p style="font-size:14px;color:#4D4F46;margin:0;padding:16px 18px;line-height:1.9;">${inlineMarkdown(text2, context)}</p></section>`;
  return `<section data-wenote-block="quote" data-wenote-kind="${prominent ? "prominent" : "normal"}" style="border-left:3px solid ${escapeAttr2(theme.accent)};padding:16px 0 16px 24px;margin:0 10px 28px;">
  <p style="font-size:${prominent ? 16 : 15}px;font-weight:${prominent ? 700 : 600};color:${escapeAttr2(theme.title)};margin:0;line-height:1.7;letter-spacing:0.5px;">${inlineMarkdown(text2, context)}</p>
</section>`;
}
function renderCard(title, body, context, label) {
  const theme = context.themeInfo;
  if (theme.layout === "ticket") {
    return `<section data-wenote-block="tip" style="margin:0 12px 26px;padding:16px 18px;background:#FFFEF8;border:2px solid ${escapeAttr2(theme.title)};box-shadow:4px 4px 0 ${escapeAttr2(theme.border)};"><p style="margin:0 0 7px;font-size:11px;color:${escapeAttr2(theme.accent)};font-weight:900;letter-spacing:2px;">${leaf(label)}</p><p style="margin:0;font-size:14px;line-height:1.8;color:${escapeAttr2(theme.text)};font-weight:700;">${inlineMarkdown(body || title, context).replace(/\n/g, "<br>")}</p></section>`;
  }
  if (theme.layout === "olive") {
    return `<section data-wenote-block="tip" style="margin:0 10px 26px;padding:15px 18px;background:#EEEFE9;border-left:4px solid ${escapeAttr2(theme.accent)};"><p style="margin:0 0 7px;font-size:10px;color:${escapeAttr2(theme.accent)};font-weight:800;letter-spacing:2px;">${leaf(label)}</p><p style="margin:0;font-size:14px;line-height:1.8;color:${escapeAttr2(theme.text)};font-weight:700;">${inlineMarkdown(body || title, context).replace(/\n/g, "<br>")}</p></section>`;
  }
  if (theme.layout === "zen") {
    return `<section data-wenote-block="tip" style="margin:0 22px 30px;padding:16px 0 16px 20px;border-left:2px solid ${escapeAttr2(theme.border)};"><p style="margin:0 0 7px;font-size:10px;color:${escapeAttr2(theme.muted)};letter-spacing:3px;">${leaf(label)}</p><p style="margin:0;font-family:${escapeAttr2(theme.fontFamily)};font-size:14px;line-height:2;color:${escapeAttr2(theme.text)};">${inlineMarkdown(body || title, context).replace(/\n/g, "<br>")}</p></section>`;
  }
  return `<section data-wenote-block="tip" style="border-left:3px solid ${escapeAttr2(theme.deep)};padding:14px 0 14px 22px;margin:0 10px 24px;">
  <p style="font-size:11px;color:${escapeAttr2(theme.muted)};margin:0 0 ${body ? 8 : 0}px;letter-spacing:2px;font-weight:500;">${leaf(label)}</p>
  <p style="font-size:14px;font-weight:700;color:${escapeAttr2(theme.title)};margin:0;line-height:1.8;">${inlineMarkdown(body || title, context).replace(/\n/g, "<br>")}</p>
</section>`;
}
function renderCode(code2, label, context) {
  const theme = context.themeInfo;
  const lines = code2.split("\n").map((line) => `<p style="margin:0;font-size:13px;line-height:1.65;color:#E5E7EB;font-family:SFMono-Regular,Consolas,Liberation Mono,monospace;word-break:break-word;overflow-wrap:anywhere;">${leaf(line.replace(/^ +/, (spaces) => "\u3000".repeat(spaces.length)))}</p>`).join("");
  return `<section data-wenote-block="command" style="margin:18px 16px;background:${escapeAttr2(theme.codeBg)};border-radius:18px;overflow:visible;box-sizing:border-box;">
  <section style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.12);box-sizing:border-box;">
    <span leaf="" style="font-size:11px;line-height:1;color:${escapeAttr2(theme.border)};font-weight:900;letter-spacing:2px;">${escapeHtml3(label || "CODE")}</span>
  </section>
  <section style="margin:0;padding:14px 16px;box-sizing:border-box;">${lines || `<p style="margin:0;">${leaf("")}</p>`}</section>
</section>`;
}
function renderImage(block2, context) {
  const src = context.settings.resolveImageSrc ? context.settings.resolveImageSrc(block2.src) : block2.src;
  if (!/^https?:\/\//.test(block2.src) && !block2.src.startsWith("data:") && !src.startsWith("data:")) {
    context.warnings.push(`Local image kept as a local reference: ${block2.src}`);
  }
  const isGif = /\.gif(?:[?#].*)?$/i.test(block2.src);
  const margin = block2.caption ? "0 10px 8px" : "0 10px 28px";
  return `<section data-wenote-block="image" style="border:1px solid ${escapeAttr2(context.themeInfo.border)};padding:4px;margin:${margin};">
  <section style="margin:0;overflow:hidden;">
    <span leaf=""><img src="${escapeAttr2(src)}" data-noterelay-source="${escapeAttr2(block2.src)}" style="max-width:100%;height:auto;display:block;margin:0 auto;"></span>
  </section>
  ${isGif ? `<p style="margin:8px 0 0;text-align:center;">${leaf("GIF \u52A8\u56FE", `display:inline-block;padding:2px 8px;border-radius:999px;background:${context.themeInfo.light};color:${context.themeInfo.accent};font-size:12px;font-weight:800;`)}</p>` : ""}
  </section>
${block2.caption ? `<p style="font-size:12px;color:${escapeAttr2(context.themeInfo.muted)};text-align:center;margin:0 10px 28px;letter-spacing:0.5px;">${leaf(`\u2014 ${block2.caption}`)}</p>` : ""}`;
}
function renderFigureCallout(block2, context) {
  const src = block2.attrs.src;
  if (!src) return renderCard(block2.attrs.title || "Figure", block2.body, context, "FIGURE");
  return renderImage({ type: "image", src, alt: block2.attrs.alt || block2.attrs.title || "figure", caption: block2.attrs.caption || block2.body }, context);
}
function renderCta(text2, context) {
  const theme = context.themeInfo;
  return `<section data-wenote-block="cta" style="border-left:3px solid ${escapeAttr2(theme.deep)};padding:14px 0 14px 22px;margin:0 10px 24px;">
  <p style="font-size:14px;font-weight:700;color:${escapeAttr2(theme.title)};margin:0;line-height:1.8;">${inlineMarkdown(text2, context)}</p>
</section>`;
}
function renderDivider(context) {
  const theme = context.themeInfo;
  return `<section data-wenote-block="rule" style="padding:0 10px;">
  <section style="height:1px;background:${escapeAttr2(theme.border)};margin:0;">${leafBreak()}</section>
</section>`;
}
function renderEndDivider(context) {
  const theme = context.themeInfo;
  return `<section data-wenote-block="rule" data-wenote-kind="end" style="padding:0 10px;">
  <section style="text-align:center;margin:0 0 36px;">
    <section style="display:flex;align-items:center;justify-content:center;">
      <span style="height:1px;width:48px;background:${escapeAttr2(theme.border)};margin-right:16px;">${leafBreak()}</span>
      <span style="font-size:10px;color:${escapeAttr2(theme.muted)};letter-spacing:4px;font-weight:500;">${leaf("END")}</span>
      <span style="height:1px;width:48px;background:${escapeAttr2(theme.border)};margin-left:16px;">${leafBreak()}</span>
    </section>
  </section>
</section>`;
}
function renderSignature(context) {
  const theme = context.themeInfo;
  const author = context.frontmatter.author || context.settings.authorName || "{{\u4F5C\u8005\u540D}}";
  const bio = context.frontmatter.bio || context.settings.authorBio || "{{\u7B80\u4ECB}}";
  const sentence = `\u6211\u662F ${author}\uFF0C${bio}${/[。！？.!?]$/.test(bio) ? "" : "\u3002"}`;
  const cta = context.variables["\u4E92\u52A8\u5F15\u5BFC"] || context.settings.footerCta || DEFAULT_SETTINGS2.footerCta;
  if (theme.layout === "magazine") {
    return `<section data-wenote-block="cta" data-wenote-kind="signature" style="padding:0 20px 24px;">
  <p style="margin:0 0 24px;font-size:14px;line-height:1.9;text-align:justify;color:#374151;">${leaf(replaceArticleVariables(sentence, context))}</p>
  <section style="background:radial-gradient(circle at center,#F9FAFB 0%,#FFFFFF 100%);border:1px solid #E5E7EB;border-radius:16px;padding:32px 20px;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,.03);">
    <p style="font-size:13px;font-weight:700;color:#111827;margin:0 0 20px;line-height:1.6;">${inlineMarkdown(cta, context)}</p>
    ${renderEngagementActions("soft-green")}
    <p style="font-size:10px;color:#9CA3AF;letter-spacing:1px;margin:0;">${leaf("THANKS FOR READING")}</p>
  </section>
</section>`;
  }
  if (theme.layout === "zen") {
    return `<section data-wenote-block="cta" data-wenote-kind="signature" style="padding:0 16px 40px;">
  <p style="margin:0 0 26px;font-size:15px;line-height:1.9;text-align:justify;color:#525252;">${leaf(replaceArticleVariables(sentence, context))}</p>
  <p style="margin:0 0 26px;font-size:15px;line-height:1.9;text-align:justify;color:#525252;">${inlineMarkdown(cta, context)}</p>
</section>`;
  }
  if (theme.layout === "ticket") {
    return `<section data-wenote-block="cta" data-wenote-kind="signature" style="padding:0 0 32px;">
  <p style="margin:0 20px 24px;font-size:14px;line-height:1.9;color:#555;text-align:justify;">${leaf(replaceArticleVariables(sentence, context))}</p>
  <section style="background:#FFFEF8;border:2px solid #1A1A1A;box-shadow:4px 4px 0 #1A1A1A;padding:24px 20px;text-align:center;">
    <p style="font-size:13px;font-weight:700;color:#1A1A1A;margin:0 0 20px;line-height:1.6;">${inlineMarkdown(cta, context)}</p>
    ${renderEngagementActions("ticket")}
    <p style="border-top:1px dashed #CCC;padding-top:12px;font-size:10px;color:#999;letter-spacing:2px;margin:0;">${leaf("THANKS FOR READING \u2702")}</p>
  </section>
</section>`;
  }
  if (theme.layout === "olive") {
    const initial = author.includes("{{") ? "\u540D" : Array.from(author)[0] || "\u540D";
    return `<section data-wenote-block="cta" data-wenote-kind="signature" style="padding:0 0 30px;">
  <p style="margin:24px 0 0;font-size:14px;line-height:1.9;color:#4D4F46;text-align:justify;">${leaf(replaceArticleVariables(sentence, context))}</p>
  <p style="margin:24px 0;"><span style="display:inline-flex;align-items:center;padding:8px 12px;background:#EEEFE9;border:1px solid #BFC1B7;border-radius:999px;"><span style="width:22px;height:22px;border-radius:50%;background:#1E1F23;color:#FFFFFF;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;margin-right:10px;">${leaf(initial)}</span><span style="font-size:12px;color:#23251D;font-weight:700;">${leaf(`${author} \xB7 ${bio}`)}</span></span></p>
  <section style="background:#FDFDF8;border:1px solid #BFC1B7;border-radius:6px;padding:22px 16px;text-align:center;">
    <p style="font-size:13px;font-weight:700;color:#23251D;line-height:1.6;margin:0 0 14px;">${inlineMarkdown(cta, context)}</p>
    ${renderEngagementActions("olive")}
    <p style="font-size:10px;color:#9EA096;letter-spacing:2px;margin:0;font-weight:500;">${leaf("THANKS FOR READING")}</p>
  </section>
</section>`;
  }
  const wrapperStyle = theme.layout === "graphite" ? "padding:0 10px 24px;" : "padding:0 10px 24px;";
  const innerStyle = theme.layout === "graphite" ? "border-top:1px solid #E4E4E7;padding-top:28px;" : "";
  return `<section data-wenote-block="cta" data-wenote-kind="signature" style="${wrapperStyle}"><section style="${innerStyle}"><p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:${escapeAttr2(theme.text)};text-align:justify;">${leaf(replaceArticleVariables(sentence, context))}</p><p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:${escapeAttr2(theme.text)};text-align:justify;">${inlineMarkdown(cta, context)}</p></section></section>`;
}
function renderEngagementActions(variant) {
  const actions = variant === "ticket" ? [["like", "\u70B9\u8D5E"], ["view", "\u5728\u770B"], ["star", "\u661F\u6807"]] : variant === "olive" ? [["like", "\u8D5E"], ["view", "\u5728\u770B"], ["star", "\u6536\u85CF"]] : [["like", "\u70B9\u8D5E"], ["view", "\u5728\u770B"], ["share", "\u8F6C\u53D1"]];
  const items = actions.map(([icon, label], index) => {
    const active = index === 2;
    const spacing = index < actions.length - 1 ? "margin-right:24px;" : "";
    const box = variant === "ticket" ? `background:${active ? "#F0FDF4" : "#FFFFFF"};border:${active ? "2px solid #059669" : "1px solid #1A1A1A"};border-radius:0;` : variant === "olive" ? `background:${active ? "#D4C9B8" : "#EEEFE9"};border:1px solid ${active ? "#B17816" : "#BFC1B7"};border-radius:6px;` : `background:${active ? "#ECFDF5" : "#FFFFFF"};border:1px solid ${active ? "#A7F3D0" : "#F3F4F6"};border-radius:12px;box-shadow:0 2px 4px rgba(0,0,0,.05);`;
    const color = active ? variant === "olive" ? "#23251D" : "#059669" : variant === "olive" ? "#4D4F46" : "#4B5563";
    return `<section style="text-align:center;color:${color};${spacing}"><section style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;margin:0 auto 6px;${box}">${engagementSvg(icon)}</section><span style="font-size:10px;font-weight:600;">${leaf(label)}</span></section>`;
  }).join("");
  return `<section style="display:flex;justify-content:center;margin-bottom:16px;">${items}</section>`;
}
function engagementSvg(icon) {
  if (icon === "view") return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"></circle><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path></svg>`;
  if (icon === "star") return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  if (icon === "share") return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 18v-4a8 8 0 0 1 8-8h8"></path><polyline points="16 2 20 6 16 10"></polyline></svg>`;
  return `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
}
function inlineMarkdown(input, context, options = {}) {
  const theme = context.themeInfo;
  const variableValues = [];
  const protectedInput = input.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (all, key) => {
    const value = context.variables[key.trim()];
    if (typeof value !== "string") return all;
    const index = variableValues.push(value) - 1;
    return `\uE000${index}\uE001`;
  });
  let html = escapeHtml3(protectedInput);
  html = html.replace(/\uE000(\d+)\uE001/g, (_all, index) => leaf(variableValues[Number(index)] ?? ""));
  const linkColor = options.onDark ? theme.border : theme.accent;
  const strongColor = options.onDark ? "#ffffff" : theme.title;
  html = html.replace(/!\[([^\]]*)]\(([^)]+)\)/g, (_all, alt, url) => `<img src="${escapeAttr2(safeUrl(unescapeHtml(url)))}" alt="${escapeAttr2(unescapeHtml(alt))}" style="max-width:100%;height:auto;border-radius:12px;vertical-align:middle;box-sizing:border-box;" />`);
  html = html.replace(/\[([^\]]+)]\(([^)]+)\)/g, (_all, label, url) => `<a href="${escapeAttr2(safeUrl(unescapeHtml(url)))}" target="_blank" style="color:${escapeAttr2(linkColor)};text-decoration:none;border-bottom:1px solid ${escapeAttr2(theme.border)};word-break:break-word;overflow-wrap:anywhere;">${leaf(unescapeHtml(label))}</a>`);
  html = html.replace(/(^|[\s>])((?:https?:\/\/)[^\s<]+)/g, (_all, prefix, url) => `${prefix}<a href="${escapeAttr2(safeUrl(unescapeHtml(url)))}" target="_blank" style="color:${escapeAttr2(linkColor)};text-decoration:none;border-bottom:1px solid ${escapeAttr2(theme.border)};word-break:break-word;overflow-wrap:anywhere;">${leaf(unescapeHtml(url))}</a>`);
  html = html.replace(/`([^`]+)`/g, (_all, code2) => `<span style="background:${escapeAttr2(theme.highlight)};color:${escapeAttr2(theme.title)};padding:2px 6px;border-radius:4px;font-family:'SF Mono',Consolas,Monaco,monospace;font-size:14px;">${leaf(unescapeHtml(code2))}</span>`);
  html = html.replace(/\+\+([^+]+)\+\+/g, (_all, value) => `<span style="${escapeAttr2(theme.underlineCss)}color:${escapeAttr2(strongColor)};">${leaf(unescapeHtml(value))}</span>`);
  html = html.replace(/&lt;u&gt;([\s\S]+?)&lt;\/u&gt;/g, (_all, value) => `<span style="${escapeAttr2(theme.underlineCss)}color:${escapeAttr2(strongColor)};">${leaf(unescapeHtml(value))}</span>`);
  html = html.replace(/==([^=]+)==/g, (_all, value) => `<span style="background:${escapeAttr2(theme.highlight)};color:${escapeAttr2(theme.title)};padding:2px 7px;border-radius:3px;font-weight:700;font-size:14px;">${leaf(unescapeHtml(value))}</span>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, (_all, value) => `<strong style="color:${escapeAttr2(strongColor)};">${leaf(unescapeHtml(value))}</strong>`);
  html = html.replace(/__([^_]+)__/g, (_all, value) => `<strong style="color:${escapeAttr2(strongColor)};">${leaf(unescapeHtml(value))}</strong>`);
  html = html.replace(/~~([^~]+)~~/g, (_all, value) => `<del style="color:${escapeAttr2(theme.muted)};text-decoration:line-through;">${leaf(unescapeHtml(value))}</del>`);
  html = html.replace(/\*([^*]+)\*/g, (_all, value) => `<em style="font-style:normal;color:${escapeAttr2(options.onDark ? theme.border : theme.muted)};">${leaf(unescapeHtml(value))}</em>`);
  html = html.replace(/_([^_]+)_/g, (_all, value) => `<em style="font-style:normal;color:${escapeAttr2(options.onDark ? theme.border : theme.muted)};">${leaf(unescapeHtml(value))}</em>`);
  return wrapLeafText(html);
}
function buildArticleVariables(context) {
  const custom = parseArticleVariables(context.settings.articleVariables);
  const author = context.frontmatter.author || context.settings.authorName || custom["\u4F5C\u8005\u540D"] || custom.author || "{{\u4F5C\u8005\u540D}}";
  const bio = context.frontmatter.bio || context.settings.authorBio || custom["\u7B80\u4ECB"] || custom.bio || "{{\u7B80\u4ECB}}";
  const title = context.frontmatter.title || custom["\u6807\u9898"] || custom.title || "";
  const subtitle = context.frontmatter.subtitle || custom["\u526F\u6807\u9898"] || custom.subtitle || "";
  const variables = {
    "\u4F5C\u8005\u540D": author,
    "\u4F5C\u8005": author,
    author,
    "\u7B80\u4ECB": bio,
    "\u4F5C\u8005\u7B80\u4ECB": bio,
    bio,
    "\u6807\u9898": title,
    title,
    "\u526F\u6807\u9898": subtitle,
    subtitle,
    "\u4E3B\u9898": context.themeInfo.label,
    "\u4E3B\u9898\u540D": context.themeInfo.label,
    theme: context.themeInfo.label
  };
  Object.entries(custom).forEach(([key, value]) => {
    if (value) variables[key] = value;
  });
  return variables;
}
function parseArticleVariables(raw) {
  const variables = {};
  if (!raw) return variables;
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match2 = trimmed.match(/^([^=:：=]+)\s*(?:=|:|：)\s*(.+)$/);
    if (!match2) return;
    const key = match2[1].trim().replace(/^\{\{\s*|\s*\}\}$/g, "");
    const value = match2[2].trim();
    if (key && value) variables[key] = value;
  });
  return variables;
}
function replaceArticleVariables(text2, context) {
  if (!text2 || !text2.includes("{{")) return text2;
  return text2.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (all, key) => context.variables[key.trim()] ?? all);
}
function variableOrPlaceholder(context, key) {
  const value = context.variables[key];
  return value?.trim() ? value : `{{${key}}}`;
}
function underlineKeywordIfPlain(text2) {
  if (/\*\*|==|\+\+|<u>|`|\[.+]\(.+\)/.test(text2)) return text2;
  const clean = text2.replace(/https?:\/\/\S+/g, "").trim();
  const match2 = clean.match(/[\u4e00-\u9fa5A-Za-z0-9][\u4e00-\u9fa5A-Za-z0-9\s·-]{3,14}/);
  const phrase = match2?.[0]?.trim();
  if (!phrase || phrase.length < 4) return text2;
  const index = text2.indexOf(phrase);
  if (index < 0) return text2;
  return `${text2.slice(0, index)}++${phrase}++${text2.slice(index + phrase.length)}`;
}
function wrapLeafText(html) {
  const parts = html.split(/(<[^>]+>)/g);
  let leafDepth = 0;
  return parts.map((part) => {
    if (!part) return part;
    if (part.startsWith("<")) {
      if (/^<span\b[^>]*\sleaf(?:\s*=\s*(?:""|''|[^\s>]+))?/i.test(part) && !/\/>$/.test(part)) leafDepth += 1;
      if (/^<\/span>/i.test(part) && leafDepth > 0) leafDepth -= 1;
      return part;
    }
    if (leafDepth > 0) return part;
    return part.replace(/([^\s]+)/g, (_all, text2) => leaf(unescapeHtml(text2)));
  }).join("");
}
function leaf(text2, style = "") {
  const styleAttr = style ? ` style="${escapeAttr2(style)}"` : "";
  return `<span leaf=""${styleAttr}>${escapeHtml3(text2)}</span>`;
}
function leafBreak() {
  return `<span leaf=""><br></span>`;
}
function shouldAppendSignature(blocks) {
  const tail = blocks.slice(-3).map((block2) => {
    if (block2.type === "paragraph" || block2.type === "quote" || block2.type === "heading") return block2.text;
    if (block2.type === "callout") return block2.body;
    return "";
  }).join("\n");
  return !/我是.+(欢迎|点赞|在看|转发|下篇见)|点赞、?在看、?转发/.test(tail);
}
function toPlainText(blocks, frontmatter, context) {
  const lines = [];
  if (frontmatter.title) lines.push(replaceArticleVariables(frontmatter.title, context));
  for (const block2 of blocks) {
    if (block2.type === "heading" || block2.type === "paragraph" || block2.type === "quote") lines.push(replaceArticleVariables(block2.text, context));
    if (block2.type === "list") lines.push(...block2.items.map((item) => replaceArticleVariables(item.text, context)));
    if (block2.type === "code") lines.push(block2.code);
    if (block2.type === "image") lines.push(replaceArticleVariables(block2.alt || block2.src, context));
    if (block2.type === "table") lines.push(block2.headers.map((header) => replaceArticleVariables(header, context)).join(" | "), ...block2.rows.map((row) => row.map((cell) => replaceArticleVariables(cell, context)).join(" | ")));
    if (block2.type === "callout") lines.push(replaceArticleVariables(block2.attrs.title || block2.title || "", context), replaceArticleVariables(block2.body, context));
  }
  return lines.filter(Boolean).join("\n\n");
}
function labelForCallout(kind) {
  const labels = { note: "\u63D0\u793A", tip: "\u91CD\u70B9", warning: "\u6CE8\u610F" };
  return labels[kind] || kind.toUpperCase();
}
function safeUrl(url) {
  const trimmed = url.trim();
  return /^javascript:/i.test(trimmed) ? "#" : trimmed;
}
function numberAttr(value) {
  return Math.max(320, Math.min(900, Math.round(value || 695)));
}
function unescapeHtml(input) {
  return input.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function escapeHtml3(input) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeAttr2(input) {
  return escapeHtml3(input).replace(/'/g, "&#39;");
}

// src/platforms/wechat/adapter.ts
var WechatAdapter = class {
  id = "wechat";
  label = "\u516C\u4F17\u53F7";
  render(context) {
    const result = renderWenote(context);
    const root = createEl("article");
    root.className = "noterelay-wechat noterelay-themed";
    if (result.warnings.length) {
      const warning = createEl("aside");
      warning.className = "noterelay-wechat-warning";
      warning.textContent = "\u6587\u7AE0\u5305\u542B\u672C\u5730\u56FE\u7247\uFF0C\u590D\u5236\u65F6\u4F1A\u5C06\u53EF\u8BFB\u53D6\u7684\u56FE\u7247\u4E00\u5E76\u5199\u5165\u3002";
      root.appendChild(warning);
    }
    const preview = createDiv();
    preview.className = "noterelay-wechat-preview";
    setSanitizedHtml(preview, result.html);
    root.appendChild(preview);
    return root;
  }
  async copy(context) {
    const result = renderWenote(context);
    const wrapped = `<article class="noterelay-themed">${result.html}</article>`;
    const portableHtml = await inlineLocalImages(wrapped, context);
    const html = makeHtmlWeChatCompatible(portableHtml, { safeMode: true, stripInternalAttrs: true });
    await copyRichHtml(html, result.plainText);
    return "\u516C\u4F17\u53F7\u6587\u7AE0\u5DF2\u590D\u5236";
  }
};
async function inlineLocalImages(html, context) {
  const host = createDiv();
  setSanitizedHtml(host, html);
  for (const image2 of Array.from(host.querySelectorAll("img"))) {
    const source = image2.dataset.noterelaySource;
    if (!source || /^(?:https?:|data:)/i.test(source)) {
      image2.removeAttribute("data-noterelay-source");
      continue;
    }
    const dataUrl = await context.resolveImageDataUrl?.(source);
    if (!dataUrl) throw new Error(`\u65E0\u6CD5\u8BFB\u53D6\u672C\u5730\u56FE\u7247\uFF1A${source}`);
    image2.src = dataUrl;
    image2.removeAttribute("data-noterelay-source");
  }
  return host.innerHTML;
}
function renderWenote(context) {
  const theme = resolveWenoteTheme(context.theme.id);
  const articleVariables = serializeAccountVariables(context);
  return renderWechatHtml(context.note.source, {
    defaultTheme: theme,
    lastPreviewTheme: theme,
    themeOverride: theme,
    accentColor: context.theme.tokens.accent,
    contentWidth: context.theme.tokens.contentWidth,
    authorName: context.account?.name ?? "",
    authorBio: context.account?.signature ?? "",
    articleVariables,
    autoSignature: true,
    autoKeywordUnderline: true,
    customCss: "",
    useCustomCss: false,
    safeMode: true,
    resolveImageSrc: context.resolveImageSrc
  });
}
function serializeAccountVariables(context) {
  const account = context.account;
  const entries = [
    ["\u8D26\u53F7\u540D\u79F0", account?.name],
    ["accountName", account?.name],
    ["\u4F5C\u8005\u540D", account?.name],
    ["\u8D26\u53F7\u4ECB\u7ECD", account?.signature],
    ["accountBio", account?.signature],
    ["\u7B80\u4ECB", account?.signature],
    ...Object.entries(account?.variables ?? {})
  ];
  return entries.filter((entry) => Boolean(entry[1]?.trim())).map(([key, value]) => `${key}=${value}`).join("\n");
}
function resolveWenoteTheme(themeId) {
  return isBuiltInTheme(themeId) ? themeId : "moyu-green";
}

// src/platforms/x/adapter.ts
var markdown2 = new lib_default({ html: false, linkify: true, typographer: true });
var defaultImageRenderer2 = markdown2.renderer.rules.image ?? ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));
markdown2.renderer.rules.image = (tokens, index, options, env, self) => {
  const token = tokens[index];
  const raw = token.attrGet("src") ?? "";
  const alt = token.content || "\u6587\u7AE0\u56FE\u7247";
  if (env.mode === "copy") {
    return `<p class="noterelay-x-media-marker"><em>[\u8BF7\u5728 X \u7F16\u8F91\u5668\u6B64\u5904\u63D2\u5165\u56FE\u7247\uFF1A${escapeHtml2(alt)}\uFF1B\u6765\u6E90\uFF1A${escapeHtml2(raw)}]</em></p>`;
  }
  token.attrSet("src", env.resolveImageSrc?.(raw) ?? raw);
  token.attrSet("loading", "eager");
  return `<figure class="noterelay-x-figure">${defaultImageRenderer2(tokens, index, options, env, self)}${alt ? `<figcaption>${escapeHtml2(alt)}</figcaption>` : ""}</figure>`;
};
var XAdapter = class {
  id = "x";
  label = "X";
  render(context) {
    const result = buildXArticle(context, "preview");
    const root = createEl("article");
    const tokens = context.theme.tokens;
    root.className = "noterelay-x noterelay-themed";
    root.setCssProps({
      "--nr-x-width": `${tokens.contentWidth}px`,
      "--nr-x-radius": `${tokens.radius}px`,
      "--nr-x-surface": tokens.surface,
      "--nr-x-text": tokens.text,
      "--nr-x-font": tokens.fontFamily,
      "--nr-x-font-size": `${tokens.baseFontSize}px`,
      "--nr-x-line-height": String(tokens.lineHeight),
      "--nr-x-muted": tokens.muted,
      "--nr-x-border": tokens.border,
      "--nr-x-accent": tokens.accent
    });
    const meta = createEl("header");
    meta.className = "noterelay-x-account";
    meta.textContent = `${context.account?.name ?? "\u672A\u9009\u62E9\u8D26\u53F7"}${context.account?.handle ? `  ${context.account.handle}` : ""}`;
    const content = createEl("section");
    content.className = "noterelay-x-article";
    setSanitizedHtml(content, result.html);
    root.append(meta, content);
    const mediaPanel = createEl("aside");
    mediaPanel.className = "noterelay-x-media-panel";
    const title = createEl("strong");
    title.textContent = result.media.length ? `\u5A92\u4F53\u6E05\u5355 \xB7 ${result.media.length} \u9879\u9700\u5728 X \u4E2D\u539F\u751F\u6DFB\u52A0` : "\u672A\u68C0\u6D4B\u5230\u9700\u8981\u5355\u72EC\u6DFB\u52A0\u7684\u5A92\u4F53";
    mediaPanel.appendChild(title);
    if (result.media.length) {
      const list2 = createEl("ol");
      for (const item of result.media) {
        const row = createEl("li");
        row.textContent = `${item.type} \xB7 ${item.label} \xB7 ${item.source}`;
        list2.appendChild(row);
      }
      mediaPanel.appendChild(list2);
    }
    root.appendChild(mediaPanel);
    return root;
  }
  async copy(context) {
    const result = buildXArticle(context, "copy");
    await copyRichHtml(result.html, result.plainText);
    return result.media.length ? `X \u957F\u6587\u683C\u5F0F\u5DF2\u590D\u5236\uFF1B${result.media.length} \u9879\u5A92\u4F53\u8BF7\u6309\u6807\u8BB0\u5728 X \u7F16\u8F91\u5668\u4E2D\u539F\u751F\u6DFB\u52A0` : "X \u957F\u6587\u683C\u5F0F\u5DF2\u590D\u5236";
  }
};
function buildXArticle(context, mode) {
  const source = prepareMarkdown(replaceAccountVariables(context.note.markdown, context.account), context.note.title, context.settings.xIncludeTitle);
  const media = collectMedia(source);
  let html = markdown2.render(source, { mode, resolveImageSrc: context.resolveImageSrc });
  html = convertTablesToLists(html);
  if (context.account?.signature.trim()) html += `<p class="noterelay-x-signature">${escapeHtml2(context.account.signature.trim())}</p>`;
  html = applyCopySafeStructure(html);
  return { html, plainText: htmlToPlainText(html), media };
}
function prepareMarkdown(markdownSource, fallbackTitle, includeTitle) {
  const titlePattern = /^ {0,3}#(?!#)[ \t]+.+(?:\n|$)/;
  const hasTitle = titlePattern.test(markdownSource);
  if (!includeTitle) return markdownSource.replace(titlePattern, "").trim();
  return hasTitle ? markdownSource.trim() : `# ${fallbackTitle}

${markdownSource.trim()}`;
}
function collectMedia(source) {
  const items = [];
  for (const match2 of source.matchAll(/!\[([^\]]*)\]\((?:<)?([^\s)>]+)(?:>)?(?:\s+["'][^"']*["'])?\)/g)) {
    const path = match2[2] ?? "";
    items.push({ type: /\.gif(?:$|[?#])/i.test(path) ? "GIF" : "\u56FE\u7247", label: match2[1] || "\u672A\u547D\u540D\u56FE\u7247", source: path });
  }
  for (const match2 of source.matchAll(/https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/[^\s)]+\/status\/\d+/gi)) {
    items.push({ type: "X \u5E16\u5B50", label: "\u5D4C\u5165\u5E16\u5B50", source: match2[0] });
  }
  for (const match2 of source.matchAll(/(?:^|\s)(\S+\.(?:mp4|mov|webm))(?:\s|$)/gim)) {
    items.push({ type: "\u89C6\u9891", label: "\u89C6\u9891", source: match2[1] ?? "" });
  }
  return uniqueMedia(items);
}
function uniqueMedia(items) {
  const seen = /* @__PURE__ */ new Set();
  return items.filter((item) => {
    const key = `${item.type}:${item.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function convertTablesToLists(html) {
  const host = createSanitizedHost(html);
  for (const table2 of Array.from(host.querySelectorAll("table"))) {
    const headers = Array.from(table2.querySelectorAll("thead th")).map((cell) => cell.textContent?.trim() || "\u9879\u76EE");
    const list2 = createEl("ul");
    for (const row of Array.from(table2.querySelectorAll("tbody tr"))) {
      const values = Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent?.trim() || "");
      const item = createEl("li");
      values.forEach((value, index) => {
        if (index) item.appendText(" \xB7 ");
        item.createEl("strong", { text: `${headers[index] || `\u5B57\u6BB5 ${index + 1}`}\uFF1A` });
        item.appendText(value);
      });
      list2.appendChild(item);
    }
    table2.replaceWith(list2);
  }
  return host.innerHTML;
}
function applyCopySafeStructure(html) {
  const host = createSanitizedHost(html, "article");
  host.querySelectorAll("h1").forEach((node) => node.setCssStyles({ fontSize: "32px", lineHeight: "1.2", margin: "0 0 20px", fontWeight: "700" }));
  host.querySelectorAll("h2").forEach((node) => node.setCssStyles({ fontSize: "24px", lineHeight: "1.3", margin: "28px 0 12px", fontWeight: "700" }));
  host.querySelectorAll("h3").forEach((node) => node.setCssStyles({ fontSize: "19px", lineHeight: "1.35", margin: "22px 0 10px", fontWeight: "700" }));
  host.querySelectorAll("p").forEach((node) => node.setCssStyles({ margin: "0 0 14px", lineHeight: "1.65" }));
  host.querySelectorAll("ul,ol").forEach((node) => node.setCssStyles({ margin: "0 0 16px", paddingLeft: "24px" }));
  host.querySelectorAll("li").forEach((node) => node.setCssStyles({ margin: "0 0 7px", lineHeight: "1.55" }));
  host.querySelectorAll("blockquote").forEach((node) => node.setCssStyles({ margin: "16px 0", padding: "2px 0 2px 16px", borderLeft: "3px solid #8b98a5" }));
  host.querySelectorAll("a").forEach((node) => node.setCssStyles({ color: "#1d9bf0", textDecoration: "underline" }));
  host.querySelectorAll("figure").forEach((node) => node.setCssStyles({ margin: "18px 0" }));
  host.querySelectorAll("img").forEach((node) => node.setCssStyles({ display: "block", maxWidth: "100%", height: "auto" }));
  return host.innerHTML;
}
function htmlToPlainText(html) {
  const host = createSanitizedHost(html);
  host.querySelectorAll("h1,h2,h3,p,blockquote,li,figure").forEach((node) => node.append("\n"));
  return (host.textContent ?? "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// src/platforms/rednote/noteToRedThemes.ts
var UPSTREAM_PRESETS = [
  { id: "default", name: "\u9ED8\u8BA4\u4E3B\u9898", background: "#1c1c1e", surface: "#2c2c2e", text: "#f2f2f7", muted: "#98989d", accent: "#0A84FF", border: "#2c2c2e", title: "#f2f2f7", code: "#2c2c2e" },
  { id: "minimal", name: "\u6781\u7B80\u4E3B\u9898", background: "#ffffff", surface: "#f5f5f5", text: "#444444", muted: "#999999", accent: "#6c9eb8", border: "#eeeeee", title: "#333333", code: "#f5f5f5" },
  { id: "warm", name: "\u6696\u9633\u6587\u827A", background: "#fffaf5", surface: "#fff6e9", text: "#5a4a42", muted: "#b87333", accent: "#d2691e", border: "#deb887", title: "#8b4513", code: "#fff6e9", quoteBackground: "rgba(222,184,135,.1)" },
  { id: "elegant", name: "\u4F18\u96C5\u6697\u8272", background: "#1a1721", surface: "#2a2433", text: "#c4b8dd", muted: "#a393c9", accent: "#b490ff", border: "#3a3443", title: "#e2d9f3", code: "#2a2433", quoteBackground: "rgba(180,144,255,.05)" },
  { id: "forest", name: "\u68EE\u6797\u6E05\u6668", background: "#17231e", surface: "#243830", text: "#f1fff6", muted: "#9adbb5", accent: "#68e6a0", border: "#4ba978", title: "#b9f6d0", code: "#243830", quoteBackground: "rgba(46,204,113,.09)" },
  { id: "ocean", name: "\u6DF1\u6D77\u4E4B\u5883", background: "#0a192f", surface: "#112a45", text: "#e6f7ff", muted: "#69c0ff", accent: "#40a9ff", border: "#1d3552", title: "#40a9ff", code: "#112a45", quoteBackground: "rgba(64,169,255,.05)" },
  { id: "sakura", name: "\u6A31\u82B1\u98DE\u821E", background: "#1f1a1d", surface: "#2d2428", text: "#fff5f7", muted: "#ff8da1", accent: "#ff69b4", border: "#ffb6c180", title: "#ffb6c1", code: "#2d2428", quoteBackground: "rgba(255,141,161,.05)" },
  { id: "starry", name: "\u661F\u7A7A\u68A6\u5883", background: "#0d0f1a", surface: "#252640", text: "#f0e6ff", muted: "#b19cd9", accent: "#9b59b6", border: "#9370db80", title: "#9370db", code: "#252640", quoteBackground: "rgba(177,156,217,.05)" },
  { id: "metal", name: "\u91D1\u5C5E\u79D1\u6280", background: "#1e2228", surface: "#282c34", text: "#e0e0e0", muted: "#a0a0a0", accent: "#4d8ee7", border: "#4d4d4d80", title: "#f0f0f0", code: "#282c34", quoteBackground: "linear-gradient(to right,rgba(77,142,231,.1),transparent)" },
  { id: "cyber", name: "\u8D5B\u535A\u670B\u514B", background: "#ffffff", surface: "#f8f8f8", text: "#333333", muted: "#666666", accent: "#ff00ff", border: "rgba(0,255,255,.2)", title: "#ff00ff", code: "#f8f8f8", quoteBackground: "#f8f8f8", glow: "0 0 15px rgba(255,0,255,.1)" },
  { id: "yueling", name: "\u60A6\u7075\u96C5\u68D5", background: "#1c1c1e", surface: "#2c2c2e", text: "#ffffff", muted: "#98989d", accent: "#c57512", border: "#2c2c2e", title: "#f2f2f7", code: "#2c2c2e" }
];
var NOTE_TO_RED_THEMES = UPSTREAM_PRESETS.map((preset) => ({
  id: preset.id,
  name: preset.name,
  description: `\u79FB\u690D\u81EA Note to RED \u7684\u300C${preset.name}\u300D\u9884\u8BBE\u3002`,
  platforms: ["rednote"],
  builtIn: true,
  tokens: {
    background: preset.background,
    surface: preset.surface,
    text: preset.text,
    muted: preset.muted,
    accent: preset.accent,
    border: preset.border,
    fontFamily: "Optima-Regular,Optima,PingFangSC-light,PingFangTC-light,'PingFang SC',serif",
    headingFontFamily: "Optima-Regular,Optima,PingFangSC-light,PingFangTC-light,'PingFang SC',serif",
    baseFontSize: 16,
    lineHeight: 1.8,
    radius: 8,
    contentWidth: 828,
    cardRatio: "3:4",
    cardPadding: 44,
    title: preset.title,
    code: preset.code,
    quoteBackground: preset.quoteBackground,
    glow: preset.glow
  },
  customCss: ""
}));

// src/themes/builtins.ts
function wechatTheme(id, name, description, accent, background, text2, muted, border) {
  return {
    id,
    name,
    description,
    platforms: ["wechat"],
    builtIn: true,
    tokens: {
      background,
      surface: "#ffffff",
      text: text2,
      muted,
      accent,
      border,
      fontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif",
      headingFontFamily: "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif",
      baseFontSize: 15,
      lineHeight: 1.8,
      radius: 18,
      contentWidth: 677,
      cardRatio: "3:4",
      cardPadding: 32
    },
    customCss: ""
  };
}
var BUILTIN_THEMES = [
  wechatTheme("moyu-green", "\u6478\u9C7C\u7EFF", "\u6E05\u723D\u7EFF\u8272\u516C\u4F17\u53F7\u4E3B\u9898\uFF0C\u9002\u5408\u6559\u7A0B\u548C\u77E5\u8BC6\u5206\u4EAB\u3002", "#059669", "#ffffff", "#334155", "#64748b", "#a7f3d0"),
  wechatTheme("red-white", "\u7EA2\u767D\u8272\u7CFB", "\u9AD8\u8BC6\u522B\u5EA6\u7EA2\u767D\u4E3B\u9898\uFF0C\u9002\u5408\u89C2\u70B9\u548C\u70ED\u70B9\u5185\u5BB9\u3002", "#dc2626", "#ffffff", "#333333", "#737373", "#fecaca"),
  wechatTheme("graphite-minimal", "\u77F3\u58A8\u6781\u7B80\u98CE", "\u514B\u5236\u7684\u9ED1\u767D\u7070\u7F16\u8F91\u98CE\u683C\uFF0C\u9002\u5408\u957F\u6587\u3002", "#52525b", "#ffffff", "#52525b", "#a1a1aa", "#e4e4e7"),
  wechatTheme("zen-whitespace", "\u7559\u767D\u7985\u610F\u98CE", "\u67D4\u548C\u4F4E\u9971\u548C\u3001\u7559\u767D\u5145\u8DB3\u7684\u9605\u8BFB\u4E3B\u9898\u3002", "#4a5d52", "#ffffff", "#4a4a44", "#8a8a82", "#b5c8bc"),
  wechatTheme("moyu-ticket", "\u6478\u9C7C\u7968\u636E\u98CE", "\u5E26\u7968\u636E\u611F\u548C\u4FE1\u606F\u5C42\u7EA7\u7684\u7EFF\u8272\u4E3B\u9898\u3002", "#059669", "#ffffff", "#2f3a34", "#64748b", "#86efac"),
  wechatTheme("olive-journal", "\u6A44\u6984\u624B\u8BB0", "\u6696\u7EB8\u5F20\u4E0E\u6A59\u8272\u5F3A\u8C03\u7684\u624B\u8BB0\u98CE\u683C\u3002", "#ed7b2f", "#ffffff", "#3d3a34", "#83786a", "#d8cbb4"),
  ...NOTE_TO_RED_THEMES,
  {
    id: "x-clean",
    name: "X \u6781\u7B80",
    description: "\u7528\u4E8E X \u6587\u6848\u9884\u89C8\u7684\u9AD8\u5BF9\u6BD4\u6781\u7B80\u4E3B\u9898\u3002",
    platforms: ["x"],
    builtIn: true,
    tokens: {
      background: "#000000",
      surface: "#16181c",
      text: "#e7e9ea",
      muted: "#71767b",
      accent: "#1d9bf0",
      border: "#2f3336",
      fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      headingFontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      baseFontSize: 16,
      lineHeight: 1.5,
      radius: 16,
      contentWidth: 600,
      cardRatio: "3:4",
      cardPadding: 24
    },
    customCss: ""
  }
];

// src/themes/themeService.ts
function listThemes(platform) {
  return BUILTIN_THEMES.filter((theme) => theme.platforms.includes(platform));
}
function resolveTheme2(settings, platform) {
  const themes = listThemes(platform);
  const selected = settings.activeThemeIds[platform];
  const theme = themes.find((item) => item.id === selected) ?? themes[0];
  if (!theme) throw new Error(`No theme available for ${platform}`);
  return theme;
}

// src/ui/infoModals.ts
var import_obsidian4 = require("obsidian");

// assets/wechat-sponsor-qr.png
var wechat_sponsor_qr_default = "data:image/png;base64,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scZvOg66gUfmRNYw2DxJfteUjtphP+j3kUceKe5yMePFF19UVecceszfYHj66acXxx13nKeFncAnV5uEbrjee/75xc6dO72e2tJYN57jERuEt4997GMeS+xUbxatbcK3fV65Z224jmqyAsaQT+KLrH1z6o/AqSefXLzvwguLww5biUfCOJarLDYq9oitYONnn332zMZpi73Ql8vaTYzOGGXMsawB2ecwP+DzzOldEn6H3MyLP/vZz/yakn1KisS64Dw353AxBhh3SWBOX96an3TiiT62/du//Zv/ArCP04Id8p9z7rnFJRdf7HHswl/fPpPdoF955ZXFuQ4cfeqEElFqG0egLYH5NffZ9C/covOO228v/uUb3yge2LXL0wU8JhctIAja1sm0GOkLcpv+GAYb9WVKxxxzTPG5z32u+PjHPz57U4BzoA8CgiZ79Eki12VxUj365GDnb//2b/0G3bbZyPfYzgMPPFDceOONxXUuQGPn4Mhlk+za2rqtF45sVAh+X/rSl4odbhPEBp1EfVlfSyffr0WAifO73/1ucf311/tYxgK8C442TtH/pZdeWjtQjydi5Y/dxooFPJ8nw2M4HuRlI7qXjdly6lggYG9sBrpOwtBRYhxiwi9+8YuCAwR4ZbNFYhzwEKZ1di6aijFXX3118Tu/8zvFmWee6X0Gfpl/SNrcqA95KKutS33Pzw6Y/2644Ybiq1/9qj9E4HBGssbGC/njGTm4kI1n6J7oFjZf/l//q/jyl7/s9f3WW2/FyO0vA+P9T/4OPqCHvTz88MPF97///eL//N//W+xyMejVV1/1i7CQn4DEKI/wiXynnnJy8dlf+Vxx1VVXFZdeeukkN+iseVjAnnbaacVHP/pRv9BWPCdnNgz1UAUi9kO/b3/728Vf/dVfzeKGtSGrI1teRpf2bHwvdovYL37xi8Xll1/ubZK5CP6xB1ITWrYdvB555JHe5uG5b8LOTznlFG/jv/Irv+JtVXQls/AMefXPEZvvy1PYn3HgiU16Tv0RONcd8vzhH/5hcYZ7wcDGlbhHmunb2a6e/R3PTgdhooQ+XNjRsW69SmJe5MLGVe8r5vgPcxkHef/8z/9cfOc73/Eyy85Du65jE5noyxzI2oWfClsaVmZbXkeXetaSn/3sZ4vf+73f83sw1pptE+OT0Ct7pltuuaX46U9/Wtx2223+ABtdSedtaSMrfX/3d3+3eJ87MOtKp+24YfvJbtA59dLJF4sJnECGFgpR97zXGe2zzz7rF3BPPPmkf0OkPigZ2hiYFniqU97W+NSvTS4+yNsuZMfgr40sbduyoWaTXpbQS1vdM7kv20QHTgQW3rKxOedNKEmBzOLbxmaedD6jjYqlke/bIYBfs1FN8eaKkUO9hs/tuFtpjQ3xpp9L9NrYSpcx2/YBxyH4ZCPJZpU3gUoswFgG8F8+TSHxxpfNS9tkdamFJYsO5j4OYo4/4YTiZPfGKUWCPolF04MPPjjJ2MFC9oInnvCbVDaTU0zoDF1zHX300Subh9VFaR9+0XMTG2L8Jr6PHemLBF6qkLRm68On+sIDl2xY5W1y1g+8ZbN/E6FN/9x28RBgE8hhK4dcbNCxAWzI2pG9L5OQ+M8mnbiGHUJHfqF75qOQdhm9IcolB3wQ21ivPf30072GEk3J2otY0BnarPnPOeecoKbbI7rma1nWv7zxZw2cIkFnCPmb8jbZDTqGpokeZfLM1SbRj8njLWewWtQBtgxPtKirSmH7qrZ96sTHPA2iD/+9+zIRlxCxugefGEboiXIWnSy6ZD8lJDdsMRhYvGKCVtl0iC0+xAQHnvSr6hsbK5fFEWiLo/SCffN2iv7oBN2oLj5Su1LxZXPRVy6KaqPnJnlIo0kftVHf2LgqC9uoXDTCXL7CYosYLDu3Czpoejoudzd+szSLVSoLCSd8lgz6YzhNSM94No2RTfhITv8F2ep8i6/bTyL9OwrkNQlewotq8CIJT9pAj6T2GtsXzukfeIAvdM01BZ7KoOAnRtiZ8KNdV36hQUI/oteVlie0+o9wtGXQh7bGtHXzuA/5COUOn+Ex7DMm3/Mce0w5hxwLDBWTuLdXm3EV5xXL1Jdn7IY4ik+pfp66Q17WB1zwhG/aeCze550LN/iD174JeoprrI2UuupC8UD2I3pj5/2RGYhjgMXg5VQCLDZcrE79aG8daeoTckw+ymIylrVd2HKCaIT5dU7mnFFBk+ZgwxU607p+EdobrUh2b+3F3neVF2y5RCu2cO9Ke1n7Ccu28rMgYFNOYlLqSqdsXNEjx570HGtfVRe2r6MVtq97rhtb9cqb0INHG0fsve/v6pXPYpXK6gZIUM9iZtOqL8KbFl91pGMY2DL+m08tMJVDU/EkpE95WT118KWLdoxlx/Od5/gPPkQCQ8kyR3bKh3ZYHhjYV19+6d9EH031BYbeLlcPYxDG2lC5cM1qrLz2nt5YoV0LNKO4fvMd0m1KJ7ebLgLoVHrFPnWfgmP5hh0jBd2+NIi57HFINv7yLJ65T5H60iNupIoT0CIR1xXbee7LY9/+8NAnTXqDbh3K3luBAZA6AemXDcYxaat6FCfjtTSmfi/ZxGcZFqrfCHkoc51MtOcSNmFwquu/EeqRPbZYEibI2BZX4cJbNkvHPagq5yMiIB2UTUJd9RsTQWMp70u7b394TEEjJmtYxjjI7XMqJ2LvLDT5w6YsbLQoCXm3z5KDshA76ZU6uwmENvHTl69uYNVWNJTTxo7Bs2Iv5SGPokO7NsmO17Sfxor1pY43LeviWlPiI7WTDH2Hszri/wmWfqvoMnYZdvSjDv1iL6k3QHV82fo8E1k0lvve2iw2budJi4zsuot/qa9yxTieVdaFruWv6z3jl8nclWZVv67ygo+uKvpN64R9TH7pQryW0VQ76tXWlpX1G7J8shv0pkIDoMD0fdxzLK1pE2uQyyaDQNZVd1UMFVCGottd0tyzDoF1sbGuQ1AvP+xLJyA76UdkDeX1nxhPhGt465Kky6Z9LQZ2TFteRYvxYptAypvSaNquio+qOitXVbuNWiddSL6ueNBPl2jlPCOwURHA1m08XeM3q/FtXrJbvsbkIYwlTcZeg1uTDjVtJHu3GbKG+JyqF36D3hS3jaS0pjIvUjs51yLxPEVeh8JxKLpTxHDKPEkPdnKz9yHv1KlPWNf0uW//puPkdvUIdNVFHztgTNlY1/GtZE1pNG1nabe5H5p+G14Wua1wVL7IsmTeMwJNEFA8XNe24wHqOjotCxbR91LzrP/roctPXlrCPVrzpdmgj4boCAOlNuwRWM5DZAQyAnNCoM/mbE4sz2VYcNLnilqAKZ8LQ3nQjEBGICOQEVgIBPJcsRBqWigm8wZ9odSVmU2BgAJpPuhIgWamsQgIyObhNdt9ucYsTuWtck1GICOQEcgIZAQyAhmB4RDQVwHDjZApZwQyAhmBjEBGYOIIsDnPG/SJKymzlxHICGQEMgIZgSVAIG/Ql0DJWcSMQEYgI5ARyAhkBDICGYGMQEYgI5ARmD4CeYM+fR1lDjMCGYGMQEZgHgi4P5CWU0YgI5ARyAhkBDICGYExEcgb9DHRzmNlBDICGYGMwMIgwPY8/2Z/YdSVGc0IZAQyAhmBjMCGQCBv0DeEGrMQGYGMQEYgI5ARyAhkBDICGYGMQEYgI7DoCOQN+qJrMPOfEcgIZAQyAhmBjEBGICOQEcgIZAQyAhsCgbxB3xBqTCPERv4LxhtZtjTaz1QyAhmBjEBGICOQHgF+JpJ/KtIA1/w3LxqAlJtkBJYDgbxBXw49N5ZyXhvZAxpzWN4Q3ufFfzlXuWbSCDibCZNsSHlYn58zAvNCoK1Ntm0fk8vS0L31GpXF+uayaSPQZdNs+7z77rteQFsWSmzr7H3YbtmfwSb1n6S0vhnDPlZm9VBXP2u7Oo/a8WZ1+aYUgY2EV2NbKUUjV4QIbA4L8vPiI2AdZe/evf7kmkCQKhikorMGafhbU9D8AX4OPHDtWdPWrVuLTZs2rSFCO4vNmsr8sOERaGO32M/mzZvX2dVUQJqnHQvHefIwhB727ds3BNmkNIewSfS5ZcuWGZ9hLJ1VrN54/VfEa3gksXl7++23V3vlbJ4IyGfhYZObK2O23saf1RYdQ4tLZfOUc6pjg43VQRmfTdqU9Y2V+3ixuu5hLajURlextpTZmAHdrrxDh7XagcQUdy1TQj/Ct4/s9BWdeeLXlIc9e/YU77zzzoxV+vWRf0Zog93kDfrEFIqREqy6Gqv6aWN+8MEHFwe4CZmJlCvctHYRH2fCuaBH0phdaKlPU8dWe5vTl4uFpfB74403Cjsh2fb5fr4ISF/YTx+9t5Giahxrv/gHi03sZ/dbb0UXsm3GtW0Zh0t2auva3Ft+2/RT2yosaINvS0fqM6Vc8qfAErkUJ7Zt25b0QEYYprBzLYbfWrVJxd6+eoFH7B260MQ2WTyJPhjrYizZjnKrC7/Idv3ZlFPOIdchhxzi6bEQVdsuPDOe7LJL/7H6gNu7+M9YAzYcB/zQBwl9H3TQQWueteYrwPJ2AABAAElEQVSwhzPIIj3bYaRH7IT1BX4DvRRrC42zKPoGr6bxHJmEneQMc9l4DPewbdUzPKEPHy+cPfKML7744ovrDp6rxoJf+pLgTbGSsjfffLM47LDDvD1BQ3TqZLR8E9eg4zdsJfZm28/zXjJ6H3e8Sk7lkr8Jj4rnu3fv9nT6+k44tj+YcToSz/AkPpvw16UN9K2thDTEI3Z06KGHzuJP2C4/70cgb9D3YzH3O5yKIHr00UcXhx9+uA98TKY24QQxZ3bFzgH3TxY4A31PP/30Youjy6KJYK0EDTlTE8e1bQhQzzzzTPHCCy/4YM/Ej9NR3ib5s1LHuBxXeRsatEUOLniEB3h5+qmnipdfftkvIJgASF3p+875nyQIoANsEZ2gHzbCJGtfSQZaJYKNabFs9a/xlNOcevwC+3n99deLx594wuerpHpnTMrHHnus93F8Rv7XhLDlPda+rj7WJywDCxZgr732mr+0GQzbzfMZHomTbAy2b99eHHHEEX6DIJ4Ug4SHctXHcuwRnZ900knr3grF2jcpY1ywBMNXX33V27l4a9I/bIPtcD366KOeHvwq5tm2Vl5r27Sxz2rHHIGtQ/fuu+/2uEKbei54tnxDQ30tTcrwHez6KRd70dEJJ5zg5WY+a2vvoi0eWMC/9NJLfoNB3VQTun7uuee8PaGfEL958Q2O0gH+/Z73vMfziK6lb3SLDskVm+Bf+lYuGdAJG/NTTz3VxzU26krYlWhZu1N9XY7fgCPzBONyiU7Ih2ipXs/Ky8pV3zZnfDBD9iOPPNJvNlIc7kETuV955WV3veptR3poyiOy0ocLH3z22We9fxMrWQuyrlS9aNoDpRBb6Ak/6ogV2AS6feSRR4rjjjvO+zj61ubd93Ft7WqQLf4vHa0wweOrzh45OCAO21gTtp3nM7IjH/b4/PPPexwUk6UjMLD+Ar8hnpJBfZ9++mk/f3HQ8corr8wwrOorfYhWmMPPKaec4n0Se4Jn9GX9UTxb/YZ0mj5LRmiJrnCgTPXgwz1tTjzxRL/PwebFV9Pxlqld3qBPRNsYMptzAt573/te72AYOUFBBi5nkkGH5XIQ6knU79ixozjqqKN8kIWeJk71bSO++jDB/+IXvyjuuecePwkwOeFoXCT4aJNEt00f2qofQV6YIB+BniD6+OOP+/KQLv3a8hjSyM/dEAB7To054MF+nnCbYHQhm+1GtVkv2YtaM663VJerjskDP2FiY/LEjlIl/JtFEgtaFnYs8DSRNR1DfIbty8rDdnoO24MFfoRvP/TQQ14vyI8/TSnBNxsNYhob6p07dxbHuA2g/r9yyRXmVTIoxp533nl+0x+2bRfN9vfGhrDz+++/v3jyySf3x0eaOLzbJPwD/bCJxiaJcSTFMcnbhiZtocPGF7rYJ5doYps2ros29RqPz1KRhbaUwycbN3g966yzimOOOcbPYdrAqJ9oVeXiAx6wyzvvvHPyG3QOJ37yk5/4+IGdCj/kljxVMg9RJ8yJbfDAwSi2TiyCP8Ug6mijdjzTN7zEI7GBjQaHjmeccUZxuNtkKKlPV5nZCLLGAE9sFD7hqyqVjVVWXkWrqg68sHEOnlirEc91+FHVr0kddB988CHvj8Ql8G2b8EFhxVzLxg8/vOSSSzyOFg/piZykXGPSVu2pI6ahd/z5pptumh3owSu8k2gfoyOaNofPtx2Pz7mYxksV+J1qYqOLPRIrWbegm20ctLtYR0J+7FQpxEDl5OiIizUqti6MqaOffaZMqazc1rO2wL+xTfTFoSFjEZPBmws6yukrulU8a4yyXDSoj9HBRvAd+MAe8ZtYuzL6y1ieN+gT0TrGrYD/mc98prj44ov9Ah72MGIuOYDykHVfjuO5S4kFF87AGyccA0elXYxGlbNQt88FoDecwz/88MPFtddeW3zve9/zQYmNBvU4X5+k8fdzX01Nb0YlE609n6ubdN7wE6BiSWPF6nLZcAiAOxMSm8Dvfve7xc033+xtkQXOFBKTFnbMIkQbrFR88VnXRRddVFxxxRV+88LbjL1uHGe0tUPgE/WtasnMGoT2z89gtjk/ZlP+wx/+sLjxxhv9wk5fOKijjRvch3TUbuiczflll11WXHXVVcWZZ54522gwro9vKzczNizfs8LVG8UtNv3oiGe1Vx72qXuGBgujBx54oPjOd75T3HLLLZ5HYnCXpMUUNNnss2lhjBD/pvyqHXZOnLz++uv9wtNuCKAdjqF+yABPSixMaQ+9k93b2Ss/8hFv52ze/M+sSuYc9Y/mzGP4hsufd29Tv/71rxd33XVXtOlUCu9xi/d/+Id/8JjKluyifZ58soFAR/jNF77wBf8WC/1q/pRufe4wZx3xLviTlK88+WfqsAFiN28AebmgJJp6bpvzRvVHP/pRceutt/oDKTZu+I54jNGz9qj6qvZq0zZno8HccPbZZ/uuyE4s7+rbGl/y3XbbbcU//dM/+XkSG+qS0Cv6Zk3JnKMDGTZv1ClZfMJYEmsDj8h/3XXXFX//93/vecS/SWX9RYdc85gdF/8gnrEu4PBoignMsEleKlxzzTXF7bff7nGQzuBZMZB7Kx/PYVI8Z9MPXeK6DjhoG8Oyjib12OGOHTuKT3ziE8VnP/tZ75+MQZ3tr3vlIX9l5WG7Ns9gyAVtYgZv0WM+24bmRm/bbbWw0VGZg3wYKptpFp7vf//7i49+9KNz4KJ6yHfchMzExBscThE5QV2UFAt4i8L7huLT2RCTMTbEYpuJblkSB1l8evb+Cy8sLnaLpr4LuiFw2+neSD/nPovctWuXn0TtGLFJm7J5+BYLEd4AXnrppf7tneWzz70WWX0XDmDCpoJPTLFx3qqmTjF9tB0DPjmE4cCMK0ViwfkRN39xcHLBBRess6MuY7B4/8EPftCl66h9nnRv2DjsYBMz1XTKySf7zSW6GSr19R/0fe+99/oDXL5CmWLiq44rr7zSr4nsprcvr4899liytRU/AeJLFn5uwhv0448/vi97vj8HjjfccEMSWotAhDjJRhdbZN3CAXbqRDzvO5/yZQMv5DiQQd9TT+DKlWIum7qsXfjbfwTepXfukxQB3j6wQJzX28QqJ6GO37LzhoXT8ZwyAp0QWJ2EqmytE90F6eRPkZ2Pp1zQpRQdvvZNmD9kZfGviT2l7KKdwjZ5U0SCVt/Nygqltf+m4BGK4Jg6MX+Jv1T0dXCSmtfU9JB7EeZH8BwiyS/76p04xCHHUHymkJ0D1ya+LUyajinfadq+qh22qPFT2iW0eKG0LAmdsPYltvW17SExw1/YR0x1fTGk7BuRdn6DPiGt4lxdTt4VgK0oPsiz+FrdENm6qnv6lQWgTW6Dzls/rjDYp5xUqvgrqyvjuax9Lp8vAixs7Oe087afEI0h7El+qsVn0oM4TqKdENoYhvLUPju/J/HWl0/tiENTnuThjYUIVzSt4tFGj7LBJovu6Ji2cDXuTt3OJTPxXHKDGXOR7NWKpXv107PFGb+G1jurOmIj0zdhk1PerEk+cERe/AgchKPq55lLR8zj+A+8oSfpUmXSu8rJ7VUnA/1t37r2sXpowA904JF7kqUreWL9hyqzY/K2covTt3hKMSb0pRPuu9C2PGKD0EDXwrCKT9vXtovxgZ2HP4GyfTbaPVgic7j2LZMzhllZ2xTl6A49Eyv3TOgLHvj6Jf676suhrGPjFI4/5ee8QZ+QdhQclVexpjbe+HEAd9nkjZ4yM7lS39cZ6M8EEqZw/LA+9bOVY+yxU8uybPScCS1lwm9Y1DHJd7Vfa+vQ0LPyrsBqUcgijk1vX3pd+WjTr3LBSdxzxLjWRsbyEaxOylttzBqwFJ7SvfKYxKqLYQYdyvn/tmP1MXp1Zano1I2Tsl6HR8IqJe0+tPB1Dgf9RsOsG+CTy+su2HhKBtlI/fh43fp1Av2a6JLxGEvj2vHgGxqxOtrFeCxra+k2uQ/Hjf1l8iZ0qto0waeqv62zv5G25WX3bcbu8jKpbNxFKMdvwJO8SUppc03Go418xm+Im3ay7YgB9jnBPThwWCvb0h8WhbTKEgyzIUnkDfrE1Iox1zm26n3u2rsOXgqeZfBqo72Q6mblboKLJdW3rYu1H7Ksis8hx820+yGA3lbNtR+hBezNxM4pPJN8iiQfWMG037QKDWKHaMUWuSl4TkVjthCpMyYnUzzSpeIkTke6iddOrzTkN3xuyzG21HQh25b2orTvi+FQcqKb2VtAd0+CV/Er3ZEryd/0vL9GJSv5/ihU1mJt+6on+InFIfGl3NKQDLZsqHuL2VQntaF8ENl5W7tMCXuL2dzUMFhjly2Z2++/LTvWNLe4MUb/6FAz4AapTrNS3CBgzFsMBQBrzCFP6yag1UkUg68Lxuqr3I/n+sWcsoyHMucvax/yP8Sz5BmCdqbZDwGrG2xE9mPL+42wWL0lt/UXe18nTaytMK3rW1Wv2EGuq6p9rosjgC5CHcU2GfHe0ykNZejEmcPCJtm+Lau6tzy07VtFd8g6dL2I+g4xsdhTR0xoqwO/CDeb/HCMqmfG51Jcsm2rNoZ1PFIfymZpV92HtHmWvmd/7b6KQMM66IZjNey6rl8VVk1p5nYrCEjXTXXT1c764K25u+vYXfvV8Tw7EHQNhxqjjodFrM8b9AlpTc5VxlJZYMDgK42egF9CtKy8pLkvLuOjqs+Qdcg+NZ6GlHdRaMd0QpmuKcsxpE2F8sdwstjULXQrfd8SanAPrZT0Ggy5YZpYPUrHyjeMkC0E6TK3hOTBb9HscVE36HVvtcbWQzienq2fhfZS9mz72Puy9k3KtWEjT0UzHDcF3RQ0Qr6W8Rk9c+AxZTzxEf8TkAkpSH47IZYWhpW8QZ+QqjBkNukxg44FhVg7xFlXzqJ7VU7oqF55DILYeLSjPFZn6cbopSyLjZ+SfqaVBgHsS7qSfZDHFjRVtpiGm3ZUxHe7Xs1bgwEphkWMCvjgw3bTMzXMYnwvU1moH9m6xWBou7Jj5fvxEUC/WcdpcPcxz8W9rmloPRC7ufh97dBjtcEA3MRPfoPeBrnqtl7XLT7rlw6qqcZre8/tPfwmzlEunQcCeYM+D9RLxsQpYxv0Po4eDtXb8UOC5jkln4Zsvl1QBGQPyhGDe10LKlZvtmN4VBGVz9rNeVX7XDcnBFgUOfsmoWMdvpDn1A0B2X633rnXsiJgY+xQGMi/8fkxxmsih/yFXDwpb9I/tylHAByrYrmwT4E3NESvnKNcs9ERyBv0CWo45uDWYbs6rqXr6RnZw8V/1RiWjiGRbxMjEMO5Si9lw3tdj3SiGo7FcygHz0x09nQ/bFMmy1jlQ/AzW9A5IaRHDuTqxqKtf480kg7HwniMceqwtTykxFjjKrfjLOu9bH5Z5V8kubFb9BWz37H0yDj62Z/dGMV4CrEdkkeNT27vQx66PsM7F7S7yMEfIdWn2Ba3rvzkfisIWH1bTEIdhc+2bdW9bEltwmeVD5GvGwvbLhmoSr6quhJyubgCgbxBrwBn7Cr/9nyEQeWMZQ5YxYL6VrXJdQkQcAFy0VKVbaiOXJeVT/W2bKPd499KmsiUqzyWN2kT69eljLHGHK8Lj0P1weO6f1C7litr48tg22ulz08WgSH9KZVtxQ6nUtG2WHS574IfvHfp14W/qeBkeWeusQfCti7fd0CgZN0iStbWpmgP4jNFPqZvpeB3kWnkDXqN9uR4TZ2O9k3bxoY+wCziY/VdypryI1k1RpUsYVv6xMpEa+i8qYxD85GMvrMjZ0jJyI1BiEVejGN0U6efedrO0NjEZLfy2vuheUlBX/zG5EpBf0gaIc+SJcWY0OYSzVSb/RS8ZRrzQQBbkD2k5sDammiH9q3y2pz5xiTRVm6qRrlNgdlYvKfgVaCKlvSoXPV1Of3pk9+c1yGVpl76ErUyfZWVq1+q3L/kw5eNPzN2yGc43rp6118RIcb7uvYhwfycBIH9r3SSkFtuIjJa5YuERsiznpVPWZZYAJkyv014W0SZtDm3vNt75OZZVxMcNlIbFk18epjfbGwkrVbIYhZJFa1yVUZgUggoPvvYvRqv58FgirWHl2Fg5lOOwaaoD70+fdvAhG5S6KfNmIvadiydDIWP17UhnvVuwBj4Nr9BDwAuM76y8qD77LFNexy4TfvZIMGNAkFbWmH7uudg2Nmjxp8V5JtOCFThGNaFuooNSJuwX6xdl7Iyur90m1H+b9hYPWWx8i7jD9knNY/Q27t3r79S006NAzZjP8m39EPem9ig7d/1Phy3DZ2yvrZ8LDna8L3IbTcanrKVtnKpXypdil6Mj7BMbcvGpl59yHVPufoe6MpJqiujNcXypjxL1joZQnpN+9XRndUbHczKOtzoE/cOXRt1gT6/dV/0hP5CnfaRCVqyCeV96E2mL3Y5GWaWh5HF97CRdGWdeJ6Ol9pJrFxAGT6PBO9SDyN7CvOmoExJZ1YGey9Z4FWXypYlBw/eoNs/jrcssmc5lwcBfSEi/18eyYeVNMST576xH13x/yaTyuJyinGGRWbjUA910Ea/0hN9QlvZOAiVS9IYK+c3Ngk3W7bu3mFKajzGOgLNC7qMsYz6bo7o4rbMG/SGupv9tsO1xxm0CFH3YYOiCSirgULjdsnLAkBZeZcxcp9mCMiWaB3aVB0FP2W4k+wp6A05/CRB7hj39xEB4JUFIafvU+A7wuI4RcEioe2gZfhCJwWu0Mcec8oIdEFgmewHWct8rspPu+Ba16ftePg4vGt9Q2zWPCRaqqsbO9fHESizjVhr8Bfewj/WLlbGOLra9o3RqyqD/r59+6JN2sgbJTBgYQyXpvw2bQf7sXGaiNVmjCb0cpvFRmApNug4C5/bElDefvvtSo2VOVZZMIIYTkVQ1cRWOUCDyvVOylasfBFQR3I9vboe8XroHHTQQX5zVYZTvGcuLUOACRlMSdz3SVu3bvU00I211766wq63bNniWQttSc/K6/iHR/Fp3yT35TEctyk/YT89p+YHunv27PF68XFCA3XIQ976ympZQM/Qg0drQ7QJx7X9xrzfvXu35w37mQpPMfnBEB7R+7IlYhm2pNjWV37FjL50NnL/pr6AbsCTpLguXPD9vvOQaOW8PQKKvdKl8qaUaG/jDT+pIg5ZnTelVdfuzTffjDZpy3OUSIJCYq/sW3Ok8rbkwU8vFey8KFmVt6UbtodOVx5Fi73IVvPzg770RDfn4yOwFBt0YCVIacE0BMw4AY5hNx1tx4FGmTOVldsxmrSx7bvcE6h0GNGl/zz6gEuqAJqaf7BMtSBiAoEesvaxw5iMqXiEPy6SnehiY/Ypm6K+tVgiDrVNZfKk9nnpGR7hd4oJu+H65S/fbezXwinEUeVDyTmELw7Fa0q6+DjxSPbUl7ZiW186G61/aM9N5MPmwTOn/giApa7+1IrZ3JiCFjRW4qTb9K36Yyq6yNzF9lKN34QO/KWKP4yntVWX+buKX7AkpcITege6dXpOi4/A4kdp54Q2YeQyeJXjpMcce2xx9tlnFx/5yEeKBx54wE9Q2iioHf02uYtgBlWedakNuZz+6aefLh566KGi7CTR9pnX/euvvVY88eSTxauvvjr741QWH4INl4KD6pSLb7Bi04esyH3CCScUH/vYxzxN6mi/yeWktRoRhfFyeGFz8dhjj/lLso3HQfORHn300eKaa64pjj766OL111+fdVz5ZmL2uO7G1iMvb0R4swi9bdu2FR+45JLiPe95j59UZK8QCfW6jrAp0IbyxBNPLG699dbiSWdH2Ir3G+dn6Fm2A8bCWbkh5W/hA5qvvPJK8cILLxTnnnvubKGok+6wT9NnaD7xxBOldt6UDryDEQvYww47zNv5cccd57sja5eE3yD3GWecUZx11lle11YndTTL8JSdIzcX44hurE+sTGNDCx289NJL/jr++OOLD3/4w15X1HGJNvfzSPDP26FDDz20uOCCCxyeZ/r7efBSNyYYHXLIIcXJJ59cfPCDH5zZud5c1vVPWa95jjy0YRbwxHTs57nnnksyLHFo165dxU033VQ8/vjjHgdss8r+YgOv2BmL7M3Fiy++WDz88MOxZrmsJQLPPvtscf311xennXaa/6JQ87f8Gj1x6ZlcVzgUMWH79u3F4YcfXhAziJk5xREQnvHalVLaME984hOfKN544w3vO1Xty+rwc/zwiCOO8NeTzr9/8IMf+HvqwjhQRicsR9ckYsbVV19dvObWlwcffPCsWVsfn3VMcCMb1brllFNOKW677bbiqaee8vJS34S/sA02zrxDfCQOnXnmmbPNOnXyH8VZiVKlb9pyvfzyy37NxvocfXXVi8ZEdubwO+64o2Ddwnyz1301zMollIs+sTLRog5+mMdY7x911FFe18ic0zgILP4GvQFOLDx37thRHOoMjeCHAfvkHJZk/0qpnE3O7mYm38b+c5Azeuqvu+664utf/7oPVhgzi5CpJTbT3/nOd4p7773Xb14INDiYggcOvcc58L5V3inXRtv+n+z8VW7SFic7jvr+97+/+PznP1+848r3OppsaDY7uvPcnEsm5CPwffOb3/Qb9KnpBD4VGNn4/uVf/qX/FJTFMnWSownf77g+pE0OfwVSNtRf+vKX/WRMHT/vIFk7rxrD1u119B92i+1vfetbfjK2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NUnmiBTamqPvroT6IoMXSY/zojxqrogPfZueu5xtlF/Ej0tbUL5pBacgDEWym4NeBC3LawjUjACOxurqammq6jxBADoba2sDx55LEx9hQeTwTleCkaAy6vQwqeO8ylEHrEqLxQ1d4KiDbpxGWpvE843yfX5+3vEjVFu5Mn5MsChPW7fOOWgT5hcWihbvyw8d5TNM0HYL41r1nND/WsWfMVMZAfpMUr9J6+vEpwXV8Tg95qJx6Lo6UHpP4htp0iVKKpEcRx1Z9SSXGm0sP9THtbkpi+BFnNURsslYOy9jOXq2vr7WrVm47j6XeVjX3xERul6H1XDQe5xohp77rJ1yaxv18agsyFK46GQdWqkUa74La1vkewHm3b6Ql2XN17nPz80njkF9tAu9RJ9HRmNbSR7T6qumhmlUc8Wbg54LJstkCDSDAANeFQc95Or69evuujjoa3LVZxwxOunoGtZWz7MaheFdKavj6WsPJk//C+8tNTaU91HdaWsusGJyUhxHVf846tm+fbvj2rZtW9ehroMPsFtcXKyDlKehPNZGsGFCyG+hHgRCLOsbi+vjTRei6qBIn1mILWi1TeZQTrW3e9ree+rl01y9mL4n6SttllF5XVpZdtdlsWR9nT9fqrEpd82g40BCfnapQ91OoVQoeseOHX7cZf5iLqsrrAstbysgD44ld21qvReqjDbfcMsr1wuVypNZoS7FVp4KquYR3QDLbTXNj4uL2wad/Qo88jkDC/bz8wtuUa66A329br3Pw6M56HlQsjwzjwBO9LVr1/y1vLzsJxLtsGUmaiYlVrah9eijj7qzZ8+6nTt3epyZqHC40gYF0jWoE7uysuL279/vjh496m655Ra3KM5LPWGLu3r1qjt//ryjjjKyKh+UhXeMOeTfs3u32y73UB7Ny93ji9GgBkOQSFoVXgJSjT8qnziUtBGy684TlWsb5mUEeio/bX3zzTfnLTo0HzqJntPmly9f9noOr7QR9XpZgjbxBkVC+wytqGQGnIELFy641157zX344YdeJ0uSGih26dIl95vf/Mb3SwxFZKZtdBdK24l4FtZog/BSgug3/fqdd95x7777rsdT09p6R442B3TwpptucgcOHPBsZhny2k6jkgd90P6Ibp4+fdr3E40bFR9567l48aLXc+Y09FT5D3U51Ie0Pk6bsChMP2S8OHTokDt+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";

// src/ui/infoModals.ts
var SUPPORTERS_LIST_URL = "https://github.com/x-supermeng/noterelay/blob/main/docs/Support.zh-CN.md";
var TutorialModal = class extends import_obsidian4.Modal {
  constructor(app) {
    super(app);
  }
  onOpen() {
    this.modalEl.addClass("noterelay-modal");
    const header = this.contentEl.createDiv({ cls: "noterelay-modal-header" });
    const icon = header.createDiv({ cls: "noterelay-modal-icon" });
    (0, import_obsidian4.setIcon)(icon, "book-open");
    const title = header.createDiv();
    title.createEl("h2", { text: "NoteRelay \u4F7F\u7528\u6559\u7A0B" });
    title.createEl("p", { text: "\u4E00\u7BC7\u7B14\u8BB0\uFF0C\u9002\u914D\u4E09\u4E2A\u5185\u5BB9\u5E73\u53F0\u3002" });
    const steps = this.contentEl.createDiv({ cls: "noterelay-tutorial-steps" });
    this.createStep(steps, "1", "\u6253\u5F00\u7B14\u8BB0", "\u5728 Obsidian \u4E2D\u6253\u5F00\u9700\u8981\u6392\u7248\u7684 Markdown \u7B14\u8BB0\u3002", "file-text");
    this.createStep(steps, "2", "\u9009\u62E9\u5E73\u53F0", "\u5728\u9996\u9875\u9876\u90E8\u5207\u6362\u516C\u4F17\u53F7\u3001\u5C0F\u7EA2\u4E66\u6216 X\u3002", "panels-top-left");
    this.createStep(steps, "3", "\u9009\u62E9\u8D26\u53F7\u548C\u4E3B\u9898", "\u8D26\u53F7\u8D44\u6599\u7528\u4E8E\u7F72\u540D\uFF1B\u4E3B\u9898\u51B3\u5B9A\u9884\u89C8\u548C\u590D\u5236\u6837\u5F0F\u3002", "palette");
    this.createStep(steps, "4", "\u68C0\u67E5\u5E76\u590D\u5236", "\u786E\u8BA4\u9884\u89C8\u540E\u70B9\u51FB\u4E3B\u6309\u94AE\uFF0C\u518D\u7C98\u8D34\u5230\u76EE\u6807\u5E73\u53F0\u7F16\u8F91\u5668\u3002", "copy");
    const note = this.contentEl.createDiv({ cls: "noterelay-modal-note" });
    const noteIcon = note.createSpan();
    (0, import_obsidian4.setIcon)(noteIcon, "info");
    note.createSpan({ text: "NoteRelay \u4E0D\u767B\u5F55\u5E73\u53F0\uFF0C\u4E5F\u4E0D\u4F1A\u81EA\u52A8\u53D1\u5E03\u3002\u7C98\u8D34\u540E\u8BF7\u5B8C\u6210\u6700\u7EC8\u68C0\u67E5\u3002" });
  }
  createStep(container, number, title, description, iconName) {
    const step = container.createDiv({ cls: "noterelay-tutorial-step" });
    step.createSpan({ cls: "noterelay-step-number", text: number });
    const icon = step.createSpan({ cls: "noterelay-step-icon" });
    (0, import_obsidian4.setIcon)(icon, iconName);
    const copy = step.createDiv();
    copy.createEl("strong", { text: title });
    copy.createEl("p", { text: description });
  }
};
var AboutModal = class extends import_obsidian4.Modal {
  constructor(app) {
    super(app);
  }
  onOpen() {
    this.modalEl.addClass("noterelay-modal", "noterelay-about-modal");
    const brand = this.contentEl.createDiv({ cls: "noterelay-about-brand" });
    const mark = brand.createDiv({ cls: "noterelay-brand-mark" });
    (0, import_obsidian4.setIcon)(mark, "send");
    brand.createEl("h2", { text: "NoteRelay \xB7 \u6587\u9012" });
    brand.createEl("p", { text: "\u7531\u8D85\u7EA7\u731B\uFF08x-supermeng\uFF09\u53D1\u8D77\u7684 Obsidian \u591A\u5E73\u53F0\u5185\u5BB9\u6392\u7248\u63D2\u4EF6\u3002" });
    const description = this.contentEl.createDiv({ cls: "noterelay-about-description" });
    description.createEl("p", { text: "\u6211\u4E60\u60EF\u5728 Obsidian \u4E2D\u5B8C\u6210\u5199\u4F5C\uFF0C\u4E5F\u5E0C\u671B\u4E00\u6B21\u521B\u4F5C\u80FD\u591F\u66F4\u8F7B\u677E\u5730\u62B5\u8FBE\u4E0D\u540C\u5E73\u53F0\u3002NoteRelay \u56E0\u6B64\u8BDE\u751F\uFF1A\u628A\u540C\u4E00\u7BC7 Markdown \u7B14\u8BB0\u5206\u522B\u6574\u7406\u6210\u9002\u5408\u5FAE\u4FE1\u516C\u4F17\u53F7\u3001\u5C0F\u7EA2\u4E66\u548C X \u7684\u5185\u5BB9\u5F62\u5F0F\u3002" });
    description.createEl("p", { text: "\u5B83\u53EA\u8D1F\u8D23\u6392\u7248\u3001\u9884\u89C8\u3001\u590D\u5236\u4E0E\u5BFC\u51FA\uFF0C\u4E0D\u767B\u5F55\u5E73\u53F0\u3001\u4E0D\u4FDD\u5B58\u53D1\u5E03\u51ED\u636E\uFF0C\u4E5F\u4E0D\u4F1A\u66FF\u4F60\u81EA\u52A8\u53D1\u9001\u3002\u5185\u5BB9\u6700\u7EC8\u5982\u4F55\u5448\u73B0\uFF0C\u59CB\u7EC8\u7531\u521B\u4F5C\u8005\u81EA\u5DF1\u68C0\u67E5\u548C\u51B3\u5B9A\u3002" });
    description.createEl("p", { text: "\u9879\u76EE\u4EE5 AGPL-3.0-or-later \u534F\u8BAE\u5F00\u6E90\u3002\u6B22\u8FCE\u4F7F\u7528\u3001\u53CD\u9988\u548C\u53C2\u4E0E\u6539\u8FDB\uFF0C\u4E5F\u6B22\u8FCE\u5728 GitHub \u5173\u6CE8 x-supermeng/noterelay\u3002" });
    const qrcodes = this.contentEl.createDiv({ cls: "noterelay-about-qrcodes" });
    this.createQrCode(qrcodes, "\u4E2A\u4EBA\u5FAE\u4FE1", "\u626B\u7801\u6DFB\u52A0\u4F5C\u8005\u5FAE\u4FE1", "https://blog-oss.x-qu.com/blog/20260723181509936.png", "is-personal");
    this.createQrCode(qrcodes, "\u5FAE\u4FE1\u516C\u4F17\u53F7", "\u626B\u7801\u5173\u6CE8\u516C\u4F17\u53F7\u300C\u8D85\u7EA7\u731B\u300D", "https://blog-oss.x-qu.com/blog/20260723181218073.png", "is-official");
    this.createQrCode(qrcodes, "\u5FAE\u4FE1\u6253\u8D4F", "\u5982\u679C NoteRelay \u5BF9\u4F60\u6709\u5E2E\u52A9\uFF0C\u6B22\u8FCE\u626B\u7801\u652F\u6301\u6301\u7EED\u7EF4\u62A4\u3002", wechat_sponsor_qr_default, "is-sponsor", {
      label: "\u67E5\u770B\u6253\u8D4F\u540D\u5355",
      url: SUPPORTERS_LIST_URL
    });
    const badges = this.contentEl.createDiv({ cls: "noterelay-about-badges" });
    badges.createSpan({ text: "\u8D85\u7EA7\u731B\u51FA\u54C1" });
    badges.createSpan({ text: "AGPL-3.0-or-later" });
    badges.createSpan({ text: "\u516C\u4F17\u53F7 \xB7 \u5C0F\u7EA2\u4E66 \xB7 X" });
  }
  createQrCode(container, title, description, imageUrl, variant, link2) {
    const card = container.createDiv({ cls: `noterelay-about-qr-card ${variant}` });
    card.createEl("strong", { text: title });
    card.createEl("img", {
      attr: {
        src: imageUrl,
        alt: `${title}\u4E8C\u7EF4\u7801`,
        loading: "lazy"
      }
    });
    card.createSpan({ text: description });
    if (link2) {
      card.createEl("a", {
        text: link2.label,
        attr: {
          href: link2.url,
          target: "_blank",
          rel: "noopener noreferrer"
        }
      });
    }
  }
};

// src/ui/openSettings.ts
function openPluginSettings(app, pluginId) {
  const settings = app.setting;
  settings.open();
  settings.openTabById(pluginId);
}

// src/ui/rednoteBackgroundModal.ts
var import_obsidian5 = require("obsidian");
var RednoteBackgroundModal = class extends import_obsidian5.Modal {
  constructor(app, plugin, onApply) {
    super(app);
    this.plugin = plugin;
    this.onApply = onApply;
    this.image = plugin.settings.rednoteBackgroundImage;
    this.scale = plugin.settings.rednoteBackgroundScale;
    this.position = { ...plugin.settings.rednoteBackgroundPosition };
  }
  plugin;
  onApply;
  image;
  scale;
  position;
  preview;
  dragging = false;
  dragStart = { x: 0, y: 0 };
  onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("noterelay-background-modal");
    this.contentEl.createEl("h2", { text: "\u80CC\u666F\u56FE\u7247" });
    const gallery = this.contentEl.createDiv({ cls: "noterelay-background-gallery" });
    REDNOTE_BACKGROUNDS.filter((item) => item.image).forEach((item) => {
      const button = gallery.createEl("button", { cls: "noterelay-background-thumb", attr: { type: "button", "aria-label": item.name } });
      button.createEl("img", { attr: { src: item.image, alt: item.name } });
      button.addEventListener("click", () => {
        this.image = item.image;
        this.scale = 1;
        this.position = { x: 0, y: 0 };
        this.updatePreview();
      });
    });
    this.preview = this.contentEl.createDiv({ cls: "noterelay-background-preview" });
    this.preview.addEventListener("mousedown", (event) => {
      this.dragging = true;
      this.dragStart = { x: event.clientX - this.position.x, y: event.clientY - this.position.y };
      this.preview?.addClass("is-dragging");
    });
    this.preview.addEventListener("mousemove", (event) => {
      if (!this.dragging) return;
      this.position = { x: event.clientX - this.dragStart.x, y: event.clientY - this.dragStart.y };
      this.updatePreview();
    });
    const finishDrag = () => {
      this.dragging = false;
      this.preview?.removeClass("is-dragging");
    };
    this.preview.addEventListener("mouseup", finishDrag);
    this.preview.addEventListener("mouseleave", finishDrag);
    new import_obsidian5.Setting(this.contentEl).addButton((button) => button.setButtonText("\u9009\u62E9\u56FE\u7247").onClick(() => this.chooseImage())).addButton((button) => button.setButtonText("\u6E05\u9664\u56FE\u7247").onClick(() => {
      this.image = "";
      this.scale = 1;
      this.position = { x: 0, y: 0 };
      this.updatePreview();
    }));
    new import_obsidian5.Setting(this.contentEl).setName("\u7F29\u653E").addSlider((slider) => slider.setLimits(0.1, 2, 0.01).setValue(this.scale).onChange((value) => {
      this.scale = value;
      this.updatePreview();
    }));
    new import_obsidian5.Setting(this.contentEl).setName("\u4F4D\u7F6E X").addSlider((slider) => slider.setLimits(-200, 200, 1).setValue(this.position.x).onChange((value) => {
      this.position.x = value;
      this.updatePreview();
    }));
    new import_obsidian5.Setting(this.contentEl).setName("\u4F4D\u7F6E Y").addSlider((slider) => slider.setLimits(-200, 200, 1).setValue(this.position.y).onChange((value) => {
      this.position.y = value;
      this.updatePreview();
    }));
    new import_obsidian5.Setting(this.contentEl).addButton((button) => button.setButtonText("\u53D6\u6D88").onClick(() => this.close())).addButton((button) => button.setButtonText("\u786E\u8BA4").setCta().onClick(async () => {
      this.plugin.settings.rednoteBackgroundImage = this.image;
      this.plugin.settings.rednoteBackgroundScale = this.scale;
      this.plugin.settings.rednoteBackgroundPosition = this.position;
      await this.plugin.saveSettings();
      this.close();
      this.onApply?.();
    }));
    this.updatePreview();
  }
  chooseImage() {
    const input = createEl("input");
    input.type = "file";
    input.accept = "image/*";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        this.image = typeof reader.result === "string" ? reader.result : "";
        this.updatePreview();
      });
      reader.readAsDataURL(file);
    });
    input.click();
  }
  updatePreview() {
    if (!this.preview) return;
    this.preview.style.backgroundImage = this.image ? `url("${this.image.replace(/"/g, "%22")}")` : "none";
    this.preview.style.backgroundSize = `${this.scale * 100}%`;
    this.preview.style.backgroundPosition = `${this.position.x}px ${this.position.y}px`;
  }
};

// src/ui/noteRelayView.ts
var NOTERELAY_VIEW = "noterelay-view";
var REDNOTE_ADAPTER = new RednoteAdapter();
var ADAPTERS = {
  wechat: new WechatAdapter(),
  rednote: REDNOTE_ADAPTER,
  x: new XAdapter()
};
var COPY_LABELS = {
  wechat: "\u4E00\u952E\u590D\u5236\u516C\u4F17\u53F7\u6587\u7AE0",
  rednote: "\u590D\u5236\u5F53\u524D\u56FE\u7247",
  x: "\u590D\u5236 X \u957F\u6587\u683C\u5F0F"
};
var NoteRelayView = class extends import_obsidian6.ItemView {
  constructor(leaf2, plugin) {
    super(leaf2);
    this.plugin = plugin;
  }
  plugin;
  platform = "wechat";
  context;
  previewRoot;
  renderVersion = 0;
  rednoteFocusImageKey;
  getViewType() {
    return NOTERELAY_VIEW;
  }
  getDisplayText() {
    return "NoteRelay";
  }
  getIcon() {
    return "send";
  }
  async onOpen() {
    this.render();
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.render()));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (file === this.app.workspace.getActiveFile()) this.render();
    }));
  }
  render() {
    const version = ++this.renderVersion;
    const platform = this.platform;
    this.context = void 0;
    this.previewRoot = void 0;
    const container = this.contentEl;
    container.empty();
    container.addClass("noterelay-view");
    const shell = container.createDiv({ cls: "noterelay-shell" });
    this.renderPlatformTabs(shell, platform);
    const accounts = this.plugin.settings.accounts.filter((account) => account.platform === platform && account.enabled);
    const configuration = shell.createDiv({ cls: "noterelay-configuration" });
    if (platform === "rednote") this.renderRednoteControls(configuration, accounts);
    else {
      this.renderAccountControl(configuration, platform, accounts);
      this.renderThemeControl(configuration, platform);
    }
    const previewPanel = shell.createDiv({ cls: "noterelay-preview-panel" });
    const previewHeader = previewPanel.createDiv({ cls: "noterelay-preview-header" });
    previewHeader.createSpan({ text: "\u6587\u7AE0\u9884\u89C8\uFF1A" });
    const activeFile = this.app.workspace.getActiveFile();
    previewHeader.createSpan({ cls: "noterelay-file-name", text: activeFile?.basename ?? "\u672A\u6253\u5F00\u7B14\u8BB0" });
    const stage = previewPanel.createDiv({ cls: "noterelay-stage" });
    const copyArea = shell.createDiv({ cls: platform === "rednote" ? "noterelay-rednote-actions" : "noterelay-copy-area" });
    const copyButton = copyArea.createEl("button", {
      text: platform === "rednote" ? "\u4E0B\u8F7D\u5F53\u524D\u9875" : COPY_LABELS[platform],
      cls: platform === "rednote" ? "noterelay-rednote-action" : "noterelay-copy-button mod-cta",
      attr: { type: "button" }
    });
    const exportAllButton = platform === "rednote" ? copyArea.createEl("button", { text: "\u5BFC\u51FA\u5168\u90E8\u9875", cls: "noterelay-rednote-action mod-cta", attr: { type: "button" } }) : void 0;
    copyButton.disabled = true;
    if (exportAllButton) exportAllButton.disabled = true;
    if (platform === "rednote") {
      copyButton.addEventListener("click", () => void this.runRednoteExport(copyButton, "current"));
      exportAllButton?.addEventListener("click", () => void this.runRednoteExport(exportAllButton, "all"));
    } else copyButton.addEventListener("click", () => void this.copyCurrent(copyButton));
    this.renderFooter(shell);
    if (!activeFile || activeFile.extension !== "md") {
      this.renderEmptyState(stage);
      return;
    }
    stage.createDiv({ cls: "noterelay-loading", text: "\u6B63\u5728\u751F\u6210\u9884\u89C8\u2026" });
    void this.app.vault.read(activeFile).then((source) => {
      if (version !== this.renderVersion || this.app.workspace.getActiveFile() !== activeFile) return;
      const note = parseNote(source, activeFile.basename);
      const accountId = this.plugin.settings.activeAccountIds[platform];
      const context = {
        note,
        account: accounts.find((account) => account.id === accountId) ?? accounts[0],
        theme: resolveTheme2(this.plugin.settings, platform),
        settings: this.plugin.settings,
        notePath: activeFile.path,
        rednoteFocusImageKey: this.rednoteFocusImageKey,
        onRednoteImageWidthChange: async (imageKey, width) => {
          const noteOverrides = this.plugin.settings.rednoteImageWidths[activeFile.path] ?? {};
          if (width === void 0) delete noteOverrides[imageKey];
          else noteOverrides[imageKey] = width;
          if (Object.keys(noteOverrides).length) this.plugin.settings.rednoteImageWidths[activeFile.path] = noteOverrides;
          else delete this.plugin.settings.rednoteImageWidths[activeFile.path];
          this.rednoteFocusImageKey = imageKey;
          await this.plugin.saveSettings();
        },
        onRednoteImageRadiusChange: async (imageKey, radius) => {
          const noteOverrides = this.plugin.settings.rednoteImageRadii[activeFile.path] ?? {};
          if (radius <= 0) delete noteOverrides[imageKey];
          else noteOverrides[imageKey] = radius;
          if (Object.keys(noteOverrides).length) this.plugin.settings.rednoteImageRadii[activeFile.path] = noteOverrides;
          else delete this.plugin.settings.rednoteImageRadii[activeFile.path];
          this.rednoteFocusImageKey = imageKey;
          await this.plugin.saveSettings();
        },
        resolveImageSrc: (src) => {
          if (/^(?:https?:|data:|blob:|app:)/i.test(src)) return src;
          let decoded = src.replace(/^<|>$/g, "");
          try {
            decoded = decodeURIComponent(decoded);
          } catch {
          }
          const imageFile = this.app.metadataCache.getFirstLinkpathDest(decoded, activeFile.path);
          return imageFile ? this.app.vault.getResourcePath(imageFile) : src;
        },
        resolveImageDataUrl: async (src) => {
          if (src.startsWith("data:")) return src;
          let decoded = src.replace(/^<|>$/g, "");
          try {
            decoded = decodeURIComponent(decoded);
          } catch {
          }
          if (/^https?:\/\//i.test(decoded)) {
            const response = await (0, import_obsidian6.requestUrl)({ url: decoded, method: "GET" });
            const contentType = response.headers["content-type"]?.split(";", 1)[0] || imageMimeType(new URL(decoded).pathname.split(".").pop() || "");
            return `data:${contentType};base64,${arrayBufferToBase64(response.arrayBuffer)}`;
          }
          const imageFile = this.app.metadataCache.getFirstLinkpathDest(decoded, activeFile.path);
          if (!imageFile) return void 0;
          const binary = await this.app.vault.readBinary(imageFile);
          return `data:${imageMimeType(imageFile.extension)};base64,${arrayBufferToBase64(binary)}`;
        }
      };
      const root = ADAPTERS[platform].render(context);
      stage.empty();
      stage.appendChild(root);
      this.context = context;
      this.previewRoot = root;
      copyButton.disabled = false;
      if (exportAllButton) exportAllButton.disabled = false;
      root.querySelectorAll("[data-rednote-copy]").forEach((button) => button.addEventListener("click", () => void this.copyCurrent(button)));
    }).catch((error2) => {
      stage.empty();
      stage.createDiv({ cls: "noterelay-empty", text: "\u8BFB\u53D6\u7B14\u8BB0\u5931\u8D25\uFF0C\u8BF7\u6253\u5F00\u5F00\u53D1\u8005\u5DE5\u5177\u67E5\u770B\u8BE6\u60C5\u3002" });
      new import_obsidian6.Notice(`\u8BFB\u53D6\u7B14\u8BB0\u5931\u8D25\uFF1A${error2 instanceof Error ? error2.message : String(error2)}`);
    });
  }
  renderPlatformTabs(shell, activePlatform) {
    const tabs = shell.createDiv({ cls: "noterelay-platform-tabs", attr: { role: "tablist", "aria-label": "\u53D1\u5E03\u5E73\u53F0" } });
    PLATFORM_IDS.forEach((platform) => {
      const button = tabs.createEl("button", {
        cls: `noterelay-platform-tab is-${platform}${platform === activePlatform ? " is-active" : ""}`,
        attr: {
          type: "button",
          role: "tab",
          "aria-selected": String(platform === activePlatform)
        }
      });
      this.renderPlatformLogo(button, platform);
      button.createSpan({ cls: "noterelay-platform-label", text: PLATFORM_LABELS[platform] });
      button.addEventListener("click", () => {
        if (this.platform === platform) return;
        this.platform = platform;
        this.render();
      });
    });
  }
  renderPlatformLogo(button, platform) {
    const logo = button.createSpan({ cls: `noterelay-platform-logo is-${platform}`, attr: { "aria-hidden": "true" } });
    if (platform === "wechat") {
      setSanitizedHtml(logo, `<svg viewBox="0 0 28 24" role="img"><path fill="currentColor" d="M11.2 2C5.6 2 1 5.6 1 10c0 2.5 1.5 4.7 3.8 6.2l-.9 3.1 3.7-1.8c1.1.3 2.3.5 3.6.5h.5a7.4 7.4 0 0 1-.5-2.7c0-4.7 4.2-8.5 9.5-8.5h.4C19.5 3.9 15.6 2 11.2 2Zm-3.6 6.6a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm7.2 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z"/><path fill="currentColor" d="M27 15.2c0-3.8-3.8-6.9-8.4-6.9s-8.4 3.1-8.4 6.9 3.8 6.9 8.4 6.9c1 0 2-.2 2.9-.4l3.1 1.5-.7-2.6c1.9-1.3 3.1-3.2 3.1-5.4Zm-11.2-1.1a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Zm5.9 0a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z"/></svg>`);
      return;
    }
    if (platform === "rednote") {
      logo.createSpan({ text: "RED" });
      return;
    }
    logo.createSpan({ text: "\u{1D54F}" });
  }
  renderAccountControl(container, platform, accounts) {
    const group = container.createDiv({ cls: "noterelay-control-group" });
    group.createEl("label", { text: ACCOUNT_LABELS[platform] });
    const select = group.createEl("select", { attr: { "aria-label": ACCOUNT_LABELS[platform] } });
    select.createEl("option", { value: "", text: accounts.length ? "\u4E0D\u4F7F\u7528\u8D26\u53F7\u7F72\u540D" : "\u5C1A\u672A\u914D\u7F6E\u8D26\u53F7" });
    for (const account of accounts) select.createEl("option", { value: account.id, text: account.name });
    select.value = this.plugin.settings.activeAccountIds[platform] ?? "";
    select.addEventListener("change", () => void (async () => {
      this.plugin.settings.activeAccountIds[platform] = select.value;
      await this.plugin.saveSettings();
      this.render();
    })());
  }
  renderThemeControl(container, platform) {
    const group = container.createDiv({ cls: "noterelay-control-group" });
    group.createEl("label", { text: "\u4E3B\u9898" });
    const select = group.createEl("select", { attr: { "aria-label": `${PLATFORM_LABELS[platform]}\u4E3B\u9898` } });
    for (const theme of listThemes(platform)) select.createEl("option", { value: theme.id, text: theme.name });
    select.value = resolveTheme2(this.plugin.settings, platform).id;
    select.addEventListener("change", () => void (async () => {
      this.plugin.settings.activeThemeIds[platform] = select.value;
      await this.plugin.saveSettings();
      this.render();
    })());
  }
  renderRednoteControls(container, accounts) {
    container.addClass("is-rednote");
    const selectControl = (label, ariaLabel, options, value, onChange) => {
      const group = container.createDiv({ cls: "noterelay-rednote-control" });
      group.createEl("label", { text: label });
      const select = group.createEl("select", { attr: { "aria-label": ariaLabel } });
      options.forEach((option) => select.createEl("option", option));
      select.value = value;
      select.addEventListener("change", () => void onChange(select.value));
    };
    const selectedAccountId = this.plugin.settings.activeAccountIds.rednote ?? accounts[0]?.id ?? "";
    selectControl("\u8D26\u53F7", "\u5C0F\u7EA2\u4E66\u8D26\u53F7", accounts.length ? accounts.map((account) => ({ value: account.id, text: account.name })) : [{ value: "", text: "\u5C1A\u672A\u914D\u7F6E\u8D26\u53F7" }], selectedAccountId, async (value) => {
      this.plugin.settings.activeAccountIds.rednote = value;
      await this.plugin.saveSettings();
      this.render();
    });
    selectControl("\u6A21\u677F", "\u5C0F\u7EA2\u4E66\u56FE\u6587\u6A21\u677F", REDNOTE_TEMPLATES.map((item) => ({ value: item.id, text: item.name })), this.plugin.settings.rednoteTemplateId, async (value) => {
      this.plugin.settings.rednoteTemplateId = value;
      await this.plugin.saveSettings();
      this.render();
    });
    selectControl("\u4E3B\u9898", "\u5C0F\u7EA2\u4E66\u4E3B\u9898", listThemes("rednote").map((item) => ({ value: item.id, text: item.name })), resolveTheme2(this.plugin.settings, "rednote").id, async (value) => {
      this.plugin.settings.activeThemeIds.rednote = value;
      await this.plugin.saveSettings();
      this.render();
    });
    selectControl("\u5B57\u4F53", "\u5C0F\u7EA2\u4E66\u5B57\u4F53", REDNOTE_FONTS.map((item) => ({ value: item.value, text: item.name })), this.plugin.settings.rednoteFontFamily, async (value) => {
      this.plugin.settings.rednoteFontFamily = value;
      await this.plugin.saveSettings();
      this.render();
    });
    const fontGroup = container.createDiv({ cls: "noterelay-rednote-control is-font-size" });
    fontGroup.createEl("label", { text: "\u5B57\u53F7" });
    const decrease = fontGroup.createEl("button", { text: "\u2212", attr: { type: "button", "aria-label": "\u51CF\u5C0F\u5B57\u53F7" } });
    const fontValue = fontGroup.createSpan({ text: String(this.plugin.settings.rednoteFontSize) });
    const increase = fontGroup.createEl("button", { text: "+", attr: { type: "button", "aria-label": "\u589E\u5927\u5B57\u53F7" } });
    const changeFontSize = async (delta) => {
      this.plugin.settings.rednoteFontSize = Math.max(14, Math.min(42, this.plugin.settings.rednoteFontSize + delta));
      await this.plugin.saveSettings();
      this.render();
    };
    decrease.addEventListener("click", () => void changeFontSize(-1));
    increase.addEventListener("click", () => void changeFontSize(1));
    fontValue.setAttr("aria-label", "\u5F53\u524D\u5B57\u53F7");
    const backgroundGroup = container.createDiv({ cls: "noterelay-rednote-control is-background-button" });
    const backgroundButton = backgroundGroup.createEl("button", { text: "\u80CC\u666F", attr: { type: "button", "aria-label": "\u8BBE\u7F6E\u5C0F\u7EA2\u4E66\u80CC\u666F\u56FE\u7247" } });
    (0, import_obsidian6.setIcon)(backgroundButton, "image");
    backgroundButton.createSpan({ text: "\u80CC\u666F" });
    backgroundButton.addEventListener("click", () => new RednoteBackgroundModal(this.app, this.plugin, () => this.render()).open());
  }
  renderEmptyState(stage) {
    const empty = stage.createDiv({ cls: "noterelay-empty" });
    const icon = empty.createDiv({ cls: "noterelay-empty-icon" });
    (0, import_obsidian6.setIcon)(icon, "file-text");
    empty.createEl("strong", { text: "\u8BF7\u5148\u6253\u5F00\u4E00\u7BC7 Markdown \u7B14\u8BB0" });
    empty.createSpan({ text: "NoteRelay \u4F1A\u5728\u8FD9\u91CC\u663E\u793A\u5F53\u524D\u7B14\u8BB0\u7684\u6392\u7248\u6548\u679C\u3002" });
  }
  renderFooter(shell) {
    const footer = shell.createDiv({ cls: "noterelay-footer" });
    const tutorialButton = footer.createEl("button", { cls: "noterelay-footer-button is-icon", attr: { type: "button", "aria-label": "\u4F7F\u7528\u6559\u7A0B" } });
    (0, import_obsidian6.setIcon)(tutorialButton, "circle-help");
    tutorialButton.addEventListener("click", () => new TutorialModal(this.app).open());
    const aboutButton = footer.createEl("button", { text: "\u5173\u4E8E\u4F5C\u8005", cls: "noterelay-footer-button", attr: { type: "button" } });
    aboutButton.addEventListener("click", () => new AboutModal(this.app).open());
    const settingsButton = footer.createEl("button", { cls: "noterelay-footer-button is-icon", attr: { type: "button", "aria-label": "\u5168\u5C40\u8BBE\u7F6E" } });
    (0, import_obsidian6.setIcon)(settingsButton, "settings");
    settingsButton.addEventListener("click", () => openPluginSettings(this.app, this.plugin.manifest.id));
  }
  async copyCurrent(button) {
    if (!this.context || !this.previewRoot) return;
    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = "\u6B63\u5728\u590D\u5236\u2026";
    try {
      new import_obsidian6.Notice(await ADAPTERS[this.platform].copy(this.context, this.previewRoot));
      button.textContent = "\u590D\u5236\u6210\u529F";
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1200);
    } catch (error2) {
      button.textContent = originalLabel;
      new import_obsidian6.Notice(`\u590D\u5236\u5931\u8D25\uFF1A${error2 instanceof Error ? error2.message : String(error2)}`);
    } finally {
      button.disabled = false;
    }
  }
  async runRednoteExport(button, mode) {
    if (!this.context || !this.previewRoot) return;
    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = mode === "all" ? "\u6B63\u5728\u5BFC\u51FA\u2026" : "\u6B63\u5728\u4E0B\u8F7D\u2026";
    try {
      const message = mode === "all" ? await REDNOTE_ADAPTER.downloadAll(this.context, this.previewRoot) : await REDNOTE_ADAPTER.downloadCurrent(this.context, this.previewRoot);
      new import_obsidian6.Notice(message);
    } catch (error2) {
      new import_obsidian6.Notice(`\u5BFC\u51FA\u5931\u8D25\uFF1A${error2 instanceof Error ? error2.message : String(error2)}`);
    } finally {
      button.textContent = originalLabel;
      button.disabled = false;
    }
  }
};

// src/main.ts
var NoteRelayPlugin = class extends import_obsidian7.Plugin {
  settings = structuredClone(DEFAULT_SETTINGS);
  settingTab;
  async onload() {
    await this.loadSettings();
    this.registerView(NOTERELAY_VIEW, (leaf2) => new NoteRelayView(leaf2, this));
    this.settingTab = new NoteRelaySettingTab(this.app, this);
    this.addSettingTab(this.settingTab);
    this.addRibbonIcon("send", "\u6253\u5F00 NoteRelay", () => void this.activateView());
    this.addCommand({ id: "open-preview", name: "\u6253\u5F00\u591A\u5E73\u53F0\u6392\u7248\u9884\u89C8", callback: () => void this.activateView() });
    this.addCommand({ id: "open-settings", name: "\u6253\u5F00\u8D26\u53F7\u4E0E\u6392\u7248\u8BBE\u7F6E", callback: () => {
      openPluginSettings(this.app, this.manifest.id);
    } });
  }
  async activateView() {
    let leaf2 = this.app.workspace.getLeavesOfType(NOTERELAY_VIEW)[0];
    if (!leaf2) {
      leaf2 = this.app.workspace.getRightLeaf(false) ?? void 0;
      await leaf2?.setViewState({ type: NOTERELAY_VIEW, active: true });
    }
    if (leaf2) await this.app.workspace.revealLeaf(leaf2);
  }
  async loadSettings() {
    const stored = await this.loadData();
    this.settings = { ...structuredClone(DEFAULT_SETTINGS), ...stored ?? {} };
    if (this.settings.activeThemeIds.wechat === "clean-editorial") {
      this.settings.activeThemeIds.wechat = "moyu-green";
      await this.saveSettings();
    }
    if (["warm-card", "rednote-clean", "mint-note", "graphite-card", "lemon-pop", "lavender-soft"].includes(this.settings.activeThemeIds.rednote ?? "")) {
      this.settings.activeThemeIds.rednote = "default";
      await this.saveSettings();
    }
    if (!["default", "notes"].includes(this.settings.rednoteTemplateId)) {
      this.settings.rednoteTemplateId = "default";
      await this.saveSettings();
    }
    if (this.settings.rednoteSplitHeading !== 1 && this.settings.rednoteSplitHeading !== 2) {
      this.settings.rednoteSplitHeading = 2;
      await this.saveSettings();
    }
    if (!this.settings.rednoteImageWidths || typeof this.settings.rednoteImageWidths !== "object") {
      this.settings.rednoteImageWidths = {};
      await this.saveSettings();
    }
    if (!this.settings.rednoteImageRadii || typeof this.settings.rednoteImageRadii !== "object") {
      this.settings.rednoteImageRadii = {};
      await this.saveSettings();
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.app.workspace.getLeavesOfType(NOTERELAY_VIEW).forEach((leaf2) => {
      if (leaf2.view instanceof NoteRelayView) leaf2.view.render();
    });
  }
};
