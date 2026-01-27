async function searchYouTubeVideos(query) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    console.log("YT KEY len:", apiKey?.length, "start:", apiKey?.slice(0, 6));

    if (!apiKey) {
        throw new Error("Missing YOUTUBE_API_KEY");
    }

    const url =
        "https://www.googleapis.com/youtube/v3/search" +
        `?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(query)}` +
        `&key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
    }

    const data = await response.json();

    return data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
    }));
}

module.exports = { searchYouTubeVideos };
