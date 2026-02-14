export default async function handler(req, res) {

  try {

    const { prompt } = req.query;

    if (!prompt) {
      return res.status(400).json({
        status:false,
        error:"Prompt required"
      });
    }

    // Pollinations AI image endpoint
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;

    return res.status(200).json({
      creator: "chathura hansaka",
      status: true,
      result: imageUrl
    });

  } catch (err) {

    return res.status(500).json({
      status:false,
      error: err.message
    });

  }

}