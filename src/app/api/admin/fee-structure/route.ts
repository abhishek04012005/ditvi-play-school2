import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const programName = searchParams.get('program_name');

        if (programName) {
            // Get fee for specific program
            const { data, error } = await supabase
                .from('fee_structure')
                .select('*')
                .eq('program_name', programName)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                return NextResponse.json(
                    { error: 'Fee structure not found for this program', success: false },
                    { status: 404 }
                );
            }

            return NextResponse.json({ data, success: true });
        } else {
            // Get all fees (both active and inactive for admin view)
            const { data, error } = await supabase
                .from('fee_structure')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            return NextResponse.json({ data, success: true });
        }
    } catch (err) {
        console.error('Error fetching fee structure:', err);
        return NextResponse.json(
            { error: 'Failed to fetch fee structure', success: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            program_name,
            monthly_fee,
            annual_fee,
            registration_fee,
            admission_fee,
            description,
            is_active,
        } = body;

        if (!program_name || !monthly_fee) {
            return NextResponse.json(
                { error: 'Program name and monthly fee are required', success: false },
                { status: 400 }
            );
        }

        // Check if program already exists
        const { data: existing, error: checkError } = await supabase
            .from('fee_structure')
            .select('id')
            .eq('program_name', program_name);

        if (existing && existing.length > 0) {
            // Update existing
            const { data, error } = await supabase
                .from('fee_structure')
                .update({
                    monthly_fee,
                    annual_fee,
                    registration_fee,
                    admission_fee,
                    description,
                    is_active: is_active !== undefined ? is_active : true,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', existing[0].id)
                .select()
                .single();

            if (error) throw error;

            return NextResponse.json({
                data,
                success: true,
                message: 'Fee structure updated successfully',
            });
        } else {
            // Create new
            const { data, error } = await supabase
                .from('fee_structure')
                .insert([
                    {
                        program_name,
                        monthly_fee,
                        annual_fee,
                        registration_fee,
                        admission_fee,
                        description,
                        is_active: is_active !== undefined ? is_active : true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return NextResponse.json(
                {
                    data,
                    success: true,
                    message: 'Fee structure created successfully',
                },
                { status: 201 }
            );
        }
    } catch (err) {
        console.error('Error creating/updating fee structure:', err);
        return NextResponse.json(
            { error: 'Failed to create/update fee structure', success: false },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Fee structure ID is required', success: false },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('fee_structure')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Fee structure deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting fee structure:', err);
        return NextResponse.json(
            { error: 'Failed to delete fee structure', success: false },
            { status: 500 }
        );
    }
}
