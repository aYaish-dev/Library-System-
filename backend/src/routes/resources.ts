import { Router } from "express";
import { prisma } from "../prisma";

export const resourcesRouter = Router();

resourcesRouter.get("/", async (req, res) => {
  const q = String(req.query.q || "").trim();

  const items = await prisma.resource.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { author: { contains: q, mode: "insensitive" } },
            { isbn: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { title: "asc" },
    select: { id: true, title: true, author: true, isbn: true },
    take: 50,
  });

  res.json(items);
});

resourcesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: { copies: true, tags: { include: { tag: true } } },
  });

  if (!resource) return res.status(404).json({ error: "Resource not found" });

  res.json({
    id: resource.id,
    title: resource.title,
    author: resource.author,
    isbn: resource.isbn,
    digital_link: resource.digitalLink,
    tags: resource.tags.map((t: any) => t.tag.name),
    copies: resource.copies.map((c: any) => ({

      id: c.id,
      status: c.status,
      due_date: c.dueDate,
      branch: c.branch,
      floor: c.floor,
      shelf: c.shelf,
    })),
  });
});
