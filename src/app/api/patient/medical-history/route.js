import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MedicalHistory from "@/model/MedicalHistory";

export async function GET(req) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        const clerkId = searchParams.get("clerkId");

        if (!clerkId) {
            return NextResponse.json(
                {
                    success: false,
                    message: "clerkId required",
                },
                {
                    status: 400,
                }
            );
        }

        let history = await MedicalHistory.findOne({ clerkId });

        if (!history) {
            history = await MedicalHistory.create({
                clerkId,
                medicalConditions: [],
            });
        };

        return NextResponse.json({
            success: true,
            history,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            {
                status: 500,
            }
        );
    }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    let history = await MedicalHistory.findOne({
      clerkId: body.clerkId,
    });

    if (!history) {
      history = await MedicalHistory.create({
        clerkId: body.clerkId,
        medicalConditions: [],
        allergies: [],
        surgeries: [],
        familyHistory: [],
        labResults: [],
      });
    }

    switch (body.type) {
      case "condition":
        history.medicalConditions.push({
          condition: body.condition,
          diagnosedDate: body.diagnosedDate,
          status: body.status,
          severity: body.severity,
        });
        break;

      case "allergy":
        history.allergies.push({
          allergen: body.allergen,
          reaction: body.reaction,
          severity: body.severity,
          diagnosedDate: body.diagnosedDate,
        });
        break;

      case "surgery":
        history.surgeries.push({
          procedure: body.procedure,
          hospital: body.hospital,
          date: body.date,
          notes: body.notes,
        });
        break;

      case "family":
        history.familyHistory.push({
          relation: body.relation,
          condition: body.condition,
          ageOfOnset: body.ageOfOnset,
        });
        break;

      case "lab":
        history.labResults.push({
          test: body.test,
          result: body.result,
          normalRange: body.normalRange,
          date: body.date,
          status: body.status,
        });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid type",
          },
          {
            status: 400,
          }
        );
    }

    await history.save();

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}