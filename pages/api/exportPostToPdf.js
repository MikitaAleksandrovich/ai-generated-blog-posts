import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { parse } from "node-html-parser";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const cssVariablesCache = (() => {
  let cache = null;
  return () => {
    if (cache) {
      return cache;
    }
    try {
      const cssPath = path.join(process.cwd(), "styles", "pdfStyles.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      const vars = {};
      const regex = /--([^:]+):\s*([^;]+);/g;
      let match;
      while ((match = regex.exec(css))) {
        vars[match[1]] = match[2].trim();
      }
      cache = vars;
      return vars;
    } catch (error) {
      cache = {};
      return cache;
    }
  };
})();

const sanitizeText = (text = "") =>
  text.replace(/\s+/g, " ").replace(/&nbsp;/gi, " ").trim();

const convertHtmlToBlocks = (html = "") => {
  const root = parse(`<div>${html}</div>`);
  const blocks = [];

  const traverse = (node) => {
    if (!node) {
      return;
    }
    if (node.nodeType === 3) {
      const text = sanitizeText(node.rawText);
      if (text) {
        blocks.push({ type: "paragraph", text });
      }
      return;
    }
    if (!node.tagName) {
      node.childNodes?.forEach(traverse);
      return;
    }

    const tag = node.tagName.toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      const text = sanitizeText(node.text);
      if (text) {
        blocks.push({
          type: "heading",
          level: Number(tag.replace("h", "")),
          text,
        });
      }
      return;
    }

    if (tag === "p") {
      const text = sanitizeText(node.text);
      if (text) {
        blocks.push({ type: "paragraph", text });
      }
      return;
    }

    if (tag === "ul" || tag === "ol") {
      let index = 1;
      node.childNodes.forEach((child) => {
        if (child.tagName?.toLowerCase() === "li") {
          const text = sanitizeText(child.text);
          if (text) {
            blocks.push({
              type: "list-item",
              ordered: tag === "ol",
              index: index++,
              text,
            });
          }
        }
      });
      return;
    }

    if (tag === "li") {
      const text = sanitizeText(node.text);
      if (text) {
        blocks.push({
          type: "list-item",
          ordered: false,
          index: 0,
          text,
        });
      }
      return;
    }

    node.childNodes?.forEach(traverse);
  };

  root.childNodes?.forEach(traverse);
  return blocks;
};

const hexToRgbColor = (hex, fallback = rgb(0, 0, 0)) => {
  if (!hex) {
    return fallback;
  }
  let normalized = hex.trim();
  if (!normalized.startsWith("#")) {
    return fallback;
  }
  normalized = normalized.replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (normalized.length !== 6) {
    return fallback;
  }
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  if ([r, g, b].some((value) => Number.isNaN(value))) {
    return fallback;
  }
  return rgb(r, g, b);
};

const wrapText = (text, font, size, maxWidth) => {
  const sanitized = sanitizeText(text);
  if (!sanitized) {
    return [];
  }
  if (maxWidth <= 0) {
    return [sanitized];
  }
  const words = sanitized.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(nextLine, size);
    if (width <= maxWidth) {
      currentLine = nextLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

const sanitizeFileName = (name = "blog-post") => {
  const fallback = "blog-post";
  const cleaned = name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").trim();
  return (cleaned || fallback).replace(/\s+/g, "_").slice(0, 60);
};

const buildPdfBuffer = async (post) => {
  const pdfDoc = await PDFDocument.create();
  const [regularFont, boldFont] = await Promise.all([
    pdfDoc.embedFont(StandardFonts.Helvetica),
    pdfDoc.embedFont(StandardFonts.HelveticaBold),
  ]);

  const cssVars = cssVariablesCache();
  const margin = parseFloat(cssVars["pdf-margin"]) || 50;
  const baseFontSize = parseFloat(cssVars["pdf-font-size"]) || 12;

  const colors = {
    text: hexToRgbColor(cssVars["pdf-text-color"], rgb(0.12, 0.15, 0.2)),
    heading: hexToRgbColor(
      cssVars["pdf-heading-color"],
      rgb(0.06, 0.09, 0.16)
    ),
    accent: hexToRgbColor(cssVars["pdf-accent-color"], rgb(0.1, 0.66, 0.65)),
    meta: hexToRgbColor(cssVars["pdf-meta-color"], rgb(0.27, 0.33, 0.42)),
  };

  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
  let cursorY = height - margin;

  const addNewPage = () => {
    page = pdfDoc.addPage();
    ({ width, height } = page.getSize());
    cursorY = height - margin;
  };

  const ensureSpace = (amount) => {
    if (cursorY - amount < margin) {
      addNewPage();
    }
  };

  const addGap = (amount) => {
    if (cursorY - amount < margin) {
      addNewPage();
    } else {
      cursorY -= amount;
    }
  };

  const drawBlock = ({
    text,
    font = regularFont,
    size = baseFontSize,
    color = colors.text,
    bullet = null,
  }) => {
    const maxWidth = width - margin * 2;
    const indent = bullet ? size * 1.2 : 0;
    const lines = wrapText(text, font, size, maxWidth - indent);
    if (!lines.length) {
      return;
    }

    lines.forEach((line, index) => {
      ensureSpace(size * 1.4);
      if (cursorY === height - margin) {
        cursorY -= size * 0.2;
      }
      if (bullet && index === 0) {
        page.drawText(bullet, {
          x: margin,
          y: cursorY,
          font,
          size,
          color,
        });
      }
      page.drawText(line, {
        x: margin + indent,
        y: cursorY,
        font,
        size,
        color,
      });
      cursorY -= size * 1.4;
      if (cursorY < margin) {
        addNewPage();
      }
    });
  };

  drawBlock({
    text: post.title || "Blog Post",
    font: boldFont,
    size: baseFontSize * 1.8,
    color: colors.heading,
  });

  addGap(baseFontSize * 0.5);

  if (post.metaDescription) {
    drawBlock({
      text: post.metaDescription,
      font: regularFont,
      size: baseFontSize * 1.1,
      color: colors.meta,
    });
    addGap(baseFontSize * 0.5);
  }

  const keywords = (post.keywords || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (keywords.length) {
    drawBlock({
      text: `Keywords: ${keywords.join(", ")}`,
      font: boldFont,
      size: baseFontSize,
      color: colors.accent,
    });
    addGap(baseFontSize * 0.8);
  }

  const sections = convertHtmlToBlocks(post.postContent || "");
  const headingSizes = {
    1: baseFontSize * 1.6,
    2: baseFontSize * 1.45,
    3: baseFontSize * 1.3,
    4: baseFontSize * 1.2,
    5: baseFontSize * 1.1,
    6: baseFontSize * 1.05,
  };

  sections.forEach((section) => {
    if (section.type === "heading") {
      addGap(baseFontSize * 0.4);
      drawBlock({
        text: section.text,
        font: boldFont,
        size: headingSizes[section.level] || baseFontSize * 1.2,
        color: colors.heading,
      });
      addGap(baseFontSize * 0.2);
      return;
    }

    if (section.type === "paragraph") {
      drawBlock({
        text: section.text,
        font: regularFont,
        size: baseFontSize,
        color: colors.text,
      });
      addGap(baseFontSize * 0.2);
      return;
    }

    if (section.type === "list-item") {
      drawBlock({
        text: section.text,
        font: regularFont,
        size: baseFontSize,
        color: colors.text,
        bullet: section.ordered ? `${section.index}.` : "•",
      });
      addGap(baseFontSize * 0.1);
    }
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

const streamBuffer = (buffer, res) =>
  new Promise((resolve, reject) => {
    const stream = Readable.from(buffer);
    stream.on("end", resolve);
    stream.on("error", (error) => {
      reject(error);
    });
    stream.pipe(res);
  });

export default withApiAuthRequired(async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { user } = await getSession(req, res);
    const { postId } = req.body || {};

    if (!postId) {
      res.status(400).json({ error: "Missing postId" });
      return;
    }

    const client = await clientPromise;
    const db = client.db("BlogStandard");

    const currentUser = await db.collection("users").findOne({
      auth0Id: user.sub,
    });

    if (!currentUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const post = await db.collection("posts").findOne({
      _id: new ObjectId(postId),
      userId: currentUser._id,
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const pdfBuffer = await buildPdfBuffer(post);
    const filename = `${sanitizeFileName(post.title)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );
    res.setHeader("Cache-Control", "no-store");
    res.status(200);

    await streamBuffer(pdfBuffer, res);
  } catch (error) {
    console.error("EXPORT PDF ERROR", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Unable to export PDF" });
    } else {
      res.end();
    }
  }
});