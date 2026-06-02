# Synapse - AI-Powered Hypertension Management

<div align="center">

**Preventing hypertensive emergencies through intelligent monitoring**

</div>

---

## The Problem

- **220M+** Indians suffer from hypertension, **60%** poorly managed
- **50%** medication non-adherence leads to preventable emergencies
- **70%** of strokes are preventable with proper BP management
- Healthcare is **reactive**, not **proactive**

## Our Solution

**Synapse** bridges the gap between patients, doctors, and families with:

**AI Deterioration Alerts** - 6 algorithms detect emergencies before they happen  
**Doctor Dashboard** - Real-time patient monitoring with smart recommendations  
**Family Circle** - Involve loved ones in patient care  
**Emergency SOS** - One-tap alerts with GPS + vitals sharing  
**Smart Analytics** - Beautiful dashboards for everyone

---

## Core Features

### AI-Powered Patient Deterioration Alerts

**6 Detection Algorithms:**
1. **Hypertensive Crisis** (≥180/120) - Critical
2. **Rapid Escalation** (20+ mmHg in 5 readings) - High
3. **Persistently Elevated** (≥140/90 for 3+ readings) - Medium/High
4. **High Variability** (30+ mmHg range) - Medium
5. **Treatment Non-Response** (<5 mmHg improvement) - Medium
6. **Sudden Spike** (15+ mmHg after stable period) - High

**Why It Matters:** Catches emergencies 24-48 hours before they escalate

### Emergency SOS System
- Large accessibility-focused button
- 5-second countdown (prevents accidents)
- Auto-shares GPS location + critical vitals
- Instant alerts to family + doctor
- Embedded Google Maps

### Family Circle
- Add unlimited caregivers
- Emergency contact designation
- Real-time health updates
- Medication adherence notifications

### Smart Medication Management
- Automated reminders
- Adherence tracking with streaks
- Missed dose alerts to family
- PDF prescription generation

---

## Tech Stack

**Frontend:** Next.js 15, React 19, Tailwind CSS  
**Backend:** Next.js API Routes, Node.js 18+  
**Database:** MongoDB Atlas with Mongoose  
**Auth:** Clerk (Multi-tenant: Patient + Doctor portals)  
**Deployment:** Vercel, Auto HTTPS

---

## Impact

**Clinical Outcomes (Projected):**  
30% ↓ hypertensive emergencies | 50% ↑ medication adherence | 23% ↓ average BP

**Market:**  
220M TAM in India | 1M users Year 1 target | $24M ARR potential

---

## Architecture

```
Next.js Frontend (Patient + Doctor Portals)
         ↓
Clerk Auth (Multi-tenant)
         ↓
API Routes (BP Analysis + 6 Alert Algorithms)
         ↓
MongoDB Atlas (UserProfile, BPPrediction, DoctorProfile)
```

---

## Future Vision

**Phase 1 - MVP** (current)
AI alerts, Family Circle, Emergency SOS, Medication tracking

**Phase 2** 
IoT device integration, Telemedicine, Mobile apps

**Phase 3** 
ML predictive models, Hospital EMR integration, Insurance APIs

---

## Security

AES-256 encryption at rest | TLS 1.3 in transit  
OAuth 2.0 authentication | Row-level authorization  
HIPAA/GDPR/DPDPA compliance roadmap

---

## Team

1. Ujjwal Singh
2. Rohit Ratnam
3. Aditya Kumar
4. Shivam Mishra

---

<div align="center">

**Built for CodeUtsava 9.0**

</div>