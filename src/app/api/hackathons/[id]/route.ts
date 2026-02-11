import { NextRequest, NextResponse } from 'next/server';
import { getHackathon, updateHackathon, deleteHackathon } from '@/lib/db';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const hackathon = await getHackathon(id);
        if (!hackathon) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(hackathon);
    } catch (error) {
        console.error('Failed to fetch hackathon:', error);
        return NextResponse.json({ error: 'Failed to fetch hackathon' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await updateHackathon(id, body);
        if (!updated) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update hackathon:', error);
        return NextResponse.json({ error: 'Failed to update hackathon' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await deleteHackathon(id);
        if (!success) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete hackathon:', error);
        return NextResponse.json({ error: 'Failed to delete hackathon' }, { status: 500 });
    }
}
