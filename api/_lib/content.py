"""Canonical portfolio content.

This module is the single source of truth used to seed MongoDB. The admin panel
edits the database afterwards; re-running the seed never clobbers edited rows
unless it is explicitly told to (see `_routers/admin.py::reseed`).

Every human-facing string carries fr/en/ar so the site is genuinely trilingual
rather than English with translations bolted on.
"""
from __future__ import annotations

# Self-hosted so it never expires or gets hotlink-blocked (the LinkedIn CDN URL
# carries an `e=` expiry). The file lives in public/.
PHOTO_URL = "/othmane-sadiki.jpg"

GITHUB_URL = "https://github.com/othmanestd"
LINKEDIN_URL = "https://www.linkedin.com/in/sadiki-othmane/"
EMAIL = "othmanesadiki6114@gmail.com"
PHONE = "+212675958346"


PROFILE = {
    "name": "Othmane Sadiki",
    "headline": {
        "fr": "Data Engineer — pipelines temps réel, Lakehouse et Process Mining",
        "en": "Data Engineer — real-time pipelines, Lakehouse and Process Mining",
        "ar": "مهندس بيانات — خطوط أنابيب فورية، ليكهاوس وتنقيب العمليات",
    },
    "bio": {
        "fr": "Je conçois des plateformes de données qui tiennent en production : ingestion temps réel, architectures Lakehouse Bronze/Silver/Gold, qualité de données mesurable et restitution qui sert vraiment la décision.",
        "en": "I build data platforms that survive production: real-time ingestion, Bronze/Silver/Gold Lakehouse architectures, measurable data quality, and serving layers that actually inform decisions.",
        "ar": "أبني منصات بيانات تصمد في بيئة الإنتاج: استيعاب فوري للبيانات، معماريات ليكهاوس برونزي/فضي/ذهبي، جودة بيانات قابلة للقياس، وطبقات عرض تخدم القرار فعليًا.",
    },
    "long_bio": {
        "fr": (
            "Ingénieur d'État en Génie Informatique (EMSI Casablanca), je travaille sur toute la chaîne "
            "de la donnée : de l'ingestion événementielle jusqu'aux tableaux de bord décisionnels.\n\n"
            "Chez Silamir, j'ai migré des pipelines SQL vers Apache Spark 3.5 et modélisé les Event Logs "
            "de Bouygues Telecom dans Celonis pour analyser et optimiser leurs processus métiers. "
            "Chez ONDA, j'ai construit un pipeline ETL Python qui structure des données non structurées "
            "issues d'un VoiceAgent IA, exposées ensuite via une REST API avec alerting SMTP.\n\n"
            "Ce qui m'intéresse : les architectures qui restent lisibles quand le volume monte, "
            "la qualité de données traitée comme une contrainte de premier ordre, et le fait de "
            "livrer en équipe agile — j'ai piloté du delivery Data dans une équipe hybride France/Maroc."
        ),
        "en": (
            "State Engineer in Computer Science (EMSI Casablanca), I work across the whole data chain: "
            "from event ingestion to decision-grade dashboards.\n\n"
            "At Silamir I migrated SQL processing pipelines to Apache Spark 3.5 and modelled Bouygues "
            "Telecom's Event Logs into Celonis to analyse and optimise their business processes. "
            "At ONDA I built a Python ETL pipeline that structures unstructured data coming from an AI "
            "VoiceAgent, then exposed it through a REST API with SMTP-driven alerting.\n\n"
            "What I care about: architectures that stay readable as volume grows, data quality treated "
            "as a first-class constraint, and shipping as a team — I drove Data delivery inside a "
            "hybrid France/Morocco agile squad."
        ),
        "ar": (
            "مهندس دولة في هندسة المعلوميات (المدرسة المغربية لعلوم المهندس، الدار البيضاء)، أعمل على "
            "سلسلة البيانات كاملة: من استيعاب الأحداث إلى لوحات القيادة التي تدعم القرار.\n\n"
            "في Silamir قمت بترحيل خطوط معالجة البيانات من SQL إلى Apache Spark 3.5، ونمذجت سجلات "
            "الأحداث الخاصة بـ Bouygues Telecom داخل منصة Celonis لتحليل وتحسين عملياتها. "
            "وفي ONDA بنيت خط ETL بلغة Python لهيكلة بيانات غير منظمة قادمة من وكيل صوتي ذكي، "
            "ثم عرضتها عبر واجهة REST مع نظام تنبيهات بالبريد.\n\n"
            "ما يهمني: معماريات تبقى واضحة مع تزايد الحجم، وجودة بيانات تُعامَل كقيد أساسي، "
            "والتسليم ضمن فريق — قدت تسليم حلول البيانات داخل فريق رشيق مشترك بين فرنسا والمغرب."
        ),
    },
    "location": "Casablanca, Morocco",
    "email": EMAIL,
    "phone": PHONE,
    "photo_url": PHOTO_URL,
    "cv_url_fr": "/cv/othmane-sadiki-data-engineer-fr.pdf",
    "cv_url_en": "",
    "available": True,
    "availability_note": {
        "fr": "Ouvert aux opportunités Data Engineering",
        "en": "Open to Data Engineering opportunities",
        "ar": "منفتح على فرص في هندسة البيانات",
    },
}


EXPERIENCES = [
    {
        "company": "Silamir",
        "role": {
            "fr": "Consultant Data Engineer",
            "en": "Data Engineer Consultant",
            "ar": "استشاري مهندس بيانات",
        },
        "location": "France / Maroc",
        "period": {"fr": "Février – Août 2026", "en": "February – August 2026", "ar": "فبراير – أغسطس 2026"},
        "start": "2026-02", "end": "2026-08", "kind": "work", "order": 1,
        "stack": ["Apache Spark 3.5", "SQL", "Celonis", "Power BI", "Excel", "Jira"],
        "bullets": [
            {
                "fr": "Migration des pipelines de traitement de SQL vers Apache Spark 3.5 pour optimiser les performances du calcul distribué et la scalabilité des flux.",
                "en": "Migrated processing pipelines from SQL to Apache Spark 3.5 to optimise distributed compute performance and stream scalability.",
                "ar": "ترحيل خطوط المعالجة من SQL إلى Apache Spark 3.5 لتحسين أداء الحوسبة الموزعة وقابلية التوسع.",
            },
            {
                "fr": "Conception de pipelines ETL (extraction, nettoyage, transformation) via des requêtes SQL avancées garantissant l'intégrité des données brutes.",
                "en": "Designed ETL pipelines (extraction, cleansing, transformation) with advanced SQL guaranteeing raw-data integrity.",
                "ar": "تصميم خطوط ETL (استخراج، تنظيف، تحويل) عبر استعلامات SQL متقدمة تضمن سلامة البيانات الخام.",
            },
            {
                "fr": "Modélisation et intégration des Event Logs d'entreprise dans Celonis pour l'analyse et l'optimisation des processus métiers de Bouygues Telecom.",
                "en": "Modelled and integrated enterprise Event Logs into Celonis to analyse and optimise Bouygues Telecom's business processes.",
                "ar": "نمذجة ودمج سجلات الأحداث المؤسسية في Celonis لتحليل وتحسين عمليات Bouygues Telecom.",
            },
            {
                "fr": "Structuration et exposition des modèles de données pour automatiser l'alimentation des tableaux de bord Power BI et Celonis.",
                "en": "Structured and exposed prepared data models to automate the feeding of Power BI and Celonis performance dashboards.",
                "ar": "هيكلة وعرض نماذج البيانات لأتمتة تغذية لوحات القيادة في Power BI وCelonis.",
            },
            {
                "fr": "Pilotage du cycle de développement et du delivery Data au sein d'une équipe agile hybride France/Maroc (Jira).",
                "en": "Drove the development cycle and Data delivery inside a hybrid France/Morocco agile team (Jira).",
                "ar": "قيادة دورة التطوير وتسليم حلول البيانات ضمن فريق رشيق مشترك بين فرنسا والمغرب (Jira).",
            },
        ],
    },
    {
        "company": "ONDA",
        "role": {"fr": "AI Engineer", "en": "AI Engineer", "ar": "مهندس ذكاء اصطناعي"},
        "location": "Casablanca, Maroc",
        "period": {"fr": "Juillet – Septembre 2025", "en": "July – September 2025", "ar": "يوليوز – شتنبر 2025"},
        "start": "2025-07", "end": "2025-09", "kind": "work", "order": 2,
        "stack": ["Python", "MySQL", "REST API", "Retell.ai", "GenAI", "SMTP", "JavaScript"],
        "bullets": [
            {
                "fr": "Conception d'un pipeline ETL Python pour l'extraction, la structuration et l'ingestion de données non structurées issues d'un VoiceAgent IA vers MySQL.",
                "en": "Designed a Python ETL pipeline extracting, structuring and ingesting unstructured data from an AI VoiceAgent into MySQL.",
                "ar": "تصميم خط ETL بلغة Python لاستخراج وهيكلة واستيعاب بيانات غير منظمة من وكيل صوتي ذكي إلى MySQL.",
            },
            {
                "fr": "Développement d'une REST API robuste servant les données d'incidents IT en temps réel vers les interfaces de visualisation.",
                "en": "Built a robust REST API serving IT incident data in real time to visualisation interfaces.",
                "ar": "تطوير واجهة REST قوية تقدّم بيانات الحوادث التقنية آنيًا إلى واجهات العرض.",
            },
            {
                "fr": "Automatisation du monitoring via un serveur SMTP intégré au pipeline pour le déclenchement d'alertes événementielles.",
                "en": "Automated monitoring by wiring an SMTP server into the pipeline for data-driven event alerts.",
                "ar": "أتمتة المراقبة عبر دمج خادم SMTP في الخط لإطلاق تنبيهات مبنية على الأحداث.",
            },
            {
                "fr": "Dashboard web interactif (HTML/CSS/JS) connecté à l'API et à la base SQL pour le suivi des incidents.",
                "en": "Interactive web dashboard (HTML/CSS/JS) wired to the API and SQL database for incident monitoring.",
                "ar": "لوحة تحكم تفاعلية (HTML/CSS/JS) متصلة بالواجهة وقاعدة البيانات لمتابعة الحوادث.",
            },
        ],
    },
    {
        "company": "InsurBT",
        "role": {"fr": "AI Engineer", "en": "AI Engineer", "ar": "مهندس ذكاء اصطناعي"},
        "location": "Casablanca, Maroc",
        "period": {"fr": "Juillet – Août 2024", "en": "July – August 2024", "ar": "يوليوز – غشت 2024"},
        "start": "2024-07", "end": "2024-08", "kind": "work", "order": 3,
        "stack": ["OpenAI API", "TypeScript", "React", "JavaScript"],
        "bullets": [
            {
                "fr": "Déploiement d'une architecture de traitement temps réel (chatbot InsurBT) avec monitoring et système d'alertes.",
                "en": "Deployed a real-time processing architecture (InsurBT chatbot) with monitoring and an alerting system.",
                "ar": "نشر معمارية معالجة فورية (روبوت محادثة InsurBT) مع نظام مراقبة وتنبيهات.",
            },
            {
                "fr": "Pipeline de classification NLP via l'API OpenAI (GPT-3.5) pour analyser les intentions et automatiser les réponses.",
                "en": "NLP classification pipeline on the OpenAI API (GPT-3.5) to analyse intents and automate replies.",
                "ar": "خط تصنيف لغوي عبر واجهة OpenAI (GPT-3.5) لتحليل النوايا وأتمتة الردود.",
            },
            {
                "fr": "Développement des flux d'intégration asynchrones (TypeScript, React) entre l'interface et les modèles d'IA.",
                "en": "Built asynchronous integration flows (TypeScript, React) routing data between the UI and the AI models.",
                "ar": "تطوير تدفقات تكامل غير متزامنة (TypeScript وReact) بين الواجهة ونماذج الذكاء الاصطناعي.",
            },
        ],
    },
    {
        "company": "LOGINFO",
        "role": {"fr": "Software Engineer", "en": "Software Engineer", "ar": "مهندس برمجيات"},
        "location": "Casablanca, Maroc",
        "period": {"fr": "Juillet – Août 2023", "en": "July – August 2023", "ar": "يوليوز – غشت 2023"},
        "start": "2023-07", "end": "2023-08", "kind": "work", "order": 4,
        "stack": ["HTML", "CSS", "JavaScript", "SQL", "MySQL"],
        "bullets": [
            {
                "fr": "Développement d'une plateforme de gestion des licences Sage et de suivi des abonnements clients (expirations, renouvellements).",
                "en": "Developed a platform to manage Sage licences and track customer subscriptions (expiry, renewals).",
                "ar": "تطوير منصة لإدارة تراخيص Sage ومتابعة اشتراكات العملاء (انتهاء الصلاحية والتجديد).",
            },
            {
                "fr": "Interface simple et intuitive facilitant les ventes, le suivi client et les formations proposées par l'entreprise.",
                "en": "Simple, intuitive interface supporting sales, customer follow-up and the company's training offer.",
                "ar": "واجهة بسيطة وسهلة تدعم المبيعات ومتابعة العملاء والتكوينات التي تقدمها الشركة.",
            },
        ],
    },
    {
        "company": "EMSI — École Marocaine des Sciences de l'Ingénieur",
        "role": {
            "fr": "Ingénieur d'État en Génie Informatique",
            "en": "State Engineer in Computer Science",
            "ar": "مهندس دولة في هندسة المعلوميات",
        },
        "location": "Casablanca, Maroc",
        "period": {"fr": "2021 – 2026", "en": "2021 – 2026", "ar": "2021 – 2026"},
        "start": "2021", "end": "2026", "kind": "education", "order": 1,
        "stack": [], "bullets": [],
    },
    {
        "company": "Lycée Abdelmalek Saâdi",
        "role": {
            "fr": "Baccalauréat Sciences Physiques",
            "en": "Baccalaureate in Physical Sciences",
            "ar": "بكالوريا العلوم الفيزيائية",
        },
        "location": "Maroc",
        "period": {"fr": "2020 – 2021", "en": "2020 – 2021", "ar": "2020 – 2021"},
        "start": "2020", "end": "2021", "kind": "education", "order": 2,
        "stack": [], "bullets": [],
    },
]


PROJECTS = [
    {
        "slug": "dataflow360",
        "title": "DataFlow360",
        "year": "2026",
        "category": "streaming",
        "featured": True,
        "published": True,
        "order": 1,
        "repo_url": f"{GITHUB_URL}/DataFlow360",
        "live_url": "",
        "stack": ["Azure Event Hubs", "Databricks", "Spark Structured Streaming",
                  "Delta Lake", "ADLS Gen2", "Synapse Serverless", "Power BI", "Python"],
        "tagline": {
            "fr": "Pipeline IoT temps réel sur architecture Lakehouse",
            "en": "Real-time IoT pipeline on a Lakehouse architecture",
            "ar": "خط بيانات إنترنت الأشياء الفوري على معمارية ليكهاوس",
        },
        "summary": {
            "fr": "Pipeline de bout en bout traitant ~1000 événements/seconde depuis Azure Event Hubs, à travers des couches Bronze/Silver/Gold en Delta Lake, servies à Power BI via Synapse Serverless.",
            "en": "End-to-end pipeline processing ~1000 events/second from Azure Event Hubs through Bronze/Silver/Gold Delta Lake layers, served to Power BI via Synapse Serverless.",
            "ar": "خط متكامل يعالج حوالي 1000 حدث في الثانية من Azure Event Hubs عبر طبقات برونزية/فضية/ذهبية في Delta Lake، ويُقدَّم إلى Power BI عبر Synapse Serverless.",
        },
        "role": {
            "fr": "Conception d'architecture · Développement · Optimisation",
            "en": "Architecture · Development · Optimisation",
            "ar": "تصميم المعمارية · التطوير · التحسين",
        },
        "metrics": [
            {"label": "Throughput", "value": "~1000 evt/s"},
            {"label": "Layers", "value": "Bronze/Silver/Gold"},
            {"label": "Guarantee", "value": "Exactly-once"},
        ],
        "highlights": [
            {"fr": "Streaming temps réel avec Spark Structured Streaming depuis Azure Event Hubs",
             "en": "Real-time streaming with Spark Structured Streaming from Azure Event Hubs",
             "ar": "بث فوري باستخدام Spark Structured Streaming من Azure Event Hubs"},
            {"fr": "Traitement exactly-once via checkpointing Spark et transactions ACID Delta Lake",
             "en": "Exactly-once processing via Spark checkpointing and Delta Lake ACID transactions",
             "ar": "معالجة بضمان المرة الواحدة عبر نقاط تفتيش Spark ومعاملات Delta Lake"},
            {"fr": "Contrôles qualité en couche Silver : taux de nulls, plages de valeurs, détection d'anomalies",
             "en": "Silver-layer quality gates: null rates, value ranges, anomaly flagging",
             "ar": "ضوابط الجودة في الطبقة الفضية: نسب القيم الفارغة، نطاقات القيم، رصد الشذوذ"},
            {"fr": "Optimisation par indexation Z-ORDER et compaction OPTIMIZE",
             "en": "Optimised with Z-ORDER indexing and OPTIMIZE compaction",
             "ar": "تحسين عبر فهرسة Z-ORDER وضغط OPTIMIZE"},
        ],
        "body": {
            "fr": (
                "## Le problème\n"
                "Des capteurs IoT (température, humidité, pression, vibration) émettent en continu. "
                "Le besoin : une plateforme capable d'absorber ce flux sans perte, de le nettoyer, "
                "et d'en tirer des KPI exploitables dans Power BI — le tout sans réécrire la chaîne "
                "à chaque changement de schéma.\n\n"
                "## L'architecture\n"
                "Azure Event Hubs encaisse l'ingestion. Spark Structured Streaming consomme le flux "
                "et écrit dans une couche **Bronze** en append-only : la donnée brute reste intacte "
                "et rejouable. La couche **Silver** déduplique, valide et applique les contrôles "
                "qualité. La couche **Gold** agrège les KPI métier, exposés via Synapse Serverless SQL "
                "à Power BI.\n\n"
                "## Ce qui compte techniquement\n"
                "- **Exactly-once** : combinaison du checkpointing Spark et des transactions ACID de Delta Lake. "
                "Un redémarrage ne duplique ni ne perd d'événement.\n"
                "- **Partitionnement optimisé** et Z-ORDER sur les colonnes de filtrage fréquent, "
                "avec compaction OPTIMIZE pour éviter le problème des petits fichiers.\n"
                "- **Qualité en Silver, pas en Gold** : détecter tôt évite de propager du bruit dans les agrégats.\n\n"
                "## Résultat\n"
                "Un pipeline qui tient ~1000 événements/seconde, rejouable de bout en bout, "
                "avec une séparation claire entre donnée brute, donnée fiable et donnée métier."
            ),
            "en": (
                "## The problem\n"
                "IoT sensors (temperature, humidity, pressure, vibration) emit continuously. "
                "The need: a platform that absorbs the stream without loss, cleans it, and turns it "
                "into KPIs usable in Power BI — without rewriting the chain on every schema change.\n\n"
                "## The architecture\n"
                "Azure Event Hubs takes the ingestion load. Spark Structured Streaming consumes the "
                "stream and writes an append-only **Bronze** layer: raw data stays intact and replayable. "
                "The **Silver** layer deduplicates, validates and applies quality checks. The **Gold** "
                "layer aggregates business KPIs, exposed through Synapse Serverless SQL to Power BI.\n\n"
                "## What matters technically\n"
                "- **Exactly-once**: Spark checkpointing combined with Delta Lake ACID transactions. "
                "A restart neither duplicates nor drops events.\n"
                "- **Optimised partitioning** plus Z-ORDER on frequently filtered columns, with OPTIMIZE "
                "compaction to avoid the small-files problem.\n"
                "- **Quality in Silver, not Gold**: catching issues early stops noise propagating into aggregates.\n\n"
                "## Outcome\n"
                "A pipeline sustaining ~1000 events/second, replayable end to end, with a clean separation "
                "between raw, trusted and business data."
            ),
            "ar": (
                "## المشكلة\n"
                "مستشعرات إنترنت الأشياء (الحرارة، الرطوبة، الضغط، الاهتزاز) ترسل بيانات باستمرار. "
                "المطلوب: منصة تستوعب هذا التدفق دون فقدان، وتنظفه، وتحوّله إلى مؤشرات قابلة للاستخدام في Power BI.\n\n"
                "## المعمارية\n"
                "يتكفّل Azure Event Hubs بالاستيعاب. ويستهلك Spark Structured Streaming التدفق ويكتبه في "
                "طبقة **برونزية** بالإضافة فقط، فتبقى البيانات الخام سليمة وقابلة لإعادة التشغيل. "
                "تقوم الطبقة **الفضية** بإزالة التكرار والتحقق وتطبيق ضوابط الجودة. أما الطبقة **الذهبية** "
                "فتجمّع المؤشرات وتعرضها عبر Synapse Serverless إلى Power BI.\n\n"
                "## الجوانب التقنية المهمة\n"
                "- **ضمان المرة الواحدة** عبر الجمع بين نقاط تفتيش Spark ومعاملات Delta Lake.\n"
                "- **تقسيم محسَّن** مع فهرسة Z-ORDER وضغط OPTIMIZE لتفادي مشكلة الملفات الصغيرة.\n"
                "- **الجودة في الطبقة الفضية** لمنع انتقال الضجيج إلى التجميعات.\n\n"
                "## النتيجة\n"
                "خط بيانات يتحمل حوالي 1000 حدث في الثانية، قابل لإعادة التشغيل، مع فصل واضح بين "
                "البيانات الخام والموثوقة والتجارية."
            ),
        },
    },
    {
        "slug": "lakehouse-dq-pipeline",
        "title": "Lakehouse-DQ-Pipeline",
        "year": "2026",
        "category": "data-quality",
        "featured": True,
        "published": True,
        "order": 2,
        "repo_url": f"{GITHUB_URL}/Lakehouse-DQ-Pipeline",
        "live_url": "",
        "stack": ["PySpark", "Delta Lake", "Databricks", "Python", "pytest"],
        "tagline": {
            "fr": "Framework de qualité de données avec pattern de quarantaine",
            "en": "Data Quality framework with a quarantine pattern",
            "ar": "إطار لجودة البيانات مع نمط الحجر الصحي",
        },
        "summary": {
            "fr": "Pipeline e-commerce Bronze/Silver/Gold doté d'un framework de qualité de données maison en PySpark : 5 types de contrôles, quarantaine des rejets et rapports HTML.",
            "en": "E-commerce Bronze/Silver/Gold pipeline with a custom PySpark Data Quality framework: 5 check types, quarantined rejects, and HTML scorecards.",
            "ar": "خط بيانات للتجارة الإلكترونية بطبقات برونزية/فضية/ذهبية مع إطار جودة مخصص بـ PySpark: خمسة أنواع من الفحوص، وحجر للسجلات المرفوضة، وتقارير HTML.",
        },
        "role": {
            "fr": "Conception du framework · Développement · Tests",
            "en": "Framework design · Development · Testing",
            "ar": "تصميم الإطار · التطوير · الاختبارات",
        },
        "metrics": [
            {"label": "Records", "value": "50K+"},
            {"label": "Check types", "value": "5"},
            {"label": "Data loss", "value": "Zero"},
        ],
        "highlights": [
            {"fr": "Framework DQ maison : not_null, unique, positive, range, values_in_set",
             "en": "Custom DQ framework: not_null, unique, positive, range, values_in_set",
             "ar": "إطار جودة مخصص: not_null وunique وpositive وrange وvalues_in_set"},
            {"fr": "Pattern de quarantaine : les rejets sont isolés, jamais supprimés (zéro perte)",
             "en": "Quarantine pattern: rejected rows are isolated, never dropped (zero data loss)",
             "ar": "نمط الحجر: تُعزل السجلات المرفوضة ولا تُحذف أبدًا (بدون فقدان)"},
            {"fr": "Rapports HTML auto-générés : scorecard pass/fail lisible par les métiers",
             "en": "Auto-generated HTML reports: a pass/fail scorecard business teams can read",
             "ar": "تقارير HTML تلقائية: بطاقة نجاح/فشل يفهمها فريق الأعمال"},
            {"fr": "Couche Gold : revenu journalier, performance produit, LTV et segmentation client",
             "en": "Gold layer: daily revenue, product performance, customer LTV and segmentation",
             "ar": "الطبقة الذهبية: الإيرادات اليومية، أداء المنتجات، القيمة الدائمة وتقسيم العملاء"},
        ],
        "body": {
            "fr": (
                "## Le problème\n"
                "Un pipeline qui jette silencieusement les lignes invalides est un pipeline qui ment. "
                "L'objectif était de rendre la qualité de données **visible et auditable**, sans perdre "
                "une seule ligne au passage.\n\n"
                "## Le framework\n"
                "Un moteur de contrôles déclaratif en PySpark, avec cinq primitives composables : "
                "`not_null`, `unique`, `positive`, `range` et `values_in_set`. Chaque contrôle produit "
                "un verdict par ligne, pas seulement un compteur global.\n\n"
                "## Le pattern de quarantaine\n"
                "Les lignes qui échouent ne disparaissent pas : elles partent dans une table de "
                "quarantaine Delta, avec le motif du rejet. On peut donc enquêter, corriger la source, "
                "puis rejouer — au lieu de découvrir six mois plus tard qu'un champ était mal formaté.\n\n"
                "## La restitution\n"
                "Un rapport HTML est généré à chaque exécution : scorecard pass/fail par contrôle et par "
                "colonne. C'est ce qui transforme la qualité de données d'un sujet d'ingénieur en "
                "conversation avec les métiers.\n\n"
                "## Couche Gold\n"
                "Trois produits de données : revenu journalier par pays et catégorie, performance produit "
                "(taux de retour, revenu), et segmentation client avec LTV."
            ),
            "en": (
                "## The problem\n"
                "A pipeline that silently drops invalid rows is a pipeline that lies. The goal was to make "
                "data quality **visible and auditable**, without losing a single row on the way.\n\n"
                "## The framework\n"
                "A declarative check engine in PySpark with five composable primitives: `not_null`, "
                "`unique`, `positive`, `range` and `values_in_set`. Each check produces a per-row verdict, "
                "not just a global counter.\n\n"
                "## The quarantine pattern\n"
                "Failing rows do not vanish — they land in a Delta quarantine table alongside the reason "
                "for rejection. You can investigate, fix the source, then replay, instead of discovering "
                "six months later that a field was malformed.\n\n"
                "## Reporting\n"
                "An HTML report is generated on every run: a pass/fail scorecard per check and per column. "
                "That is what turns data quality from an engineering concern into a conversation with the business.\n\n"
                "## Gold layer\n"
                "Three data products: daily revenue by country and category, product performance (return "
                "rate, revenue), and customer segmentation with lifetime value."
            ),
            "ar": (
                "## المشكلة\n"
                "الخط الذي يتخلص بصمت من السجلات غير الصالحة هو خط يكذب. الهدف كان جعل جودة البيانات "
                "**مرئية وقابلة للتدقيق** دون فقدان أي سجل.\n\n"
                "## الإطار\n"
                "محرك فحوص تصريحي بـ PySpark بخمس وحدات قابلة للتركيب: `not_null` و`unique` و`positive` "
                "و`range` و`values_in_set`. كل فحص ينتج حكمًا لكل سجل وليس عدادًا عامًا فقط.\n\n"
                "## نمط الحجر الصحي\n"
                "السجلات الفاشلة لا تختفي، بل تُوضع في جدول حجر مع سبب الرفض، ما يتيح التحقيق وتصحيح "
                "المصدر ثم إعادة التشغيل.\n\n"
                "## التقارير\n"
                "يُنتج تقرير HTML عند كل تشغيل: بطاقة نجاح/فشل لكل فحص وكل عمود.\n\n"
                "## الطبقة الذهبية\n"
                "ثلاثة منتجات بيانات: الإيرادات اليومية حسب البلد والفئة، أداء المنتجات، وتقسيم العملاء "
                "مع القيمة الدائمة."
            ),
        },
    },
    {
        "slug": "airflow-data-pipeline",
        "title": "Airflow-Data-Pipeline",
        "year": "2026",
        "category": "orchestration",
        "featured": True,
        "published": True,
        "order": 3,
        "repo_url": f"{GITHUB_URL}/Airflow-Data-Pipeline",
        "live_url": "",
        "stack": ["Apache Airflow", "Docker", "PostgreSQL 15", "PySpark", "Python"],
        "tagline": {
            "fr": "Orchestration dockerisée, idempotente et rejouable",
            "en": "Dockerised orchestration, idempotent and replayable",
            "ar": "تنسيق عبر Docker، قابل لإعادة التشغيل ومتسق",
        },
        "summary": {
            "fr": "DAG Airflow traitant les ventes retail quotidiennes : branchement conditionnel, TaskGroups, transformations PySpark et upserts SQL idempotents — le tout en un `docker-compose up`.",
            "en": "Airflow DAG processing daily retail sales: conditional branching, TaskGroups, PySpark transforms and idempotent SQL upserts — all in one `docker-compose up`.",
            "ar": "مخطط Airflow لمعالجة مبيعات التجزئة اليومية: تفرّع شرطي، مجموعات مهام، تحويلات PySpark، وعمليات دمج SQL متسقة.",
        },
        "role": {
            "fr": "Conception du DAG · Dockerisation · Développement",
            "en": "DAG design · Dockerisation · Development",
            "ar": "تصميم المخطط · الحوسبة الحاوية · التطوير",
        },
        "metrics": [
            {"label": "Schedule", "value": "Daily 06:00 UTC"},
            {"label": "Idempotent", "value": "Yes"},
            {"label": "Setup", "value": "1 command"},
        ],
        "highlights": [
            {"fr": "BranchPythonOperator : le pipeline se saute lui-même les jours sans données",
             "en": "BranchPythonOperator: the pipeline skips itself on empty days",
             "ar": "BranchPythonOperator: يتخطى الخط نفسه في الأيام الفارغة"},
            {"fr": "Idempotence réelle : `ON CONFLICT DO UPDATE` en SQL et mode overwrite côté Spark",
             "en": "Real idempotency: `ON CONFLICT DO UPDATE` in SQL plus Spark overwrite mode",
             "ar": "اتساق حقيقي: `ON CONFLICT DO UPDATE` في SQL ووضع الكتابة فوق البيانات في Spark"},
            {"fr": "Backfill via templating Jinja `{{ ds }}` pour reprocesser l'historique",
             "en": "Backfill through `{{ ds }}` Jinja templating to reprocess history",
             "ar": "إعادة المعالجة التاريخية عبر قوالب Jinja باستخدام `{{ ds }}`"},
            {"fr": "TaskGroups pour garder le DAG lisible quand il grossit",
             "en": "TaskGroups to keep the DAG readable as it grows",
             "ar": "مجموعات المهام للحفاظ على وضوح المخطط عند توسعه"},
        ],
        "body": {
            "fr": (
                "## Pourquoi ce projet\n"
                "Un DAG qui ne peut pas être rejoué est une dette. Ce projet met l'accent sur "
                "l'**idempotence** et la **reprise sur incident**, deux propriétés qu'on ne découvre "
                "manquantes qu'au pire moment.\n\n"
                "## Le DAG\n"
                "Déclenché quotidiennement à 06:00 UTC. Un `BranchPythonOperator` vérifie d'abord la "
                "présence de données en source : week-ends et jours fériés, le pipeline se saute "
                "proprement au lieu d'échouer bruyamment.\n\n"
                "Ensuite : extraction vers CSV, contrôles qualité (nulls, montants négatifs, dates "
                "futures), transformation PySpark, puis chargement en deux tables d'agrégats "
                "(par magasin et par produit), et notification finale.\n\n"
                "## Idempotence\n"
                "Les chargements SQL utilisent `ON CONFLICT DO UPDATE`, et Spark écrit en mode overwrite "
                "sur la partition du jour. Relancer la même date deux fois donne exactement le même "
                "résultat — condition nécessaire pour tout backfill sérieux.\n\n"
                "## Exploitation\n"
                "Airflow et PostgreSQL 15 tournent ensemble via Docker Compose : un seul `docker-compose up` "
                "et l'environnement complet est debout, ce qui rend le projet réellement reproductible."
            ),
            "en": (
                "## Why this project\n"
                "A DAG that cannot be replayed is debt. This project focuses on **idempotency** and "
                "**failure recovery** — two properties you only notice are missing at the worst moment.\n\n"
                "## The DAG\n"
                "Triggered daily at 06:00 UTC. A `BranchPythonOperator` first checks whether source data "
                "exists: on weekends and holidays the pipeline skips cleanly instead of failing loudly.\n\n"
                "Then: extract to CSV, quality checks (nulls, negative amounts, future dates), PySpark "
                "transformation, load into two aggregate tables (per store and per product), and a final "
                "notification task.\n\n"
                "## Idempotency\n"
                "SQL loads use `ON CONFLICT DO UPDATE`, and Spark writes in overwrite mode on the day's "
                "partition. Re-running the same date twice yields exactly the same result — a prerequisite "
                "for any serious backfill.\n\n"
                "## Operations\n"
                "Airflow and PostgreSQL 15 run together via Docker Compose: a single `docker-compose up` "
                "brings the whole environment up, which makes the project genuinely reproducible."
            ),
            "ar": (
                "## لماذا هذا المشروع\n"
                "المخطط الذي لا يمكن إعادة تشغيله هو دَين تقني. يركز هذا المشروع على **الاتساق** "
                "و**التعافي من الأعطال**.\n\n"
                "## المخطط\n"
                "يعمل يوميًا في الساعة 06:00 بالتوقيت العالمي. يتحقق `BranchPythonOperator` أولًا من وجود "
                "بيانات في المصدر: في العطل ينتقل الخط بسلاسة بدل أن يفشل.\n\n"
                "بعد ذلك: الاستخراج إلى CSV، وفحوص الجودة، والتحويل بـ PySpark، والتحميل إلى جدولي "
                "تجميع، ثم مهمة إشعار نهائية.\n\n"
                "## الاتساق\n"
                "تستخدم عمليات التحميل `ON CONFLICT DO UPDATE`، ويكتب Spark فوق قسم اليوم. إعادة تشغيل "
                "نفس التاريخ مرتين تعطي النتيجة ذاتها.\n\n"
                "## التشغيل\n"
                "يعمل Airflow وPostgreSQL 15 معًا عبر Docker Compose بأمر واحد."
            ),
        },
    },
    {
        "slug": "azure-etl-factory",
        "title": "Azure-ETL-Factory",
        "year": "2026",
        "category": "etl",
        "featured": False,
        "published": True,
        "order": 4,
        "repo_url": f"{GITHUB_URL}/Azure-ETL-Factory",
        "live_url": "",
        "stack": ["Azure Data Factory", "Databricks", "Delta Lake", "Synapse",
                  "Power BI", "Azure Key Vault", "Python"],
        "tagline": {
            "fr": "ETL batch orchestré par Azure Data Factory",
            "en": "Batch ETL orchestrated by Azure Data Factory",
            "ar": "ETL دفعي بتنسيق من Azure Data Factory",
        },
        "summary": {
            "fr": "Pipeline batch pour données de vente retail : ADF copie depuis Azure SQL vers le Data Lake, déclenche les notebooks Databricks Bronze/Silver/Gold, puis rafraîchit Power BI.",
            "en": "Batch pipeline for retail sales: ADF copies from Azure SQL into the Data Lake, triggers Databricks notebooks for Bronze/Silver/Gold, then refreshes Power BI.",
            "ar": "خط دفعي لبيانات مبيعات التجزئة: ينسخ ADF من Azure SQL إلى بحيرة البيانات، ويشغّل دفاتر Databricks، ثم يحدّث Power BI.",
        },
        "role": {
            "fr": "Orchestration · Sécurisation · Développement",
            "en": "Orchestration · Security · Development",
            "ar": "التنسيق · التأمين · التطوير",
        },
        "metrics": [
            {"label": "Retries", "value": "2 × 5 min"},
            {"label": "Secrets", "value": "Key Vault"},
            {"label": "Auth", "value": "Managed Identity"},
        ],
        "highlights": [
            {"fr": "Orchestration ADF : activités Lookup, Copy, Databricks et Web",
             "en": "ADF orchestration with Lookup, Copy, Databricks and Web activities",
             "ar": "تنسيق ADF عبر أنشطة Lookup وCopy وDatabricks وWeb"},
            {"fr": "Sécurité : secrets dans Azure Key Vault, authentification par Managed Identity",
             "en": "Security: secrets in Azure Key Vault, Managed Identity authentication",
             "ar": "الأمان: الأسرار في Azure Key Vault والمصادقة عبر Managed Identity"},
            {"fr": "Paramétrage `run_date` permettant le backfill historique",
             "en": "`run_date` parameterisation enabling historical backfill",
             "ar": "معامل `run_date` يتيح إعادة المعالجة التاريخية"},
            {"fr": "Idempotence par MERGE Delta Lake — pas de doublons sur re-run",
             "en": "Idempotency through Delta Lake MERGE — no duplicates on re-runs",
             "ar": "اتساق عبر MERGE في Delta Lake دون تكرار عند إعادة التشغيل"},
        ],
        "body": {
            "fr": (
                "## Contexte\n"
                "Un pipeline batch quotidien sur données de vente retail, avec les contraintes "
                "habituelles de l'entreprise : secrets à ne pas exposer, exécutions à reprendre, "
                "et un tableau de bord Power BI qui doit être à jour le matin.\n\n"
                "## L'orchestration\n"
                "Azure Data Factory enchaîne cinq étapes : `Validate` (Lookup) vérifie que la source "
                "contient bien des données ; `Copy` déverse vers la couche Bronze en Parquet ; deux "
                "notebooks Databricks produisent Silver puis Gold en Delta Lake ; enfin une activité "
                "Web déclenche le rafraîchissement du dataset Power BI.\n\n"
                "## Sécurité et robustesse\n"
                "Aucun secret en dur : tout passe par Azure Key Vault, avec authentification par "
                "Managed Identity. Chaque activité a une politique de retry (2 tentatives, 5 minutes "
                "d'intervalle) et une alerte email en cas d'échec.\n\n"
                "## Rejouabilité\n"
                "Le pipeline est paramétré par `run_date`, et les écritures Gold utilisent un MERGE "
                "Delta Lake. Reprocesser un mois d'historique ne crée pas de doublons."
            ),
            "en": (
                "## Context\n"
                "A daily batch pipeline over retail sales data, with the usual enterprise constraints: "
                "secrets that must not leak, runs that must be resumable, and a Power BI dashboard that "
                "has to be current by morning.\n\n"
                "## The orchestration\n"
                "Azure Data Factory chains five steps: `Validate` (Lookup) checks the source actually has "
                "data; `Copy` lands it into the Bronze layer as Parquet; two Databricks notebooks produce "
                "Silver then Gold in Delta Lake; finally a Web activity triggers the Power BI dataset refresh.\n\n"
                "## Security and robustness\n"
                "No hard-coded secrets: everything goes through Azure Key Vault with Managed Identity "
                "authentication. Every activity has a retry policy (2 attempts, 5-minute interval) and an "
                "email alert on failure.\n\n"
                "## Replayability\n"
                "The pipeline is parameterised by `run_date`, and Gold writes use a Delta Lake MERGE. "
                "Reprocessing a month of history creates no duplicates."
            ),
            "ar": (
                "## السياق\n"
                "خط دفعي يومي لبيانات مبيعات التجزئة مع القيود المؤسسية المعتادة: أسرار يجب حمايتها، "
                "وتشغيلات قابلة للاستئناف، ولوحة Power BI محدّثة صباحًا.\n\n"
                "## التنسيق\n"
                "ينسّق Azure Data Factory خمس خطوات: التحقق، والنسخ إلى الطبقة البرونزية، ودفترا "
                "Databricks لإنتاج الطبقتين الفضية والذهبية، ثم تحديث Power BI.\n\n"
                "## الأمان والمتانة\n"
                "لا توجد أسرار مكتوبة مباشرة: كل شيء عبر Azure Key Vault مع Managed Identity، مع سياسة "
                "إعادة محاولة وتنبيهات بالبريد.\n\n"
                "## إعادة التشغيل\n"
                "الخط معامَل بـ `run_date` وتستخدم الكتابة الذهبية MERGE، فلا تتكرر البيانات."
            ),
        },
    },
    {
        "slug": "spark-sql-performance-lab",
        "title": "Spark-SQL-Performance-Lab",
        "year": "2026",
        "category": "performance",
        "featured": False,
        "published": True,
        "order": 5,
        "repo_url": f"{GITHUB_URL}/Spark-SQL-Performance-Lab",
        "live_url": "",
        "stack": ["Apache Spark", "PySpark", "SQL", "Delta Lake", "Databricks"],
        "tagline": {
            "fr": "Laboratoire de tuning Spark benchmarké sur 10M+ lignes",
            "en": "Spark tuning lab benchmarked on 10M+ rows",
            "ar": "مختبر لضبط أداء Spark على أكثر من 10 ملايين سجل",
        },
        "summary": {
            "fr": "Quatre notebooks autonomes mesurant l'impact réel des stratégies de partitionnement, des types de jointures, du caching et des window functions.",
            "en": "Four self-contained notebooks measuring the real impact of partitioning strategies, join types, caching and window functions.",
            "ar": "أربعة دفاتر مستقلة تقيس الأثر الفعلي لاستراتيجيات التقسيم وأنواع الربط والتخزين المؤقت ودوال النوافذ.",
        },
        "role": {
            "fr": "Conception des benchmarks · Analyse · Documentation",
            "en": "Benchmark design · Analysis · Documentation",
            "ar": "تصميم القياسات · التحليل · التوثيق",
        },
        "metrics": [
            {"label": "Dataset", "value": "10M+ rows"},
            {"label": "Notebooks", "value": "4"},
            {"label": "Approach", "value": "Measured"},
        ],
        "highlights": [
            {"fr": "Partitionnement et Z-ORDER : quatre stratégies comparées, y compris l'anti-pattern du sur-partitionnement",
             "en": "Partitioning and Z-ORDER: four strategies compared, including the over-partitioning anti-pattern",
             "ar": "التقسيم وZ-ORDER: مقارنة أربع استراتيجيات بما فيها النمط المضاد للتقسيم المفرط"},
            {"fr": "Jointures : broadcast, sort-merge, salting pour le skew, et AQE",
             "en": "Joins: broadcast, sort-merge, salting for skew, and AQE",
             "ar": "الربط: البث، الفرز والدمج، التمليح لمعالجة الانحراف، وAQE"},
            {"fr": "Caching : matrice de décision entre MEMORY_ONLY et MEMORY_AND_DISK",
             "en": "Caching: a decision matrix between MEMORY_ONLY and MEMORY_AND_DISK",
             "ar": "التخزين المؤقت: مصفوفة قرار بين MEMORY_ONLY وMEMORY_AND_DISK"},
            {"fr": "Window functions : ROW_NUMBER, RANK, LAG/LEAD, totaux glissants, NTILE",
             "en": "Window functions: ROW_NUMBER, RANK, LAG/LEAD, running totals, NTILE",
             "ar": "دوال النوافذ: ROW_NUMBER وRANK وLAG/LEAD والمجاميع التراكمية وNTILE"},
        ],
        "body": {
            "fr": (
                "## L'idée\n"
                "La plupart des conseils d'optimisation Spark circulent sans chiffres. Ce lab prend le "
                "contre-pied : chaque notebook est une expérience autonome, benchmarkée sur plus de "
                "10 millions de lignes, avec le résultat mesuré plutôt qu'affirmé.\n\n"
                "## 01 — Partitionnement et Z-ORDER\n"
                "Quatre stratégies comparées : aucune partition (baseline), partition par région, "
                "Z-ORDER, et sur-partitionnement. Ce dernier est explicitement documenté comme "
                "**anti-pattern** : il dégrade les performances, ce que la théorie seule ne rend pas évident.\n\n"
                "## 02 — Stratégies de jointure\n"
                "Broadcast pour les petites tables (<10 Mo, `autoBroadcastJoinThreshold`), sort-merge "
                "quand les deux côtés sont volumineux, salting manuel en cas de skew connu, et AQE "
                "(`adaptive.skewJoin.enabled`) quand le skew est imprévisible.\n\n"
                "## 03 — Caching et persistance\n"
                "Une matrice de décision plutôt qu'une règle : `MEMORY_ONLY` est le plus rapide mais "
                "expose à l'OOM ; `MEMORY_AND_DISK` est le choix par défaut raisonnable. Et surtout : "
                "quand `unpersist`.\n\n"
                "## 04 — Window functions\n"
                "ROW_NUMBER, RANK, LAG/LEAD, totaux glissants et NTILE — les primitives qui reviennent "
                "constamment en analytics SQL."
            ),
            "en": (
                "## The idea\n"
                "Most Spark optimisation advice circulates without numbers. This lab does the opposite: "
                "each notebook is a self-contained experiment benchmarked on 10M+ rows, with the result "
                "measured rather than asserted.\n\n"
                "## 01 — Partitioning and Z-ORDER\n"
                "Four strategies compared: no partitioning (baseline), partition by region, Z-ORDER, and "
                "over-partitioning. The last is explicitly documented as an **anti-pattern**: it degrades "
                "performance, which theory alone does not make obvious.\n\n"
                "## 02 — Join strategies\n"
                "Broadcast for small tables (<10MB, `autoBroadcastJoinThreshold`), sort-merge when both "
                "sides are large, manual salting for known key skew, and AQE (`adaptive.skewJoin.enabled`) "
                "when skew is unpredictable.\n\n"
                "## 03 — Caching and persistence\n"
                "A decision matrix rather than a rule: `MEMORY_ONLY` is fastest but risks OOM; "
                "`MEMORY_AND_DISK` is the sane default. And crucially: when to `unpersist`.\n\n"
                "## 04 — Window functions\n"
                "ROW_NUMBER, RANK, LAG/LEAD, running totals and NTILE — the primitives that keep coming "
                "back in SQL analytics."
            ),
            "ar": (
                "## الفكرة\n"
                "أغلب نصائح تحسين Spark تنتشر بلا أرقام. هذا المختبر يفعل العكس: كل دفتر تجربة مستقلة "
                "مقيسة على أكثر من 10 ملايين سجل.\n\n"
                "## 01 — التقسيم وZ-ORDER\n"
                "مقارنة أربع استراتيجيات، مع توثيق التقسيم المفرط بوصفه **نمطًا مضادًا** يضر بالأداء.\n\n"
                "## 02 — استراتيجيات الربط\n"
                "البث للجداول الصغيرة، الفرز والدمج للجداول الكبيرة، التمليح اليدوي عند الانحراف المعروف، "
                "وAQE عند الانحراف غير المتوقع.\n\n"
                "## 03 — التخزين المؤقت\n"
                "مصفوفة قرار: `MEMORY_ONLY` الأسرع لكنه يعرّض لنفاد الذاكرة، و`MEMORY_AND_DISK` الخيار "
                "الافتراضي المعقول.\n\n"
                "## 04 — دوال النوافذ\n"
                "ROW_NUMBER وRANK وLAG/LEAD والمجاميع التراكمية وNTILE."
            ),
        },
    },
    {
        "slug": "celonis-process-mining",
        "title": "Process Mining — Bouygues Telecom",
        "year": "2026",
        "category": "process-mining",
        "featured": True,
        "published": True,
        "order": 6,
        "repo_url": "",
        "live_url": "",
        "stack": ["Celonis", "Apache Spark 3.5", "SQL", "Power BI", "Jira"],
        "tagline": {
            "fr": "Event Logs modélisés dans Celonis pour optimiser les processus métiers",
            "en": "Event Logs modelled in Celonis to optimise business processes",
            "ar": "نمذجة سجلات الأحداث في Celonis لتحسين العمليات",
        },
        "summary": {
            "fr": "Mission Silamir : migration des traitements SQL vers Spark 3.5, modélisation des Event Logs d'entreprise dans Celonis, et automatisation des tableaux de bord de performance.",
            "en": "Silamir engagement: migrating SQL processing to Spark 3.5, modelling enterprise Event Logs into Celonis, and automating performance dashboards.",
            "ar": "مهمة مع Silamir: ترحيل المعالجة من SQL إلى Spark 3.5، ونمذجة سجلات الأحداث في Celonis، وأتمتة لوحات الأداء.",
        },
        "role": {
            "fr": "Consultant Data Engineer · Delivery en équipe agile France/Maroc",
            "en": "Data Engineer Consultant · Delivery in a France/Morocco agile team",
            "ar": "استشاري مهندس بيانات · التسليم ضمن فريق رشيق",
        },
        "metrics": [
            {"label": "Migration", "value": "SQL → Spark 3.5"},
            {"label": "Platform", "value": "Celonis"},
            {"label": "Client", "value": "Bouygues Telecom"},
        ],
        "highlights": [
            {"fr": "Migration des pipelines SQL vers Apache Spark 3.5 pour le calcul distribué",
             "en": "Migrated SQL pipelines to Apache Spark 3.5 for distributed compute",
             "ar": "ترحيل خطوط SQL إلى Apache Spark 3.5 للحوسبة الموزعة"},
            {"fr": "Modélisation des Event Logs : la matière première du process mining",
             "en": "Event Log modelling: the raw material of process mining",
             "ar": "نمذجة سجلات الأحداث: المادة الخام لتنقيب العمليات"},
            {"fr": "Alimentation automatisée des tableaux de bord Power BI et Celonis",
             "en": "Automated feeding of Power BI and Celonis dashboards",
             "ar": "تغذية آلية للوحات Power BI وCelonis"},
            {"fr": "Pilotage du delivery en équipe hybride France/Maroc sous Jira",
             "en": "Delivery driven in a hybrid France/Morocco team using Jira",
             "ar": "قيادة التسليم ضمن فريق مشترك بين فرنسا والمغرب عبر Jira"},
        ],
        "body": {
            "fr": (
                "## Le contexte\n"
                "Le process mining ne fonctionne que si les Event Logs sont propres. Un log d'événements "
                "mal modélisé produit des graphes de processus séduisants mais faux — et c'est pire "
                "qu'aucune analyse.\n\n"
                "## La migration Spark\n"
                "Les traitements existants étaient en SQL et atteignaient leurs limites en volume. "
                "Je les ai migrés vers **Apache Spark 3.5** pour bénéficier du calcul distribué et "
                "rendre les flux scalables.\n\n"
                "## La modélisation\n"
                "Conception de pipelines ETL (extraction, nettoyage, transformation) via des requêtes "
                "SQL avancées, avec l'intégrité des données brutes comme contrainte non négociable. "
                "Les Event Logs ont ensuite été modélisés et intégrés dans **Celonis** pour permettre "
                "l'analyse et l'optimisation des processus métiers de **Bouygues Telecom**.\n\n"
                "## La restitution\n"
                "Structuration et exposition des modèles de données préparés pour automatiser "
                "l'alimentation des tableaux de bord de performance sur Power BI et Celonis.\n\n"
                "## Le delivery\n"
                "Pilotage du cycle de développement au sein d'une équipe agile hybride France/Maroc, "
                "avec suivi sous Jira."
            ),
            "en": (
                "## Context\n"
                "Process mining only works if the Event Logs are clean. A badly modelled event log "
                "produces process graphs that look compelling but are wrong — which is worse than no "
                "analysis at all.\n\n"
                "## The Spark migration\n"
                "The existing processing was written in SQL and hitting its ceiling on volume. I migrated "
                "it to **Apache Spark 3.5** to gain distributed compute and make the flows scalable.\n\n"
                "## The modelling\n"
                "Designed ETL pipelines (extraction, cleansing, transformation) through advanced SQL, with "
                "raw-data integrity as a non-negotiable constraint. Event Logs were then modelled and "
                "integrated into **Celonis** to enable analysis and optimisation of **Bouygues Telecom**'s "
                "business processes.\n\n"
                "## Serving\n"
                "Structured and exposed the prepared data models to automate the feeding of performance "
                "dashboards in Power BI and Celonis.\n\n"
                "## Delivery\n"
                "Drove the development cycle inside a hybrid France/Morocco agile team, tracked in Jira."
            ),
            "ar": (
                "## السياق\n"
                "لا ينجح تنقيب العمليات إلا إذا كانت سجلات الأحداث نظيفة. السجل السيئ النمذجة ينتج "
                "رسومًا مقنعة لكنها خاطئة، وهو أسوأ من غياب التحليل.\n\n"
                "## ترحيل Spark\n"
                "كانت المعالجة بـ SQL وبلغت حدودها، فرحّلتها إلى **Apache Spark 3.5** للاستفادة من "
                "الحوسبة الموزعة وقابلية التوسع.\n\n"
                "## النمذجة\n"
                "تصميم خطوط ETL عبر استعلامات SQL متقدمة مع اعتبار سلامة البيانات الخام قيدًا غير قابل "
                "للتفاوض، ثم نمذجة سجلات الأحداث ودمجها في **Celonis** لتحليل عمليات "
                "**Bouygues Telecom** وتحسينها.\n\n"
                "## العرض\n"
                "هيكلة نماذج البيانات وعرضها لأتمتة تغذية لوحات الأداء في Power BI وCelonis.\n\n"
                "## التسليم\n"
                "قيادة دورة التطوير ضمن فريق رشيق مشترك بين فرنسا والمغرب عبر Jira."
            ),
        },
    },
    {
        "slug": "voice-incident-etl",
        "title": "VoiceAgent Incident ETL — ONDA",
        "year": "2025",
        "category": "etl",
        "featured": False,
        "published": True,
        "order": 7,
        "repo_url": f"{GITHUB_URL}/retellai-call-stats",
        "live_url": "",
        "stack": ["Python", "MySQL", "REST API", "Retell.ai", "GenAI", "SMTP", "JavaScript"],
        "tagline": {
            "fr": "Du langage naturel à la base de données, avec alerting",
            "en": "From natural language to database, with alerting",
            "ar": "من اللغة الطبيعية إلى قاعدة البيانات مع نظام تنبيهات",
        },
        "summary": {
            "fr": "Pipeline ETL transformant les appels d'un VoiceAgent IA en incidents IT structurés, exposés via REST API et surveillés par alertes SMTP événementielles.",
            "en": "ETL pipeline turning AI VoiceAgent calls into structured IT incidents, exposed through a REST API and watched by event-driven SMTP alerts.",
            "ar": "خط ETL يحوّل مكالمات وكيل صوتي ذكي إلى حوادث تقنية منظمة، تُعرض عبر REST وتُراقَب بتنبيهات بالبريد.",
        },
        "role": {
            "fr": "AI Engineer · Conception ETL · API · Monitoring",
            "en": "AI Engineer · ETL design · API · Monitoring",
            "ar": "مهندس ذكاء اصطناعي · تصميم ETL · واجهة برمجية · مراقبة",
        },
        "metrics": [
            {"label": "Source", "value": "Voice / NL"},
            {"label": "Sink", "value": "MySQL"},
            {"label": "Alerting", "value": "SMTP events"},
        ],
        "highlights": [
            {"fr": "Extraction et structuration de données non structurées issues d'un VoiceAgent IA",
             "en": "Extraction and structuring of unstructured data from an AI VoiceAgent",
             "ar": "استخراج وهيكلة بيانات غير منظمة من وكيل صوتي ذكي"},
            {"fr": "REST API robuste servant les incidents IT en temps réel",
             "en": "Robust REST API serving IT incidents in real time",
             "ar": "واجهة REST قوية تقدّم الحوادث آنيًا"},
            {"fr": "Alertes data-driven déclenchées par un serveur SMTP intégré au pipeline",
             "en": "Data-driven alerts triggered by an SMTP server wired into the pipeline",
             "ar": "تنبيهات مبنية على البيانات عبر خادم SMTP مدمج في الخط"},
            {"fr": "Dashboard web interactif branché sur l'API et la base SQL",
             "en": "Interactive web dashboard wired to the API and SQL database",
             "ar": "لوحة تفاعلية متصلة بالواجهة وقاعدة البيانات"},
        ],
        "body": {
            "fr": (
                "## Le problème\n"
                "Les incidents IT étaient déclarés oralement via un VoiceAgent (Retell.ai + GenAI). "
                "Utile pour l'utilisateur, inexploitable pour l'analyse : du texte libre, pas de schéma, "
                "pas d'agrégation possible.\n\n"
                "## Le pipeline\n"
                "Un ETL Python extrait les transcriptions, les structure (typage de l'incident, sévérité, "
                "entités concernées) et les ingère dans MySQL. C'est l'étape qui transforme une "
                "conversation en donnée requêtable.\n\n"
                "## L'exposition\n"
                "Une REST API sert les incidents en temps réel aux interfaces de visualisation, et un "
                "dashboard web interactif (HTML/CSS/JS) permet le suivi opérationnel.\n\n"
                "## Le monitoring\n"
                "Un serveur SMTP est intégré au pipeline pour déclencher des alertes événementielles : "
                "l'alerte est produite par la donnée elle-même, pas par une supervision externe qui "
                "arriverait trop tard."
            ),
            "en": (
                "## The problem\n"
                "IT incidents were reported verbally through a VoiceAgent (Retell.ai + GenAI). Great for "
                "the user, useless for analysis: free text, no schema, no aggregation possible.\n\n"
                "## The pipeline\n"
                "A Python ETL extracts the transcripts, structures them (incident type, severity, affected "
                "entities) and ingests them into MySQL. This is the step that turns a conversation into "
                "queryable data.\n\n"
                "## Serving\n"
                "A REST API serves incidents in real time to visualisation interfaces, and an interactive "
                "web dashboard (HTML/CSS/JS) supports operational follow-up.\n\n"
                "## Monitoring\n"
                "An SMTP server is wired into the pipeline to fire event-driven alerts: the alert is "
                "produced by the data itself, not by external supervision that would arrive too late."
            ),
            "ar": (
                "## المشكلة\n"
                "كانت الحوادث التقنية تُبلَّغ شفويًا عبر وكيل صوتي (Retell.ai مع الذكاء التوليدي): مفيد "
                "للمستخدم لكنه غير قابل للتحليل، نص حر بلا بنية.\n\n"
                "## الخط\n"
                "يستخرج ETL بلغة Python النصوص ويهيكلها (نوع الحادث، الخطورة، الكيانات المعنية) "
                "ويستوعبها في MySQL، وهي الخطوة التي تحوّل المحادثة إلى بيانات قابلة للاستعلام.\n\n"
                "## العرض\n"
                "واجهة REST تقدّم الحوادث آنيًا، ولوحة ويب تفاعلية للمتابعة التشغيلية.\n\n"
                "## المراقبة\n"
                "خادم SMTP مدمج يطلق تنبيهات مبنية على الأحداث، فالتنبيه تنتجه البيانات نفسها."
            ),
        },
    },
    {
        "slug": "devops-factory",
        "title": "DevOps Factory",
        "year": "2025",
        "category": "platform",
        "featured": False,
        "published": True,
        "order": 8,
        "repo_url": "",
        "live_url": "",
        "stack": ["Kubernetes (RKE)", "Proxmox VE", "GitLab CI/CD", "Jenkins",
                  "Docker", "pfSense", "HAProxy", "Nexus", "Harbor"],
        "tagline": {
            "fr": "Chaîne logicielle sécurisée de bout en bout, DevSecOps",
            "en": "End-to-end secured software supply chain, DevSecOps",
            "ar": "سلسلة برمجية مؤمَّنة من الطرف إلى الطرف",
        },
        "summary": {
            "fr": "Plateforme de virtualisation intégrant les pratiques DevSecOps et l'orchestration Kubernetes (RKE) pour automatiser et sécuriser toute la chaîne logicielle.",
            "en": "Virtualisation platform integrating DevSecOps practices and Kubernetes (RKE) orchestration to automate and secure the entire software supply chain.",
            "ar": "منصة افتراضية تدمج ممارسات DevSecOps وتنسيق Kubernetes لأتمتة وتأمين السلسلة البرمجية.",
        },
        "role": {
            "fr": "Architecture · Sécurisation · Automatisation",
            "en": "Architecture · Security hardening · Automation",
            "ar": "المعمارية · التأمين · الأتمتة",
        },
        "metrics": [
            {"label": "Orchestration", "value": "Kubernetes RKE"},
            {"label": "Hypervisor", "value": "Proxmox VE"},
            {"label": "Scanning", "value": "Harbor"},
        ],
        "highlights": [
            {"fr": "Architecture déployée sur Proxmox VE avec segmentation réseau pfSense/HAProxy",
             "en": "Architecture deployed on Proxmox VE with pfSense/HAProxy network segmentation",
             "ar": "معمارية على Proxmox VE مع تقسيم شبكي عبر pfSense وHAProxy"},
            {"fr": "Gestion des artéfacts et images par Nexus et Harbor",
             "en": "Artifact and image management through Nexus and Harbor",
             "ar": "إدارة القطع والصور عبر Nexus وHarbor"},
            {"fr": "Scan de vulnérabilités intégré à la chaîne CI/CD",
             "en": "Vulnerability scanning integrated into the CI/CD chain",
             "ar": "فحص الثغرات مدمج في سلسلة CI/CD"},
            {"fr": "Automatisation complète via GitLab CI/CD et Jenkins",
             "en": "Full automation through GitLab CI/CD and Jenkins",
             "ar": "أتمتة كاملة عبر GitLab CI/CD وJenkins"},
        ],
        "body": {
            "fr": (
                "## L'objectif\n"
                "Construire une « usine » logicielle complète : de la validation du code jusqu'au "
                "déploiement, avec la sécurité intégrée à chaque étape plutôt qu'ajoutée à la fin.\n\n"
                "## L'infrastructure\n"
                "L'ensemble tourne sur **Proxmox VE**. Le réseau est segmenté via **pfSense** et "
                "**HAProxy**, ce qui isole les environnements et contrôle les flux entre eux.\n\n"
                "## L'orchestration\n"
                "**Kubernetes (RKE)** orchestre les workloads. **GitLab CI/CD** et **Jenkins** pilotent "
                "les pipelines de build et de déploiement.\n\n"
                "## La chaîne d'approvisionnement\n"
                "**Nexus** gère les artéfacts, **Harbor** les images conteneurs — avec scan de "
                "vulnérabilités avant promotion. C'est le cœur du volet DevSecOps : une image qui ne "
                "passe pas le scan ne va pas en production."
            ),
            "en": (
                "## The goal\n"
                "Build a complete software factory: from code validation to deployment, with security "
                "built into every stage rather than bolted on at the end.\n\n"
                "## The infrastructure\n"
                "Everything runs on **Proxmox VE**. The network is segmented with **pfSense** and "
                "**HAProxy**, isolating environments and controlling the flows between them.\n\n"
                "## The orchestration\n"
                "**Kubernetes (RKE)** orchestrates the workloads. **GitLab CI/CD** and **Jenkins** drive "
                "the build and deployment pipelines.\n\n"
                "## The supply chain\n"
                "**Nexus** manages artifacts and **Harbor** manages container images — with vulnerability "
                "scanning before promotion. That is the core of the DevSecOps angle: an image that fails "
                "the scan does not reach production."
            ),
            "ar": (
                "## الهدف\n"
                "بناء «مصنع» برمجي كامل من التحقق من الشيفرة حتى النشر، مع دمج الأمان في كل مرحلة.\n\n"
                "## البنية التحتية\n"
                "يعمل كل شيء على **Proxmox VE**، مع تقسيم الشبكة عبر **pfSense** و**HAProxy**.\n\n"
                "## التنسيق\n"
                "**Kubernetes (RKE)** ينسّق أحمال العمل، و**GitLab CI/CD** و**Jenkins** يقودان خطوط "
                "البناء والنشر.\n\n"
                "## سلسلة التوريد\n"
                "**Nexus** لإدارة القطع و**Harbor** لصور الحاويات مع فحص الثغرات قبل الترقية: أي صورة "
                "تفشل في الفحص لا تصل إلى الإنتاج."
            ),
        },
    },
]


SKILLS = [
    {
        "key": "programming", "order": 1,
        "label": {"fr": "Programmation & Scripting", "en": "Programming & Scripting", "ar": "البرمجة والكتابة البرمجية"},
        "items": ["Python", "PySpark", "SQL", "Java", "TypeScript", "JavaScript"],
    },
    {
        "key": "data-engineering", "order": 2,
        "label": {"fr": "Data Engineering", "en": "Data Engineering", "ar": "هندسة البيانات"},
        "items": ["Apache Spark 3.5", "Spark Structured Streaming", "Delta Lake", "Hadoop",
                  "Hive", "Kafka", "Airflow", "Databricks"],
    },
    {
        "key": "cloud", "order": 3,
        "label": {"fr": "Cloud & Plateformes", "en": "Cloud & Platforms", "ar": "السحابة والمنصات"},
        "items": ["Azure Event Hubs", "Azure Data Lake Gen2", "Azure Data Factory",
                  "Synapse Analytics", "Docker", "Kubernetes", "Proxmox VE"],
    },
    {
        "key": "databases", "order": 4,
        "label": {"fr": "Bases de données", "en": "Databases", "ar": "قواعد البيانات"},
        "items": ["MySQL", "Microsoft SQL Server", "PostgreSQL", "Vertica", "MongoDB", "Oracle PL/SQL"],
    },
    {
        "key": "analytics", "order": 5,
        "label": {"fr": "Visualisation & Process Mining", "en": "Visualisation & Process Mining", "ar": "التصور وتنقيب العمليات"},
        "items": ["Celonis", "Power BI", "Tableau", "Excel"],
    },
    {
        "key": "ml", "order": 6,
        "label": {"fr": "Machine Learning & IA", "en": "Machine Learning & AI", "ar": "تعلم الآلة والذكاء الاصطناعي"},
        "items": ["Scikit-learn", "Deep Learning (CNN)", "Computer Vision", "BeautifulSoup",
                  "OpenAI API", "GenAI / RAG"],
    },
    {
        "key": "devops", "order": 7,
        "label": {"fr": "CI/CD & DevOps", "en": "CI/CD & DevOps", "ar": "التكامل المستمر وDevOps"},
        "items": ["GitLab CI/CD", "Jenkins", "Azure DevOps", "Git", "GitHub", "Nexus", "Harbor"],
    },
    {
        "key": "methods", "order": 8,
        "label": {"fr": "Méthodes & Gestion", "en": "Methods & Management", "ar": "المنهجيات والإدارة"},
        "items": ["Agile", "Scrum", "Jira", "Data Quality", "Lakehouse Architecture"],
    },
]


AWARDS = [
    {"title": "Hult Prize International Winners — Top 50 Worldwide", "issuer": "Hult Prize",
     "year": "", "rank": "Top 50", "kind": "award", "order": 1},
    {"title": "Roots & Route Hackathon", "issuer": "UM6P", "year": "",
     "rank": "1st Prize", "kind": "award", "order": 2},
    {"title": "AI2SD Hackathon — Intelligent Industry", "issuer": "AI2SD", "year": "2025",
     "rank": "1st Prize", "kind": "award", "order": 3},
    {"title": "AI2SD Hackathon — Territorial Intelligence", "issuer": "AI2SD", "year": "2025",
     "rank": "1st Prize", "kind": "award", "order": 4},
    {"title": "DeepFake National Challenge", "issuer": "UM6P × INWI", "year": "",
     "rank": "Top 3", "kind": "award", "order": 5},
    {"title": "Finnovate Hackathon", "issuer": "EMSI × AIESEC", "year": "2025",
     "rank": "1st Prize", "kind": "award", "order": 6},
    {"title": "Mediterranean Smart Cities Hackathon", "issuer": "", "year": "2024",
     "rank": "2nd Prize", "kind": "award", "order": 7},
    {"title": "Valbium Cluster Hackathon", "issuer": "ENSEM", "year": "",
     "rank": "1st Prize", "kind": "award", "order": 8},
]

CERTIFICATIONS = [
    {"title": "Academy Accreditation — Databricks Fundamentals", "issuer": "Databricks",
     "year": "", "rank": "", "kind": "certification", "order": 1},
    {"title": "Knowledge Badge — SQL Analytics on Databricks", "issuer": "Databricks",
     "year": "", "rank": "", "kind": "certification", "order": 2},
    {"title": "Knowledge Badge — AI/BI for Data Analysts", "issuer": "Databricks",
     "year": "", "rank": "", "kind": "certification", "order": 3},
]


LINKS = [
    {"label": "LinkedIn", "url": LINKEDIN_URL, "icon": "linkedin",
     "description": "Parcours & réseau", "primary": True, "order": 1},
    {"label": "GitHub", "url": GITHUB_URL, "icon": "github",
     "description": "Code & projets data", "primary": True, "order": 2},
    {"label": "Email", "url": f"mailto:{EMAIL}", "icon": "mail",
     "description": EMAIL, "primary": True, "order": 3},
    {"label": "WhatsApp", "url": f"https://wa.me/{PHONE.lstrip('+')}", "icon": "whatsapp",
     "description": "Réponse rapide", "primary": False, "order": 4},
    {"label": "Téléphone", "url": f"tel:{PHONE}", "icon": "phone",
     "description": PHONE, "primary": False, "order": 5},
    {"label": "CV (FR)", "url": "/cv/othmane-sadiki-data-engineer-fr.pdf", "icon": "file",
     "description": "PDF · Français", "primary": False, "order": 6},
]
