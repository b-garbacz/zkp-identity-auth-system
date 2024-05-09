import { prisma } from "@/services/prisma";
import axios from "axios";

//uzytkownik chce utworzyc proof
export async function POST(request: Request) {
  try {
    const { email, expiryDate, proofOfUser } = await request.json();
    const response = await axios.post("http://localhost:8080/verify_zkp", {
      proofData: proofOfUser,
    });

    if (response.status === 200) {
      const createdProof = await prisma.proof.create({
        data: {
          proofData: proofOfUser,
          verificationDate: new Date(),
          expirationDate: new Date(expiryDate * 1000),
          email: email,
          verifed: true,
        },
      });
      console.log("Proof created:", createdProof);

      return Response.json({
        status: 200,
        body: JSON.stringify({ verified: true }),
      });
    } else {
      console.log("Proof verification failed:");
      return Response.json({
        status: 404,
        body: JSON.stringify({ verified: false }),
      });
    }
  } catch (error) {
    return Response.json({
      status: 500,
      body: JSON.stringify({
        error: "Internal server error",
      }),
    });
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
    const { email } = await request.json();
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
  } catch (error) {
    console.error("Error:", error);
    return Response.json({
      status: 500,
      body: JSON.stringify({ error: "Wystąpił wewnętrzny błąd serwera." }),
    });
  }
}
