import { PrismaClient, CopyStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const TOPICS = [
  "Software Engineering", "Artificial Intelligence", "Cybersecurity", 
  "World History", "Psychology", "Science Fiction", "Business"
];

async function fetchBooksFromGoogle(query: string) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&langRestrict=en`;
    const res = await fetch(url);
    const data = await res.json();
    return data.items || [];
  } catch (e) {
    console.error(`Failed to fetch books for ${query}:`, e);
    return [];
  }
}

async function main() {
  console.log("🚀 Starting Monster Level Seed...");

  // Clear everything
  await prisma.review.deleteMany(); // New
  await prisma.auditLog.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.resourceCopy.deleteMany();
  await prisma.resourceTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash("123456", 10);
  const users = [
    { email: "admin@uni.edu", role: "admin", name: "System Admin" },
    { email: "staff@uni.edu", role: "staff", name: "Library Staff" },
    { email: "student@uni.edu", role: "student", name: "Demo Student" }
  ];

  for (const u of users) {
    await prisma.user.create({ data: { email: u.email, passwordHash, role: u.role as any, name: u.name } });
  }

  // Create Books with Tags & Reviews
  let totalBooks = 0;
  for (const topic of TOPICS) {
    console.log(`📚 Processing Category: ${topic}...`);
    const books = await fetchBooksFromGoogle(topic);

    for (const item of books) {
      const info = item.volumeInfo;
      if(!info.description) continue; // Skip empty books for higher quality

      const isbn = info.industryIdentifiers?.[0]?.identifier || `GEN-${Math.random()}`;
      
      // 1. Create Resource
      const resource = await prisma.resource.create({
        data: {
          title: info.title || "Unknown",
          author: info.authors ? info.authors.join(", ") : "Unknown",
          isbn: isbn,
          digitalLink: info.previewLink,
          description: info.description ? info.description.substring(0, 500) + "..." : "No description."
        },
      });

      // 2. Create/Link Tag (Category)
      if (info.categories && info.categories.length > 0) {
        const catName = info.categories[0];
        const tag = await prisma.tag.upsert({
          where: { name: catName },
          update: {},
          create: { name: catName },
        });
        await prisma.resourceTag.create({
          data: { resourceId: resource.id, tagId: tag.id }
        });
      }

      // 3. Create Copies
      await prisma.resourceCopy.createMany({
        data: Array(Math.floor(Math.random() * 3) + 1).fill(0).map(() => ({
          resourceId: resource.id,
          status: CopyStatus.available,
          branch: "Main Lib",
          floor: "Floor 1",
          shelf: `Shelf ${Math.floor(Math.random() * 100)}`
        }))
      });

      // 4. Fake Reviews (Social Proof)
      if (Math.random() > 0.5) {
        const student = await prisma.user.findUnique({ where: { email: "student@uni.edu" } });
        if (student) {
          await prisma.review.create({
            data: {
              userId: student.id,
              resourceId: resource.id,
              rating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
              comment: "Great read! Highly recommended for this course."
            }
          });
        }
      }
      totalBooks++;
    }
  }
  console.log(`🎉 Database upgraded with ${totalBooks} smart resources!`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });