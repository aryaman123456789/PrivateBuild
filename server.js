/**
 * @file This file contains the server-side logic for the application.
 * @author [Your Name]
 */

require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

/**
 * @route POST /api/analyze
 * @group AI Analysis - Operations for AI-powered match analysis
 * @param {object} request.body.required - The points and stats of the match.
 * @returns {object} 200 - An object containing the AI analysis.
 * @returns {Error}  500 - Server error
 */
app.post('/api/analyze', async (req, res) => {
    const { points, stats } = req.body;

    const prompt = `
        You are a professional tennis coach providing an analysis of a tennis match.
        The user is the "player" in this analysis. Do not refer to them as "the player", but rather as "you".
        Analyze the provided match statistics and point-by-point data to identify key insights.

        Match Statistics:
        ${JSON.stringify(stats, null, 2)}

        Point-by-Point Data:
        ${JSON.stringify(points, null, 2)}

        Based on the data, provide a concise and actionable analysis covering the following areas:
        1.  What Went Well: Highlight the top 2-3 strengths and positive trends from the match.
        2.  What Didn't Go Well: Identify the top 2-3 areas that need improvement.
        3.  Tips for Improvement: Offer specific, actionable tips to address the areas that didn't go well.
    `;

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                "contents": [
                    {
                        "parts": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data.candidates[0].content.parts[0].text;

        // Basic parsing of the response. This might need to be adjusted based on the actual LLM output format.
        const wentWellMatch = analysisText.match(/1\.\s+What Went Well:(.*?)(?=2\.\s+What Didn't Go Well:|$)/s);
        const didNotGoWellMatch = analysisText.match(/2\.\s+What Didn't Go Well:(.*?)(?=3\.\s+Tips for Improvement:|$)/s);
        const tipsMatch = analysisText.match(/3\.\s+Tips for Improvement:(.*)/s);

        res.json({
            wentWell: wentWellMatch ? wentWellMatch[1].trim() : "Could not determine what went well.",
            didNotGoWell: didNotGoWellMatch ? didNotGoWellMatch[1].trim() : "Could not determine what didn't go well.",
            tips: tipsMatch ? tipsMatch[1].trim() : "Could not determine any tips for improvement."
        });
    } catch (error) {
        console.error("Error fetching AI analysis:", error);
        res.status(500).json({
            wentWell: `Error fetching analysis: ${error.message}`,
            didNotGoWell: `Error fetching analysis: ${error.message}`,
            tips: `Error fetching analysis: ${error.message}`
        });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
