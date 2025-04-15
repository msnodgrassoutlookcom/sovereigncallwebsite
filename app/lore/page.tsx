"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronDown, BookOpen, Code, Lightbulb, Calendar, Users, Building } from "lucide-react"
import { cn } from "@/lib/utils"
import { FactionStatistics } from "@/components/faction-statistics"

// Define lore categories and items
const loreCategories = [
  {
    name: "World History",
    items: [
      { id: "origin", title: "Origin of the Galaxy" },
      { id: "silent-king", title: "The Silent King" },
      { id: "great-divide", title: "The Great Divide" },
      { id: "recent-history", title: "Recent History" },
    ],
  },
  {
    name: "Factions",
    items: [
      { id: "dominion-history", title: "The Dominion: History" },
      { id: "dominion-structure", title: "The Dominion: Structure" },
      { id: "reformation-history", title: "The Reformation: History" },
      { id: "reformation-structure", title: "The Reformation: Structure" },
      { id: "neutral-factions", title: "Neutral Factions" },
    ],
  },
  {
    name: "Key Locations",
    items: [
      { id: "capital-worlds", title: "Capital Worlds" },
      { id: "contested-zones", title: "Contested Zones" },
      { id: "the-citadel", title: "The Citadel" },
      { id: "frontier-worlds", title: "Frontier Worlds" },
    ],
  },
  {
    name: "Technology",
    items: [
      { id: "ftl-travel", title: "FTL Travel" },
      { id: "weapons", title: "Weapons Technology" },
      { id: "augmentation", title: "Human Augmentation" },
      { id: "ai-systems", title: "AI Systems" },
    ],
  },
  {
    name: "Culture",
    items: [
      { id: "dominion-culture", title: "Dominion Culture" },
      { id: "reformation-culture", title: "Reformation Culture" },
      { id: "religion", title: "Religious Practices" },
      { id: "daily-life", title: "Daily Life" },
      { id: "arts", title: "Arts and Entertainment" },
    ],
  },
  {
    name: "Bestiary",
    items: [
      { id: "native-species", title: "Native Species" },
      { id: "synthetic-life", title: "Synthetic Life" },
    ],
  },
  // New FAQ categories
  {
    name: "Development Technology",
    icon: Code,
    items: [
      { id: "tech-stack", title: "Tech Stack" },
      { id: "game-engine", title: "Game Engine" },
      { id: "server-architecture", title: "Server Architecture" },
      { id: "client-optimization", title: "Client Optimization" },
      { id: "cross-platform", title: "Cross-Platform Support" },
    ],
  },
  {
    name: "Game Design Philosophy",
    icon: Lightbulb,
    items: [
      { id: "design-principles", title: "Core Design Principles" },
      { id: "balance-approach", title: "Balance Philosophy" },
      { id: "narrative-design", title: "Narrative Design" },
      { id: "progression-systems", title: "Progression Systems" },
      { id: "monetization", title: "Monetization Approach" },
    ],
  },
  {
    name: "Future Updates & Roadmap",
    icon: Calendar,
    items: [
      { id: "upcoming-features", title: "Upcoming Features" },
      { id: "expansion-plans", title: "Expansion Plans" },
      { id: "release-schedule", title: "Release Schedule" },
      { id: "content-updates", title: "Content Update Cycle" },
      { id: "long-term-vision", title: "Long-Term Vision" },
    ],
  },
  {
    name: "Community & Feedback",
    icon: Users,
    items: [
      { id: "feedback-process", title: "Feedback Process" },
      { id: "community-events", title: "Community Events" },
      { id: "beta-testing", title: "Beta Testing" },
      { id: "bug-reporting", title: "Bug Reporting" },
      { id: "player-council", title: "Player Council" },
    ],
  },
  {
    name: "Team & Organization",
    icon: Building,
    items: [
      { id: "dev-team", title: "Development Team" },
      { id: "studio-history", title: "Studio History" },
      { id: "hiring-process", title: "Hiring Process" },
      { id: "work-culture", title: "Work Culture" },
      { id: "partnerships", title: "Partnerships" },
    ],
  },
]

// Lore content for each item
const loreContent: Record<string, { title: string; content: React.ReactNode }> = {
  origin: {
    title: "Origin of the Galaxy",
    content: (
      <div className="space-y-4">
        <p>
          The known galaxy has been inhabited by humans for over two millennia, following the great exodus from Old
          Earth. Historical records from before the exodus are fragmented, with many believing that humanity fled a
          dying world.
        </p>
        <p>
          The early colonists spread across the stars using generation ships, establishing the first colonies in what
          would become the Core Systems. These early settlements faced harsh conditions but thrived through
          technological innovation and adaptation.
        </p>
        <p>
          As humanity expanded, they discovered ancient artifacts and ruins suggesting they were not the first
          intelligent life in the galaxy. However, no living alien civilizations have ever been encountered, leading to
          the "Great Mystery" that scholars still debate today.
        </p>
        <p>
          The unified government known as the Galactic Concord maintained peace for centuries until the emergence of the
          Silent King and the subsequent ideological divide that would fracture humanity into the factions we know
          today.
        </p>
      </div>
    ),
  },
  "silent-king": {
    title: "The Silent King",
    content: (
      <div className="space-y-4">
        <p>
          The figure known as the Silent King emerged approximately 300 years ago from the mysterious region known as
          the Shroud. His origins remain unknown, but his profound wisdom and seemingly supernatural abilities quickly
          gathered a devoted following.
        </p>
        <p>
          For fifty years, the Silent King shared teachings and guidance that transformed human society, introducing
          advanced technologies and philosophical concepts that reshaped civilization. His most devoted followers formed
          the original Council of Interpreters.
        </p>
        <p>
          Then, without warning, the Silent King ceased all communication. He remains physically present in the heavily
          guarded Citadel at the heart of the Core Systems, seated upon the Eternal Throne, but has not spoken or moved
          in 250 years.
        </p>
        <p>
          Despite his silence, his body shows no signs of decay or aging. The Council of Interpreters claims to receive
          his guidance through meditation and dreams, though this claim is the central point of contention between the
          Dominion and the Reformation.
        </p>
      </div>
    ),
  },
  "great-divide": {
    title: "The Great Divide",
    content: (
      <div className="space-y-4">
        <p>
          The Great Divide began approximately 150 years ago, when disagreements over the interpretation of the Silent
          King's will fractured the Council of Interpreters. What started as philosophical debate escalated into armed
          conflict within a decade.
        </p>
        <p>
          The conservative faction, believing in strict adherence to the King's last spoken commands, formed the
          Dominion. They maintain that the King's silence is a test of faith and that his will continues to be revealed
          to the worthy through visions and signs.
        </p>
        <p>
          The progressive faction, advocating for adaptation and evolution of the King's teachings, established the
          Reformation. They believe the King's silence indicates humanity should forge its own path while honoring his
          core principles.
        </p>
        <p>
          The Schism War that followed claimed millions of lives before settling into the current cold war. Both
          factions maintain control of roughly equal territory, with contested zones forming dangerous buffer regions
          between them.
        </p>
      </div>
    ),
  },
  "recent-history": {
    title: "Recent History",
    content: (
      <div className="space-y-4">
        <p>
          The last fifty years have seen an uneasy peace maintained through mutually assured destruction. Both the
          Dominion and Reformation possess planet-killing weapons that have only been deployed twice in history,
          creating the Dead Zones that serve as grim reminders of the stakes.
        </p>
        <p>
          Proxy conflicts continue in contested regions, with both sides funding insurgencies and conducting covert
          operations in enemy territory. The neutral frontier worlds have become increasingly important as both factions
          seek resources and strategic advantages.
        </p>
        <p>
          Recent developments include the discovery of new artifacts in the Shroud region, sparking renewed interest in
          the Silent King's origins. Additionally, reports of strange phenomena at the edges of known space have led
          some to speculate about the return of whatever civilization left the ancient ruins found throughout human
          territory.
        </p>
        <p>
          As tensions rise once again, many fear that a new full-scale war is inevitable. Both factions have been
          mobilizing forces and developing new weapons technologies, while claiming defensive postures.
        </p>
      </div>
    ),
  },
  // New FAQ content
  "tech-stack": {
    title: "Tech Stack",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What programming languages and frameworks are used in Sovereign Call?</strong>
        </p>
        <p>
          Sovereign Call is a testament to the passion and dedication of a small, independent team at Fallen Signal
          Studios. We're pushing the boundaries of what's possible with limited resources, relying on ingenuity and
          determination to bring our vision to life. Our server-side infrastructure is primarily written in C++ for the
          core game engine and Rust for high-performance services. Our web services and tools utilize TypeScript with
          Next.js, which is what powers this website.
        </p>
        <p>
          <strong>Q: How do you handle database requirements for an MMORPG?</strong>
        </p>
        <p>
          We use a combination of database technologies to meet different needs. PostgreSQL serves as our primary
          relational database for player accounts, character data, and persistent world state. Redis handles caching,
          real-time data, and session management. For certain high-throughput game metrics and analytics, we employ a
          custom time-series database solution.
        </p>
        <p>
          <strong>Q: How do you ensure the game can scale with player population?</strong>
        </p>
        <p>
          Our infrastructure is built on a microservices architecture deployed in Kubernetes clusters across multiple
          regions. This allows us to scale individual components independently based on demand. The game world itself is
          divided into shards with dynamic instancing technology that can spin up additional resources during peak
          times.
        </p>
      </div>
    ),
  },
  "game-engine": {
    title: "Game Engine",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: Is Sovereign Call using a custom engine or a commercial one?</strong>
        </p>
        <p>
          Sovereign Call is being brought to life by the small but mighty team at Fallen Signal Studios, and we're
          leveraging the power of Unreal Engine to achieve our AAA ambitions! As an indie team, we rely on the engine's
          robust toolset and our team's scrappy determination to create a truly immersive experience.
        </p>
        <p>
          <strong>Q: What advantages does using Unreal Engine provide?</strong>
        </p>
        <p>
          Unreal Engine allows us to seamlessly transition between space and planetary environments without loading
          screens. It also features advanced procedural generation for planets, asteroids, and space phenomena while
          maintaining consistent performance. The engine's networking capabilities are optimized for MMO gameplay with
          hundreds of players in the same area.
        </p>
        <p>
          <strong>Q: How do you handle graphics and rendering?</strong>
        </p>
        <p>
          Unreal Engine uses a hybrid rendering pipeline that combines rasterization for most gameplay elements with ray
          tracing for reflections, shadows, and global illumination where supported. We've developed a custom
          level-of-detail system that can render vast planetary landscapes and detailed character models with minimal
          performance impact.
        </p>
      </div>
    ),
  },
  "server-architecture": {
    title: "Server Architecture",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How are the game servers structured?</strong>
        </p>
        <p>
          Sovereign Call uses a distributed server architecture with specialized services handling different aspects of
          gameplay. The world is divided into interconnected zones, each managed by dedicated server clusters. This
          allows us to distribute the computational load and provide seamless transitions between areas.
        </p>
        <p>
          <strong>Q: How do you handle server maintenance and updates?</strong>
        </p>
        <p>
          We employ a rolling update system that allows us to patch most server components without taking the entire
          game offline. For major updates that require downtime, we schedule maintenance during off-peak hours across
          different regions. Our containerized infrastructure allows us to quickly roll back changes if issues are
          detected.
        </p>
        <p>
          <strong>Q: What measures are in place for server stability and reliability?</strong>
        </p>
        <p>
          We maintain redundant server clusters across multiple geographic regions with automatic failover systems. Our
          infrastructure includes comprehensive monitoring and alerting systems that can detect and respond to issues
          before they impact gameplay. Load balancing technology distributes players across server instances to prevent
          any single point of failure.
        </p>
      </div>
    ),
  },
  "client-optimization": {
    title: "Client Optimization",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What are the minimum and recommended system requirements?</strong>
        </p>
        <p>
          Minimum requirements include a quad-core CPU, 8GB RAM, and a DirectX 11 compatible GPU with 4GB VRAM. For the
          optimal experience, we recommend an 8-core CPU, 16GB RAM, and a DirectX 12 compatible GPU with 8GB VRAM. The
          game is designed to scale across a wide range of hardware, with extensive graphics options to tune
          performance.
        </p>
        <p>
          <strong>Q: How do you optimize the game for lower-end systems?</strong>
        </p>
        <p>
          We've implemented multiple rendering paths and dynamic resolution scaling that automatically adjusts based on
          performance metrics. Our LOD (Level of Detail) system is highly optimized to reduce geometric complexity at
          distance while maintaining visual fidelity. Additionally, we use adaptive texture streaming to manage memory
          usage efficiently.
        </p>
        <p>
          <strong>Q: How large is the game client and how are updates handled?</strong>
        </p>
        <p>
          The base game client is approximately 75GB, though our installation system allows players to download
          essential components first (about 25GB) and begin playing while the rest downloads in the background. Updates
          use a differential patching system that only downloads changed files, typically keeping patch sizes under 2GB
          even for major content updates.
        </p>
      </div>
    ),
  },
  "cross-platform": {
    title: "Cross-Platform Support",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: Which platforms will Sovereign Call be available on?</strong>
        </p>
        <p>
          Sovereign Call will launch on PC (Windows) first, with PlayStation 5 and Xbox Series X|S versions releasing
          within six months of the PC launch. We're also exploring cloud gaming options to make the game accessible on
          more devices in the future.
        </p>
        <p>
          <strong>Q: Will there be cross-play between platforms?</strong>
        </p>
        <p>
          Yes, we're committed to full cross-play between all supported platforms. Players on PC, PlayStation, and Xbox
          will share the same servers and can form groups regardless of their platform. Our UI and control schemes are
          designed to provide a fair experience across all platforms.
        </p>
        <p>
          <strong>Q: How do you handle the different control schemes across platforms?</strong>
        </p>
        <p>
          We've designed the combat and interface systems to work equally well with keyboard/mouse and controllers. The
          UI automatically adapts to the input method being used. For competitive play, we've carefully balanced
          abilities and controls to ensure no platform has an inherent advantage.
        </p>
      </div>
    ),
  },
  "design-principles": {
    title: "Core Design Principles",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What are the core design principles guiding Sovereign Call?</strong>
        </p>
        <p>
          Our design is guided by four key principles: Meaningful Choice, Consequential Gameplay, Social
          Interdependence, and Narrative Depth. Every feature we develop must support at least one of these pillars. We
          believe that player decisions should matter, both to individual progression and to the evolving game world.
        </p>
        <p>
          <strong>Q: How do you balance accessibility for new players with depth for veterans?</strong>
        </p>
        <p>
          We follow a "easy to learn, difficult to master" philosophy. Core gameplay mechanics are intuitive and guided
          by clear tutorials, while mastery comes from understanding the nuanced interactions between systems. We layer
          complexity gradually as players progress, introducing advanced mechanics only after basics are understood.
        </p>
        <p>
          <strong>Q: How important is player agency in your design?</strong>
        </p>
        <p>
          Player agency is central to our design philosophy. We want players to feel that their choices—from faction
          allegiance to moment-to-moment gameplay decisions—have meaningful impact on their experience and the game
          world. The factional conflict between the Dominion and Reformation is driven primarily by player actions
          rather than scripted events.
        </p>
      </div>
    ),
  },
  "balance-approach": {
    title: "Balance Philosophy",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How do you approach class and faction balance?</strong>
        </p>
        <p>
          Rather than pursuing perfect symmetrical balance, we embrace "rock-paper-scissors" design where each class and
          faction has distinct strengths and weaknesses. We balance around team composition and counters rather than
          individual power. Our goal is that every class feels uniquely powerful in certain situations while having
          clear vulnerabilities in others.
        </p>
        <p>
          <strong>Q: How frequently do you make balance adjustments?</strong>
        </p>
        <p>
          We follow a tiered approach to balance changes. Critical issues that break gameplay receive immediate
          hotfixes. Moderate balance concerns are addressed in bi-weekly patches. Larger systemic adjustments occur in
          seasonal updates (every 3-4 months) after extensive testing on our public test server.
        </p>
        <p>
          <strong>Q: How do you gather data for balance decisions?</strong>
        </p>
        <p>
          We use a combination of quantitative and qualitative methods. Our analytics platform tracks detailed metrics
          on class performance, faction balance, and economy health. This data is complemented by feedback from our
          player council, community forums, and professional players. Before implementing major changes, we test them on
          dedicated balance servers with focused player groups.
        </p>
      </div>
    ),
  },
  "narrative-design": {
    title: "Narrative Design",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How is the story developed and delivered in Sovereign Call?</strong>
        </p>
        <p>
          Our narrative is delivered through multiple layers. The core conflict between the Dominion and Reformation
          provides the backdrop, while regional storylines explore how this conflict affects different worlds. Personal
          stories adapt to player choices and faction allegiance. We use a mix of traditional quest text, in-game
          cinematics, environmental storytelling, and dynamic events to convey the narrative.
        </p>
        <p>
          <strong>Q: Can players influence the overall story direction?</strong>
        </p>
        <p>
          Yes, through our "Living World" system. Major world events have multiple possible outcomes determined by
          collective player actions. For example, a contested zone might fall under Dominion or Reformation control
          based on which faction completes more objectives during a campaign. These outcomes become permanent parts of
          the game's history and influence future storylines.
        </p>
        <p>
          <strong>Q: How do you balance narrative for solo players versus groups?</strong>
        </p>
        <p>
          We've designed parallel narrative tracks. Personal storylines focus on character development and can be
          experienced solo, while faction campaigns are designed for group play and advance the larger narrative. Key
          story moments are accessible to all players regardless of playstyle, though the context and perspective may
          differ based on how you engage with the content.
        </p>
      </div>
    ),
  },
  "progression-systems": {
    title: "Progression Systems",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How does character progression work in Sovereign Call?</strong>
        </p>
        <p>
          Progression in Sovereign Call is multi-faceted. Traditional level-based advancement unlocks core abilities and
          content, while the Augmentation system allows for horizontal progression and specialization. Additionally,
          faction reputation, crafting expertise, and exploration achievements provide alternative advancement paths
          that aren't tied to combat power.
        </p>
        <p>
          <strong>Q: Is there a level cap, and what happens at max level?</strong>
        </p>
        <p>
          The current level cap is 50, which can be reached in approximately 80-100 hours of gameplay. At max level, the
          focus shifts to Augmentation optimization, faction campaigns, endgame activities like Void Incursions and
          Citadel Raids, and competitive PvP in Contested Zones. Each seasonal update introduces new progression systems
          that extend endgame advancement.
        </p>
        <p>
          <strong>Q: How do you prevent power creep with new content releases?</strong>
        </p>
        <p>
          We use a calibrated progression model where new content adds breadth rather than strictly increasing power
          levels. New gear and augmentations offer alternative optimization paths rather than direct upgrades. When we
          do increase the power ceiling (typically once per year), we implement catch-up mechanisms to help returning
          players reach competitive viability quickly.
        </p>
      </div>
    ),
  },
  monetization: {
    title: "Monetization Approach",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What is the business model for Sovereign Call?</strong>
        </p>
        <p>
          Sovereign Call uses a buy-to-play model with optional cosmetic microtransactions. The base game purchase
          includes all core content and gameplay features. We release major expansions approximately once per year as
          paid updates, while smaller content patches are free for all players.
        </p>
        <p>
          <strong>Q: What types of items are available in the in-game store?</strong>
        </p>
        <p>
          Our store focuses exclusively on cosmetic items and convenience features that don't affect gameplay balance.
          This includes character appearances, ship skins, housing decorations, and social animations. We also offer
          account services like name changes and server transfers. We strictly avoid selling power, progression
          shortcuts, or exclusive gameplay content.
        </p>
        <p>
          <strong>Q: Do you offer a subscription option?</strong>
        </p>
        <p>
          We offer an optional "Sovereign's Pass" subscription that provides quality-of-life benefits like increased
          storage space, priority login queues during high-traffic periods, and a monthly stipend of store credits worth
          more than the subscription cost. All gameplay content remains accessible without a subscription.
        </p>
      </div>
    ),
  },
  "upcoming-features": {
    title: "Upcoming Features",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What major features are currently in development?</strong>
        </p>
        <p>
          Our current development focus is on the "Echoes of the Void" update, which will introduce the new Void
          Exploration system, the Technomancer class, and expanded crafting with Void-infused materials. We're also
          working on improvements to the faction warfare system with dynamic objectives and enhanced rewards.
        </p>
        <p>
          <strong>Q: When will player housing be implemented?</strong>
        </p>
        <p>
          The player housing system, called "Sovereign Domains," is scheduled for release in Q3 of this year. The
          initial implementation will include personal apartments in faction capitals and the ability to purchase larger
          properties in neutral territories. The system will feature extensive customization options and functional
          elements like crafting stations and trophy displays.
        </p>
        <p>
          <strong>Q: Are there plans for new playable races?</strong>
        </p>
        <p>
          While the core narrative of Sovereign Call focuses on humanity's divided factions, we are developing the
          "Evolved" system that will allow players to significantly alter their character's appearance and abilities
          through advanced augmentation. This will provide race-like diversity while maintaining narrative consistency.
          The first phase of this system is planned for our first major expansion.
        </p>
      </div>
    ),
  },
  "expansion-plans": {
    title: "Expansion Plans",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What can we expect from the first major expansion?</strong>
        </p>
        <p>
          Our first major expansion, tentatively titled "Beyond the Shroud," is scheduled for next year. It will
          introduce a new region of space beyond the mysterious Shroud, revealing more about the Silent King's origins.
          The expansion will include a level cap increase to 60, three new classes, a new faction of returned ancient
          humans, and a revolutionary ship customization system.
        </p>
        <p>
          <strong>Q: How many expansions do you have planned?</strong>
        </p>
        <p>
          We have a five-year content roadmap with three major expansions already outlined in detail. Each expansion
          will advance the core narrative of the Silent King and the faction conflict while introducing new regions,
          systems, and gameplay features. Beyond that, we have a framework for how the story could continue depending on
          player engagement and narrative choices.
        </p>
        <p>
          <strong>Q: Will expansions be required to stay competitive?</strong>
        </p>
        <p>
          While expansions will introduce new progression options and content, we're committed to ensuring that players
          can remain competitive in PvP even without the latest expansion. Core balance changes and system improvements
          will be implemented in the base game for all players, while expansions focus on new content and optional
          advancement paths.
        </p>
      </div>
    ),
  },
  "release-schedule": {
    title: "Release Schedule",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What is your typical update cadence?</strong>
        </p>
        <p>
          Our update schedule follows a tiered approach:
          <br />- Weekly: Hotfixes and minor adjustments
          <br />- Monthly: Content updates with new quests, events, and balance changes
          <br />- Quarterly: Season updates with new progression systems and mid-size features
          <br />- Yearly: Major expansions that significantly extend the game world and systems
        </p>
        <p>
          <strong>Q: When is the next major update scheduled?</strong>
        </p>
        <p>
          Our next major update, "Echoes of the Void," is scheduled for release in approximately six weeks. Before that,
          we'll have a final monthly update focusing on quality-of-life improvements and preparation for the new
          systems. We'll be running public tests of the new features on our test server starting next week.
        </p>
        <p>
          <strong>Q: Do you have scheduled maintenance periods?</strong>
        </p>
        <p>
          Regular maintenance occurs weekly during off-peak hours, typically Tuesdays from 3:00 AM to 6:00 AM UTC. We
          schedule these to minimize disruption across different time zones. Major updates that require extended
          downtime are announced at least two weeks in advance, with countdown timers in-game and on our website.
        </p>
      </div>
    ),
  },
  "content-updates": {
    title: "Content Update Cycle",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How do you decide what content to prioritize?</strong>
        </p>
        <p>
          Content prioritization is based on a combination of our narrative roadmap, player feedback, and gameplay
          metrics. We maintain a balance between different types of content (PvE, PvP, social, etc.) to ensure all
          playstyles receive regular updates. Our content committee, which includes representatives from different
          development teams and community managers, meets monthly to adjust priorities based on emerging needs.
        </p>
        <p>
          <strong>Q: How do seasonal events work?</strong>
        </p>
        <p>
          Seasonal events occur throughout the year, tied to both real-world seasons and in-game narrative moments. Each
          event typically runs for 2-3 weeks and features unique activities, rewards, and temporary changes to the game
          world. While some events return annually with new variations, we also introduce new events regularly to keep
          the experience fresh.
        </p>
        <p>
          <strong>Q: Do you ever revisit and update old content?</strong>
        </p>
        <p>
          Yes, we have a dedicated "Legacy Content" team that regularly reviews and refreshes older zones and
          activities. Each quarter, we select at least one older area to receive visual updates, narrative enhancements,
          and mechanical improvements to keep it relevant. This ensures that the entire game world remains vibrant and
          worth exploring regardless of its age.
        </p>
      </div>
    ),
  },
  "long-term-vision": {
    title: "Long-Term Vision",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What is your long-term vision for Sovereign Call?</strong>
        </p>
        <p>
          Our vision is to create a persistent sci-fi universe that evolves over at least a decade, with player actions
          shaping its history and development. We aim to expand beyond the initial conflict between the Dominion and
          Reformation to explore the greater mysteries of the galaxy, including the origins of the Silent King and the
          fate of the ancient civilizations that preceded humanity.
        </p>
        <p>
          <strong>Q: How will the core narrative evolve over time?</strong>
        </p>
        <p>
          The narrative will unfold in distinct chapters, each spanning roughly 1-2 years of real time. The current
          chapter focuses on the escalating conflict between factions and the discovery of new artifacts related to the
          Silent King. Future chapters will reveal more about the Silent King's origins, introduce new factions and
          regions beyond known space, and eventually build toward a resolution of the central mystery that has driven
          the conflict.
        </p>
        <p>
          <strong>Q: Do you have an "end game" planned?</strong>
        </p>
        <p>
          Rather than a definitive endpoint, we envision major narrative arcs that reach satisfying conclusions while
          opening new possibilities. We're designing the story so that major revelations and resolutions occur
          periodically, allowing players to experience complete narrative arcs while the larger universe continues to
          evolve. This approach ensures both narrative satisfaction and ongoing gameplay opportunities.
        </p>
      </div>
    ),
  },
  "feedback-process": {
    title: "Feedback Process",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How do you collect and process player feedback?</strong>
        </p>
        <p>
          We gather feedback through multiple channels: in-game surveys, our community forums, social media, the Player
          Council program, and analytics data. All feedback is categorized and tracked in our internal feedback
          management system. Community managers provide weekly summaries to the development team, and high-impact issues
          are escalated for immediate review.
        </p>
        <p>
          <strong>Q: How quickly do you typically respond to community concerns?</strong>
        </p>
        <p>
          Our response time varies based on the nature of the feedback. Critical issues like game-breaking bugs receive
          immediate attention, often with same-day communication and fixes within 24-48 hours. Balance concerns
          typically receive developer responses within a week, with changes implemented in the next appropriate patch
          cycle. Feature requests and quality-of-life suggestions are collected for monthly review meetings.
        </p>
        <p>
          <strong>Q: How transparent are you about development decisions?</strong>
        </p>
        <p>
          Transparency is a core value for our team. We publish detailed developer notes with each update explaining the
          reasoning behind significant changes. Our monthly developer livestreams address community questions directly,
          including discussions about decisions that may be controversial. While we can't always share everything due to
          spoilers or business considerations, we strive to explain our thought process whenever possible.
        </p>
      </div>
    ),
  },
  "community-events": {
    title: "Community Events",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What types of community events do you organize?</strong>
        </p>
        <p>
          We run several types of community events:
          <br />- In-game events like faction tournaments and special challenges
          <br />- Developer livestreams featuring Q&A sessions and content previews
          <br />- Community contests for fan art, screenshots, and stories
          <br />- Annual Sovereign Call Convention (SovCon) with panels and activities
          <br />- Charity fundraising events with special in-game rewards
        </p>
        <p>
          <strong>Q: Do you support player-organized events?</strong>
        </p>
        <p>
          We have a dedicated Community Events team that supports player initiatives. We offer an event application
          system where players can request GM support, special items, or temporary game modifications for their events.
          We also highlight player events in our community calendar and sometimes feature them in our official social
          media channels.
        </p>
        <p>
          <strong>Q: Are there in-game tools for organizing community events?</strong>
        </p>
        <p>
          Yes, we've developed several in-game systems to facilitate player events. The Guild Hall system allows for
          customizable spaces for gatherings, while the Event Broadcasting tool lets organizers create announcements
          visible to interested players. For larger events, we offer the Instance Request system where players can apply
          for dedicated server instances with customizable parameters.
        </p>
      </div>
    ),
  },
  "beta-testing": {
    title: "Beta Testing",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How can players participate in beta testing?</strong>
        </p>
        <p>
          We maintain a Public Test Server (PTS) that's accessible to all active players. Major features are deployed to
          the PTS 2-4 weeks before their live release. Additionally, we run a Focused Testing Program where selected
          players are invited to test specific features earlier in development. Players can apply for this program
          through our website, with selections based on play history, feedback quality, and system specifications.
        </p>
        <p>
          <strong>Q: Are there rewards for participating in beta tests?</strong>
        </p>
        <p>
          Yes, we reward active testers in several ways. All PTS participants receive special titles and cosmetic items
          that recognize their contribution. Those who submit high-quality bug reports or detailed feedback earn
          additional rewards. Members of the Focused Testing Program receive exclusive cosmetics and early access to
          certain features, as well as direct communication channels with developers.
        </p>
        <p>
          <strong>Q: How much does beta feedback influence the final release?</strong>
        </p>
        <p>
          Beta feedback is integral to our development process. We've delayed feature releases when testing revealed
          significant issues, and we've made substantial design changes based on tester feedback. After each testing
          cycle, we publish a "Testing Impact Report" that highlights specific changes made in response to player input,
          demonstrating how feedback directly shapes the game.
        </p>
      </div>
    ),
  },
  "bug-reporting": {
    title: "Bug Reporting",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What's the best way to report bugs?</strong>
        </p>
        <p>
          The most effective way to report bugs is through our in-game bug reporting tool (accessed via the ESC menu),
          which automatically captures relevant system information and character state. For more complex issues, our
          website features a detailed bug submission form where players can upload screenshots, videos, and step-by-step
          reproduction instructions.
        </p>
        <p>
          <strong>Q: How are bug reports prioritized?</strong>
        </p>
        <p>
          Bug reports are triaged based on several factors:
          <br />- Severity (game-breaking issues receive highest priority)
          <br />- Scope (how many players are affected)
          <br />- Reproducibility (consistently reproducible bugs are easier to fix)
          <br />- Impact on gameplay experience
          <br />
          Our QA team reviews all submissions and assigns priority levels that determine which development team handles
          the issue and how quickly.
        </p>
        <p>
          <strong>Q: Do you acknowledge when players find significant bugs?</strong>
        </p>
        <p>
          Yes, we credit players who discover significant bugs or security vulnerabilities. Our patch notes specifically
          mention players who reported issues that led to fixes. For security vulnerabilities, we have a formal Bug
          Bounty program that provides substantial rewards for responsible disclosure of potential exploits or security
          concerns.
        </p>
      </div>
    ),
  },
  "player-council": {
    title: "Player Council",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: What is the Player Council and how does it work?</strong>
        </p>
        <p>
          The Player Council is a selected group of 30 players who serve as representatives of different playstyles and
          community segments. Council members participate in regular meetings with developers, receive early information
          about upcoming features (under NDA), and provide structured feedback on development plans. The council rotates
          membership every six months to ensure diverse perspectives.
        </p>
        <p>
          <strong>Q: How are Player Council members selected?</strong>
        </p>
        <p>
          Selection occurs through a combination of application and invitation. Players can apply through our website
          during open application periods. We select members based on their game experience, communication skills, and
          representation of different playstyles (PvE, PvP, roleplay, etc.). We deliberately include both veteran
          players and newer voices to ensure balanced feedback.
        </p>
        <p>
          <strong>Q: How much influence does the Player Council have?</strong>
        </p>
        <p>
          The Council serves in an advisory capacity rather than having direct decision-making power. However, their
          input has significantly influenced many features and systems. Developers are required to review and respond to
          Council feedback, even if they ultimately take a different direction. The Council's greatest impact is often
          in identifying potential issues early in development, before features are publicly announced.
        </p>
      </div>
    ),
  },
  "dev-team": {
    title: "Development Team",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How large is the development team?</strong>
        </p>
        <p>
          The core development team consists of approximately 120 full-time developers across various disciplines:
          programming, art, design, writing, QA, community management, and operations. This is supplemented by
          specialized contractors for specific components like orchestral music composition and motion capture. The team
          has grown steadily since the project began five years ago.
        </p>
        <p>
          <strong>Q: Where is the development team located?</strong>
        </p>
        <p>
          Our main Fallen Signal Studios is located in Seattle, Washington, with a secondary Fallen Signal Studios in
          Montreal, Canada. We also have a distributed workforce with team members in 14 countries across North America,
          Europe, and Asia. We operate on a hybrid model where some roles are Fallen Signal Studios-based while others
          are fully remote, with regular in-person gatherings for team building and intensive development sprints.
        </p>
        <p>
          <strong>Q: Do you have any notable industry veterans on the team?</strong>
        </p>
        <p>
          Our team includes veterans from several major MMO and RPG Fallen Signal Studios, including former leads from
          games like World of Warcraft, EVE Online, Guild Wars 2, and Mass Effect. However, we've deliberately built a
          team that balances experienced developers with fresh talent bringing new perspectives. We believe this
          combination helps us respect genre traditions while innovating in meaningful ways.
        </p>
      </div>
    ),
  },
  "studio-history": {
    title: "Studio History",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: When was the Fallen Signal Studios founded and what's its background?</strong>
        </p>
        <p>
          Nexus Realms Fallen Signal Studios was founded in 2018 by a group of developers with extensive experience in
          both MMORPGs and single-player RPGs. The founding team had previously worked together at larger Fallen Signal
          Studios but wanted to create a game that combined the social depth of MMOs with the narrative richness of
          single-player experiences. Sovereign Call has been our primary focus since inception.
        </p>
        <p>
          <strong>Q: How is the Fallen Signal Studios funded?</strong>
        </p>
        <p>
          The Fallen Signal Studios began with private investment from the founding team and angel investors with gaming
          industry experience. In 2020, we secured a larger round of funding from strategic partners who share our
          vision for long-term development. We've maintained creative independence while benefiting from the business
          expertise and stability this partnership provides.
        </p>
        <p>
          <strong>Q: Has the Fallen Signal Studios released other games before Sovereign Call?</strong>
        </p>
        <p>
          Sovereign Call is our first major release as Nexus Realms Fallen Signal Studios. However, to refine our
          technology and processes, we developed two smaller projects: "Void Explorers," a single-player space
          exploration game that tested our engine's capabilities, and "Nexus Tactics," a mobile strategy game set in the
          same universe as Sovereign Call. These projects helped us establish our development pipeline while building
          the foundation of our game world.
        </p>
      </div>
    ),
  },
  "hiring-process": {
    title: "Hiring Process",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: Are you currently hiring, and what positions are available?</strong>
        </p>
        <p>
          We're continuously growing our team as development expands. Current openings include positions in combat
          design, environmental art, backend engineering, and community management. All open positions are listed on the
          Careers section of our website, with new opportunities posted regularly as our needs evolve.
        </p>
        <p>
          <strong>Q: What is your hiring process like?</strong>
        </p>
        <p>
          Our hiring process typically involves:
          <br />
          1. Initial application review
          <br />
          2. Portfolio assessment (for creative roles) or technical screening (for engineering roles)
          <br />
          3. First interview focusing on experience and team fit
          <br />
          4. Practical assessment or design challenge relevant to the role
          <br />
          5. Final panel interview with team members and leadership
          <br />
          We aim to make decisions within 3-4 weeks of initial application.
        </p>
        <p>
          <strong>Q: Do you hire players from the community?</strong>
        </p>
        <p>
          Yes, we've hired several team members directly from our player community, particularly in community
          management, QA, and design roles. We value the deep understanding of our game that comes from being an active
          player. That said, all candidates go through the same rigorous evaluation process, as passion for the game
          must be complemented by relevant skills and experience.
        </p>
      </div>
    ),
  },
  "work-culture": {
    title: "Work Culture",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: How would you describe Fallen Signal Studios's work culture?</strong>
        </p>
        <p>
          Our culture emphasizes collaboration, creativity, and sustainable development practices. We organize our teams
          into small, cross-functional groups that own specific features or systems from concept to implementation. We
          value diverse perspectives and encourage open discussion of ideas at all levels. While we're passionate about
          our work, we maintain a strict no-crunch policy to ensure team wellbeing and long-term productivity.
        </p>
        <p>
          <strong>Q: How do you handle the challenges of live service development?</strong>
        </p>
        <p>
          We've structured our team to balance ongoing live support with new feature development. Dedicated "Live Ops"
          teams handle immediate player needs and game stability, while feature teams work on longer-term additions. We
          rotate developers between these focuses to prevent burnout and ensure everyone understands both immediate
          player concerns and long-term vision.
        </p>
        <p>
          <strong>Q: What development methodologies do you use?</strong>
        </p>
        <p>
          We employ a modified Agile approach with two-week sprints for most teams, though some specialized groups like
          narrative and concept art work on different cadences better suited to their disciplines. We hold brief daily
          standups, bi-weekly planning sessions, and end-of-sprint retrospectives to continuously improve our processes.
          Feature development follows a stage-gate process with regular reviews to ensure quality and alignment with our
          overall vision.
        </p>
      </div>
    ),
  },
  partnerships: {
    title: "Partnerships",
    content: (
      <div className="space-y-4">
        <p>
          <strong>Q: Do you collaborate with other Fallen Signal Studios or companies?</strong>
        </p>
        <p>
          We maintain strategic partnerships with several technology providers who help power specific aspects of
          Sovereign Call. This includes specialized middleware for physics simulation, audio processing, and network
          infrastructure. We also collaborate with external art Fallen Signal Studios for certain asset creation,
          allowing our internal team to focus on the most distinctive visual elements of our world.
        </p>
        <p>
          <strong>Q: Have you considered crossover events with other games or media?</strong>
        </p>
        <p>
          We're open to thoughtful collaborations that make narrative sense within our universe. Rather than simple
          cosmetic crossovers, we prefer partnerships that can be meaningfully integrated into our lore. We're currently
          developing our first major collaboration with a popular sci-fi franchise that will be announced later this
          year, which will include both in-game content and expanded universe storytelling.
        </p>
        <p>
          <strong>Q: Do you work with content creators and streamers?</strong>
        </p>
        <p>
          Yes, we have an established Creator Partnership Program that supports content creators covering Sovereign
          Call. Partners receive early access to information, developer interviews, custom promotional codes for their
          audiences, and in some cases, unique in-game items to give away. We select partners based on content quality,
          community engagement, and alignment with our values rather than simply audience size.
        </p>
      </div>
    ),
  },
  // Additional lore content entries for other items would go here
}

// Default lore item to display
const defaultLoreItem = "origin"

export default function LorePage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("World History")
  const [selectedItem, setSelectedItem] = useState<string>(defaultLoreItem)

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  const selectItem = (itemId: string) => {
    setSelectedItem(itemId)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Sovereign Call Lore</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Flyout Menu */}
        <div className="lg:w-1/4 bg-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/10">
          <div className="sticky top-20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Lore Compendium
            </h2>

            <div className="space-y-2">
              {loreCategories.map((category) => (
                <div key={category.name} className="border-b border-white/10 pb-2">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded transition-colors"
                  >
                    <span className="font-medium flex items-center gap-2">
                      {category.icon && <category.icon className="h-4 w-4" />}
                      {category.name}
                    </span>
                    {expandedCategory === category.name ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedCategory === category.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 space-y-1 mt-1">
                          {category.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => selectItem(item.id)}
                              className={cn(
                                "w-full text-left p-2 rounded text-sm transition-colors",
                                selectedItem === item.id ? "bg-primary/20 text-primary" : "hover:bg-white/5",
                              )}
                            >
                              {item.title}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-3/4">
          <div className="bg-black/20 rounded-lg p-6 backdrop-blur-sm border border-white/10 min-h-[600px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedItem}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-6 text-primary">
                  {loreContent[selectedItem]?.title || "Lore Entry"}
                </h2>
                <div className="prose prose-invert max-w-none">
                  {loreContent[selectedItem]?.content || <p>This lore entry is yet to be discovered...</p>}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Faction Statistics Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-6 text-center">Galactic Conflict Status</h2>
            <FactionStatistics />
          </div>
        </div>
      </div>
    </div>
  )
}
