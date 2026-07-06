import { prisma } from './db.js';
import express from 'express';

async function testPatch() {
  // Let's directly call the update method as it is in ticket.routes.ts
  const ticket = await prisma.ticket.update({
    where: { id: "cmr7ssk4j0001jkmitibck7no" },
    data: {
      assignedToId: "wi90lZcgOYlOItnGrbvUtroXcbSicOv1"
    },
    include: {
      assignedTo: {
        select: { name: true, email: true }
      }
    }
  });
  console.log(JSON.stringify(ticket, null, 2));
  process.exit(0);
}

testPatch();
