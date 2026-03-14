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
      // For development/hackathon: Log OTP to console
      console.log("=".repeat(50));
      console.log(`PASSWORD RESET OTP FOR ${email}: ${otp}`);
      console.log(`Valid for 10 minutes`);
      console.log("=".repeat(50));

      // In production, use proper email service:
      /*
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
          <h2>Password Reset Request</h2>
          <p>Your OTP for password reset is:</p>
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      });
      */

      return NextResponse.json({
        success: true,
        message: "OTP sent to your email (check console for development)",
      });
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
