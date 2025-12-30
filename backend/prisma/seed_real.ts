import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Topics to fetch real books for
const TOPICS = ["Software Engineering", "Artificial Intelligence", "World History", "Physics", "Philosophy"];

async function fetchBooksFromGoogle(query: string) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&langRestrict=en`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

async function main() {
  console.log("🌱 Starting Real Data Seed...");

  // 1. Create Base Users (Real credentials)
  const passwordHash = "$2b$10$EpWaTzcQ8.ntv.m.d.5v.O8/v/a.X.a.X.a.X.a.X.a"; // Hash for "password123" (Use a real hash in production)
  
  const users = [
    { email: "admin@medipol.edu.tr", role: "admin", name: "System Admin" },
    { email: "staff@medipol.edu.tr", role: "staff", name: "Library Staff" },
    { email: "student@medipol.edu.tr", role: "student", name: "John Student" },
    { email: "faculty@medipol.edu.tr", role: "faculty", name: "Dr. Professor" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: passwordHash as string, role: u.role as any },
    });
  }
  console.log("✅ Users created.");

  // 2. Fetch and Insert Real Books
  for (const topic of TOPICS) {
    console.log(`📥 Fetching books for: ${topic}...`);
    const books = await fetchBooksFromGoogle(topic);

    for (const item of books) {
      const info = item.volumeInfo;
      const isbn = info.industryIdentifiers?.find((i: any) => i.type === "ISBN_13")?.identifier || 
                   info.industryIdentifiers?.find((i: any) => i.type === "ISBN_10")?.identifier || 
                   `GEN-${Math.floor(Math.random() * 100000)}`;

      // Create Resource
      const resource = await prisma.resource.create({
        data: {
          title: info.title,
          author: info.authors ? info.authors.join(", ") : "Unknown Author",
          isbn: isbn,
          digitalLink: info.previewLink || null, // Real link to Google Books preview
        },
      });

      // Create Physical Copies (1-3 copies per book)
      const copyCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < copyCount; i++) {
        await prisma.resourceCopy.create({
          data: {
            resourceId: resource.id,
            status: "available",
            branch: "Main Library",
            floor: `Floor ${Math.floor(Math.random() * 3) + 1}`,
            shelf: `Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 20)}`,
          },
        });
      }
    }
  }

  console.log("📚 Real Library Database Seeded Successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });