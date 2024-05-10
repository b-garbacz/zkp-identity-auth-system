import { globalPublicKey } from "@/internal/generateKeys";

export async function GET(request: Request) {
  try {
    return new Response(
      JSON.stringify({ publicKey: globalPublicKey }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET request for public key:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}
