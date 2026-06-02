import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";

// Register fonts (optional - you can use built-in fonts)
// Font.register({
//   family: 'Times-Roman',
//   src: '/fonts/TimesNewRoman.ttf'
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Times-Roman",
    backgroundColor: "#ffffff",
  },

  // Header Section
  header: {
    borderBottom: "3 solid #0891b2",
    paddingBottom: 15,
    marginBottom: 15,
  },
  hospitalName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0891b2",
    textAlign: "center",
    marginBottom: 5,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
    color: "#1f2937",
  },
  doctorDetails: {
    fontSize: 10,
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 9,
    textAlign: "center",
    color: "#6b7280",
    marginTop: 5,
    borderTop: "1 solid #e5e7eb",
    paddingTop: 8,
  },

  // Prescription ID
  prescriptionId: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 10,
  },

  // Date Section
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "1 solid #e5e7eb",
  },
  dateText: {
    fontSize: 10,
    color: "#374151",
  },

  // Patient Info Section
  patientInfoSection: {
    backgroundColor: "#f0f9ff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
    border: "1 solid #0891b2",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  patientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  patientField: {
    width: "50%",
    marginBottom: 5,
  },
  fieldLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "bold",
  },

  // Vitals Section
  vitalsSection: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
    border: "1 solid #14b8a6",
  },
  vitalsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vitalItem: {
    width: "18%",
  },

  // Diagnosis Section
  diagnosisSection: {
    backgroundColor: "#fef3c7",
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
    border: "1 solid #f59e0b",
  },
  diagnosisList: {
    marginLeft: 10,
  },
  diagnosisItem: {
    fontSize: 10,
    color: "#1f2937",
    marginBottom: 4,
  },
  bullet: {
    marginRight: 5,
  },

  // Rx Symbol
  rxSection: {
    marginBottom: 6,
    borderBottom: "2 solid #0891b2",
    paddingBottom: 5,
  },
  rxSymbol: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0891b2",
    fontFamily: "Times-Roman",
  },

  // Medications Section
  medicationsSection: {
    marginBottom: 8,
    minHeight: 180,
  },
  medicationItem: {
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: "1 dashed #d1d5db",
  },
  medicationNumber: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 3,
  },
  medicationDosage: {
    fontSize: 10,
    color: "#374151",
    marginBottom: 2,
  },
  medicationInstructions: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 3,
    fontStyle: "italic",
  },

  // Tests Section
  testsSection: {
    backgroundColor: "#fce7f3",
    padding: 12,
    marginBottom: 8,
    borderRadius: 5,
    border: "1 solid #ec4899",
  },
  testsList: {
    marginLeft: 10,
  },
  testItem: {
    fontSize: 10,
    color: "#1f2937",
    marginBottom: 3,
  },

  // Advice Section
  adviceSection: {
    backgroundColor: "#f0fdf4",
    padding: 12,
    marginBottom: 12,
    borderRadius: 5,
    border: "1 solid #10b981",
  },
  adviceList: {
    marginLeft: 10,
  },
  adviceItem: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 4,
    lineHeight: 1.4,
  },

  // Footer Section
  footer: {
    marginTop: 20,
    borderTop: "2 solid #0891b2",
    paddingTop: 15,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  qrSection: {
    width: "30%",
    alignItems: "center",
  },
  qrCode: {
    width: 70,
    height: 70,
    marginBottom: 5,
  },
  qrLabel: {
    fontSize: 7,
    color: "#6b7280",
    textAlign: "center",
  },
  signatureBox: {
    width: "65%",
  },
  signatureLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 15,
  },
  signatureLine: {
    borderTop: "1 solid #9ca3af",
    paddingTop: 5,
    marginTop: 15,
  },
  signatureText: {
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "bold",
  },
  signatureSubtext: {
    fontSize: 8,
    color: "#6b7280",
  },
  disclaimer: {
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },

  // Watermark
  watermark: {
    position: "absolute",
    top: "45%",
    left: "25%",
    fontSize: 60,
    color: "#f3f4f6",
    opacity: 0.1,
    transform: "rotate(-45deg)",
    fontWeight: "bold",
  },
});

const PrescriptionDocument = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermark}>
          <Text>SYNAPSE</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.hospitalName}>{data.doctor.hospital}</Text>
          <Text style={styles.doctorName}>{data.doctor.name}</Text>
          <Text style={styles.doctorDetails}>
            {data.doctor.qualification} | {data.doctor.specialization}
          </Text>
          <Text style={styles.doctorDetails}>
            Reg. No: {data.doctor.regNumber}
          </Text>
          <View style={styles.contactInfo}>
            <Text>
              {data.doctor.address} | Phone: {data.doctor.phone} | Email:{" "}
              {data.doctor.email}
            </Text>
          </View>
        </View>

        {/* Prescription ID */}
        <View>
          <Text style={styles.prescriptionId}>
            Prescription ID: {data.prescriptionId}
          </Text>
        </View>

        {/* Date */}
        <View style={styles.dateSection}>
          <Text style={styles.dateText}>Date: {data.date}</Text>
          <Text style={styles.dateText}>Next Visit: {data.nextVisit}</Text>
        </View>

        {/* Patient Information */}
        <View style={styles.patientSection}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.patientGrid}>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Name</Text>
              <Text style={styles.fieldValue}>{data.patient.name}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Patient ID</Text>
              <Text style={styles.fieldValue}>{data.patient.patientId}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Age / Gender</Text>
              <Text style={styles.fieldValue}>
                {data.patient.age} Years / {data.patient.gender}
              </Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Blood Group</Text>
              <Text style={styles.fieldValue}>{data.patient.bloodGroup}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Contact</Text>
              <Text style={styles.fieldValue}>{data.patient.phone}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Weight</Text>
              <Text style={styles.fieldValue}>{data.patient.weight}</Text>
            </View>
          </View>
        </View>

        {/* Vital Signs */}
        <View style={styles.vitalsSection}>
          <Text style={styles.sectionTitle}>Vital Signs</Text>
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalItem}>
              <Text style={styles.fieldLabel}>BP</Text>
              <Text style={styles.fieldValue}>{data.vitals.bp}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.fieldLabel}>Pulse</Text>
              <Text style={styles.fieldValue}>{data.vitals.pulse}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.fieldLabel}>Temp</Text>
              <Text style={styles.fieldValue}>{data.vitals.temp}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.fieldLabel}>SpO2</Text>
              <Text style={styles.fieldValue}>{data.vitals.spo2}</Text>
            </View>
            <View style={styles.vitalItem}>
              <Text style={styles.fieldLabel}>Weight</Text>
              <Text style={styles.fieldValue}>{data.vitals.weight}</Text>
            </View>
          </View>
        </View>

        {/* Diagnosis */}
        <View style={styles.diagnosisSection}>
          <Text style={styles.sectionTitle}>Clinical Diagnosis</Text>
          <View style={styles.diagnosisList}>
            {data.diagnosis.map((item, index) => (
              <Text key={index} style={styles.diagnosisItem}>
                <Text style={styles.bullet}>•</Text> {item}
              </Text>
            ))}
          </View>
        </View>

        {/* Rx Symbol */}
        <View style={styles.rxSection}>
          <Text style={styles.rxSymbol}>℞</Text>
        </View>

        {/* Medications */}
        <View style={styles.medicationsSection}>
          {data.medications.map((med, index) => (
            <View key={index} style={styles.medicationItem}>
              <Text style={styles.medicationNumber}>{index + 1}.</Text>
              <Text style={styles.medicationName}>
                Tab. {med.name} - {med.dosage}
              </Text>
              <Text style={styles.medicationDosage}>
                {med.frequency} - {med.timing} - {med.duration}
              </Text>
              <Text style={styles.medicationInstructions}>
                {med.instructions}
              </Text>
            </View>
          ))}
        </View>

        {/* Medical Tests */}
        {data.tests && data.tests.length > 0 && (
          <View style={styles.testsSection}>
            <Text style={styles.sectionTitle}>Recommended Tests</Text>
            <View style={styles.testsList}>
              {data.tests.map((test, index) => (
                <Text key={index} style={styles.testItem}>
                  <Text style={styles.bullet}>•</Text> {test}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Medical Advice */}
        <View style={styles.adviceSection}>
          <Text style={styles.sectionTitle}>Medical Advice & Instructions</Text>
          <View style={styles.adviceList}>
            {data.advice.map((item, index) => (
              <Text key={index} style={styles.adviceItem}>
                <Text style={styles.bullet}>•</Text> {item}
              </Text>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            {/* QR Code for Doctor Profile */}
            <View style={styles.qrSection}>
              <Image 
                style={styles.qrCode}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  JSON.stringify({
                    name: data.doctor.name,
                    qualification: data.doctor.qualification,
                    regNumber: data.doctor.regNumber,
                    specialization: data.doctor.specialization,
                    hospital: data.doctor.hospital,
                    phone: data.doctor.phone,
                    email: data.doctor.email
                  })
                )}`}
              />
              <Text style={styles.qrLabel}>Scan for Doctor's Profile</Text>
            </View>
            
            {/* Doctor Signature */}
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Doctor's Signature</Text>
              <View style={styles.signatureLine}>
                <Text style={styles.signatureText}>{data.doctor.name}</Text>
                <Text style={styles.signatureSubtext}>
                  {data.doctor.qualification}
                </Text>
                <Text style={styles.signatureSubtext}>
                  Reg. No: {data.doctor.regNumber}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.disclaimer}>
            This is a computer-generated prescription. This prescription is valid for {data.medications[0]?.duration || '30 days'} from the date of issue. 
            In case of any emergency, please contact the hospital immediately. Keep all medicines out of reach of children.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PrescriptionDocument;
