"""
Management Command: seed_blog_data
===================================
Generates a realistic blogging platform dataset for development, testing,
search indexing, trending algorithms, and performance testing.

Usage:
    python manage.py seed_blog_data
    python manage.py seed_blog_data --users=300 --posts=10000
    python manage.py seed_blog_data --reset
    python manage.py seed_blog_data --categories  # only seed categories

Requirements:
    pip install faker

Place this file at:
    your_project/blogs/management/commands/seed_blog_data.py

(Also create __init__.py files in management/ and management/commands/ if absent)
"""

import random
import textwrap
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from faker import Faker

# ---------------------------------------------------------------------------
# Import your actual models. Adjust the import paths to match your project.
# ---------------------------------------------------------------------------
from blogs.models import BlogPost, Category

User = get_user_model()
fake = Faker()
Faker.seed(42)          # Reproducible output across runs
random.seed(42)


# ===========================================================================
# CONSTANTS & CONFIGURATION
# ===========================================================================

BATCH_SIZE = 500        # Records per bulk_create call – tune for your DB

# ------------------------------------------------------------------
# Predefined professional categories exactly as specified
# ------------------------------------------------------------------
CATEGORIES_DATA = [
    {"name": "Web Development",      "icon": "🌐", "color": "#3B82F6"},
    {"name": "Mobile Development",   "icon": "📱", "color": "#8B5CF6"},
    {"name": "Artificial Intelligence", "icon": "🤖", "color": "#EC4899"},
    {"name": "Machine Learning",     "icon": "🧠", "color": "#F59E0B"},
    {"name": "Data Science",         "icon": "📊", "color": "#10B981"},
    {"name": "Cybersecurity",        "icon": "🔒", "color": "#EF4444"},
    {"name": "Cloud Computing",      "icon": "☁️",  "color": "#06B6D4"},
    {"name": "DevOps",               "icon": "⚙️",  "color": "#84CC16"},
    {"name": "System Design",        "icon": "🏗️",  "color": "#F97316"},
    {"name": "Software Engineering", "icon": "💻", "color": "#6366F1"},
    {"name": "Programming",          "icon": "⌨️",  "color": "#14B8A6"},
    {"name": "Open Source",          "icon": "🔓", "color": "#A78BFA"},
    {"name": "Startups",             "icon": "🚀", "color": "#FB923C"},
    {"name": "Career Growth",        "icon": "📈", "color": "#34D399"},
    {"name": "Product Management",   "icon": "🗂️",  "color": "#60A5FA"},
    {"name": "UI/UX Design",         "icon": "🎨", "color": "#F472B6"},
    {"name": "Blockchain",           "icon": "⛓️",  "color": "#FBBF24"},
    {"name": "Tech News",            "icon": "📰", "color": "#A3E635"},
    {"name": "Productivity",         "icon": "⏱️",  "color": "#38BDF8"},
    {"name": "Entrepreneurship",     "icon": "💡", "color": "#FB7185"},
]

# Category descriptions (matches order above)
CATEGORY_DESCRIPTIONS = [
    "Articles covering frontend, backend, APIs, and full-stack web technologies.",
    "iOS, Android, React Native, and cross-platform mobile development.",
    "Deep dives into AI research, LLMs, neural networks, and intelligent systems.",
    "Practical guides on ML algorithms, model training, and deployment.",
    "Data analysis, visualization, statistics, and data engineering best practices.",
    "Security vulnerabilities, penetration testing, and defensive strategies.",
    "AWS, GCP, Azure, serverless, and cloud-native architecture patterns.",
    "CI/CD, Docker, Kubernetes, infrastructure automation, and SRE.",
    "Distributed systems, microservices, scalability, and architecture reviews.",
    "Clean code, design patterns, refactoring, and engineering best practices.",
    "Language tutorials, coding challenges, and general programming concepts.",
    "Contributing to open source, project spotlights, and community building.",
    "Startup journeys, product launches, fundraising, and growth hacking.",
    "Interview prep, promotions, mentorship, and navigating tech careers.",
    "Product roadmaps, prioritization frameworks, and stakeholder management.",
    "User research, wireframing, Figma workflows, and accessibility.",
    "DeFi, NFTs, Web3 development, and smart contract engineering.",
    "Industry news, product launches, acquisitions, and tech trends.",
    "Time management, note-taking systems, focus techniques, and tools.",
    "Building companies, leadership, culture, and business strategy.",
]

# ------------------------------------------------------------------
# Realistic title templates per category keyword
# ------------------------------------------------------------------
TITLE_TEMPLATES = [
    # Web
    "Building Scalable {tech} Applications with {framework}",
    "The Complete Guide to {topic} in {year}",
    "How to Optimize {tech} Performance: {count} Proven Techniques",
    "Why {tech} Is the Future of {domain}",
    "From Zero to Production: {tech} in 30 Days",
    "{count} Things I Wish I Knew Before Learning {tech}",
    "A Deep Dive into {tech}: Architecture, Patterns, and Best Practices",
    "Building a {type} System with {tech} and {tech2}",
    "Understanding {concept} in {tech}",
    "How I Built a {type} App That Handles {count}K+ Users",
    "{tech} vs {tech2}: Which Should You Choose in {year}?",
    "Mastering {concept}: A Practical {tech} Guide",
    "The Hidden Costs of {topic} Nobody Talks About",
    "Lessons Learned Scaling {tech} to {count} Million Requests",
    "Stop Making These {count} {tech} Mistakes",
    "A Beginner's Guide to {concept}",
    "Advanced {tech} Patterns for Senior Engineers",
    "How {big_company} Uses {tech} at Scale",
    "Refactoring Legacy {tech} Code: A Step-by-Step Approach",
    "The State of {topic} in {year}",
]

TECH_WORDS = [
    "React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "Django", "FastAPI",
    "Node.js", "GraphQL", "REST APIs", "PostgreSQL", "Redis", "Kafka", "Elasticsearch",
    "Docker", "Kubernetes", "Terraform", "AWS Lambda", "TypeScript", "Python",
    "Rust", "Go", "Java", "Kotlin", "Swift", "Flutter", "React Native",
    "PyTorch", "TensorFlow", "LangChain", "GPT-4", "LLMs", "Vector Databases",
    "Microservices", "gRPC", "WebSockets", "Server-Sent Events", "WebAssembly",
    "Celery", "RabbitMQ", "MongoDB", "Cassandra", "ClickHouse", "Prometheus",
    "Grafana", "OpenTelemetry", "GitHub Actions", "ArgoCD", "Istio", "Envoy",
]

CONCEPT_WORDS = [
    "System Design", "Event-Driven Architecture", "CQRS", "Domain-Driven Design",
    "Clean Architecture", "Hexagonal Architecture", "CAP Theorem", "Eventual Consistency",
    "Database Sharding", "Rate Limiting", "Circuit Breakers", "Caching Strategies",
    "Zero-Downtime Deployments", "Blue-Green Deployments", "Feature Flags",
    "Observability", "Distributed Tracing", "API Versioning", "OAuth 2.0", "JWT",
    "Server Components", "Edge Computing", "Streaming Responses", "Concurrency",
]

DOMAIN_WORDS = [
    "Web Development", "Backend Engineering", "Frontend Development", "DevOps",
    "Data Engineering", "Machine Learning", "Product Development", "Software Architecture",
]

TYPE_WORDS = [
    "Real-Time Chat", "E-Commerce", "SaaS", "Analytics Dashboard", "Recommendation",
    "Search", "Notification", "Authentication", "Payment Processing", "Content Delivery",
    "Job Queue", "Rate Limiting", "Caching", "API Gateway", "Monitoring",
]

BIG_COMPANIES = [
    "Netflix", "Uber", "Airbnb", "Stripe", "Shopify", "Discord",
    "Notion", "Linear", "Vercel", "PlanetScale", "Cloudflare",
]

# ------------------------------------------------------------------
# Role-based bio templates
# ------------------------------------------------------------------
BIO_TEMPLATES = [
    "Full Stack Engineer passionate about scalable systems and developer experience.",
    "Machine Learning Engineer exploring LLM applications and generative AI.",
    "Frontend Developer focused on React, performance, and beautiful UX.",
    "Backend Engineer specializing in distributed systems and high-throughput APIs.",
    "Software Architect with {years}+ years designing cloud-native platforms.",
    "DevOps Engineer obsessed with automation, reliability, and incident-free deployments.",
    "Data Scientist turning messy datasets into actionable business insights.",
    "Product Manager bridging the gap between engineering and user needs.",
    "iOS Developer building delightful mobile experiences with Swift and SwiftUI.",
    "Open Source contributor and maintainer of several popular {tech} libraries.",
    "Cybersecurity researcher focused on application security and threat modeling.",
    "Startup founder sharing lessons learned from building and scaling {type} products.",
    "UI/UX Designer crafting accessible, pixel-perfect interfaces with Figma.",
    "Technical Writer documenting complex systems with clarity and precision.",
    "Engineering Manager leading high-performance teams at {big_company}-scale.",
    "Blockchain developer building decentralized applications on Ethereum and Solana.",
    "Cloud Architect helping teams migrate to AWS and optimize infrastructure costs.",
    "Senior Software Engineer | {tech} enthusiast | Speaker | Open Source lover.",
    "Principal Engineer at a Series B startup. Previously {big_company}.",
    "Hobbyist programmer turned professional. Writing about my journey in tech.",
]

# ------------------------------------------------------------------
# Content block generators
# ------------------------------------------------------------------

CODE_SNIPPETS = {
    "python": """\
<pre><code class="language-python">
def process_items(items: list[dict]) -> list[dict]:
    \"\"\"
    Process and validate a list of items using batch operations.
    \"\"\"
    results = []
    for item in items:
        if validated := validate_item(item):
            results.append(transform(validated))
    return results
</code></pre>""",

    "javascript": """\
<pre><code class="language-javascript">
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt &lt; retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2 ** attempt * 200));
    }
  }
}
</code></pre>""",

    "typescript": """\
<pre><code class="language-typescript">
interface Repository&lt;T extends { id: string }&gt; {
  findById(id: string): Promise&lt;T | null&gt;;
  findAll(filters?: Partial&lt;T&gt;): Promise&lt;T[]&gt;;
  save(entity: T): Promise&lt;T&gt;;
  delete(id: string): Promise&lt;void&gt;;
}
</code></pre>""",

    "sql": """\
<pre><code class="language-sql">
-- Efficient pagination using keyset (seek method)
SELECT id, title, created_at, views
FROM blog_posts
WHERE is_published = TRUE
  AND created_at &lt; :cursor_created_at
ORDER BY created_at DESC, id DESC
LIMIT 20;
</code></pre>""",

    "bash": """\
<pre><code class="language-bash">
#!/usr/bin/env bash
set -euo pipefail

IMAGE="myapp:$(git rev-parse --short HEAD)"

docker build -t "$IMAGE" .
docker push "$IMAGE"
kubectl set image deployment/myapp app="$IMAGE" --record
kubectl rollout status deployment/myapp
</code></pre>""",

    "yaml": """\
<pre><code class="language-yaml">
# GitHub Actions CI pipeline
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest --cov=. --cov-report=xml
</code></pre>""",
}


# ===========================================================================
# HELPER: Generate a realistic blog title
# ===========================================================================

def generate_title() -> str:
    template = random.choice(TITLE_TEMPLATES)
    title = template.format(
        tech=random.choice(TECH_WORDS),
        tech2=random.choice(TECH_WORDS),
        framework=random.choice(TECH_WORDS),
        concept=random.choice(CONCEPT_WORDS),
        domain=random.choice(DOMAIN_WORDS),
        type=random.choice(TYPE_WORDS),
        topic=random.choice(CONCEPT_WORDS),
        count=random.choice([5, 7, 10, 12, 15, 20]),
        year=random.choice([2024, 2025]),
        big_company=random.choice(BIG_COMPANIES),
    )
    return title[:50]


# ===========================================================================
# HELPER: Unique slugify
# ===========================================================================

def unique_slug(title: str, existing_slugs: set) -> str:
    """Return a slug that doesn't clash with existing slugs."""
    base = slugify(title)[:45]          # keep slugs manageable within 50 chars
    slug = base
    counter = 1
    while slug in existing_slugs:
        slug = f"{base}-{counter}"
        counter += 1
    existing_slugs.add(slug)
    return slug


# ===========================================================================
# HELPER: Generate realistic HTML article content
# ===========================================================================

def generate_content(length_class: str) -> str:
    """
    Generate HTML content that mimics a real technical article.

    length_class: 'short' | 'medium' | 'long'
    """
    if length_class == "short":
        num_sections = random.randint(2, 3)
    elif length_class == "medium":
        num_sections = random.randint(4, 6)
    else:  # long
        num_sections = random.randint(7, 10)

    blocks = []

    # Introduction
    blocks.append(
        "<h2>Introduction</h2>\n"
        + _para_block(random.randint(2, 4))
    )

    section_headings = [
        "Core Concepts", "Getting Started", "Implementation", "Architecture Overview",
        "Performance Considerations", "Security Best Practices", "Testing Strategy",
        "Deployment & Monitoring", "Advanced Patterns", "Real-World Example",
        "Common Pitfalls", "Benchmarks & Results", "Conclusion",
    ]
    random.shuffle(section_headings)

    for i in range(num_sections):
        heading = section_headings[i % len(section_headings)]
        section = f"<h2>{heading}</h2>\n"
        section += _para_block(random.randint(2, 4))

        # Optionally add a list
        if random.random() < 0.5:
            section += _list_block(random.randint(3, 6))

        # Optionally add a code snippet
        if random.random() < 0.6:
            lang = random.choice(list(CODE_SNIPPETS.keys()))
            section += CODE_SNIPPETS[lang] + "\n"

        # Sub-section
        if random.random() < 0.3 and length_class != "short":
            section += f"<h3>{fake.bs().title()}</h3>\n"
            section += _para_block(random.randint(1, 3))

        blocks.append(section)

    # Conclusion (always present)
    blocks.append(
        "<h2>Conclusion</h2>\n"
        + _para_block(random.randint(2, 3))
    )

    return "\n".join(blocks)


def _para_block(count: int) -> str:
    """Return `count` HTML paragraphs of realistic text."""
    return "\n".join(
        f"<p>{fake.paragraph(nb_sentences=random.randint(3, 7))}</p>"
        for _ in range(count)
    ) + "\n"


def _list_block(items: int) -> str:
    """Return an HTML unordered list."""
    li = "\n".join(f"  <li>{fake.sentence(nb_words=random.randint(6, 14))}</li>"
                   for _ in range(items))
    return f"<ul>\n{li}\n</ul>\n"


# ===========================================================================
# HELPER: Generate a thumbnail URL
# ===========================================================================

def generate_thumbnail() -> str:
    w = random.choice([800, 1200, 1280])
    h = random.choice([400, 600, 720])
    seed = random.randint(1, 1000)
    # picsum.photos gives deterministic images by seed
    return f"https://picsum.photos/seed/{seed}/{w}/{h}"


# ===========================================================================
# HELPER: Generate realistic engagement metrics
# ===========================================================================

def generate_views() -> int:
    """
    Weighted distribution:
      60% new posts  → 10–500 views
      30% popular    → 1 000–10 000 views
      10% viral      → 10 000–100 000 views
    """
    bucket = random.random()
    if bucket < 0.60:
        return random.randint(10, 500)
    elif bucket < 0.90:
        return random.randint(1_000, 10_000)
    else:
        return random.randint(10_000, 100_000)


def generate_shares() -> int:
    """Shares follow an approximate power-law distribution."""
    return int(random.betavariate(0.5, 5) * 1000)


# ===========================================================================
# HELPER: Realistic created_at distribution over the past 12 months
# ===========================================================================

def generate_created_at() -> "datetime":
    now = timezone.now()
    bucket = random.random()
    if bucket < 0.05:          # ~5%  → today
        delta = timedelta(hours=random.randint(0, 23))
    elif bucket < 0.15:        # ~10% → this week
        delta = timedelta(days=random.randint(1, 6))
    elif bucket < 0.30:        # ~15% → this month
        delta = timedelta(days=random.randint(7, 30))
    else:                      # ~70% → past 12 months
        delta = timedelta(days=random.randint(31, 365))
    return now - delta


# ===========================================================================
# HELPER: Author distribution  (power-law so top writers dominate)
# ===========================================================================

def build_author_weights(users: list) -> list:
    """
    Assign a weight to each user so that a small number get many posts.

    Approximate tiers:
      Top 10  →  weight 50–100
      Next 40 →  weight 20–50
      Next 100 → weight 5–20
      Rest    →  weight 1–5
    """
    weights = []
    n = len(users)
    for i, _ in enumerate(users):
        if i < 10:
            w = random.randint(50, 100)
        elif i < 50:
            w = random.randint(20, 50)
        elif i < 150:
            w = random.randint(5, 20)
        else:
            w = random.randint(1, 5)
        weights.append(w)
    return weights


# ===========================================================================
# HELPER: Category selection  (weighted per post topic)
# ===========================================================================

def select_categories(all_categories: list) -> list:
    """Return 1–3 categories with weighted randomness."""
    count = random.choices([1, 2, 3], weights=[20, 50, 30])[0]
    return random.sample(all_categories, k=min(count, len(all_categories)))


# ===========================================================================
# SEEDER: Categories
# ===========================================================================

def seed_categories(stdout) -> list:
    stdout.write("  Creating Categories...")
    created_count = 0
    categories = []

    for idx, cat in enumerate(CATEGORIES_DATA):
        desc = CATEGORY_DESCRIPTIONS[idx]
        obj, created = Category.objects.get_or_create(
            name=cat["name"],
            defaults={
                "slug": slugify(cat["name"]),
                "description": desc,
                "icon": cat["icon"],
                "color": cat["color"],
                "is_active": True,
            },
        )
        categories.append(obj)
        if created:
            created_count += 1

    stdout.write(f"  ✓ Categories ready: {len(categories)} total ({created_count} new)")
    return categories


# ===========================================================================
# SEEDER: Users
# ===========================================================================

def seed_users(num_users: int, stdout) -> list:
    stdout.write(f"  Creating {num_users} Users...")

    existing_emails = set(User.objects.values_list("email", flat=True))
    users_to_create = []
    new_users = []

    # We must call create_user() to hash passwords – cannot use bulk_create
    # directly on AbstractBaseUser subclasses that need hashing.
    # Strategy: prepare data, then batch-insert in chunks using create_user().
    # This is unavoidable when password hashing is required.

    batch = []
    for _ in range(num_users):
        email = fake.unique.email()
        while email in existing_emails:
            email = fake.unique.email()
        existing_emails.add(email)

        first = fake.first_name()
        last = fake.last_name()
        name = f"{first} {last}"
        username_slug = slugify(name)

        # Pick a bio
        bio_template = random.choice(BIO_TEMPLATES)
        bio = bio_template.format(
            years=random.randint(3, 15),
            tech=random.choice(TECH_WORDS),
            type=random.choice(TYPE_WORDS),
            big_company=random.choice(BIG_COMPANIES),
        )

        batch.append({
            "email": email,
            "name": name,
            "password": "password123",
            "bio": bio,
            "website": f"https://{username_slug}.dev" if random.random() < 0.6 else "",
            "github": f"https://github.com/{username_slug}{random.randint(1,99)}"
                      if random.random() < 0.8 else "",
            "linkedin": f"https://linkedin.com/in/{username_slug}"
                        if random.random() < 0.7 else "",
            "avatar": f"https://picsum.photos/seed/{random.randint(1,500)}/200/200",
        })

        # Flush in BATCH_SIZE chunks to show progress
        if len(batch) >= BATCH_SIZE:
            created = _bulk_create_users(batch)
            new_users.extend(created)
            batch = []
            stdout.write(f"    ... {len(new_users)} users created so far")

    if batch:
        created = _bulk_create_users(batch)
        new_users.extend(created)

    stdout.write(f"  ✓ Users created: {len(new_users)}")
    return new_users


def _bulk_create_users(batch: list) -> list:
    """Create a batch of users; returns the newly-created User instances."""
    created = []
    for data in batch:
        try:
            u = User.objects.create_user(
                email=data["email"],
                password=data["password"],
                name=data.get("name", ""),
                bio=data.get("bio", ""),
                website=data.get("website", ""),
                github=data.get("github", ""),
                linkedin=data.get("linkedin", ""),
                avatar=data.get("avatar", ""),
            )
            created.append(u)
        except Exception:
            # Skip if email collision despite our dedup (race condition in multi-process setups)
            pass
    return created


# ===========================================================================
# SEEDER: Blog Posts
# ===========================================================================

def seed_posts(
    num_posts: int,
    users: list,
    categories: list,
    stdout,
) -> int:
    stdout.write(f"  Creating {num_posts} Blog Posts...")

    author_weights = build_author_weights(users)

    # Track slugs to ensure uniqueness within this run
    existing_slugs: set = set(BlogPost.objects.values_list("slug", flat=True))

    total_created = 0
    batch_posts: list[BlogPost] = []
    # We'll store (post_index, [category_objs]) to assign M2M after bulk_create
    category_assignments: list[tuple[int, list]] = []

    # Length distribution: 20% short, 50% medium, 30% long
    length_choices = ["short"] * 20 + ["medium"] * 50 + ["long"] * 30

    for i in range(num_posts):
        author = random.choices(users, weights=author_weights, k=1)[0]
        title = generate_title()
        slug = unique_slug(title, existing_slugs)
        length_class = random.choice(length_choices)

        post = BlogPost(
            author=author,
            title=title,
            slug=slug,
            thumbnail=generate_thumbnail(),
            content=generate_content(length_class),
            is_published=True,
            views=generate_views(),
            shares=generate_shares(),
        )
        # We set created_at after creation via update() to bypass auto_now_add
        batch_posts.append(post)
        category_assignments.append(random.randint(0, len(batch_posts) - 1))  # placeholder

        if len(batch_posts) >= BATCH_SIZE:
            saved, ca = _flush_post_batch(
                batch_posts, categories, existing_slugs, i - len(batch_posts) + 1
            )
            total_created += saved
            _assign_categories(ca, categories)
            batch_posts = []
            stdout.write(f"    ... {total_created} posts created so far")

    # Final partial batch
    if batch_posts:
        saved, ca = _flush_post_batch(batch_posts, categories, existing_slugs, total_created)
        total_created += saved
        _assign_categories(ca, categories)

    stdout.write(f"  ✓ Posts created: {total_created}")
    return total_created


def _flush_post_batch(
    batch: list,
    categories: list,
    existing_slugs: set,
    offset: int,
) -> tuple[int, list]:
    """
    bulk_create a batch of BlogPost objects, then update created_at
    in a single UPDATE … CASE … WHEN statement (via individual updates
    grouped in one transaction – Django ORM doesn't support bulk UPDATE
    with per-row values natively without third-party libraries).

    Returns (count_saved, [(post_obj, [cat_objs])])
    """
    with transaction.atomic():
        created = BlogPost.objects.bulk_create(batch)

    # Assign realistic created_at via a bulk update trick:
    # Build (id, datetime) pairs and run per-row updates in one transaction.
    with transaction.atomic():
        for post in created:
            BlogPost.objects.filter(pk=post.pk).update(
                created_at=generate_created_at()
            )

    # Build category assignment list
    category_assignments = [
        (post, select_categories(categories)) for post in created
    ]

    return len(created), category_assignments


def _assign_categories(
    assignments: list,
    categories: list,
) -> None:
    """
    Bulk-assign ManyToMany categories.

    Django's M2M .set() runs an INSERT per relation, so we use
    through-model bulk_create if the M2M uses an auto-created through table.
    For simplicity we use .add() with *unpacked list, which Django batches
    into a single INSERT per post.
    """
    with transaction.atomic():
        for post, cats in assignments:
            if cats:
                post.categories.add(*cats)


# ===========================================================================
# RESET
# ===========================================================================

def reset_data(stdout) -> None:
    stdout.write("  [RESET] Deleting existing seeded data...")

    with transaction.atomic():
        deleted_posts, _ = BlogPost.objects.all().delete()
        stdout.write(f"    Deleted {deleted_posts} blog posts.")

        deleted_cats, _ = Category.objects.all().delete()
        stdout.write(f"    Deleted {deleted_cats} categories.")

        # Delete non-superuser accounts (preserve real admin accounts)
        deleted_users, _ = (
            User.objects.filter(is_superuser=False).delete()
        )
        stdout.write(f"    Deleted {deleted_users} users.")

    stdout.write("  [RESET] Complete.")


# ===========================================================================
# MANAGEMENT COMMAND
# ===========================================================================

class Command(BaseCommand):
    help = (
        "Seed the database with realistic blogging platform data. "
        "Generates users, categories, and blog posts suitable for "
        "development, testing, and performance benchmarking."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--users",
            type=int,
            default=200,
            metavar="N",
            help="Number of users to create (default: 200)",
        )
        parser.add_argument(
            "--posts",
            type=int,
            default=5000,
            metavar="N",
            help="Number of blog posts to create (default: 5000)",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            default=False,
            help="Delete all existing seeded data before re-seeding.",
        )
        parser.add_argument(
            "--categories",
            action="store_true",
            default=False,
            help="Only seed categories (skips users and posts).",
        )

    def handle(self, *args, **options):
        num_users = options["users"]
        num_posts = options["posts"]
        do_reset = options["reset"]
        only_categories = options["categories"]

        self.stdout.write(self.style.SUCCESS("\n" + "=" * 60))
        self.stdout.write(self.style.SUCCESS("  Blog Platform Seeder"))
        self.stdout.write(self.style.SUCCESS("=" * 60))

        # ---- RESET --------------------------------------------------------
        if do_reset:
            reset_data(self.stdout)

        # ---- CATEGORIES ---------------------------------------------------
        self.stdout.write("\nCreating Categories...")
        categories = seed_categories(self.stdout)

        if only_categories:
            self.stdout.write(self.style.SUCCESS("\nCategories-only mode. Done."))
            return

        # ---- USERS --------------------------------------------------------
        self.stdout.write(f"\nCreating Users...")
        users = seed_users(num_users, self.stdout)

        if not users:
            self.stdout.write(
                self.style.ERROR(
                    "No users were created. If you intended to re-seed, use --reset."
                )
            )
            return

        # ---- BLOG POSTS ---------------------------------------------------
        self.stdout.write(f"\nCreating Blog Posts...")
        total_posts = seed_posts(num_posts, users, categories, self.stdout)

        # ---- SUMMARY ------------------------------------------------------
        self.stdout.write(self.style.SUCCESS("\n" + "=" * 60))
        self.stdout.write(self.style.SUCCESS("  Seeding Complete"))
        self.stdout.write(self.style.SUCCESS("=" * 60))
        self.stdout.write(f"  Users Created:      {len(users)}")
        self.stdout.write(f"  Categories Created: {len(categories)}")
        self.stdout.write(f"  Posts Created:      {total_posts}")
        self.stdout.write(self.style.SUCCESS("\n  Completed Successfully.\n"))
