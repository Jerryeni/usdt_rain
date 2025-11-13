import { NextRequest, NextResponse } from 'next/server';
import { backendApi } from '@/lib/services/backendApi';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    console.log('[Request Eligibility] Received request for address:', address);

    if (!address) {
      console.error('[Request Eligibility] No address provided');
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Check if backend is available
    console.log('[Request Eligibility] Checking backend availability...');
    const isAvailable = await backendApi.isAvailable();
    console.log('[Request Eligibility] Backend available:', isAvailable);
    
    if (!isAvailable) {
      console.error('[Request Eligibility] Backend service is not available');
      return NextResponse.json(
        { success: false, error: 'Backend service is not available' },
        { status: 503 }
      );
    }

    // Check eligibility first
    console.log('[Request Eligibility] Checking if user is already eligible...');
    const eligibilityCheck = await backendApi.checkEligibility(address);
    console.log('[Request Eligibility] Eligibility check result:', eligibilityCheck);
    
    if (eligibilityCheck.success && eligibilityCheck.data?.isEligible) {
      console.log('[Request Eligibility] User is already eligible');
      return NextResponse.json(
        { success: false, error: 'User is already in the eligible list' },
        { status: 400 }
      );
    }

    // Add user to eligible list via backend
    console.log('[Request Eligibility] Adding user to eligible list...');
    const response = await backendApi.addEligibleUser(address);
    console.log('[Request Eligibility] Add user response:', response);

    if (!response.success) {
      console.error('[Request Eligibility] Failed to add user:', response.error);
      return NextResponse.json(
        { success: false, error: response.error || 'Failed to add user to eligible list' },
        { status: 400 }
      );
    }

    console.log('[Request Eligibility] Successfully added user to eligible list');
    return NextResponse.json({
      success: true,
      message: 'Successfully added to eligible list',
      data: response.data
    });

  } catch (error: any) {
    console.error('[Request Eligibility] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
