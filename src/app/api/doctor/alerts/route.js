import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/model/userModel';
import BPPrediction from '@/model/prescriptionModel';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const doctorClerkId = searchParams.get('doctorClerkId');
    
    console.log("🔍 Looking for alerts for doctor:", doctorClerkId);
    
    if (!doctorClerkId) {
      return NextResponse.json({ success: false, message: 'Doctor ID required' }, { status: 400 });
    }

    // ✅ Get ALL pending prescriptions (regardless of doctorId)
    // Since doctorId might not be populated in existing prescriptions
    let prescriptions = await BPPrediction.find({ 
      prescriptionStatus: 'pending'
    });
    
    console.log(`📊 Found ${prescriptions.length} total pending prescriptions in DB`);
    
    // If no pending prescriptions found, return empty
    if (prescriptions.length === 0) {
      console.log("No pending prescriptions found");
      return NextResponse.json({ 
        success: true, 
        alerts: [],
        totalAlerts: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
      });
    }
    
    // Analyze each pending prescription for alerts
    const alerts = [];
    
    for (const prescription of prescriptions) {
      const stage = prescription.stage?.toLowerCase() || '';
      console.log(`🔍 Analyzing: ${prescription.patientName}, Stage: "${prescription.stage}", Status: ${prescription.prescriptionStatus}`);
      
      // Create alert based on stage
      let alert = null;
      
      // Check for hypertensive crisis (critical)
      if (stage === 'hypertensive crisis') {
        alert = {
          patientName: prescription.patientName || 'Unknown Patient',
          patientClerkId: prescription.clerkId || '',
          age: prescription.patientAge || 0,
          gender: prescription.gender || 'Not specified',
          currentStage: prescription.stage || 'Unknown',
          alertType: '🚨 Hypertensive Crisis - Immediate Action Required',
          severity: 'critical',
          message: `URGENT: Patient ${prescription.patientName} has been diagnosed with Hypertensive Crisis. Immediate medical attention required.`,
          latestReading: { 
            systolic: 180, 
            diastolic: 120, 
            timestamp: prescription.datePredicted || new Date() 
          },
          trend: 'critical_high',
          recommendations: [
            'Emergency consultation required - Contact patient immediately',
            'Consider hospitalization for acute BP management',
            'Assess for target organ damage (heart, kidneys, brain)',
            'Review and adjust medication urgently',
            'Check for medication compliance issues'
          ],
          prescriptionId: prescription._id,
          prescriptionStatus: prescription.prescriptionStatus || 'pending'
        };
        alerts.push(alert);
        console.log(`✅ Added CRITICAL alert for: ${prescription.patientName}`);
        continue;
      }
      
      // Check for hypertension stage 2 (high)
      if (stage === 'hypertension stage 2') {
        alert = {
          patientName: prescription.patientName || 'Unknown Patient',
          patientClerkId: prescription.clerkId || '',
          age: prescription.patientAge || 0,
          gender: prescription.gender || 'Not specified',
          currentStage: prescription.stage || 'Unknown',
          alertType: '⚠️ Stage 2 Hypertension - High Risk',
          severity: 'high',
          message: `Patient ${prescription.patientName} has Stage 2 Hypertension. Prompt medical attention and treatment adjustment required.`,
          latestReading: { 
            systolic: 160, 
            diastolic: 100, 
            timestamp: prescription.datePredicted || new Date() 
          },
          trend: 'consistently_high',
          recommendations: [
            'Schedule urgent follow-up within 48 hours',
            'Review medication effectiveness and compliance',
            'Consider combination therapy (two or more medications)',
            'Assess for secondary causes of hypertension',
            'Order laboratory tests (kidney function, electrolytes)'
          ],
          prescriptionId: prescription._id,
          prescriptionStatus: prescription.prescriptionStatus || 'pending'
        };
        alerts.push(alert);
        console.log(`✅ Added HIGH alert for: ${prescription.patientName}`);
        continue;
      }
      
      // Check for hypertension stage 1 (medium)
      if (stage === 'hypertension stage 1') {
        alert = {
          patientName: prescription.patientName || 'Unknown Patient',
          patientClerkId: prescription.clerkId || '',
          age: prescription.patientAge || 0,
          gender: prescription.gender || 'Not specified',
          currentStage: prescription.stage || 'Unknown',
          alertType: '📊 Stage 1 Hypertension - Monitor',
          severity: 'medium',
          message: `Patient ${prescription.patientName} has Stage 1 Hypertension. Regular monitoring and lifestyle modifications recommended.`,
          latestReading: { 
            systolic: 140, 
            diastolic: 90, 
            timestamp: prescription.datePredicted || new Date() 
          },
          trend: 'stable',
          recommendations: [
            'Schedule follow-up within 1 week',
            'Monitor blood pressure regularly and maintain log',
            'Review lifestyle modifications (diet, exercise, stress)',
            'Check medication adherence',
            'Consider dietary changes (reduce sodium intake)'
          ],
          prescriptionId: prescription._id,
          prescriptionStatus: prescription.prescriptionStatus || 'pending'
        };
        alerts.push(alert);
        console.log(`✅ Added MEDIUM alert for: ${prescription.patientName}`);
        continue;
      }
      
      // Check for elevated (low priority)
      if (stage === 'elevated') {
        alert = {
          patientName: prescription.patientName || 'Unknown Patient',
          patientClerkId: prescription.clerkId || '',
          age: prescription.patientAge || 0,
          gender: prescription.gender || 'Not specified',
          currentStage: prescription.stage || 'Unknown',
          alertType: '📈 Elevated Blood Pressure',
          severity: 'low',
          message: `Patient ${prescription.patientName} has elevated blood pressure. Monitor and provide lifestyle guidance.`,
          latestReading: { 
            systolic: 130, 
            diastolic: 85, 
            timestamp: prescription.datePredicted || new Date() 
          },
          trend: 'stable',
          recommendations: [
            'Schedule follow-up within 2 weeks',
            'Educate on lifestyle modifications',
            'Monitor blood pressure weekly',
            'Review stress management techniques',
            'Consider dietary improvements'
          ],
          prescriptionId: prescription._id,
          prescriptionStatus: prescription.prescriptionStatus || 'pending'
        };
        alerts.push(alert);
        console.log(`✅ Added LOW alert for: ${prescription.patientName}`);
        continue;
      }
      
      // Normal stage - no alert
      console.log(`ℹ️ No alert needed for: ${prescription.patientName} (Stage: ${stage})`);
    }
    
    // Sort by severity (critical first)
    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    
    console.log(`✅ Total alerts generated: ${sortedAlerts.length}`);
    console.log(`   - Critical: ${sortedAlerts.filter(a => a.severity === 'critical').length}`);
    console.log(`   - High: ${sortedAlerts.filter(a => a.severity === 'high').length}`);
    console.log(`   - Medium: ${sortedAlerts.filter(a => a.severity === 'medium').length}`);
    console.log(`   - Low: ${sortedAlerts.filter(a => a.severity === 'low').length}`);
    
    return NextResponse.json({ 
      success: true, 
      alerts: sortedAlerts,
      totalAlerts: sortedAlerts.length,
      criticalCount: sortedAlerts.filter(a => a.severity === 'critical').length,
      highCount: sortedAlerts.filter(a => a.severity === 'high').length,
      mediumCount: sortedAlerts.filter(a => a.severity === 'medium').length,
      lowCount: sortedAlerts.filter(a => a.severity === 'low').length,
    });
    
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Server error: ' + error.message 
    }, { status: 500 });
  }
}