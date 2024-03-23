import fetch from "node-fetch"
import langsColor from "./langColors.json" assert { "type": "json" }
import { env } from "process";

const GH_TOKEN = env.GH_TOKEN;

const fetchRepo = async (username, reponame) => {
    let res = await fetch(`https://api.github.com/repos/${username}/${reponame}`, {
        headers: {
            "Authorization": `token ${GH_TOKEN}`,
        }
    });

    if (!res.ok) {
        throw new Error(`Cannot get "${username}/${reponame}" repository: ${await res.text()}`)
    }

    let data = await res.json()

    if (!data) {
        throw new Error("Not found");
    }

    if (!data.html_url || data.private) {
        throw new Error(`User Repository Not found - ${data.html_url} - ${data.private}`);
    }

    return {
        name: data.name,
        nameWithOwner: data.full_name,
        description: data.description,
        primaryLanguage: {
            name: data.language,
            color: langsColor[data.language] || "#2f80ed",
        },
        isArchived: data.archived,
        isTemplate: data.is_template,
        starCount: data.stargazers_count,
        forkCount: data.forks,
    }
};

export default fetchRepo;
