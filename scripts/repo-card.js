// @ts-check
import { Card } from "./card.js";
import { icons } from "./icons.js";
import {
    encodeHTML,
    flexLayout,
    kFormatter,
    measureText,
    parseEmojis,
    wrapTextMultiline,
    iconWithLabel,
    createLanguageNode,
    clampValue,
} from "./utils.js";

const ICON_SIZE = 16;
const DESCRIPTION_LINE_WIDTH = 59;
const DESCRIPTION_MAX_LINES = 3;

/**
 * Retrieves the repository description and wraps it to fit the card width.
 *
 * @param {string} label The repository description.
 * @param {string} textColor The color of the text.
 * @returns {string} Wrapped repo description SVG object.
 */
const getBadgeSVG = (label, textColor) => `
  <g data-testid="badge" class="badge" transform="translate(320, -18)">
    <rect stroke="#${textColor}" stroke-width="1" width="70" height="20" x="-12" y="-14" ry="10" rx="10"></rect>
    <text
      x="23" y="-5"
      alignment-baseline="central"
      dominant-baseline="central"
      text-anchor="middle"
      fill="#${textColor}"
    >
      ${label}
    </text>
  </g>
`;

const renderRepoCard = (repo, options = {}) => {
    const {
        name,
        nameWithOwner,
        description,
        primaryLanguage,
        isArchived,
        isTemplate,
        starCount,
        forkCount,
    } = repo;
    const {
        hide_border = false,
        titleColor,
        iconColor,
        textColor,
        bgColor,
        show_owner = false,
        border_radius,
        borderColor,
        description_lines_count,
    } = options;

    const lineHeight = 10;
    const header = show_owner ? nameWithOwner : name;
    const langName = (primaryLanguage && primaryLanguage.name) || "Unspecified";
    const langColor = (primaryLanguage && primaryLanguage.color) || "#333";
    const descriptionMaxLines = description_lines_count
        ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
        : DESCRIPTION_MAX_LINES;

    const desc = parseEmojis(options.description || description || "No description provided");
    const multiLineDescription = wrapTextMultiline(
        desc,
        DESCRIPTION_LINE_WIDTH,
        descriptionMaxLines,
    );
    const descriptionLinesCount = description_lines_count
        ? clampValue(description_lines_count, 1, DESCRIPTION_MAX_LINES)
        : multiLineDescription.length;

    const descriptionSvg = multiLineDescription
        .map((line) => `<tspan dy="1.2em" x="25">${encodeHTML(line)}</tspan>`)
        .join("");

    const height =
        (descriptionLinesCount > 1 ? 120 : 110) +
        descriptionLinesCount * lineHeight;

    const svgLanguage = primaryLanguage
        ? createLanguageNode(langName, langColor)
        : "";

    const totalStars = kFormatter(starCount);
    const totalForks = kFormatter(forkCount);
    const svgStars = iconWithLabel(
        icons.star,
        totalStars,
        "stargazers",
        ICON_SIZE,
    );
    const svgForks = iconWithLabel(
        icons.fork,
        totalForks,
        "forkcount",
        ICON_SIZE,
    );

    const starAndForkCount = flexLayout({
        items: [svgLanguage, svgStars, svgForks],
        sizes: [
            measureText(langName, 12),
            ICON_SIZE + measureText(`${totalStars}`, 12),
            ICON_SIZE + measureText(`${totalForks}`, 12),
        ],
        gap: 25,
    }).join("");

    const card = new Card({
        defaultTitle: header.length > 35 ? `${header.slice(0, 35)}...` : header,
        titlePrefixIcon: icons.contribs,
        width: 400,
        height,
        border_radius,
        colors: { titleColor, textColor, iconColor, bgColor, borderColor, },
    });

    card.disableAnimations();
    card.setHideBorder(hide_border);
    card.setHideTitle(false);
    card.setCSS(`
    .description { font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${textColor} }
    .gray { font: 400 12px 'Segoe UI', Ubuntu, Sans-Serif; fill: #${textColor} }
    .icon { fill: #${iconColor} }
    .badge { font: 600 11px 'Segoe UI', Ubuntu, Sans-Serif; }
    .badge rect { opacity: 0.2 }
  `);

    return card.render(`
    ${isTemplate
            ? // @ts-ignore
            getBadgeSVG("Plantilla", textColor)
            : isArchived
                ? // @ts-ignore
                getBadgeSVG("Archivados", textColor)
                : ""
        }

    <text class="description" x="25" y="-5">
      ${descriptionSvg}
    </text>

    <g transform="translate(30, ${height - 75})">
      ${starAndForkCount}
    </g>
  `);
};

export default renderRepoCard;
