import {
  PrismaClient,
  UserRole,
  NtrpLevel,
  SlotStatus,
  TournamentFormat,
  TournamentStatus,
} from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

try {
  process.loadEnvFile(".env");
} catch {
  // .env отсутствует — переменные окружения берутся из окружения процесса (CI/прод)
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function atTime(daysFromNow: number, hours: number, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function main() {
  // Настройки платформы (singleton)
  await prisma.adminSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      minTrainingPrice: 500,
      maxTrainingPrice: 10000,
      platformCommissionPct: 30,
    },
  });

  // Администратор
  await prisma.user.upsert({
    where: { email: "admin@breakpoint.moscow" },
    update: {},
    create: {
      email: "admin@breakpoint.moscow",
      name: "Администратор",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  // Тренеры
  const coachesData = [
    {
      email: "coach.smirnov@breakpoint.moscow",
      name: "Алексей Смирнов",
      bio: "Тренер с 12-летним стажем, специализация — постановка техники удара для взрослых игроков.",
      specialization: ["Техника удара", "Постановка подачи"],
      ratingAvg: 4.8,
      ratingCount: 24,
      payoutInfo: "Карта: 2202 **** **** 1234 (Сбербанк)",
    },
    {
      email: "coach.ivanova@breakpoint.moscow",
      name: "Мария Иванова",
      bio: "Бывшая профессиональная теннисистка, тренирует юниоров и взрослых-любителей.",
      specialization: ["Юниоры", "Физическая подготовка"],
      ratingAvg: 4.6,
      ratingCount: 17,
      payoutInfo: "СБП: +7 (999) 123-45-67 (Т-Банк)",
    },
    {
      email: "coach.kozlov@breakpoint.moscow",
      name: "Дмитрий Козлов",
      bio: "Готовит игроков к любительским турнирам, разбор тактики и игровых ситуаций.",
      specialization: ["Подготовка к турнирам", "Тактика"],
      ratingAvg: 5.0,
      ratingCount: 9,
      payoutInfo: "Карта: 5536 **** **** 5678 (Альфа-Банк)",
    },
  ];

  const coaches: { userId: string; coachProfileId: string }[] = [];

  for (const data of coachesData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        role: UserRole.COACH,
        emailVerified: new Date(),
      },
    });

    const coachProfile = await prisma.coachProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: data.bio,
        specialization: data.specialization,
        ratingAvg: data.ratingAvg,
        ratingCount: data.ratingCount,
        payoutInfo: data.payoutInfo,
      },
    });

    coaches.push({ userId: user.id, coachProfileId: coachProfile.id });
  }

  // Игроки
  const playersData = [
    {
      email: "player.petrov@breakpoint.moscow",
      name: "Игорь Петров",
      ntrpLevel: NtrpLevel.NTRP_3_0,
    },
    {
      email: "player.sokolova@breakpoint.moscow",
      name: "Анна Соколова",
      ntrpLevel: NtrpLevel.NTRP_2_5,
    },
  ];

  for (const data of playersData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        role: UserRole.PLAYER,
        emailVerified: new Date(),
      },
    });

    await prisma.playerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        ntrpLevel: data.ntrpLevel,
      },
    });
  }

  // Слоты тренировок (свободные, в ближайшие дни)
  const locations = [
    'Корт «Лужники», корт №3',
    'ТК «Дружба», крытый корт №1',
    'ТК «Метрополис», корт №5',
  ];

  const slotsData = [
    { coach: coaches[0], daysFromNow: 1, hour: 10, durationH: 1, price: 2500, location: locations[0] },
    { coach: coaches[0], daysFromNow: 2, hour: 18, durationH: 1, price: 2500, location: locations[0] },
    { coach: coaches[0], daysFromNow: 4, hour: 9, durationH: 1.5, price: 3500, location: locations[1] },
    { coach: coaches[1], daysFromNow: 1, hour: 16, durationH: 1, price: 2000, location: locations[1] },
    { coach: coaches[1], daysFromNow: 3, hour: 11, durationH: 1, price: 2000, location: locations[1] },
    { coach: coaches[2], daysFromNow: 2, hour: 19, durationH: 1, price: 3000, location: locations[2] },
    { coach: coaches[2], daysFromNow: 5, hour: 12, durationH: 1.5, price: 4000, location: locations[2] },
  ];

  for (const [index, slot] of slotsData.entries()) {
    const startsAt = atTime(slot.daysFromNow, slot.hour);
    const endsAt = new Date(startsAt.getTime() + slot.durationH * 60 * 60 * 1000);
    const id = `seed-slot-${index + 1}`;

    await prisma.trainingSlot.upsert({
      where: { id },
      update: {},
      create: {
        id,
        coachId: slot.coach.coachProfileId,
        startsAt,
        endsAt,
        location: slot.location,
        price: slot.price,
        status: SlotStatus.AVAILABLE,
      },
    });
  }

  // Турниры (открытая регистрация)
  const tournamentsData = [
    {
      id: "seed-tournament-1",
      title: "Открытый турнир Break Point — лето",
      description:
        "Главный летний турнир Break Point. Групповой этап с распределением по группам и плей-офф на выбывание. Призы победителям и финалистам.",
      format: TournamentFormat.GROUP_PLAYOFF,
      entryFee: 1500,
      location: 'Корт «Лужники»',
      startsAt: atTime(15, 10),
      endsAt: atTime(16, 20),
      registrationDeadline: atTime(12, 23, 59),
      minParticipants: 8,
      maxParticipants: 16,
      minNtrpLevel: NtrpLevel.NTRP_3_0,
      maxNtrpLevel: NtrpLevel.NTRP_3_5,
    },
    {
      id: "seed-tournament-2",
      title: "Кубок новичков",
      description:
        "Турнир для игроков начального уровня. Дружеская атмосфера, групповой этап и плей-офф — отличный способ получить турнирный опыт.",
      format: TournamentFormat.GROUP_PLAYOFF,
      entryFee: 1000,
      location: 'Корт «Чертаново»',
      startsAt: atTime(29, 10),
      endsAt: atTime(30, 20),
      registrationDeadline: atTime(26, 23, 59),
      minParticipants: 8,
      maxParticipants: 16,
      minNtrpLevel: NtrpLevel.NTRP_2_0,
      maxNtrpLevel: NtrpLevel.NTRP_2_5,
    },
    {
      id: "seed-tournament-3",
      title: "Летний мастерс",
      description:
        "Турнир по олимпийской системе для опытных игроков. Один матч — и ты либо проходишь дальше, либо выбываешь.",
      format: TournamentFormat.SINGLE_ELIM,
      entryFee: 2000,
      location: 'Корт «Динамо»',
      startsAt: atTime(43, 10),
      endsAt: atTime(44, 20),
      registrationDeadline: atTime(40, 23, 59),
      minParticipants: 8,
      maxParticipants: 16,
      minNtrpLevel: NtrpLevel.NTRP_4_0,
      maxNtrpLevel: null,
    },
  ];

  for (const data of tournamentsData) {
    const { id, ...rest } = data;
    await prisma.tournament.upsert({
      where: { id },
      update: {},
      create: {
        id,
        ...rest,
        status: TournamentStatus.REGISTRATION_OPEN,
      },
    });
  }

  console.log("Сид данных выполнен успешно.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
