import { NextRequest, NextResponse } from 'next/server';
import { getHackathons, addHackathon } from '@/lib/db';
import { Hackathon } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const hackathons = await getHackathons();
        return NextResponse.json(hackathons);
    } catch (error) {
        console.error('Failed to fetch hackathons:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const now = new Date().toISOString();

        const hackathon: Hackathon = {
            id: uuidv4(),
            name: body.name || '',
            link: body.link || '',
            description: body.description || '',
            githubLink: body.githubLink || '',
            deadline: body.deadline || '',
            startDate: body.startDate || '',
            endDate: body.endDate || '',
            teamName: body.teamName || '',
            memberIds: body.memberIds || [],
            resources: body.resources || [],
            tags: body.tags || [],
            priority: body.priority || 'medium',
            notes: body.notes || '',
            createdAt: now,
            updatedAt: now,
        };

        await addHackathon(hackathon);
        return NextResponse.json(hackathon, { status: 201 });
    } catch (error) {
        console.error('Failed to create hackathon:', error);
        return NextResponse.json({ error: 'Failed to create hackathon' }, { status: 500 });
    }
}
