// Seeds a live CP contest on the DEV database so the contest screens can be tested with realistic data.
// Everything it creates is separate from real data: its own hidden competition (slug "e2e-cp"), 20 accounts
// e2e-cp-01 ... e2e-cp-20 @nplc.test, their teams, 8 problems and a mix of submissions. --reset removes exactly that.
//
//   pnpm seed:cp --confirm <NEXT_PUBLIC_SUPABASE_URL> [--hours 4]
//   pnpm seed:cp --confirm <NEXT_PUBLIC_SUPABASE_URL> --reset
//
// Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and E2E_CP_PASSWORD (the accounts' password) in .env.local.
// See docs/dev-seed-cp.md.

import { createClient } from "@supabase/supabase-js";

const SLUG = "e2e-cp";
const EMAIL_PREFIX = "e2e-cp-";
const EMAIL_DOMAIN = "nplc.test";
const TEST_CASES_PER_PROBLEM = 5;

const out = (line) => process.stdout.write(`${line}\n`);
const fail = (line) => {
  process.stderr.write(`${line}\n`);
  process.exit(1);
};

const args = process.argv.slice(2);
const arg = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.E2E_CP_PASSWORD;
if (!url || !serviceKey) fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).");
// The URL must be typed on the command line, so the seed never runs against a database by accident.
if (arg("--confirm") !== url) fail(`Refusing to run. Pass --confirm ${url} if this is the DEV database.`);
const reset = args.includes("--reset");
const hours = Number(arg("--hours") ?? 4);
if (!reset && (!password || password.length < 8)) fail("Set E2E_CP_PASSWORD (at least 8 characters) in .env.local.");
if (!Number.isFinite(hours) || hours <= 1 || hours > 48) fail("--hours must be more than 1 and at most 48.");

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const must = async (label, promise) => {
  const { data, error } = await promise;
  if (error) fail(`${label}: ${error.message}`);
  return data;
};

// ----- Example content (all made up) -----

const PROBLEMS = [
  ["Jumlah Dua Bilangan", "easy", "Diberikan dua bilangan bulat A dan B. Cetak A + B.", (a, b) => [`${a} ${b}`, `${a + b}`]],
  ["Bilangan Genap", "easy", "Diberikan N. Cetak banyaknya bilangan genap dari 1 sampai N.", (a) => [`${a}`, `${Math.floor(a / 2)}`]],
  ["Selisih Mutlak", "easy", "Diberikan A dan B. Cetak |A − B|.", (a, b) => [`${a} ${b}`, `${Math.abs(a - b)}`]],
  ["Nilai Maksimum", "medium", "Diberikan tiga bilangan bulat. Cetak yang terbesar.", (a, b) => [`${a} ${b} ${a + b}`, `${Math.max(a, b, a + b)}`]],
  ["Faktor Persekutuan", "medium", "Diberikan A dan B. Cetak FPB keduanya.", (a, b) => [`${a} ${b}`, `${gcd(a, b)}`]],
  ["Tangga Fibonacci", "medium", "Diberikan N (1 ≤ N ≤ 40). Cetak bilangan Fibonacci ke-N.", (a) => [`${(a % 40) + 1}`, `${fib((a % 40) + 1)}`]],
  ["Kuadrat Sempurna", "hard", "Diberikan N. Cetak YA jika N kuadrat sempurna, selain itu TIDAK.", (a) => [`${a * a}`, "YA"]],
  ["Susun Ulang Digit", "hard", "Diberikan bilangan N. Cetak digit-digitnya dari besar ke kecil.", (a, b) => [`${a}${b}`, `${a}${b}`.split("").sort().reverse().join("")]],
];

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
function fib(n) {
  let [x, y] = [0, 1];
  for (let i = 0; i < n; i++) [x, y] = [y, x + y];
  return x;
}

// Events per team: problem letter, then A<ms> Accepted, S<ms> Accepted again ("Yes – Solved"), W wrong answer,
// T time limit, R runtime error, C compile error, J judge error. In time order.
// Covers: ties split by runtime (5 & 6), Solved faster (2) and not faster (3), negative scores (12–16),
// a judge error that costs nothing (9), teams with no submissions (17–19) and a disqualified team (20).
const TEAMS = [
  ["Null Pointer", "SMK Contoh 5", "A:W A:A120 B:A310 C:W C:W C:A220 D:A400 E:T"],
  ["Logika Nusantara", "SMA Contoh 2", "A:A90 B:A250 C:W C:A180 D:A330 D:S280"],
  ["Binary Tigers", "SMA Contoh 7", "A:A150 B:W B:A260 C:A300 C:S420"],
  ["Byte Squad", "SMA Contoh 1", "A:W A:W A:A100 B:A240 C:R C:W"],
  ["Recursion Rangers", "SMA Contoh 3", "A:A110 B:A180"],
  ["Stack Overflowers", "SMA Contoh 9", "A:A160 B:A250"],
  ["Pixel Pirates", "SMA Contoh 8", "A:C A:A120"],
  ["Kode Kilat", "SMK Contoh 4", "A:A150 B:T B:T"],
  ["Algo Arek", "SMA Contoh 11", "A:J A:A180"],
  ["Debug Dewa", "SMA Contoh 6", "A:W A:W A:W A:W A:A200"],
  ["Loop Legends", "SMK Contoh 2", "B:A300 A:W"],
  ["Bit Bersatu", "SMA Contoh 4", "A:W"],
  ["Heap Heroes", "SMA Contoh 13", "A:W B:C"],
  ["Cache Me", "SMA Contoh 14", "A:W A:R A:T B:W"],
  ["Segfault Squad", "SMK Contoh 3", "A:R A:R A:R B:W B:W"],
  ["Sintaks Senja", "SMA Contoh 16", "H:W"],
  ["Kopi Kode", "SMA Contoh 12", ""],
  ["Prima Tim", "SMA Contoh 10", ""],
  ["Tim Tanpa Nama", "SMA Contoh 15", ""],
  ["Graf Gerilya", "SMK Contoh 1", "A:A140 B:A200"],
];
const DISQUALIFIED = new Set([20]);

const VERDICT = { A: "accepted", S: "accepted", W: "wrong_answer", T: "time_limit_exceeded", R: "runtime_error_sigsegv", C: "compilation_error", J: "internal_error" };
const PASSED = { A: 5, S: 5, W: 3, T: 2, R: 1, C: 0, J: 0 };
const LANGUAGES = ["cpp", "python", "java"];
const SOURCE = {
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n  long long a, b;\n  cin >> a >> b;\n  cout << a + b << endl;\n}\n",
  python: "a, b = map(int, input().split())\nprint(a + b)\n",
  java: "import java.util.*;\npublic class Main {\n  public static void main(String[] x) {\n    Scanner s = new Scanner(System.in);\n    System.out.println(s.nextLong() + s.nextLong());\n  }\n}\n",
};

const pad = (n) => String(n).padStart(2, "0");

// ----- Reset -----

async function removeSeed() {
  const competition = await must("find competition", db.from("competitions").select("id").eq("slug", SLUG).maybeSingle());
  if (competition) {
    // Registrations first (their delete cascades members, submissions and scores), then the competition
    // (cascades problems, test cases and the session).
    await must("delete teams", db.from("registrations").delete().eq("competition_id", competition.id));
    await must("delete competition", db.from("competitions").delete().eq("id", competition.id));
  }
  let removed = 0;
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) fail(`list accounts: ${error.message}`);
    const seeded = data.users.filter((u) => u.email?.startsWith(EMAIL_PREFIX) && u.email.endsWith(`@${EMAIL_DOMAIN}`));
    for (const user of seeded) {
      const { error: deleteError } = await db.auth.admin.deleteUser(user.id);
      if (deleteError) fail(`delete ${user.email}: ${deleteError.message}`);
      removed++;
    }
    if (data.users.length < 1000) break;
  }
  out(`Removed the seeded competition and ${removed} accounts.`);
}

// ----- Seed -----

async function seed() {
  const competition = await must(
    "create competition",
    db
      .from("competitions")
      .insert({
        slug: SLUG,
        name: "E2E Competitive Programming",
        type: "competitive_programming",
        description: "Lomba contoh untuk menguji layar kontes di DEV. Tidak tampil di situs.",
        is_active: false,
        fee: 0,
        min_members: 1,
        max_members: 3,
        payment_method: "qris",
        sort_order: 99,
      })
      .select("id")
      .single(),
  );

  const problemIds = [];
  for (const [index, [title, difficulty, statement, make]] of PROBLEMS.entries()) {
    const problem = await must(
      `create problem ${title}`,
      db
        .from("cp_problems")
        .insert({
          competition_id: competition.id,
          level: index + 1,
          title,
          difficulty,
          statement,
          input_format: "Satu baris berisi bilangan bulat sesuai soal.",
          output_format: "Satu baris berisi jawaban.",
          constraints: "1 ≤ A, B ≤ 1000",
          time_limit_ms: difficulty === "hard" ? 2000 : 1000,
          memory_limit_kb: 262144,
          points: 100,
        })
        .select("id")
        .single(),
    );
    const cases = Array.from({ length: TEST_CASES_PER_PROBLEM }, (_, i) => {
      const [input, expected] = make(3 + i * 7 + index, 2 + i * 5);
      return { problem_id: problem.id, ordinal: i + 1, input: `${input}\n`, expected_output: `${expected}\n`, is_sample: i < 2 };
    });
    await must(`add tests ${title}`, db.from("cp_test_cases").insert(cases));
    await must(`publish ${title}`, db.from("cp_problems").update({ is_published: true }).eq("id", problem.id));
    problemIds.push(problem.id);
  }

  // Live now, started 50 minutes ago; the end follows from the duration.
  const startedAt = new Date(Date.now() - 50 * 60_000);
  await must(
    "create session",
    db.from("cp_sessions").insert({ competition_id: competition.id, status: "live", duration_seconds: Math.round(hours * 3600) }),
  );
  await must("backdate start", db.from("cp_sessions").update({ started_at: startedAt.toISOString() }).eq("competition_id", competition.id));

  const teams = [];
  for (const [index, [teamName, school]] of TEAMS.entries()) {
    const n = index + 1;
    const email = `${EMAIL_PREFIX}${pad(n)}@${EMAIL_DOMAIN}`;
    const { data: created, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: `Peserta E2E ${pad(n)}` },
    });
    if (error) fail(`create ${email}: ${error.message}`);
    const userId = created.user.id;
    const registration = await must(
      `create team ${teamName}`,
      db
        .from("registrations")
        .insert({ competition_id: competition.id, leader_id: userId, team_name: teamName, school, status: "accepted" })
        .select("id")
        .single(),
    );
    await must(
      `add leader ${teamName}`,
      db.from("registration_members").insert({
        registration_id: registration.id,
        user_id: userId,
        is_leader: true,
        full_name: `Peserta E2E ${pad(n)}`,
        email,
        phone: `0800000000${pad(n)}`,
        nisn: `99000000${pad(n)}`,
      }),
    );
    teams.push({ n, userId, registrationId: registration.id });
  }

  // Submissions in time order, spread over the 45 minutes after the start. The database scores each one.
  const events = [];
  for (const team of teams) {
    const script = TEAMS[team.n - 1][2];
    if (!script) continue;
    for (const step of script.split(" ")) {
      const [letter, code] = step.split(":");
      events.push({ team, problem: letter.charCodeAt(0) - 65, kind: code[0], ms: Number(code.slice(1)) || null });
    }
  }
  const spacing = (45 * 60_000) / Math.max(1, events.length);
  // Interleave teams so the history looks like a real contest: order by each event's index within its team.
  const order = events
    .map((event, i) => ({ event, rank: events.slice(0, i).filter((e) => e.team === event.team).length * 100 + event.team.n }))
    .sort((a, b) => a.rank - b.rank)
    .map((entry) => entry.event);

  for (const [i, event] of order.entries()) {
    const language = LANGUAGES[(event.team.n + i) % LANGUAGES.length];
    const ran = event.kind !== "C" && event.kind !== "J";
    const timeMs = event.ms ?? (event.kind === "T" ? 1000 : 40 + ((event.team.n * 37 + i * 13) % 300));
    await must(
      `submission ${i + 1}`,
      db.from("cp_submissions").insert({
        problem_id: problemIds[event.problem],
        registration_id: event.team.registrationId,
        user_id: event.team.userId,
        language,
        source_code: SOURCE[language],
        verdict: VERDICT[event.kind],
        passed: PASSED[event.kind],
        total: TEST_CASES_PER_PROBLEM,
        max_time_ms: ran ? timeMs : null,
        max_memory_kb: ran ? 3000 + timeMs * 40 : null,
        compile_output: event.kind === "C" ? "main.cpp:17:5: error: 'dist' was not declared in this scope" : null,
        created_at: new Date(startedAt.getTime() + 60_000 + i * spacing).toISOString(),
      }),
    );
  }

  for (const team of teams.filter((t) => DISQUALIFIED.has(t.n))) {
    await must(
      "disqualify",
      db
        .from("registrations")
        .update({ disqualified_at: new Date().toISOString(), disqualification_reason: "Contoh diskualifikasi untuk pengujian." })
        .eq("id", team.registrationId),
    );
  }

  out(`Seeded "${SLUG}": 8 problems, ${teams.length} teams, ${order.length} submissions, live for ${hours} h from ${startedAt.toISOString()}.`);
  out(`Sign in as ${EMAIL_PREFIX}04@${EMAIL_DOMAIN} (Byte Squad) or any ${EMAIL_PREFIX}NN@${EMAIL_DOMAIN} with E2E_CP_PASSWORD.`);
}

await removeSeed();
if (!reset) await seed();
