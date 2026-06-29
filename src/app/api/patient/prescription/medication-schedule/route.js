import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import MedicationSchedule from "@/model/MedicationSchedule";



/* -------------------------------------
   CREATE SCHEDULE
--------------------------------------*/

export async function POST(req) {

    try {

        await connectDB();

        const {
            clerkId,
            prescriptionId,
            medicationName,
        } = await req.json();



        if (!clerkId || !prescriptionId || !medicationName) {

            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields",
                },
                {
                    status: 400,
                }
            );
        }



        let existing = await MedicationSchedule.findOne({

            clerkId,

            prescriptionId,

            medicationName,

        });



        if (existing) {

            return NextResponse.json({

                success: true,

                data: existing,

            });

        }



        const schedule = [];

        const today = new Date();



        for (let i = 0; i < 7; i++) {

            const date = new Date(today);

            date.setDate(today.getDate() + i);



            schedule.push({

                date: date.toDateString(),

                period: "Morning",

                time: "8:30 AM",

                taken: false,

            });



            schedule.push({

                date: date.toDateString(),

                period: "Evening",

                time: "8:30 PM",

                taken: false,

            });

        }



        const created = await MedicationSchedule.create({

            clerkId,

            prescriptionId,

            medicationName,

            schedule,

        });



        return NextResponse.json({

            success: true,

            data: created,

        });

    }

    catch (err) {

        return NextResponse.json(

            {

                success: false,

                error: err.message,

            },

            {

                status: 500,

            }

        );

    }

}





/* -------------------------------------
   GET SCHEDULES
--------------------------------------*/

export async function GET(req) {

    try {

        await connectDB();



        const { searchParams } = new URL(req.url);



        const clerkId = searchParams.get("clerkId");

        const prescriptionId = searchParams.get("prescriptionId");



        const schedules = await MedicationSchedule.find({

            clerkId,

            prescriptionId,

        });



        return NextResponse.json({

            success: true,

            data: schedules,

        });

    }

    catch (err) {

        return NextResponse.json(

            {

                success: false,

                error: err.message,

            },

            {

                status: 500,

            }

        );

    }

}





/* -------------------------------------
   UPDATE CHECKBOX
--------------------------------------*/

export async function PATCH(req) {

    try {

        await connectDB();



        const {

            scheduleId,

            index,

            taken,

        } = await req.json();



        const schedule = await MedicationSchedule.findById(

            scheduleId

        );



        if (!schedule) {

            return NextResponse.json(

                {

                    success: false,

                    error: "Schedule not found",

                },

                {

                    status: 404,

                }

            );

        }



        schedule.schedule[index].taken = taken;



        await schedule.save();



        return NextResponse.json({

            success: true,

            data: schedule,

        });

    }

    catch (err) {

        return NextResponse.json(

            {

                success: false,

                error: err.message,

            },

            {

                status: 500,

            }

        );

    }

}