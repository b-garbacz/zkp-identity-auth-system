import { prisma } from "@/services/prisma";
import axios from "axios";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { enGB } from "date-fns/locale";

//uzytkownik chce utworzyc proof
export async function POST(request: Request) {
  try {
    const { email, expiryDate, proofOfUser, dateOfBirth } =
      await request.json();
    const response = await axios.post("http://localhost:8080/verify_zkp", {
      proofData: proofOfUser,
    });

    if (response.status === 200) {
      const existingProof = await prisma.proof.findUnique({
        where: { email: email },
      });

      if (existingProof) {
        await prisma.proof.delete({
          where: { id: existingProof.id },
        });
        console.log("Deleted existing proof:", existingProof);
      }
      const timeZone = "Europe/Warsaw";
      const birthDateUtc = new Date(dateOfBirth * 1000);
      birthDateUtc.setHours(birthDateUtc.getHours() + 2);
      birthDateUtc.setSeconds(birthDateUtc.getSeconds() + 1);
      const birthDatePl = toZonedTime(birthDateUtc, timeZone);

      const expiryDateUtc = new Date(expiryDate * 1000);
      const expiryDatePl = toZonedTime(expiryDateUtc, timeZone);

      const createdProof = await prisma.proof.create({
        data: {
          proofData: proofOfUser,
          verificationDate: toZonedTime(new Date(), timeZone),
          dateOfBirth: birthDatePl,
          expirationDate: expiryDatePl,
          email: email,
          verifed: true,
        },
      });
      console.log("Proof created:", createdProof);

      return new Response(JSON.stringify({ verified: true }), { status: 201 });
    } else {
      console.log("Proof verification failed");
      return new Response(JSON.stringify({ verified: false }), { status: 400 });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      { status: 500 }
    );
  }
}

// uzytkownik chce usunąć proof - todo dodać ikonkę usuwania dowodu
export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();

    const existingProof = await prisma.proof.findFirst({
      where: {
        email: email,
      },
    });

    if (!existingProof) {
      return Response.json({
        status: 404,
        body: JSON.stringify({
          message: " Proof does not exists",
        }),
      });
    }

    await prisma.proof.delete({
      where: {
        id: existingProof.id,
      },
    });

    return Response.json({
      status: 200,
      body: JSON.stringify({ message: "Proof has been deleted" }),
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
}
// do kiedy jest ważny proof - todo pobierana jest dla uzytkownika data kiedy jego proof wygasnie
export async function GET(request: Request) {
  try {
    
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const type = url.searchParams.get("type");

    if (!email) {
      return new Response(
        JSON.stringify({ message: "Email parameter is missing" }),
        { status: 400 }
      );
    }
    
    if (!type) {
      return new Response(
        JSON.stringify({ message: "Type parameter is missing" }),
        { status: 400 }
      );
    }

    if (type === "expiry"){
      const proof = await prisma.proof.findFirst({
        where: {
          email: email,
        },
      });
  
      if (!proof) {
        return Response.json({
          status: 404,
          body: JSON.stringify({
            message: "Proof does not exists",
          }),
        });
      }
      const expirationDate = new Date(proof.expirationDate);
      const day = expirationDate.getDate().toString().padStart(2, "0");
      const month = (expirationDate.getMonth() + 1).toString().padStart(2, "0");
      const year = expirationDate.getFullYear();
      const expirationDateString = `${day}/${month}/${year}`;

      return Response.json({
        status: 200,
        body: JSON.stringify({ expirationDate: expirationDateString }),
      });

    } else if (type === "status") {

      const proof = await prisma.proof.findFirst({
        where: {
          email: email,
        },
      });
  
      if (!proof) {
        return Response.json({
          status: 404,
          body: JSON.stringify({
            message: "Proof does not exists",
          }),
        });
      }

      return Response.json({
        status: 200,
        body: JSON.stringify({ message: "Proof exists" }),
      });
    }

  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      status: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    });
  }
}
