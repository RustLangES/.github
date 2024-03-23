import fetch from "node-fetch"

const fetchRepo = async (username, reponame) => {
    let res = await fetch(`https://api.github.com/repos/${username}/${reponame}`);
    let data = await res.json()

    if (!data) {
        throw new Error("Not found");
    }

    if (!data.html_url || data.private) {
        throw new Error("User Repository Not found");
    }

    return {
        name: data.name,
        nameWithOwner: data.full_name,
        description: data.description,
        primaryLanguage: data.language,
        isArchived: data.archived,
        isTemplate: data.is_template,
        starCount: data.stargazers_count,
        forkCount: data.forks,
    }
};

export default fetchRepo;
