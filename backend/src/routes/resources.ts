import { Router } from "express";
import { prisma } from "../prisma";
import { z } from "zod";

export const resourcesRouter = Router();

resourcesRouter.get("/", async (req, res) => {
  const q = String(req.query.q || "");
  const tag = String(req.query.tag || "");
  const page = Number(req.query.page) || 1;
  const limit = 12; // Grid size
  const skip = (page - 1) * limit;

  // Build Filter
  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { author: { contains: q, mode: "insensitive" } },
      { isbn: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tag && tag !== "All") {
    where.tags = { some: { tag: { name: tag } } };
  }

  // Execute Query
  const [total, items] = await Promise.all([
    prisma.resource.count({ where }),
    prisma.resource.findMany({
      where,
      skip,
      take: limit,
      include: {
        tags: { include: { tag: true } },
        copies: { select: { status: true } }, // Minimal data for badges
        _count: { select: { reviews: true } } // For social proof
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  // Get All Unique Tags for Sidebar
  const allTags = await prisma.tag.findMany({ select: { name: true } });

  res.json({
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    facets: allTags.map(t => t.name)
  });
});

resourcesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      copies: true,
      tags: { include: { tag: true } },
      reviews: { include: { user: { select: { name: true } } } } // Include reviews
    },
  });
  if (!resource) return res.status(404).json({ error: "Not found" });
  res.json(resource);
});