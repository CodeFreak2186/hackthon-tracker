import { NextRequest, NextResponse } from 'next/server';
import { updateMember, deleteMember } from '@/lib/db';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const updated = await updateMember(id, body);
        if (!updated) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update member:', error);
        return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const success = await deleteMember(id);
        if (!success) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete member:', error);
        return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
    }
}
