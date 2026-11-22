import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  LineRuleType,
  Packer,
  SectionType,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  Paragraph,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip,
} from "docx";

const COLORS = {
  ink: "14213D",
  blue: "3F6BF3",
  gold: "FFBE35",
  sky: "A7DEF3",
  pale: "EDF5FF",
  cream: "FFF3D5",
  muted: "53616E",
  white: "FFFFFF",
  line: "D9E2EC",
};
const PAGE_WIDTH = convertMillimetersToTwip(210);
const PAGE_HEIGHT = convertMillimetersToTwip(297);
const MARGIN = convertMillimetersToTwip(16);
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: COLORS.white };
const NO_BORDERS = Object.fromEntries(
  ["top", "bottom", "left", "right", "insideHorizontal", "insideVertical"].map((edge) => [edge, NO_BORDER]),
);
const RULE = { style: BorderStyle.SINGLE, size: 5, color: COLORS.line };
const BLOCK_TAGS = new Set([
  "P", "DIV", "SECTION", "ARTICLE", "FIGURE", "FIGCAPTION", "H1", "H2", "H3", "H4",
  "UL", "OL", "LI", "DL", "DT", "DD", "TABLE", "HEADER", "FOOTER", "NAV",
]);
const SKIP = ".upload-controls, .editorial-detail-link[href^='#'], .table-scroll-hint, .scene-fallback, input, button, label, script, style";

function clean(text) {
  return text.replace(/\s+/g, " ");
}

function fill(color) {
  return { type: ShadingType.CLEAR, fill: color };
}

function emptyParagraph() {
  return new Paragraph({ spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT }, children: [] });
}

function spacer(points) {
  return new Paragraph({ spacing: { before: 0, after: 0, line: points * 20, lineRule: LineRuleType.EXACT }, children: [] });
}

function run(text, style = {}) {
  return new TextRun({ text, font: "Arial", color: COLORS.ink, size: 21, ...style });
}

function paragraph(children, context = {}, options = {}) {
  return new Paragraph({
    children,
    spacing: { before: 0, after: context.dense ? 100 : 160, line: 290, lineRule: LineRuleType.AUTO },
    widowControl: true,
    ...options,
  });
}

function cell(children, width, options = {}) {
  const content = children.length ? [...children] : [emptyParagraph()];
  // A Word cell must end in a paragraph, including cells containing nested tables.
  if (content.at(-1) instanceof Table) content.push(emptyParagraph());
  return new TableCell({
    children: content,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    verticalAlign: VerticalAlign.TOP,
    borders: NO_BORDERS,
    ...options,
  });
}

function table(rows, widths, options = {}) {
  return new Table({
    rows,
    width: { size: widths.reduce((sum, width) => sum + width, 0), type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    borders: NO_BORDERS,
    ...options,
  });
}

function row(cells, options = {}) {
  return new TableRow({ children: cells, cantSplit: true, ...options });
}

function availableImage(element) {
  return element?.getAttribute("src") && !element.hidden;
}

/**
 * Export a detached proposal snapshot. Text, links, lists and tables are native
 * Word content; only original artwork, uploaded photos, posters and QR are images.
 * All geometry below is in fixed A4 units, never detached DOM measurements.
 */
export async function createProposalWord(root) {
  const sheets = [...root.querySelectorAll(".proposal-sheet")];
  if (!sheets.length) throw new Error("Proposal Word: tidak ada halaman proposal untuk diekspor.");
  const imageCache = new Map();
  let listInstance = 0;

  async function loadImage(element) {
    const source = element.getAttribute("src");
    if (!source) throw new Error(`Proposal Word: sumber gambar kosong (${element.alt || "gambar"}).`);
    if (!imageCache.has(source)) {
      imageCache.set(source, (async () => {
        let objectURL;
        try {
          const url = new URL(source, document.baseURI);
          if (!["blob:", "data:"].includes(url.protocol) && url.origin !== window.location.origin) {
            throw new Error("gambar harus berasal dari perangkat atau situs ini");
          }
          const response = await fetch(url.href);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const blob = await response.blob();
          objectURL = URL.createObjectURL(blob);
          const decoded = new Image();
          decoded.src = objectURL;
          await decoded.decode();
          const width = decoded.naturalWidth;
          const height = decoded.naturalHeight;
          if (!width || !height) throw new Error("ukuran gambar tidak valid");
          const data = new Uint8Array(await blob.arrayBuffer());
          const isPng = data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47;
          const isJpeg = data[0] === 0xff && data[1] === 0xd8;
          if (isPng || isJpeg) return { data, type: isPng ? "png" : "jpg", width, height };
          // Word does not consistently support WebP/AVIF/SVG uploads. Convert only
          // those individual images locally, not text, tables, or whole sheets.
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("konversi gambar tidak tersedia");
          ctx.drawImage(decoded, 0, 0);
          const png = await new Promise((resolve, reject) => {
            canvas.toBlob((value) => value ? resolve(value) : reject(new Error("konversi PNG gagal")), "image/png");
          });
          return { data: new Uint8Array(await png.arrayBuffer()), type: "png", width, height };
        } catch (error) {
          throw new Error(`Proposal Word: gagal menyematkan ${element.alt || element.closest("[data-editorial-scene]")?.dataset.editorialScene || "gambar"}: ${error.message}`, { cause: error });
        } finally {
          if (objectURL) URL.revokeObjectURL(objectURL);
        }
      })());
    }
    return imageCache.get(source);
  }

  async function imageParagraph(element, context, maxHeight = 230, maxWidth) {
    const image = await loadImage(element);
    const widthLimit = maxWidth ?? context.width / 15 - 16;
    const scale = Math.min(widthLimit / image.width, maxHeight / image.height, 1);
    return paragraph([new ImageRun({
      data: image.data,
      type: image.type,
      transformation: { width: Math.max(1, Math.round(image.width * scale)), height: Math.max(1, Math.round(image.height * scale)) },
      altText: { name: element.alt || "Ilustrasi Harlah", description: element.alt || "Ilustrasi dekoratif Harlah ke-43", title: element.alt || "Harlah ke-43" },
    })], context, {
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 140, line: 240, lineRule: LineRuleType.AUTO },
    });
  }

  function inline(node, style = {}) {
    if (node.nodeType === 3) return [run(clean(node.textContent), style)];
    if (node.nodeType !== 1 || node.matches(SKIP) || node.hidden || node.getAttribute("aria-hidden") === "true") return [];
    if (node.tagName === "BR") return [new TextRun({ break: 1 })];
    if (node.tagName === "IMG") return [];
    const nextStyle = { ...style };
    if (["B", "STRONG"].includes(node.tagName)) nextStyle.bold = true;
    if (["EM", "I"].includes(node.tagName)) Object.assign(nextStyle, { font: "Georgia", italics: true, color: style.color === COLORS.white ? COLORS.white : COLORS.blue });
    if (node.tagName === "A") {
      const href = node.getAttribute("href");
      const children = [...node.childNodes].flatMap((child) => inline(child, { ...nextStyle, color: style.color || COLORS.blue, underline: {} }));
      if (href && !href.startsWith("#") && children.length) {
        return [new ExternalHyperlink({ link: new URL(href, document.baseURI).href, children })];
      }
      return children;
    }
    return [...node.childNodes].flatMap((child) => inline(child, nextStyle));
  }

  function textParagraph(element, context, extra = {}) {
    const tag = element.tagName;
    const heading = /^H[1-4]$/.test(tag);
    let size = context.size || (context.dense ? 19 : 21);
    let color = context.color || COLORS.ink;
    let bold = context.bold || false;
    let options = {};
    if (heading) {
      const topLevel = tag === "H1" || tag === "H2";
      size = topLevel ? (context.titleSize || (context.dense ? 49 : 62)) : (context.dense ? 23 : 27);
      bold = true;
      options = {
        heading: topLevel ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        keepNext: true,
        spacing: { before: topLevel ? 80 : 140, after: topLevel ? 240 : 100, line: 250, lineRule: LineRuleType.AUTO },
      };
    }
    if (element.matches(".editorial-kicker, .feature-label")) {
      size = 17; bold = true; color = COLORS.blue;
      options.spacing = { before: 0, after: 140, line: 240, lineRule: LineRuleType.AUTO };
    }
    if (element.matches(".full-lead")) size = context.dense ? 21 : 23;
    if (element.matches(".full-note, .package-fineprint p, .partnership-notes p")) size = 18;
    if (element.matches(".ticket-price")) { size = 30; bold = true; }
    if (element.matches(".archive-year")) { size = 34; bold = true; color = COLORS.blue; }
    if (element.matches(".approval-date")) options.alignment = AlignmentType.RIGHT;
    if (element.matches(".approval-acknowledgement")) options.alignment = AlignmentType.CENTER;
    if (element.matches(".approval-role, .approval-name")) options.alignment = AlignmentType.CENTER;
    if (element.matches(".approval-name")) {
      bold = true;
      options.spacing = { before: 1000, after: 180, line: 270, lineRule: LineRuleType.AUTO };
    }
    return paragraph(inline(element, { size, color, bold }), context, { ...options, ...extra });
  }

  async function columns(elements, context, weights, backgrounds = []) {
    const total = weights.reduce((sum, value) => sum + value, 0);
    const widths = weights.map((weight, index) => index === weights.length - 1
      ? context.width - weights.slice(0, index).reduce((sum, value) => sum + Math.floor(context.width * value / total), 0)
      : Math.floor(context.width * weight / total));
    const cells = await Promise.all(elements.map(async (element, index) => {
      const children = await render(element, { ...context, width: widths[index] - 280 });
      return cell(children, widths[index], backgrounds[index] ? { shading: fill(backgrounds[index]) } : {});
    }));
    return [table([row(cells)], widths), spacer(8)];
  }

  async function dataTable(element, context) {
    const sourceRows = [...element.rows];
    const count = Math.max(...sourceRows.map((sourceRow) => [...sourceRow.cells].reduce((sum, sourceCell) => sum + sourceCell.colSpan, 0)));
    const matrix = element.classList.contains("benefit-table");
    const widths = count === 2
      ? [Math.round(context.width * 0.68), context.width - Math.round(context.width * 0.68)]
      : [Math.round(context.width * 0.28), ...Array.from({ length: count - 1 }, () => Math.floor(context.width * 0.72 / (count - 1)))];
    widths[widths.length - 1] += context.width - widths.reduce((sum, width) => sum + width, 0);
    const result = [];
    if (element.caption) result.push(textParagraph(element.caption, { ...context, size: 18, bold: true }));
    const rows = [];
    for (const [index, sourceRow] of sourceRows.entries()) {
      const header = sourceRow.parentElement.tagName === "THEAD";
      let column = 0;
      const cells = [];
      for (const sourceCell of sourceRow.cells) {
        const span = sourceCell.colSpan || 1;
        const width = widths.slice(column, column + span).reduce((sum, value) => sum + value, 0);
        const style = {
          ...context, width: width - 160, dense: true, size: matrix ? 16 : 19,
          color: header ? COLORS.white : COLORS.ink,
          bold: header || sourceCell.tagName === "TH",
        };
        cells.push(cell([textParagraph(sourceCell, style, {
          alignment: matrix && column > 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { before: 0, after: 0, line: 265, lineRule: LineRuleType.AUTO },
        })], width, {
          columnSpan: span > 1 ? span : undefined,
          rowSpan: sourceCell.rowSpan > 1 ? sourceCell.rowSpan : undefined,
          shading: fill(header ? COLORS.blue : index % 2 ? COLORS.pale : COLORS.white),
          margins: { top: matrix ? 105 : 130, bottom: matrix ? 105 : 130, left: 90, right: 90 },
          borders: { top: RULE, bottom: RULE, left: RULE, right: RULE },
        }));
        column += span;
      }
      rows.push(row(cells, { tableHeader: header }));
    }
    result.push(table(rows, widths), spacer(8));
    return result;
  }

  async function definitionList(element, context) {
    const widths = [Math.round(context.width * 0.56), context.width - Math.round(context.width * 0.56)];
    const rows = [];
    const groups = [...element.children];
    let pendingTerm;
    for (const group of groups) {
      if (group.tagName === "DT") { pendingTerm = group; continue; }
      const term = group.tagName === "DD" ? pendingTerm : group.querySelector("dt");
      const detail = group.tagName === "DD" ? group : group.querySelector("dd");
      if (!term || !detail) continue;
      rows.push(row([
        cell([textParagraph(term, { ...context, size: 19, bold: true }, { spacing: { before: 0, after: 0, line: 270, lineRule: LineRuleType.AUTO } })], widths[0], { borders: { bottom: RULE } }),
        cell([textParagraph(detail, { ...context, size: 19 }, { spacing: { before: 0, after: 0, line: 270, lineRule: LineRuleType.AUTO } })], widths[1], { borders: { bottom: RULE } }),
      ]));
      pendingTerm = undefined;
    }
    return rows.length ? [table(rows, widths), spacer(8)] : [];
  }

  async function list(element, context) {
    const result = [];
    const instance = listInstance++;
    for (const item of element.children) {
      if (item.tagName !== "LI") continue;
      const options = { numbering: { reference: element.tagName === "OL" ? "proposal-numbered" : "proposal-bullet", level: 0, instance } };
      const blocks = [...item.children].some((child) => BLOCK_TAGS.has(child.tagName));
      if (!blocks) result.push(textParagraph(item, context, options));
      else {
        const content = await renderChildren(item, context);
        // Native numbering is attached to the first paragraph, not flattened into text.
        const first = content.findIndex((child) => child instanceof Paragraph);
        if (first >= 0) content[first] = content[first].with(options);
        result.push(...content);
      }
    }
    return result;
  }

  async function renderChildren(element, context) {
    const result = [];
    let inlines = [];
    const flush = () => {
      if (inlines.some((node) => clean(node.textContent || "").trim())) {
        result.push(paragraph(inlines.flatMap((node) => inline(node, { size: context.size || (context.dense ? 19 : 21), color: context.color || COLORS.ink, bold: context.bold || false })), context));
      }
      inlines = [];
    };
    for (const child of element.childNodes) {
      if (child.nodeType === 1 && (BLOCK_TAGS.has(child.tagName) || child.tagName === "IMG" || child.matches(".editorial-scene"))) {
        flush();
        result.push(...await render(child, context));
      } else inlines.push(child);
    }
    flush();
    return result;
  }

  async function render(element, context) {
    if (element.nodeType !== 1 || element.matches(SKIP) || element.hidden) return [];
    if (element.matches(".editorial-scene")) {
      const image = element.querySelector("img[src]");
      return availableImage(image) ? [await imageParagraph(image, context, context.sceneHeight || 165)] : [];
    }
    if (element.getAttribute("aria-hidden") === "true") return [];
    if (element.tagName === "IMG") return [await imageParagraph(element, context)];
    if (element.matches(".image-slot")) {
      const image = element.querySelector("img");
      if (availableImage(image)) return [await imageParagraph(image, context, element.matches(".editorial-poster") ? 370 : 235)];
      const placeholder = element.querySelector(".image-empty:not([hidden])");
      return placeholder ? [textParagraph(placeholder, { ...context, size: 18, color: COLORS.muted }, { shading: fill(COLORS.pale), spacing: { before: 160, after: 240, line: 300, lineRule: LineRuleType.AUTO } })] : [];
    }
    if (element.matches(".dialog-voices > p")) {
      const children = [];
      for (const child of element.childNodes) {
        if (child.nodeType === 1 && child.tagName === "SPAN") children.push(new TextRun({ break: 1 }));
        children.push(...inline(child, { size: 19 }));
      }
      return [paragraph(children, context)];
    }
    if (element.tagName === "TABLE") return dataTable(element, context);
    if (element.tagName === "DL") return definitionList(element, context);
    if (["UL", "OL"].includes(element.tagName)) return list(element, context);
    if (element.matches(".full-gold, .archive-theme, .partnership-notes")) {
      const children = element.tagName === "P" ? [textParagraph(element, context)] : await renderChildren(element, context);
      return [table([row([cell(children, context.width, { shading: fill(COLORS.cream), margins: { top: 150, bottom: 100, left: 180, right: 180 } })])], [context.width]), spacer(8)];
    }
    if (/^H[1-4]$/.test(element.tagName) || ["P", "DT", "DD", "FIGCAPTION", "CAPTION"].includes(element.tagName)) return [textParagraph(element, context)];
    if (element.matches(".full-hero, .appendix-heading") && element.querySelector(":scope > .editorial-scene")) {
      const scene = element.querySelector(":scope > .editorial-scene");
      const remaining = [...element.children].filter((child) => child !== scene);
      const left = await renderElements(remaining, { ...context, width: Math.floor(context.width * 0.66) - 240 });
      const rightWidth = context.width - Math.floor(context.width * 0.66);
      const right = await render(scene, { ...context, width: rightWidth - 240, sceneHeight: 155 });
      const widths = [context.width - rightWidth, rightWidth];
      return [table([row([cell(left, widths[0]), cell(right, widths[1])])], widths), spacer(8)];
    }
    if (element.matches(".dialog-feature")) return columns([...element.children], { ...context, dense: true, titleSize: 30 }, [1, 1], [COLORS.pale]);
    if (element.matches(".full-two-column, .full-values")) return columns([...element.children], context, [1, 1], [COLORS.pale, COLORS.cream]);
    if (element.matches(".approval-signatures")) return columns([...element.children], { ...context, size: 20 }, [1, 1]);
    if (element.matches(".archive-documentation")) return columns([...element.children], { ...context, sceneHeight: 120 }, [1, 3], [COLORS.pale, COLORS.pale]);
    if (element.matches(".archive-qr")) {
      const image = element.querySelector("img");
      return image ? [await imageParagraph(image, context, 112)] : [];
    }
    if (element.matches(".dialog-hero")) {
      const scene = element.querySelector(".editorial-scene");
      const date = element.querySelector(".dialog-date");
      const titleNodes = [...element.children].filter((child) => child !== scene && child !== date);
      const widths = [Math.floor(context.width * 0.67), context.width - Math.floor(context.width * 0.67)];
      const left = await renderElements(titleNodes, { ...context, width: widths[0] - 240, titleSize: 62 });
      const right = scene ? await render(scene, { ...context, width: widths[1] - 240, sceneHeight: 145 }) : [];
      return [table([row([cell(left, widths[0]), cell(right, widths[1])])], widths), ...(date ? await render(date, context) : []), spacer(8)];
    }
    if (element.matches(".dialog-date")) {
      return [paragraph([...element.children].flatMap((child, index) => [...(index ? [run("  /  ", { size: 17, color: COLORS.blue })] : []), ...inline(child, { size: 17, bold: true })]), context)];
    }
    if (element.matches(".dialog-numbers")) return columns([...element.children], context, [1, 1], [COLORS.cream, COLORS.pale]);
    if (element.matches(".dialog-numbers > div")) {
      return [...element.children].map((child) => textParagraph(child, { ...context, bold: child.matches("strong, b"), size: child.matches("strong") ? 30 : 19 }));
    }
    if (element.matches(".dialog-location")) return renderChildren(element, context);
    if (element.matches(".full-total")) {
      return [...element.children].map((child) => textParagraph(child, { ...context, size: child.tagName === "STRONG" ? 46 : 20, bold: child.tagName === "STRONG", color: COLORS.blue }));
    }
    return renderChildren(element, context);
  }

  async function renderElements(elements, context) {
    const result = [];
    for (const element of elements) result.push(...await render(element, context));
    return result;
  }

  async function cover(body, context) {
    const result = [];
    const kicker = body.querySelector(".editorial-kicker");
    const title = body.querySelector("h1");
    if (kicker) result.push(textParagraph(kicker, context));
    if (title) result.push(textParagraph(title, { ...context, titleSize: 112 }));
    const scene = body.querySelector(".editorial-scene");
    if (scene) result.push(...await render(scene, { ...context, sceneHeight: 290 }));
    const note = body.querySelector(".cover-side-note");
    if (note) result.push(paragraph([...note.childNodes].flatMap((child) => inline(child, { size: 16, color: COLORS.muted })), context));
    const message = body.querySelector(".cover-message");
    if (message) {
      for (const child of message.children) result.push(textParagraph(child, { ...context, size: child.tagName === "P" ? 31 : 19, bold: child.tagName !== "P" }));
    }
    const dateline = body.querySelector(".cover-dateline");
    if (dateline) {
      for (const child of dateline.children) result.push(textParagraph(child, { ...context, size: 17, bold: true }));
    }
    return result;
  }

  async function packages(body, context) {
    const result = [];
    const hero = body.querySelector(".packages-hero");
    if (hero) {
      const scene = hero.querySelector(".editorial-scene");
      const widths = [Math.floor(context.width * 0.7), context.width - Math.floor(context.width * 0.7)];
      const left = await renderElements([...hero.children].filter((child) => child !== scene), { ...context, width: widths[0] - 240, titleSize: 53 });
      const right = scene ? await render(scene, { ...context, width: widths[1] - 240, sceneHeight: 130 }) : [];
      result.push(table([row([cell(left, widths[0]), cell(right, widths[1])])], widths), spacer(7));
    }
    const funding = body.querySelector(".partnership-funding");
    if (funding) result.push(...await definitionList(funding, context));
    const tickets = [...body.querySelectorAll(".package-ticket")];
    const columnWidth = Math.floor(context.width / 3);
    const widths = [columnWidth, columnWidth, context.width - columnWidth * 2];
    const rows = [];
    let cells = [];
    for (const ticket of tickets) {
      const featured = ticket.classList.contains("ticket-featured");
      const span = featured ? 3 : 1;
      const width = featured ? context.width : widths[cells.length];
      const primary = ticket.classList.contains("ticket-primary");
      const background = primary ? COLORS.blue : ticket.classList.contains("ticket-gold") ? COLORS.gold : COLORS.pale;
      const children = await renderChildren(ticket, {
        ...context, width: width - 340, dense: true, size: 17,
        color: primary ? COLORS.white : COLORS.ink,
      });
      cells.push(cell(children, width, {
        columnSpan: span,
        shading: fill(background),
        margins: { top: 140, bottom: 80, left: 170, right: 170 },
        borders: { top: { ...NO_BORDER, size: 12 }, bottom: { style: BorderStyle.SINGLE, size: 12, color: COLORS.white } },
      }));
      if (featured || cells.length === 3) {
        rows.push(row(cells));
        cells = [];
      }
    }
    if (rows.length) result.push(table(rows, widths), spacer(8));
    const fineprint = body.querySelector(".package-fineprint");
    if (fineprint) result.push(...await render(fineprint, { ...context, dense: true }));
    return result;
  }

  async function masthead(element, context) {
    if (!element) return [emptyParagraph()];
    const parts = [...element.children];
    const widths = [Math.floor(context.width * 0.55), context.width - Math.floor(context.width * 0.55)];
    const cells = [];
    for (const [index, part] of parts.entries()) {
      const image = part.querySelector("img");
      const content = image ? [await imageParagraph(image, { ...context, width: widths[index] }, 34, 245)] : [textParagraph(part, { ...context, size: 15, bold: true }, { alignment: index === 0 ? AlignmentType.LEFT : AlignmentType.RIGHT, spacing: { before: 0, after: 80, line: 240, lineRule: LineRuleType.AUTO } })];
      cells.push(cell(content, widths[index], { margins: { top: 0, bottom: 80, left: 0, right: 0 }, borders: { bottom: RULE } }));
    }
    return [table([row(cells)], widths), emptyParagraph()];
  }

  function footer(element, context) {
    if (!element) return [emptyParagraph()];
    const parts = [...element.children];
    return [paragraph(parts.flatMap((part, index) => [
      ...(index ? [run("\t", { size: 13 })] : []),
      ...inline(part, { size: 13, color: COLORS.muted }),
    ]), context, {
      spacing: { before: 80, after: 0, line: 240, lineRule: LineRuleType.AUTO },
      border: { top: RULE },
      tabStops: [{ type: "right", position: context.width }],
    })];
  }

  const sections = [];
  for (const sheet of sheets) {
    const context = { width: CONTENT_WIDTH, dense: sheet.classList.contains("editorial-appendix") || sheet.id === "packages" };
    const body = sheet.querySelector(".editorial-body");
    if (!body) throw new Error(`Proposal Word: isi halaman ${sheet.dataset.page || sheet.id} tidak ditemukan.`);
    let children;
    if (sheet.id === "cover") children = await cover(body, context);
    else if (sheet.id === "packages") children = await packages(body, context);
    else children = await renderChildren(body, context);
    if (children.at(-1) instanceof Table) children.push(emptyParagraph());
    sections.push({
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
          margin: { top: convertMillimetersToTwip(25), right: MARGIN, bottom: convertMillimetersToTwip(22), left: MARGIN, header: convertMillimetersToTwip(10), footer: convertMillimetersToTwip(10) },
        },
      },
      headers: { default: new Header({ children: await masthead(sheet.querySelector(".editorial-masthead"), context) }) },
      footers: { default: new Footer({ children: footer(sheet.querySelector(".editorial-footer"), context) }) },
      children,
    });
  }

  const documentFile = new Document({
    title: "Proposal Sahabat Harlah — ROAD TO 43",
    subject: "Proposal sponsorship Harlah ke-43 Remaja Masjid Agung Al Munawwar Tulungagung",
    creator: "Remaja Masjid Agung Al Munawwar Tulungagung",
    description: "Proposal dengan teks, tautan, daftar, dan tabel yang dapat disunting.",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 21, color: COLORS.ink, language: { value: "id-ID" } },
          paragraph: { spacing: { before: 0, after: 160, line: 290, lineRule: LineRuleType.AUTO }, widowControl: true },
        },
        heading1: { run: { font: "Arial", bold: true, color: COLORS.ink } },
        heading2: { run: { font: "Arial", bold: true, color: COLORS.ink } },
      },
    },
    numbering: {
      config: [
        { reference: "proposal-numbered", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", start: 1, style: { run: { font: "Arial", color: COLORS.blue }, paragraph: { indent: { left: 330, hanging: 300 } } } }] },
        { reference: "proposal-bullet", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", style: { run: { font: "Arial", color: COLORS.blue }, paragraph: { indent: { left: 300, hanging: 220 } } } }] },
      ],
    },
    sections,
  });
  return Packer.toBlob(documentFile);
}
