import { prisma } from "@/services/prisma";
import Email from "next-auth/providers/email";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const newUser = await prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    return Response.json({ message: "OK" });
  } catch (e) {
    console.log(e);
  }
}
