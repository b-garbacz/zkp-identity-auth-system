import { prisma } from "@/services/prisma";
import crypto from "crypto";
import { globalPublicKey, globalPrivateKey } from "@/internal/generateKeys";
import jwt from "jsonwebtoken";
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
      },
    });

    if (!proof) {
      return new Response(
        JSON.stringify({
          message: "No verified proof found",
        }),
        { status: 404 }
      );
    }
    
    const existingToken = await prisma.attestationToken.findUnique({
      where: { email: email },
    });

    if (existingToken) {
      await prisma.attestationToken.delete({
        where: { email: email },
      });
    }

    const attestationToken = await prisma.attestationToken.create({
      data: {
        email: email,
        isOlderThan18: true,
        verified: true,
        verificationDate: proof.verificationDate,
        dateOfBirth: proof.dateOfBirth,
        attestationCreationDate: new Date(),
      },
    });

    return Response.json({
      status: 201,
      body: JSON.stringify({ message: "Token has been created" }),
    });


  } catch (error) {
    return Response.json({
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        JSON.stringify({ message: "Email parameter is missing" }),
        { status: 400 }
      );
    }

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

    const attestationToken = await prisma.attestationToken.findUnique({
      where: { email: email },
    });

    if (!attestationToken) {
      return new Response(
        JSON.stringify({ message: "Attestation token not found" }),
        { status: 404 }
      );
    }

    const tokenPayload = {
      isOlderThan18: attestationToken.isOlderThan18,
      verified: attestationToken.verified,
      verificationDate: attestationToken.verificationDate,
      dateOfBirth: attestationToken.dateOfBirth,
      attestationCreationDate: attestationToken.attestationCreationDate,
      email: attestationToken.email,
    }
    const token = jwt.sign(tokenPayload, globalPrivateKey, {
      algorithm: "ES256",
      expiresIn: "1h",
    });
    console.log(globalPublicKey);
    console.log(jwt.verify(token, globalPublicKey));
    return new Response(JSON.stringify({ token }), { status: 200 });
  } 
  catch (error) {
    return Response.json({
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
}

