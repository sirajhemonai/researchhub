import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certId },
  });

  if (!certificate) {
    return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
  }

  let milestoneSummary = [];
  try {
    milestoneSummary = JSON.parse(certificate.milestoneSummary);
  } catch {
    milestoneSummary = [];
  }

  return NextResponse.json({
    id: certificate.id,
    studentName: certificate.studentName,
    university: certificate.university,
    projectTitle: certificate.projectTitle,
    companyName: certificate.companyName,
    duration: certificate.duration,
    milestoneSummary,
    verificationUrl: certificate.verificationUrl,
    createdAt: certificate.createdAt,
  });
}
