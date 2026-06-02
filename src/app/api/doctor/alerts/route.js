import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/model/userModel';
import Prescription from '@/model/prescriptionModel';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const doctorClerkId = searchParams.get('doctorClerkId');
    
    if (!doctorClerkId) {
      return NextResponse.json({ success: false, message: 'Doctor ID required' }, { status: 400 });
    }

    // Get all patients of this doctor
    const prescriptions = await Prescription.find({ doctorClerkId }).populate('clerkUserId');
    
    // Analyze each patient for deterioration patterns
    const alerts = [];
    
    for (const prescription of prescriptions) {
      const patient = await User.findOne({ clerkUserId: prescription.clerkUserId });
      
      if (!patient || !patient.bpReadings || patient.bpReadings.length === 0) {
        continue;
      }
      
      // Get last 7 readings
      const recentReadings = patient.bpReadings.slice(-7);
      
      // Check for concerning patterns
      const deteriorationChecks = analyzeDeteriorationPattern(recentReadings, patient, prescription);
      
      if (deteriorationChecks.hasAlert) {
        alerts.push({
          patientId: patient._id,
          patientName: patient.name,
          patientClerkId: patient.clerkUserId,
          age: patient.age,
          gender: patient.gender,
          currentStage: prescription.stage,
          alertType: deteriorationChecks.alertType,
          severity: deteriorationChecks.severity,
          message: deteriorationChecks.message,
          latestReading: recentReadings[recentReadings.length - 1],
          trend: deteriorationChecks.trend,
          recommendations: deteriorationChecks.recommendations,
          timestamp: new Date(),
          prescriptionId: prescription._id,
        });
      }
    }
    
    // Sort by severity (critical first)
    const sortedAlerts = alerts.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    
    return NextResponse.json({ 
      success: true, 
      alerts: sortedAlerts,
      totalAlerts: sortedAlerts.length,
      criticalCount: sortedAlerts.filter(a => a.severity === 'critical').length,
      highCount: sortedAlerts.filter(a => a.severity === 'high').length,
    });
    
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

function analyzeDeteriorationPattern(readings, patient, prescription) {
  const result = {
    hasAlert: false,
    alertType: '',
    severity: 'low',
    message: '',
    trend: '',
    recommendations: []
  };
  
  if (readings.length < 3) {
    return result;
  }
  
  const latest = readings[readings.length - 1];
  const latestSystolic = latest.systolic;
  const latestDiastolic = latest.diastolic;
  
  // Calculate average of last 3 readings
  const recent3 = readings.slice(-3);
  const avgSystolic = recent3.reduce((sum, r) => sum + r.systolic, 0) / recent3.length;
  const avgDiastolic = recent3.reduce((sum, r) => sum + r.diastolic, 0) / recent3.length;
  
  // Check 1: Hypertensive Crisis (Critical)
  if (latestSystolic >= 180 || latestDiastolic >= 120) {
    result.hasAlert = true;
    result.alertType = 'Hypertensive Crisis';
    result.severity = 'critical';
    result.message = `URGENT: Patient showing hypertensive crisis readings (${latestSystolic}/${latestDiastolic}). Immediate medical attention required.`;
    result.trend = 'critical_high';
    result.recommendations = [
      'Immediate emergency consultation required',
      'Consider hospitalization',
      'Review and adjust medication immediately',
      'Check for secondary causes',
      'Monitor for organ damage'
    ];
    return result;
  }
  
  // Check 2: Rapid Escalation (High Severity)
  if (readings.length >= 5) {
    const last5 = readings.slice(-5);
    const firstAvg = (last5[0].systolic + last5[1].systolic) / 2;
    const lastAvg = (last5[3].systolic + last5[4].systolic) / 2;
    const increase = lastAvg - firstAvg;
    
    if (increase >= 20) {
      result.hasAlert = true;
      result.alertType = 'Rapid BP Escalation';
      result.severity = 'high';
      result.message = `Patient BP increased by ${increase.toFixed(1)} mmHg over last 5 readings. Current: ${latestSystolic}/${latestDiastolic}`;
      result.trend = 'rapidly_increasing';
      result.recommendations = [
        'Schedule urgent follow-up within 48 hours',
        'Review current medication effectiveness',
        'Check medication compliance',
        'Assess lifestyle factors',
        'Consider increasing medication dosage'
      ];
      return result;
    }
  }
  
  // Check 3: Consistently High (Stage 2+)
  if (avgSystolic >= 140 || avgDiastolic >= 90) {
    const allHigh = recent3.every(r => r.systolic >= 140 || r.diastolic >= 90);
    
    if (allHigh) {
      result.hasAlert = true;
      result.alertType = 'Persistently Elevated BP';
      result.severity = avgSystolic >= 160 ? 'high' : 'medium';
      result.message = `Patient showing consistently high BP readings. Average: ${avgSystolic.toFixed(1)}/${avgDiastolic.toFixed(1)} over last 3 readings.`;
      result.trend = 'consistently_high';
      result.recommendations = [
        'Review medication regimen',
        'Check for medication adherence issues',
        'Assess diet and sodium intake',
        'Review stress levels and sleep patterns',
        'Consider adding or adjusting medication'
      ];
      return result;
    }
  }
  
  // Check 4: High Variability (Instability)
  if (readings.length >= 5) {
    const last5Systolic = readings.slice(-5).map(r => r.systolic);
    const maxSystolic = Math.max(...last5Systolic);
    const minSystolic = Math.min(...last5Systolic);
    const variability = maxSystolic - minSystolic;
    
    if (variability >= 30) {
      result.hasAlert = true;
      result.alertType = 'High BP Variability';
      result.severity = 'medium';
      result.message = `Patient showing high BP variability (${variability} mmHg range). This may indicate poor control or inconsistent medication.`;
      result.trend = 'unstable';
      result.recommendations = [
        'Investigate medication compliance',
        'Check for white coat syndrome',
        'Review timing of BP measurements',
        'Assess stress and anxiety levels',
        'Consider 24-hour ambulatory monitoring'
      ];
      return result;
    }
  }
  
  // Check 5: Medication Not Working (No Improvement)
  if (prescription.prescriptionStatus === 'approved' && readings.length >= 7) {
    const first3 = readings.slice(0, 3);
    const last3 = readings.slice(-3);
    
    const firstAvgSys = first3.reduce((sum, r) => sum + r.systolic, 0) / 3;
    const lastAvgSys = last3.reduce((sum, r) => sum + r.systolic, 0) / 3;
    
    const improvement = firstAvgSys - lastAvgSys;
    
    if (improvement < 5 && firstAvgSys >= 140) {
      result.hasAlert = true;
      result.alertType = 'Inadequate Treatment Response';
      result.severity = 'medium';
      result.message = `Patient showing minimal improvement despite medication. BP remains elevated at ${lastAvgSys.toFixed(1)}/${avgDiastolic.toFixed(1)}.`;
      result.trend = 'no_improvement';
      result.recommendations = [
        'Consider changing medication class',
        'Increase current medication dosage',
        'Add combination therapy',
        'Investigate secondary hypertension',
        'Review patient compliance with treatment'
      ];
      return result;
    }
  }
  
  // Check 6: Recent Spike After Stable Period
  if (readings.length >= 7) {
    const older5 = readings.slice(0, 5);
    const recent2 = readings.slice(-2);
    
    const olderAvg = older5.reduce((sum, r) => sum + r.systolic, 0) / 5;
    const recentAvg = recent2.reduce((sum, r) => sum + r.systolic, 0) / 2;
    
    const wasStable = older5.every(r => Math.abs(r.systolic - olderAvg) < 10);
    const suddenSpike = recentAvg - olderAvg >= 15;
    
    if (wasStable && suddenSpike) {
      result.hasAlert = true;
      result.alertType = 'Sudden BP Spike';
      result.severity = 'high';
      result.message = `Patient had stable readings but shows sudden spike. Previous average: ${olderAvg.toFixed(1)}, Current: ${recentAvg.toFixed(1)}`;
      result.trend = 'sudden_spike';
      result.recommendations = [
        'Contact patient immediately to assess symptoms',
        'Check for recent lifestyle changes',
        'Verify medication compliance',
        'Rule out medication interactions',
        'Consider temporary stress or illness'
      ];
      return result;
    }
  }
  
  return result;
}
