import fs from "node:fs/promises"
import path from "node:path"
import renderRepoCard from "./repo-card.js"
import fetchRepo from "./fetch-repo.js"

const importMeta = import.meta
const scriptsDir = path.dirname(importMeta.url.replace("file://", ""))
const baseDir = path.dirname(scriptsDir)

const conf = {
    repo: {
        base: "RustLangES/.github",
        branch: "main",
    },
    imgDir: "assets",
    outReadme: "profile/",
    api: "https://github-readme-stats-eight-topaz-65.vercel.app/api",
    styles: {
        light: {
            title_color: "2f80ed",
            icon_color: "4c71f2",
            text_color: "434d58",
            bg_color: "00000000",
            border_color: "e4e2e2",
        },
        dark: {
            titleColor: "58a6ff",
            textColor: "adbac7",
            bgColor: "00000000",
            borderColor: "444c56",
        },
    },
}

const data = [
    {
        kind: "plain",
        content: `<!--
  This README project is inspired from https://github.com/b0o/b0o
-->
## Hola, somos RustLang en Español 👋

Somos una comunidad de Rust hispana, buscamos la promoción del lenguaje de programación Rust.

Si eres apasionado por la programación y te encanta el desafío de desarrollar software de manera eficiente y confiable, ¡has llegado al lugar adecuado! Somos una comunidad diversa y amigable que comparte un interés común.

Si amas la programación y quieres potenciar tus habilidades en Rust, ¡te damos la bienvenida con los brazos abiertos!

<div align="center">

[![Discord](https://img.shields.io/discord/778674594856960012?style=for-the-badge&logo=discord&color=blue)](https://discord.gg/4ng5HgmaMg)
[![Static Badge](https://img.shields.io/badge/-LinkedIn-0e76a8?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/company/rustlanges)

</div>
      `
    },
    { kind: "separator" },
    {
        kind: "section",
        title: "[Aprende Rust](https://rustlang-es.org/aprende)",
        cards: [
            {
                kind: "repo",
                user: "RustLangES",
                repo: "rust-book-es",
                description: "Libro de Rust en Español!",
            },
            {
                kind: "repo",
                user: "RustLangES",
                repo: "comprehensive-rust",
                description: "Curso de Rust usado por el equipo de Android en Google",
            },
            {
                kind: "repo",
                user: "RustLangES",
                repo: "rust-para-dotnet-devs",
                description: "Rust para C#/.NET Desarrolladores (Español en progreso)",
            },
        ],
    },
    {
        kind: "section",
        title: "Paginas Web",
        cards: [
            {
                kind: "repo",
                user: "RustLangES",
                repo: "RustLangES.github.io",
                description: "Sitio web de la comunidad RustLangES",
            },
            {
                kind: "repo",
                user: "RustLangES",
                repo: "blog",
                description: "Blog de la comunidad RustLangES",
            },
        ],
    },
    {
        kind: "section",
        title: "Proyectos de la Comunidad",
        cards: [
            {
                kind: "repo",
                user: "RustLangES",
                repo: "cangrebot",
                description: "Bot de la comunidad de Discord de RustLangES",
            },
            {
                kind: "repo",
                user: "RustLangES",
                repo: "mdbook-killer",
                description: "Nuestra propia implementacion de mdbook para publicar libros",
            },
            {
                kind: "repo",
                user: "RustLangES",
                repo: "proyectos-comunitarios",
                description: "Proyectos de la comunidad de Rust",
            },
            {
                kind: "repo",
                user: "RustLangES",
                repo: "arte-rustlang-es",
                description: "Banco de arte de la comunidad RustLangES",
            },
        ],
    },
    {
        kind: "section",
        title: "Casos de Uso Real",
        cards: [
            {
                kind: "repo",
                user: "RustLangES",
                repo: "RustLangES-API",
                description: "Un backend simple (axum, shuttle, sqlx)",
            },
        ],
    },
]

const imgCache = new Map()

function renderCachedImage({ key, data, alt, fragment }) {
    imgCache.set(key, data)
    const cacheUrl = `https://raw.githubusercontent.com/${conf.repo.base}/${conf.repo.branch}/${conf.imgDir}/${key}`
    return `<img src="${cacheUrl}${fragment ? "#" + fragment : ""}" alt="${alt}">`
}

function renderRepoCardItem({ user, repo, description, style }) {
    return [
        `<a href="https://github.com/${user}/${repo}#gh-${style}-mode-only">`,
        renderCachedImage({
            key: `${user}-${repo}-${style}.svg`,
            data: {
                username: user,
                repo,
                description,
                show_owner: false,
                ...conf.styles[style],
            },
            alt: `${repo}: ${description}`,
            fragment: `gh-${style}-mode-only`,
        }),
        `</a>`,
    ].join("")
}

function renderCardStyles(render, { user, repo, description }) {
    return [
        render({ user, repo, description, style: "dark" }),
        render({ user, repo, description, style: "light" }),
    ].join("\n")
}

function renderSection({ title, cards }) {
    const rows = cards.reduce((rows, card, i) => {
        if (i % 2 === 0) {
            rows.push([])
        }
        rows[rows.length - 1].push(renderNode(card))
        return rows
    }, [])
    const rowDivs = rows.map((row) => {
        return [
            `<div float="left">`,
            `${row.join("\n&nbsp;\n")}`,
            `&nbsp;`,
            `</div>`,
        ].join("\n")
    })
    return [
        title ? `### ${title}\n\n` : "",
        ...rowDivs,
        "\n",
    ].join("")
}

function renderNode({ kind, ...rest }) {
    switch (kind) {
        case "repo":
            return renderCardStyles(renderRepoCardItem, rest)
        case "plain":
            return `${rest.content}\n`
        case "separator":
            return "---\n"
        case "section":
            return renderSection(rest)
        default:
            throw new Error(`Unknown card kind: ${kind}`)
    }
}

const content = data.map(renderNode).join("\n")
const imgDir = path.join(baseDir, conf.imgDir)
await fs.mkdir(imgDir, { recursive: true })
const outPath = path.join(baseDir, conf.outReadme)
await fs.mkdir(outPath, { recursive: true })

for (const [key, data] of imgCache.entries()) {
    const imgPath = path.join(baseDir, conf.imgDir, key)
    const img = renderRepoCard(await fetchRepo(data.username, data.repo), data)
    console.log(`Writing ${imgPath}`)
    await fs.writeFile(imgPath, img)
}

console.log(`Writing README.md`)
await fs.writeFile(path.join(baseDir, `${conf.outReadme}README.md`), content)
