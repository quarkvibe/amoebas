import { Router } from 'express';
import { activityMonitor } from '../services/activityMonitor';
import { deliveryService } from '../services/deliveryService';
import OpenAI from 'openai';
import axios from 'axios';

const router = Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

// Run the Social Automator Pipeline
router.post('/run', async (req, res) => {
    const { sourceUrl, sourceHeaders, platform, instructions, userId, dryRun } = req.body;

    try {
        activityMonitor.logActivity('info', `🤖 Social Automator started for ${platform}`);

        // 1. Fetch Data
        activityMonitor.logActivity('info', `🌐 Fetching data from ${sourceUrl}`);
        const apiResponse = await axios.get(sourceUrl, {
            headers: sourceHeaders || {}
        });
        const data = apiResponse.data;

        // 2. Generate Content
        activityMonitor.logActivity('info', `🧠 Generating content with AI...`);
        const prompt = `
            You are an expert Social Media Manager.
            
            GOAL: Create a high-engagement ${platform} post based on the following raw data.
            
            DATA:
            ${JSON.stringify(data, null, 2)}
            
            INSTRUCTIONS:
            ${instructions || "Make it engaging, professional, and use appropriate hashtags."}
            
            OUTPUT:
            Return ONLY the post content. No preamble.
        `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
        });

        const generatedContent = completion.choices[0].message.content || "";

        if (dryRun) {
            activityMonitor.logActivity('success', `🛡️ Dry Run: Generated content for ${platform}`);
            return res.json({
                success: true,
                dryRun: true,
                generatedContent,
                sourceData: data
            });
        }

        // 3. Deliver
        activityMonitor.logActivity('info', `📤 Posting to ${platform}...`);

        // Construct a temporary channel config for delivery
        // In a real app, we'd look up the user's configured channel ID
        const deliveryResult = await deliveryService.deliver({
            content: generatedContent,
            contentId: `auto-${Date.now()}`,
            userId: userId || 'user-1', // Default for dev
            channels: [] // We need to force a social channel here, but deliveryService expects configured channels
        });

        // Since deliveryService relies on pre-configured channels in DB, 
        // for this dynamic organelle we might need to call socialMediaService directly 
        // OR ensure the user has a channel configured.

        // Let's try a direct approach for this custom organelle to ensure it works 
        // without complex DB setup for the user
        const { socialMediaService } = await import('../services/socialMediaService');
        const socialResult = await socialMediaService.post(
            userId || 'user-1',
            generatedContent,
            [platform],
            {}
        );

        res.json({
            success: true,
            generatedContent,
            deliveryResult: socialResult
        });

    } catch (error: any) {
        activityMonitor.logError(error, 'Social Automator');
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
