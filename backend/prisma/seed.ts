import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Check if default user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@mediasignage.com' },
  });

  if (existingUser) {
    console.log('Default user already exists. Skipping seed.');
    return;
  }

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@mediasignage.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('✅ Default user created:');
  console.log('   Email: admin@mediasignage.com');
  console.log('   Password: admin123');
  console.log('   User ID:', user.id);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
