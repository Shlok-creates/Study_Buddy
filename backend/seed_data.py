import json
from sqlmodel import Session, select
from models import SkillNode, StudyRoom, StudySquad, SquadMember, SquadFeedItem, UserProfile, PlannerTask
from datetime import datetime, timedelta

def seed_database(session: Session):
    # Check if StudySquad is seeded
    existing_squad = session.exec(select(StudySquad)).first()
    if not existing_squad:
        print("Seeding default StudySquad and peer community...")
        squad = StudySquad(
            name="Alpha Study Squad",
            invite_code="ALPHA-2026",
            created_by="peer-scholar-01",
            description="Collaborative sprint pod for daily focus and competitive revision.",
            member_count=4
        )
        session.add(squad)
        session.commit()
        session.refresh(squad)

        peers = [
            {"id": "peer-scholar-01", "name": "Ananya Sharma", "stream": "Class 12 Science", "xp": 2450, "level": 5},
            {"id": "peer-scholar-02", "name": "Rohan Mehta", "stream": "UG 1st Year B.Tech", "xp": 1850, "level": 4},
            {"id": "peer-scholar-03", "name": "Priya Verma", "stream": "Class 11 Medical", "xp": 1350, "level": 3},
            {"id": "peer-scholar-04", "name": "Kabir Sen", "stream": "Class 12 Commerce", "xp": 950, "level": 2},
        ]

        for p in peers:
            user = session.get(UserProfile, p["id"])
            if not user:
                session.add(UserProfile(
                    id=p["id"],
                    full_name=p["name"],
                    grade_stream=p["stream"],
                    xp=p["xp"],
                    level=p["level"],
                    badges_json='["Novice Scholar", "Academic Pathfinder"]'
                ))
            session.add(SquadMember(
                squad_id=squad.id,
                student_id=p["id"],
                student_name=p["name"]
            ))

        # Add initial feed milestones
        feed_events = [
            {
                "student_id": "peer-scholar-01",
                "student_name": "Ananya Sharma",
                "type": "streak_milestone",
                "msg": "🔥 Ananya Sharma completed a 12-day study streak across Calculus & Physics!",
                "reactions": '{"🔥": 8, "👏": 12, "🎯": 4}'
            },
            {
                "student_id": "peer-scholar-02",
                "student_name": "Rohan Mehta",
                "type": "level_up",
                "msg": "🎉 Rohan Mehta reached Level 4 (Syllabus Conqueror)! Mastered Binary Search Trees.",
                "reactions": '{"🔥": 5, "👏": 9, "🎯": 2}'
            },
            {
                "student_id": "peer-scholar-03",
                "student_name": "Priya Verma",
                "type": "task_completed",
                "msg": "🎯 Priya Verma finished study sprint: \"NEET Biology: DNA Replication & Helicase Activity\".",
                "reactions": '{"🔥": 4, "👏": 7, "🎯": 1}'
            }
        ]
        for fe in feed_events:
            session.add(SquadFeedItem(
                squad_id=squad.id,
                student_id=fe["student_id"],
                student_name=fe["student_name"],
                event_type=fe["type"],
                message=fe["msg"],
                reactions_json=fe["reactions"]
            ))
        session.commit()

    # Check if SkillNodes are already seeded
    existing_node = session.exec(select(SkillNode)).first()
    if existing_node:
        return

    print("Seeding Skill Trees (10 MCQs per node) & Study Pods...")

    tracks_data = [
        {
            "track": "Web Development",
            "nodes": [
                {
                    "id": "web-1",
                    "title": "HTML5 Semantic Architecture & Web Standards",
                    "level_order": 1,
                    "is_unlocked": True,
                    "quiz": [
                        {"question": "Which HTML5 tag is semantically best suited for standalone syndicateable content?", "options": ["<section>", "<article>", "<div>", "<aside>"], "correct_index": 1, "explanation": "<article> represents an independent self-contained piece of content."},
                        {"question": "What is the primary purpose of 'rel=\"noopener noreferrer\"' on external links?", "options": ["Enhance SEO ranking", "Prevent security vulnerabilities where target page accesses window.opener", "Cache static assets faster", "Allow cross-origin tracking"], "correct_index": 1, "explanation": "It protects against tabnabbing phishing attacks by preventing new windows from accessing window.opener."},
                        {"question": "What does the 'defer' attribute in a <script> tag do?", "options": ["Executes script synchronously immediately", "Downloads in background and executes after HTML is parsed", "Stops DOM rendering until complete", "Disables JavaScript in older browsers"], "correct_index": 1, "explanation": "defer downloads scripts asynchronously and executes them strictly in document order after the DOM is fully parsed."},
                        {"question": "Which HTML element is used to group form controls and provide a caption?", "options": ["<group>", "<fieldset> with <legend>", "<formgroup>", "<section>"], "correct_index": 1, "explanation": "<fieldset> groups related form inputs, and <legend> provides the accessible caption."},
                        {"question": "What is the role of the HTML5 '<main>' tag?", "options": ["Encapsulates navigation links", "Represents dominant central content of the document body", "Defines the site footer", "Holds global metadata"], "correct_index": 1, "explanation": "<main> represents dominant central content unique to the document, excluding headers, sidebars, and footers."},
                        {"question": "Which input type provides native date picking with validation?", "options": ["<input type=\"calendar\">", "<input type=\"date\">", "<input type=\"datetime-local-picker\">", "<input type=\"day\">"], "correct_index": 1, "explanation": "type=\"date\" displays browser-native date picker controls."},
                        {"question": "What does the 'alt' attribute on an <img> tag provide?", "options": ["Alternative tooltip style", "Text alternative for screen readers and search engines", "Image dimensions", "Lazy loading fallback"], "correct_index": 1, "explanation": "alt provides semantic text for accessibility and search engine indexing."},
                        {"question": "Which attribute tells the browser not to track search history on form inputs?", "options": ["autocomplete=\"off\"", "private=\"true\"", "no-history=\"on\"", "secure=\"strict\""], "correct_index": 0, "explanation": "autocomplete=\"off\" disables browser form autofill and input history."},
                        {"question": "What is the purpose of the '<meta name=\"viewport\">' tag?", "options": ["Sets page background color", "Controls layout and scaling on mobile browser viewports", "Prevents scraping", "Minimizes CSS download size"], "correct_index": 1, "explanation": "Viewport meta tag ensures responsive scaling across mobile and desktop devices."},
                        {"question": "Which semantic tag should be used to display code snippets in an article?", "options": ["<pre> and <code>", "<terminal>", "<script>", "<samp> only"], "correct_index": 0, "explanation": "<pre> preserves whitespace and <code> semantically marks computer code."}
                    ]
                },
                {
                    "id": "web-2",
                    "title": "CSS3 Flexbox, Grid & Responsive Layouts",
                    "level_order": 2,
                    "is_unlocked": False,
                    "quiz": [
                        {"question": "In CSS Flexbox, what does 'justify-content' control?", "options": ["Cross-axis alignment", "Main-axis distribution of flex items", "Wrapping behavior", "Individual item shrink factor"], "correct_index": 1, "explanation": "justify-content aligns and spaces items along the main axis."},
                        {"question": "What does '1fr' represent in CSS Grid?", "options": ["1 fixed pixel ratio", "1 fraction of available free space in grid container", "1 flexible rem unit", "1 frame duration"], "correct_index": 1, "explanation": "fr stands for fractional unit of remaining available space."},
                        {"question": "How do you center an element both horizontally and vertically with CSS Grid?", "options": ["place-items: center;", "align-grid: middle;", "grid-align: center;", "display: center;"], "correct_index": 0, "explanation": "place-items: center sets both align-items and justify-items to center simultaneously."},
                        {"question": "What is the difference between 'min-width' and 'max-width' in media queries?", "options": ["min-width applies styles above a threshold; max-width applies styles below", "They are completely interchangeable", "min-width only works on iOS", "max-width disables desktop rendering"], "correct_index": 0, "explanation": "min-width defines mobile-first breakpoints (screen >= value), while max-width defines desktop-down (screen <= value)."},
                        {"question": "In the CSS Box Model, what does 'box-sizing: border-box' ensure?", "options": ["Margin is included in width", "Padding and border are included in total declared width and height", "Only content area is measured", "Borders are rendered outside the element"], "correct_index": 1, "explanation": "border-box includes padding and border within the declared width and height."},
                        {"question": "What does 'flex-shrink: 0' do to a flex item?", "options": ["Forces it to shrink to 0px", "Prevents the item from shrinking when space is constrained", "Allows infinite shrinkage", "Hides the item"], "correct_index": 1, "explanation": "A shrink factor of 0 prevents the flex item from compressing below its base size."},
                        {"question": "Which CSS property enables GPU hardware acceleration for smooth transforms?", "options": ["transform: translateZ(0) or will-change: transform", "accelerate: true", "gpu-mode: on", "render: directx"], "correct_index": 0, "explanation": "translateZ(0) or will-change promotes the layer to the GPU compositor."},
                        {"question": "What is the CSS 'clamp(1rem, 2.5vw, 2rem)' function used for?", "options": ["Fluid typography and sizing between minimum and maximum bounds", "CSS animations", "Color interpolation", "Grid column gap"], "correct_index": 0, "explanation": "clamp() constrains a value between an absolute minimum, preferred scalable value, and maximum bound."},
                        {"question": "Which pseudo-class targets an element that is the first child of its parent?", "options": [":first-of-type", ":first-child", ":root", ":first"], "correct_index": 1, "explanation": ":first-child matches an element only if it is the first child of its parent container."},
                        {"question": "What does CSS 'z-index' require to take effect on an element?", "options": ["A positioned element (relative, absolute, fixed, or sticky)", "display: block", "float: left", "font-weight: bold"], "correct_index": 0, "explanation": "z-index only applies to positioned elements or flex/grid children."}
                    ]
                },
                {
                    "id": "web-3",
                    "title": "Modern JavaScript ES6+ & Asynchronous Architecture",
                    "level_order": 3,
                    "is_unlocked": False,
                    "quiz": [
                        {"question": "What is the microtask queue behavior in the JavaScript Event Loop?", "options": ["Executed after macro-tasks like setTimeout", "Drained completely before the next macro-task runs", "Processed concurrently with Web Workers", "Ignored in Node.js"], "correct_index": 1, "explanation": "Microtasks (Promises, queueMicrotask) take strict priority and drain before picking the next task."},
                        {"question": "What does 'Promise.allSettled()' return compared to 'Promise.all()'?", "options": ["Fails fast on first rejection", "Waits for all promises to resolve or reject and returns an array of status objects", "Returns only fulfilled results", "Cancels pending network calls"], "correct_index": 1, "explanation": "Promise.allSettled never rejects early; it returns status and value/reason for every promise."},
                        {"question": "What does the '??' nullish coalescing operator check for?", "options": ["Falsy values (0, empty string, false)", "Strictly null or undefined", "NaN only", "Boolean false only"], "correct_index": 1, "explanation": "Nullish coalescing (??) only triggers on null or undefined, preserving 0 and false."},
                        {"question": "What is the key difference between 'let' and 'var' in JavaScript?", "options": ["let is block-scoped; var is function-scoped", "var cannot be reassigned", "let is hoisted to global window object", "var supports arrow functions only"], "correct_index": 0, "explanation": "let and const are block-scoped ({}) and stay in TDZ, whereas var is function-scoped."},
                        {"question": "How does Array.prototype.reduce() accumulate values?", "options": ["Iterates backward only", "Passes an accumulator and current element through a reducer callback to produce a single value", "Creates a shallow copy without modification", "Filters out undefined values"], "correct_index": 1, "explanation": "reduce() applies the callback against an accumulator and each element to yield a single reduced result."},
                        {"question": "What is a JavaScript Closure?", "options": ["A function bundled with references to its surrounding lexical environment", "A method to terminate memory leaks", "A syntax error in async functions", "A built-in JSON parser"], "correct_index": 0, "explanation": "Closures allow an inner function to retain access to outer scope variables even after outer execution completes."},
                        {"question": "What does the 'AbortController' API allow in modern JavaScript?", "options": ["Aborts unhandled promise rejections", "Cancels ongoing fetch requests and async tasks via AbortSignal", "Shuts down browser tab", "Pauses JavaScript thread"], "correct_index": 1, "explanation": "AbortController provides signal objects to cancel fetch and event listener tasks gracefully."},
                        {"question": "What is the output of 'typeof NaN' in JavaScript?", "options": ["\"number\"", "\"NaN\"", "\"undefined\"", "\"object\""], "correct_index": 0, "explanation": "In JavaScript, NaN is a numeric value representing 'Not-a-Number', so typeof NaN is \"number\"."},
                        {"question": "Which method performs a deep clone in modern browser JavaScript without external libraries?", "options": ["JSON.clone()", "structuredClone()", "Object.assign()", "Array.from()"], "correct_index": 1, "explanation": "structuredClone() handles deep cloning natively, including circular references, Maps, and Sets."},
                        {"question": "What is the purpose of the 'Symbol' primitive type?", "options": ["Creates guaranteed unique property keys to prevent naming collisions", "Formats monetary currency", "Represents large integers", "Manages regex tokens"], "correct_index": 0, "explanation": "Symbols are immutable and unique, making them ideal for private or non-enumerable object keys."}
                    ]
                },
                {
                    "id": "web-4",
                    "title": "React Lifecycle, Hooks & Component Architecture",
                    "level_order": 4,
                    "is_unlocked": False,
                    "quiz": [
                        {"question": "When should 'useCallback' primarily be applied?", "options": ["On every single internal function", "To memoize function references passed to optimized child components relying on reference equality", "To replace useEffect entirely", "To initiate asynchronous background threads"], "correct_index": 1, "explanation": "useCallback preserves identity across renders for child memoization and stable effect dependencies."},
                        {"question": "What is the primary difference between 'useMemo' and 'useCallback'?", "options": ["useMemo caches computed values; useCallback caches function definitions", "useMemo only runs on server", "useCallback caches numbers only", "They are exact synonyms"], "correct_index": 0, "explanation": "useMemo memoizes the result of calling a function; useCallback memoizes the function definition itself."},
                        {"question": "What triggers a re-render in a standard React component?", "options": ["Changes to component state or props", "Only direct window resize events", "Console.log calls", "Modifying local regular variables"], "correct_index": 0, "explanation": "A component re-renders when its state variables change or when parent passes changed props."},
                        {"question": "What does the cleanup function in 'useEffect' do?", "options": ["Deletes the component from disk", "Runs before the effect re-runs or when component unmounts to prevent memory leaks", "Clears browser cache", "Resets Redux store"], "correct_index": 1, "explanation": "Cleanup functions unsubscribe listeners, abort fetches, and clear timers when dependencies change or on unmount."},
                        {"question": "What is the rule of React Hooks regarding conditionals?", "options": ["Hooks can be called inside if-statements", "Hooks must be called at top-level of React functions, never inside loops or conditions", "Hooks must only be placed in class methods", "Hooks must only run after return statement"], "correct_index": 1, "explanation": "React relies on strict order of hook execution across renders; calling them conditionally breaks state ordering."},
                        {"question": "What is React 'useRef' primarily used for?", "options": ["Triggering visual re-renders", "Holding a mutable reference across renders without causing re-renders, and accessing DOM elements", "Creating global state", "Replacing CSS modules"], "correct_index": 1, "explanation": "useRef holds a persistent .current property that can be mutated without causing a re-render."},
                        {"question": "What is React 'Context' designed to solve?", "options": ["Prop drilling across deeply nested components", "Database SQL queries", "Browser geolocation", "Image compression"], "correct_index": 0, "explanation": "Context provides a way to pass data through the component tree without passing props down manually at every level."},
                        {"question": "In React 18, what does automatic batching do?", "options": ["Groups multiple state updates inside promises, timeouts, and handlers into a single re-render", "Batches npm packages", "Compresses JSX code", "Disables strict mode"], "correct_index": 0, "explanation": "React 18 batches state updates even inside timeouts and async fetch callbacks to optimize renders."},
                        {"question": "What is the function of the 'key' prop when rendering lists in React?", "options": ["Supplies CSS styling", "Helps React identify which items have changed, been added, or removed during reconciliation", "Stores the database primary key", "Encrypts component props"], "correct_index": 1, "explanation": "Keys give stable identity to elements so React Virtual DOM can reconcile lists efficiently."},
                        {"question": "What does React.memo() do when wrapping a functional component?", "options": ["Skips re-rendering if component props have not changed by shallow comparison", "Memoizes all database calls", "Forces synchronous rendering", "Turns component into Web Component"], "correct_index": 0, "explanation": "React.memo is a higher-order component that prevents re-rendering if previous and next props are shallowly equal."}
                    ]
                },
                {
                    "id": "web-5",
                    "title": "Full-Stack API Design & Next.js App Router",
                    "level_order": 5,
                    "is_unlocked": False,
                    "quiz": [
                        {"question": "What is the key advantage of React Server Components (RSC) in Next.js?", "options": ["Zero client-side JavaScript bundle for server-rendered code", "Automatic client-side local storage sync", "Direct access to browser geolocation APIs", "Eliminates need for any CSS styling"], "correct_index": 0, "explanation": "Server components stay on the server, resulting in smaller bundle size and faster initial page loads."},
                        {"question": "What does the 'use client' directive in Next.js App Router signify?", "options": ["Marks component and its imports as client-side interactive boundaries", "Encrypts client cookies", "Connects to PostgreSQL database directly", "Disables SSR permanently on entire domain"], "correct_index": 0, "explanation": "use client defines the boundary where components can use React hooks, browser APIs, and event listeners."},
                        {"question": "In REST API design, which HTTP method is strictly idempotent?", "options": ["POST", "PUT", "PATCH without preconditions", "CONNECT"], "correct_index": 1, "explanation": "PUT is idempotent because multiple identical PUT requests produce the exact same server resource state."},
                        {"question": "What is CORS (Cross-Origin Resource Sharing)?", "options": ["A browser security mechanism that restricts resources requested from another domain", "A server compression protocol", "A CSS styling framework", "A Node.js database connector"], "correct_index": 0, "explanation": "CORS uses HTTP headers to tell browsers whether a web app can access resources from a different origin."},
                        {"question": "What does HTTP status code 401 indicate compared to 403?", "options": ["401 is Unauthorized (unauthenticated); 403 is Forbidden (authenticated but lacks permission)", "401 is Server Error; 403 is Client Error", "They are identical", "401 is Page Not Found"], "correct_index": 0, "explanation": "401 indicates missing or invalid credentials; 403 indicates identity is known but access is forbidden."},
                        {"question": "In Next.js, where do Route Handlers reside?", "options": ["In route.ts or route.js files inside the app directory", "Inside public/api.json", "Inside components/api.ts", "Inside pages/server.ts"], "correct_index": 0, "explanation": "Route Handlers are defined in route.ts/js files inside app/ and export GET, POST, PUT, DELETE functions."},
                        {"question": "What is the purpose of JWT (JSON Web Token) signatures?", "options": ["Encrypts the payload so nobody can read it", "Verifies the token's authenticity and ensures it has not been tampered with", "Compresses token payload size", "Enables real-time WebSockets"], "correct_index": 1, "explanation": "Signatures ensure cryptographic integrity so servers verify that payload claims were not modified in transit."},
                        {"question": "What does Next.js 'generateStaticParams()' do in dynamic routes?", "options": ["Statically generates dynamic route segments at build time", "Creates SQLite tables", "Uploads static files to CDN", "Runs client-side queries"], "correct_index": 0, "explanation": "generateStaticParams pre-renders dynamic routes (e.g. /blog/[id]) at build time for optimal performance."},
                        {"question": "Which header prevents MIME-sniffing vulnerabilities in web applications?", "options": ["X-Content-Type-Options: nosniff", "Strict-Transport-Security", "X-Frame-Options: DENY", "Cache-Control: private"], "correct_index": 0, "explanation": "X-Content-Type-Options: nosniff prevents browsers from interpreting files as a different MIME type."},
                        {"question": "What is Server-Sent Events (SSE) compared to WebSockets?", "options": ["SSE provides unidirectional text streaming from server to client over standard HTTP", "SSE is bidirectional binary only", "SSE requires custom TCP ports", "SSE cannot be used with JavaScript"], "correct_index": 0, "explanation": "SSE provides lightweight, unidirectional real-time streaming from server to client using standard HTTP."}
                    ]
                }
            ]
        },
        {
            "track": "NEET Biology",
            "nodes": [
                {
                    "id": "neet-1",
                    "title": "Cell Biology, Organelles & Membrane Transport",
                    "level_order": 1,
                    "is_unlocked": True,
                    "quiz": [
                        {"question": "Which organelle is responsible for lipid biosynthesis and drug detoxification?", "options": ["Rough Endoplasmic Reticulum", "Smooth Endoplasmic Reticulum", "Golgi Apparatus", "Lysosome"], "correct_index": 1, "explanation": "Smooth ER synthesizes lipids and detoxifies metabolic byproducts."},
                        {"question": "What constitutes the 70S ribosome subunits in prokaryotes?", "options": ["60S and 40S", "50S and 30S", "50S and 20S", "40S and 30S"], "correct_index": 1, "explanation": "Prokaryotic 70S ribosomes consist of 50S large and 30S small subunits."},
                        {"question": "Which model explains the structure of cell membrane as protein icebergs in a sea of lipids?", "options": ["Unit Membrane Model", "Fluid Mosaic Model by Singer and Nicolson", "Sandwich Model", "Lamellar Model"], "correct_index": 1, "explanation": "The Fluid Mosaic Model proposed by Singer and Nicolson in 1972 describes quasi-fluid phospholipid bilayers with embedded proteins."},
                        {"question": "Which organelle contains hydrolytic enzymes active at acidic pH?", "options": ["Peroxisome", "Lysosome", "Centrosome", "Vacuole"], "correct_index": 1, "explanation": "Lysosomes contain acid hydrolases (pH ~ 5) for intracellular digestion."},
                        {"question": "What is the powerhouse of the cell where oxidative phosphorylation occurs?", "options": ["Mitochondria", "Chloroplast", "Nucleolus", "Ribosome"], "correct_index": 0, "explanation": "Mitochondria generate ATP across the inner mitochondrial membrane via ATP synthase."},
                        {"question": "In plant cells, which organelle stores water, pigments, and excretory products?", "options": ["Central Vacuole bounded by Tonoplast", "Peroxisome", "Plasmodesmata", "Golgi apparatus"], "correct_index": 0, "explanation": "The central vacuole bounded by the semi-permeable tonoplast maintains turgor pressure."},
                        {"question": "Which cytoskeletal component forms the mitotic spindle fibers?", "options": ["Microtubules (tubulin)", "Actin microfilaments", "Intermediate filaments", "Collagen fibers"], "correct_index": 0, "explanation": "Microtubules made of tubulin heterodimers assemble into the mitotic spindle apparatus."},
                        {"question": "What is the primary site of ribosomal RNA (rRNA) synthesis in eukaryotic cells?", "options": ["Nucleolus", "Cytoplasm", "Endoplasmic Reticulum", "Golgi Body"], "correct_index": 0, "explanation": "The nucleolus is the active site for rRNA transcription and ribosomal subunit pre-assembly."},
                        {"question": "Which transport mechanism moves ions against their concentration gradient using ATP?", "options": ["Facilitated diffusion", "Active transport (e.g. Na+/K+ pump)", "Simple osmosis", "Passive filtration"], "correct_index": 1, "explanation": "Primary active transport hydrolyzes ATP to move solutes against electrochemical gradients."},
                        {"question": "What is the major lipid component of the eukaryotic plasma membrane?", "options": ["Phosphoglycerides", "Triglycerides", "Prostaglandins", "Glycogen"], "correct_index": 0, "explanation": "Phosphoglycerides with polar hydrophilic heads and hydrophobic hydrocarbon tails form the bilayer core."}
                    ]
                },
                {
                    "id": "neet-2",
                    "title": "Genetics, DNA Replication & Mendelian Inheritance",
                    "level_order": 2,
                    "is_unlocked": False,
                    "quiz": [
                        {"question": "What is the expected phenotypic dihybrid ratio in Mendel's F2 generation under complete dominance?", "options": ["9:3:3:1", "1:2:1", "3:1", "9:7"], "correct_index": 0, "explanation": "Mendel's Law of Independent Assortment yields the classic 9:3:3:1 phenotypic dihybrid ratio."},
                        {"question": "During DNA replication, which enzyme unwinds the double helix at the replication fork?", "options": ["DNA Helicase", "DNA Polymerase III", "Topoisomerase", "RNA Primase"], "correct_index": 0, "explanation": "Helicase breaks hydrogen bonds between nitrogenous base pairs to unwind the double helix."},
                        {"question": "Which enzyme joins Okazaki fragments on the lagging strand?", "options": ["DNA Ligase", "DNA Polymerase I", "Reverse Transcriptase", "Endonuclease"], "correct_index": 0, "explanation": "DNA Ligase catalyzes phosphodiester bond formation between adjacent Okazaki fragments."},
                        {"question": "What type of inheritance is demonstrated by ABO blood groups in humans?", "options": ["Codominance and Multiple Allelism", "Incomplete dominance", "Polygenic inheritance", "Sex-linked inheritance"], "correct_index": 0, "explanation": "ABO blood groups show multiple alleles (IA, IB, i) where IA and IB are codominant."},
                        {"question": "In a cross between two heterozygous pink-flowered Mirabilis jalapa (incomplete dominance), what is the phenotypic ratio?", "options": ["1 Red : 2 Pink : 1 White", "3 Pink : 1 White", "All Pink", "9:3:3:1"], "correct_index": 0, "explanation": "Incomplete dominance yields a 1:2:1 phenotypic ratio matching the genotypic ratio."},
                        {"question": "Which genetic disorder is caused by trisomy of chromosome 21?", "options": ["Down Syndrome", "Turner Syndrome", "Klinefelter Syndrome", "Cri-du-chat Syndrome"], "correct_index": 0, "explanation": "Down Syndrome is an autosomal aneuploidy caused by non-disjunction resulting in trisomy 21."},
                        {"question": "What is the start codon in eukaryotic mRNA translation, and which amino acid does it code for?", "options": ["AUG (Methionine)", "UAA (Stop)", "UAG (Tryptophan)", "GAU (Aspartate)"], "correct_index": 0, "explanation": "AUG codes for Methionine and serves as the universal initiator codon."},
                        {"question": "Which experiment confirmed that DNA replication is semi-conservative?", "options": ["Meselson and Stahl Experiment using 15N", "Hershey-Chase Experiment", "Griffith Transformation Experiment", "Avery-MacLeod-McCarty Experiment"], "correct_index": 0, "explanation": "Meselson and Stahl utilized 15N isotope density gradient centrifugation in E. coli in 1958."},
                        {"question": "What nitrogenous base is present in RNA but absent in DNA?", "options": ["Uracil", "Thymine", "Guanine", "Cytosine"], "correct_index": 0, "explanation": "Uracil replaces thymine in RNA and pairs with adenine."},
                        {"question": "What term describes when a single gene influences multiple phenotypic traits?", "options": ["Pleiotropy", "Polygenic inheritance", "Epistasis", "Complementary genes"], "correct_index": 0, "explanation": "Pleiotropy refers to a single mutation or gene affecting multiple phenotypic characteristics (e.g. Phenylketonuria)."}
                    ]
                },
                {
                    "id": "neet-3",
                    "title": "Human Physiology: Cardiovascular & Respiratory Mechanics",
                    "level_order": 3,
                    "is_unlocked": False,
                    "quiz": [
                        {"question": "Where is the natural pacemaker of the human heart located?", "options": ["Sinoatrial Node (SAN) in right atrium", "Atrioventricular Node (AVN)", "Bundle of His", "Purkinje Fibres"], "correct_index": 0, "explanation": "The SAN in the upper right wall of the right atrium generates spontaneous rhythmic impulses (72/min)."},
                        {"question": "What is normal human cardiac output at rest?", "options": ["Approximately 5 Litres / minute", "10 Litres / minute", "2 Litres / minute", "500 mL / minute"], "correct_index": 0, "explanation": "Cardiac Output = Stroke Volume (70 mL) × Heart Rate (72 bpm) ≈ 5040 mL/min (~5 L/min)."},
                        {"question": "What causes the first heart sound ('LUBB')?", "options": ["Closure of atrioventricular (Tricuspid & Bicuspid) valves", "Closure of semilunar valves", "Opening of aortic valve", "Rushing of blood into ventricles"], "correct_index": 0, "explanation": "LUBB is caused by closure of AV valves during ventricular systole onset."},
                        {"question": "Which respiratory volume remains in the lungs even after forceful maximum expiration?", "options": ["Residual Volume (RV)", "Tidal Volume (TV)", "Inspiratory Reserve Volume (IRV)", "Expiratory Reserve Volume (ERV)"], "correct_index": 0, "explanation": "Residual Volume (~1100 to 1200 mL) cannot be expelled and prevents lung collapse."},
                        {"question": "How is the majority of carbon dioxide transported in human blood?", "options": ["As Bicarbonate ions (HCO3-) in plasma (~70%)", "Dissolved in plasma (~90%)", "As carbaminohemoglobin (~100%)", "As carbon monoxide"], "correct_index": 0, "explanation": "Around 70% of CO2 is carried as bicarbonate ions synthesized via carbonic anhydrase."},
                        {"question": "What shifts the oxygen-hemoglobin dissociation curve to the right (Bohr effect)?", "options": ["Increased pCO2, higher temperature, and lower pH (acidic)", "Decreased pCO2 and higher pH", "Lower body temperature", "High pO2"], "correct_index": 0, "explanation": "High pCO2, acidity, and heat decrease hemoglobin affinity for O2, promoting oxygen delivery to tissues."},
                        {"question": "Which blood vessel carries oxygenated blood from the lungs into the left atrium?", "options": ["Pulmonary Veins", "Pulmonary Artery", "Superior Vena Cava", "Aorta"], "correct_index": 0, "explanation": "Pulmonary veins are the only veins carrying oxygenated blood back to the heart."},
                        {"question": "What is the primary respiratory rhythm center located in the human brain?", "options": ["Medulla oblongata", "Cerebellum", "Hypothalamus", "Thalamus"], "correct_index": 0, "explanation": "The respiratory rhythm center in the medulla regulates basal inspiratory and expiratory drive."},
                        {"question": "What is the typical normal resting blood pressure of a healthy human adult?", "options": ["120 / 80 mmHg", "140 / 90 mmHg", "100 / 60 mmHg", "80 / 120 mmHg"], "correct_index": 0, "explanation": "120 mmHg systolic over 80 mmHg diastolic is the clinical standard."},
                        {"question": "Which layer of the heart wall is composed of specialized contractile cardiac muscle tissue?", "options": ["Myocardium", "Endocardium", "Epicardium", "Pericardium"], "correct_index": 0, "explanation": "The myocardium constitutes the thick middle muscular layer responsible for pumping action."}
                    ]
                }
            ]
        },
        {
            "track": "Financial Accounting",
            "nodes": [
                {
                    "id": "fin-1",
                    "title": "Fundamental Accounting Principles & Double Entry",
                    "level_order": 1,
                    "is_unlocked": True,
                    "quiz": [
                        {"question": "According to the fundamental accounting equation, Assets equal what?", "options": ["Liabilities + Owner's Equity", "Liabilities - Capital", "Revenue - Expenses", "Cash Inflows - Depreciation"], "correct_index": 0, "explanation": "Assets = Liabilities + Equity is the foundational balance sheet equation."},
                        {"question": "Which accounting principle dictates anticipating all future losses but no unrealized gains?", "options": ["Prudence (Conservatism) Principle", "Going Concern Principle", "Materiality Concept", "Historical Cost Principle"], "correct_index": 0, "explanation": "Prudence dictates recording provisions for all known liabilities and probable losses."},
                        {"question": "What does the Business Entity Concept state?", "options": ["The business is distinct and separate from its owner(s)", "All transactions must be in gold", "The business must liquidate annually", "Owners personal expenses are company revenue"], "correct_index": 0, "explanation": "Under the Entity Concept, enterprise transactions are treated distinctly from personal transactions of owners."},
                        {"question": "Which basis of accounting records revenues when earned and expenses when incurred, regardless of cash receipt?", "options": ["Accrual Basis of Accounting", "Cash Basis of Accounting", "Hybrid Tax Basis", "Single Entry System"], "correct_index": 0, "explanation": "Accrual accounting matches revenues and expenses to the period they relate to."},
                        {"question": "What is the golden rule for Real Accounts in traditional accounting?", "options": ["Debit what comes in, Credit what goes out", "Debit the receiver, Credit the giver", "Debit all expenses, Credit all incomes", "Debit capital, Credit drawings"], "correct_index": 0, "explanation": "Real accounts (assets, machinery, cash) follow: Debit what comes in, Credit what goes out."},
                        {"question": "What is the golden rule for Nominal Accounts?", "options": ["Debit all expenses & losses, Credit all incomes & gains", "Debit what comes in, Credit what goes out", "Debit the receiver, Credit the giver", "Debit assets, Credit liabilities"], "correct_index": 0, "explanation": "Nominal accounts (rent, salaries, interest) debit expenses and credit revenues."},
                        {"question": "What does the Going Concern Concept assume?", "options": ["The enterprise will continue operating for an indefinite foreseeable future", "The business will close next month", "Only cash transactions exist", "Assets cannot be sold"], "correct_index": 0, "explanation": "Financial statements assume the firm has neither the intention nor necessity of liquidation."},
                        {"question": "Which accounting standard board issues IFRS internationally?", "options": ["IASB (International Accounting Standards Board)", "FASB only", "ICAI only", "WTO"], "correct_index": 0, "explanation": "The IASB develops and issues International Financial Reporting Standards (IFRS)."},
                        {"question": "Why is the Double Entry System considered the most scientific bookkeeping method?", "options": ["Every transaction has dual equal debit and credit aspects maintaining balance", "It requires two bookkeepers", "It calculates taxes automatically", "It prevents all fraud"], "correct_index": 0, "explanation": "Double entry ensures that total debits always equal total credits for mathematical accuracy."},
                        {"question": "What does the Money Measurement Concept mandate?", "options": ["Only transactions capable of being expressed in monetary terms are recorded", "Barter trades are unlimited", "Inflation must be ignored entirely", "Foreign currencies are illegal"], "correct_index": 0, "explanation": "Only events measurable in currency units enter books of account."}
                    ]
                },
                {
                    "id": "fin-2",
                    "title": "Journal Entries, Ledger Accounts & Trial Balance",
                    "level_order": 2,
                    "is_unlocked": False,
                    "quiz": [
                        {"question": "When machinery is purchased on credit from Supplier X, which account is debited?", "options": ["Machinery A/c", "Purchases A/c", "Supplier X A/c", "Cash A/c"], "correct_index": 0, "explanation": "Capital asset purchases are debited to the specific Asset Account (Machinery A/c), not Purchases."},
                        {"question": "What is the book of prime or original entry called?", "options": ["Journal", "Ledger", "Trial Balance", "Balance Sheet"], "correct_index": 0, "explanation": "The Journal records transactions in chronological order before posting to the ledger."},
                        {"question": "What does the process of transferring journal entries to ledger accounts called?", "options": ["Posting", "Balancing", "Auditing", "Journalising"], "correct_index": 0, "explanation": "Transferring transactions from the Journal to the Ledger is termed posting."},
                        {"question": "What is a Trial Balance primarily prepared to test?", "options": ["Arithmetical accuracy of ledger accounts", "Market share of the firm", "True cash balance at bank", "Owner personal net worth"], "correct_index": 0, "explanation": "A Trial Balance lists debit and credit ledger balances to verify arithmetical equality."},
                        {"question": "Which type of error does NOT affect the agreement of a Trial Balance?", "options": ["Compensating Errors and Complete Omission", "One-sided posting error", "Wrong totaling of subsidiary book", "Omission of a ledger balance"], "correct_index": 0, "explanation": "Complete omission and compensating errors leave total debits equal to total credits."},
                        {"question": "When cash is deposited into the business bank account, what is the entry?", "options": ["Debit Bank A/c, Credit Cash A/c", "Debit Cash A/c, Credit Bank A/c", "Debit Drawings, Credit Cash", "Debit Capital, Credit Bank"], "correct_index": 0, "explanation": "Bank asset increases (Debit), Cash asset decreases (Credit). This is a contra entry."},
                        {"question": "What is the purpose of a Suspense Account?", "options": ["Temporarily balance a Trial Balance until differences are located and rectified", "Hide illegal transactions", "Store owner profits", "Record unbilled invoices"], "correct_index": 0, "explanation": "A Suspense Account holds unexplained discrepancies in the trial balance during rectification."},
                        {"question": "What is a Compound Journal Entry?", "options": ["An entry involving more than two accounts (multiple debits or credits)", "An entry recorded in pencil", "An entry spanning two fiscal years", "A closing entry only"], "correct_index": 0, "explanation": "Compound entries combine transactions sharing common dates and accounts into one entry."},
                        {"question": "What is a Bank Reconciliation Statement (BRS)?", "options": ["A schedule reconciling discrepancies between Cash Book bank column and Bank Passbook", "A loan application", "Tax audit report", "Balance sheet schedule"], "correct_index": 0, "explanation": "BRS explains timing and transaction differences between company books and bank statements."},
                        {"question": "In the Ledger, what does 'c/d' represent at the end of an accounting period?", "options": ["Carried Down (closing balance to be transferred to next period)", "Cash Discount", "Credit Draft", "Cancelled Deal"], "correct_index": 0, "explanation": "Balance c/d (carried down) represents the closing balance brought forward (b/d) next period."}
                    ]
                }
            ]
        }
    ]

    for t in tracks_data:
        for node in t["nodes"]:
            session.add(SkillNode(
                id=node["id"],
                track=t["track"],
                title=node["title"],
                level_order=node["level_order"],
                is_unlocked=node["is_unlocked"],
                quiz_json=json.dumps(node["quiz"])
            ))

    # Seed study room pod
    pod_members = [
        {"name": "Priya Patel", "id": "pod-scholar-02", "completed": 14, "mins_ago": "4 mins ago"},
        {"name": "Rohan Verma", "id": "pod-scholar-03", "completed": 11, "mins_ago": "12 mins ago"},
        {"name": "Ananya Iyer", "id": "pod-scholar-04", "completed": 9, "mins_ago": "25 mins ago"},
        {"name": "Devansh Mehta", "id": "pod-scholar-05", "completed": 7, "mins_ago": "1 hour ago"}
    ]
    for member in pod_members:
        session.add(StudyRoom(
            room_code="FOCUS-2026",
            student_id=member["id"],
            student_name=member["name"],
            tasks_completed_count=member["completed"],
            last_active=member["mins_ago"]
        ))

    session.commit()
    print("Database seeding completed with zero dummy user records and full 10-MCQ skill pools!")
