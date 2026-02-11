import { NextRequest, NextResponse } from 'next/server';
import { getMembers, addMember } from '@/lib/db';
import { Member } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const members = await getMembers();
        return NextResponse.json(members);
    } catch (error) {
        console.error('Failed to fetch members:', error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const member: Member = {
            id: uuidv4(),
            name: body.name || '',
            telegramChatId: body.telegramChatId || '',
            email: body.email || '',
            role: body.role || 'Member',
        };

        await addMember(member);
        return NextResponse.json(member, { status: 201 });
    } catch (error) {
        console.error('Failed to add member:', error);
        return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }
}
