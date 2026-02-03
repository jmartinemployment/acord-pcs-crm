import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const BCRYPT_ROUNDS = 12;

  // Check if admin user exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@acordpcs.com' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', BCRYPT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@acordpcs.com',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    }
  });

  console.log('Created admin user:', admin.email);
  console.log('\nLogin credentials:');
  console.log('  Email: admin@acordpcs.com');
  console.log('  Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
