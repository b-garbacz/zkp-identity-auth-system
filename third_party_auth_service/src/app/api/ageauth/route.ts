import { prisma } from "@/services/prisma";
import crypto from "crypto";

function generateOneTimeCode(email: string): number {
  const currentDate = new Date().toISOString().split("T")[0];
  const combinedString = email + currentDate;
  const hash = crypto.createHash("sha256").update(combinedString).digest("hex");
  const number = BigInt("0x" + hash);
  return Number(number);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (!user) {
      return Response.json({
        status: 404,
        body: JSON.stringify({
          message: "User does not exists",
        }),
      });
    }
    const proof = await prisma.proof.findFirst({
      where: {
        email: email,
        verifed: true,
        expirationDate: {
          gt: new Date(),
        },
      },
    });

    if (!proof) {
      return Response.json({
        status: 404,
        body: JSON.stringify({
          message: "No verified proof found",
        }),
      });
    }

    const existingCode = await prisma.oneTimeCode.findFirst({
      where: {
        email: email,
      },
    });

    if (existingCode) {
      await prisma.oneTimeCode.delete({
        where: {
          id: existingCode.id,
        },
      });
    }
    const oneTimeCode = generateOneTimeCode(email).toString().substring(0, 16);
    await prisma.oneTimeCode.create({
      data: {
        isOlderThan18: true,
        verified: proof.verifed,
        verificationDate: proof.verificationDate,
        codeCreationDate: new Date(),
        hasBeenUsed: false,
        email: email,
        code: oneTimeCode,
      },
    });
  } catch (error) {
    return Response.json({
      status: 500,
      body: JSON.stringify({ error: "Wystąpił wewnętrzny błąd serwera." }),
    });
  }
}
