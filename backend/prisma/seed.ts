import { PrismaClient, CopyStatus, Role } from "@prisma/client";
import bcrypt from "bcrypt";

console.log("🌱 Starting database seed...");

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.resourceCopy.deleteMany();
  await prisma.resourceTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  const pass = await bcrypt.hash("123456", 10);

  const student = await prisma.user.create({
    data: {
      email: "student1@uni.edu",
      passwordHash: pass,
      role: Role.student,
    },
  });

  const faculty = await prisma.user.create({
    data: {
      email: "faculty1@uni.edu",
      passwordHash: pass,
      role: Role.faculty,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: "staff1@uni.edu",
      passwordHash: pass,
      role: Role.staff,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@uni.edu",
      passwordHash: pass,
      role: Role.admin,
    },
  });

  const r1 = await prisma.resource.create({
    data: {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      copies: {
        create: [
          { status: CopyStatus.available, branch: "Main", floor: "1", shelf: "A3" },
          { status: CopyStatus.on_hold, branch: "Main", floor: "1", shelf: "A3" },
        ],
      },
    },
  });

  const r2 = await prisma.resource.create({
    data: {
      title: "The C Programming Language",
      author: "Kernighan & Ritchie",
      isbn: "9780131103627",
      copies: {
        create: [
          { status: CopyStatus.checked_out, branch: "Engineering", floor: "2", shelf: "B1" },
        ],
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "seed",
      entity: "system",
      entityId: 0,
    },
  });

  console.log("✅ Database seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
