import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.passwordReset.create({
      data: {
        email,
        otp,
        expiresAt,
        userId: user.id,
      },
    });

    // Send email with OTP
    try {
      // Always log to console for backup
      console.log("=".repeat(50));
      console.log(`PASSWORD RESET OTP FOR ${email}: ${otp}`);
      console.log(`Valid for 10 minutes`);
      console.log("=".repeat(50));

      // Send real email if configured
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "CoreInventory - Password Reset OTP",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Password Reset Request</h2>
              <p>You requested to reset your password for CoreInventory.</p>
              <p>Your OTP for password reset is:</p>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <h1 style="color: #2563eb; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
              </div>
              <p><strong>This OTP is valid for 10 minutes.</strong></p>
              <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="color: #6b7280; font-size: 12px;">
                This is an automated email from CoreInventory. Please do not reply.
              </p>
            </div>
          `,
        });

        return NextResponse.json({
          success: true,
          message: "OTP sent to your email successfully!",
        });
      } else {
        // Fallback to console only
        return NextResponse.json({
          success: true,
          message: "OTP generated (check console - email not configured)",
        });
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
