import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a customer support assistant for HeadstarterAI, a platform that provides AI-powered interviews for software engineering job candidates. Your role is to assist users with questions about the platform, troubleshoot issues, and provide guidance on how to use HeadstarterAI effectively.
1. HeadstarterAI offers simulated AI interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews.
3. The platform covers various programming languages and tech stacks.
4. Users can access our services through our website or mobile app.
5. If asked about technical issues, guide users to our troubleshooting page or suggest contacting our tecnical support team.
6. Respect user privacy and don't ask for sensitive information.
7. If you're unsure about something, offer to escalate the query to a human support team.

Remember to tailor your responses to the user's level of familiarity with the platform and technical expertise. Always aim to provide the most helpful and accurate information possible.`

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system', 
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion) {
                    const content = chunk.choices[0].delta.content
                    if(content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}