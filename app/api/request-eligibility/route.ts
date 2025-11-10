import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/services/backendApi';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Check if backend is available
    const isAvailable = await backendApi.isAvailable();
    
    if (!isAvailable) {
      return NextResponse.json(
        { success: false, error: 'Backend service is not available' },
        { status: 503 }
      );
    }

    // Check eligibility first
    const eligibilityCheck = await backendApi.checkEligibility(address);
    
    if (eligibilityCheck.success && eligibilityCheck.data?.isEligible) {
      return NextResponse.json(
        { success: false, error: 'User is already in the eligible list' },
        { status: 400 }
      );
    }

    // Add user to eligible list via backend
    const response = await backendApi.addEligibleUser(address);

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to add user to eligible list' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added to eligible list',
      data: response.data
    });

  } catch (error: any) {
    console.error('Error requesting eligibility:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
