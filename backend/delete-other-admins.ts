import { prisma } from './db.js';

async function removeOtherAdmins() {
  const mainAdminEmail = 'admin@example.com';
  
  try {
    const deleted = await prisma.user.deleteMany({
      where: {
        role: 'admin',
        NOT: {
          email: mainAdminEmail
        }
      }
    });
    
    console.log(`Successfully deleted ${deleted.count} other admin(s).`);
  } catch (err) {
    console.error('Error deleting other admins:', err);
  } finally {
    await prisma.$disconnect();
  }
}

removeOtherAdmins();
