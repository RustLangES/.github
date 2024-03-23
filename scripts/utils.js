import toEmoji from "emoji-name-map";
import wrap from "word-wrap";

/**
 * Clamp the given number between the given range.
 *
 * @param {number} number The number to clamp.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {number} The clamped number.
 */
export const clampValue = (number, min, max) => {
    // @ts-ignore
    if (Number.isNaN(parseInt(number, 10))) {
        return min;
    }
    return Math.max(min, Math.min(number, max));
};

/**
 * Creates a node to display the primary programming language of the repository/gist.
 *
 * @param {string} langName Language name.
 * @param {string} langColor Language color.
 * @returns {string} Language display SVG object.
 */
export const createLanguageNode = (langName, langColor) => {
    return `
    <g data-testid="primary-lang">
      <circle data-testid="lang-color" cx="0" cy="-5" r="6" fill="${langColor}" />
      <text data-testid="lang-name" class="gray" x="15">${langName}</text>
    </g>
    `;
};

/**
 * Encode string as HTML.
 *
 * @see https://stackoverflow.com/a/48073476/10629172
 *
 * @param {string} str String to encode.
 * @returns {string} Encoded string.
 */
export const encodeHTML = (str) => {
    return str
        .replace(/[\u00A0-\u9999<>&](?!#)/gim, (i) => {
            return "&#" + i.charCodeAt(0) + ";";
        })
        .replace(/\u0008/gim, "");
};

/**
 * Auto layout utility, allows us to layout things vertically or horizontally with
 * proper gaping.
 *
 * @param {object} props Function properties.
 * @param {string[]} props.items Array of items to layout.
 * @param {number} props.gap Gap between items.
 * @param {"column" | "row"=} props.direction Direction to layout items.
 * @param {number[]=} props.sizes Array of sizes for each item.
 * @returns {string[]} Array of items with proper layout.
 */
export const flexLayout = ({ items, gap, direction, sizes = [] }) => {
    let lastSize = 0;
    // filter() for filtering out empty strings
    return items.filter(Boolean).map((item, i) => {
        const size = sizes[i] || 0;
        let transform = `translate(${lastSize}, 0)`;
        if (direction === "column") {
            transform = `translate(0, ${lastSize})`;
        }
        lastSize += size + gap;
        return `<g transform="${transform}">${item}</g>`;
    });
};

/**
 * Creates an icon with label to display repository/gist stats like forks, stars, etc.
 *
 * @param {string} icon The icon to display.
 * @param {number|string} label The label to display.
 * @param {string} testid The testid to assign to the label.
 * @param {number} iconSize The size of the icon.
 * @returns {string} Icon with label SVG object.
 */
export const iconWithLabel = (icon, label, testid, iconSize) => {
    if (typeof label === "number" && label <= 0) {
        return "";
    }
    const iconSvg = `
      <svg
        class="icon"
        y="-12"
        viewBox="0 0 16 16"
        version="1.1"
        width="${iconSize}"
        height="${iconSize}"
      >
        ${icon}
      </svg>
    `;
    const text = `<text data-testid="${testid}" class="gray">${label}</text>`;
    return flexLayout({ items: [iconSvg, text], gap: 20 }).join("");
};

/**
 * Retrieves num with suffix k(thousands) precise to 1 decimal if greater than 999.
 *
 * @param {number} num The number to format.
 * @returns {string|number} The formatted number.
 */
export const kFormatter = (num) => {
    return Math.abs(num) > 999
        ? Math.sign(num) * parseFloat((Math.abs(num) / 1000).toFixed(1)) + "k"
        : Math.sign(num) * Math.abs(num);
};

/**
 * Retrieve text length.
 *
 * @see https://stackoverflow.com/a/48172630/10629172
 * @param {string} str String to measure.
 * @param {number} fontSize Font size.
 * @returns {number} Text length.
 */
export const measureText = (str, fontSize = 10) => {
    // prettier-ignore
    const widths = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0.2796875, 0.2765625,
        0.3546875, 0.5546875, 0.5546875, 0.8890625, 0.665625, 0.190625,
        0.3328125, 0.3328125, 0.3890625, 0.5828125, 0.2765625, 0.3328125,
        0.2765625, 0.3015625, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
        0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875, 0.5546875,
        0.2765625, 0.2765625, 0.584375, 0.5828125, 0.584375, 0.5546875,
        1.0140625, 0.665625, 0.665625, 0.721875, 0.721875, 0.665625,
        0.609375, 0.7765625, 0.721875, 0.2765625, 0.5, 0.665625,
        0.5546875, 0.8328125, 0.721875, 0.7765625, 0.665625, 0.7765625,
        0.721875, 0.665625, 0.609375, 0.721875, 0.665625, 0.94375,
        0.665625, 0.665625, 0.609375, 0.2765625, 0.3546875, 0.2765625,
        0.4765625, 0.5546875, 0.3328125, 0.5546875, 0.5546875, 0.5,
        0.5546875, 0.5546875, 0.2765625, 0.5546875, 0.5546875, 0.221875,
        0.240625, 0.5, 0.221875, 0.8328125, 0.5546875, 0.5546875,
        0.5546875, 0.5546875, 0.3328125, 0.5, 0.2765625, 0.5546875,
        0.5, 0.721875, 0.5, 0.5, 0.5, 0.3546875, 0.259375, 0.353125, 0.5890625,
    ];

    const avg = 0.5279276315789471;
    return (
        str
        .split("")
        .map((c) =>
            c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg,
        )
        .reduce((cur, acc) => acc + cur) * fontSize
    );
};

/**
 * Parse emoji from string.
 *
 * @param {string} str String to parse emoji from.
 * @returns {string} String with emoji parsed.
 */
export const parseEmojis = (str) => {
    if (!str) {
        throw new Error("[parseEmoji]: str argument not provided");
    }
    return str.replace(/:\w+:/gm, (emoji) => {
        return toEmoji.get(emoji) || "";
    });
};

/**
 * Split text over multiple lines based on the card width.
 *
 * @param {string} text Text to split.
 * @param {number} width Line width in number of characters.
 * @param {number} maxLines Maximum number of lines.
 * @returns {string[]} Array of lines.
 */
export const wrapTextMultiline = (text, width = 59, maxLines = 3) => {
    const fullWidthComma = "，";
    const encoded = encodeHTML(text);
    const isChinese = encoded.includes(fullWidthComma);

    let wrapped = [];

    if (isChinese) {
        wrapped = encoded.split(fullWidthComma); // Chinese full punctuation
    } else {
        wrapped = wrap(encoded, {
            width,
        }).split("\n"); // Split wrapped lines to get an array of lines
    }

    const lines = wrapped.map((line) => line.trim()).slice(0, maxLines); // Only consider maxLines lines

    // Add "..." to the last line if the text exceeds maxLines
    if (wrapped.length > maxLines) {
        lines[maxLines - 1] += "...";
    }

    // Remove empty lines if text fits in less than maxLines lines
    const multiLineText = lines.filter(Boolean);
    return multiLineText;
};
