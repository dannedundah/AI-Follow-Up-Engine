import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.messageLog.deleteMany();
  await prisma.rule.deleteMany();
  await prisma.lead.deleteMany();

  const statuses = ['lead', 'quote_sent', 'won', 'lost'] as const;

  for (let i = 1; i <= 10; i++) {
    await prisma.lead.create({
      data: {
        name: `Lead ${i}`,
        email: `lead${i}@example.com`,
        phone: i % 2 === 0 ? `+467000000${i}` : null,
        status: statuses[i % statuses.length],
        notes: i % 3 === 0 ? 'Behöver snabb återkoppling.' : null,
        last_contact_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  await prisma.rule.createMany({
    data: [
      {
        applies_to_status: 'lead',
        inactive_days_threshold: 2,
        channel: 'email',
        enabled: true,
        tone: 'friendly',
        subject_template: 'Hej {{lead_name}} – ska vi ta nästa steg?',
        prompt_template:
          'Skriv ett kort uppföljningsmail till {{lead_name}} med status {{lead_status}}. Inkludera en tydlig CTA.',
      },
      {
        applies_to_status: 'quote_sent',
        inactive_days_threshold: 3,
        channel: 'email',
        enabled: true,
        tone: 'direct',
        subject_template: 'Uppföljning på offert till {{lead_name}}',
        prompt_template:
          'Skriv ett tydligt uppföljningsmail till {{lead_name}} om offertläge {{lead_status}}. Fråga om beslut och nästa steg.',
      },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
