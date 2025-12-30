import { PrismaClient, CopyStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// A huge list of topics to make the library feel "full"
const TOPICS = [
  "Software Engineering", "Artificial Intelligence", "Cybersecurity", "Data Science",
  "World History", "Ancient Rome", "Modern Philosophy", "Psychology",
  "Science Fiction", "Fantasy", "Mystery", "Thriller",
  "Astrophysics", "Biology", "Economics", "Business"
];

async function fetchBooksFromGoogle(query: string) {
  try {
    // Fetch 20 books per topic
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
  console.log("🚀 Starting Massive Database Seed...");

  // 1. Clean Slate
  await prisma.auditLog.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.resourceCopy.deleteMany();
  await prisma.resourceTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Base Admin/Staff Users
  const passwordHash = await bcrypt.hash("123456", 10);
  
  const users = [
    { email: "admin@uni.edu", role: "admin", name: "System Admin" },
    { email: "staff@uni.edu", role: "staff", name: "Library Staff" },
    // We don't need to create students manually anymore, they can sign up!
  ];

  for (const u of users) {
    await prisma.user.create({
      data: { 
        email: u.email,
        passwordHash, 
        role: u.role as any // Type assertion for safety
      },
    });
  }
  console.log("✅ Core staff accounts created.");

  // 3. Fetch Real Books
  let totalBooks = 0;
  for (const topic of TOPICS) {
    console.log(`📚 Fetching category: ${topic}...`);
    const books = await fetchBooksFromGoogle(topic);

    for (const item of books) {
      const info = item.volumeInfo;
      const isbn = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier || 
                   info.industryIdentifiers?.find((i: any) => i.type === "ISBN_10")?.identifier || 
                   `GEN-${Math.floor(Math.random() * 1000000)}`;

      // Prevent duplicates if Google returns the same book for different queries
      const existing = await prisma.resource.findUnique({ where: { isbn } });
      if (existing) continue;

      const resource = await prisma.resource.create({
        data: {
          title: info.title || "Unknown Title",
          author: info.authors ? info.authors.join(", ") : "Unknown Author",
          isbn: isbn,
          digitalLink: info.previewLink || null,
        },
      });

      // Add 1-4 Physical Copies per book
      const copyCount = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < copyCount; i++) {
        await prisma.resourceCopy.create({
          data: {
            resourceId: resource.id,
            status: CopyStatus.available,
            branch: "Main Library",
            floor: `Floor ${Math.floor(Math.random() * 3) + 1}`,
            shelf: `Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 20)}`,
          },
        });
      }
      totalBooks++;
    }
  }

  console.log(`🎉 Database populated with ${totalBooks} unique titles!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });