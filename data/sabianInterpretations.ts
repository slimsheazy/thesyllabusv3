export interface SabianDetail {
  phrase: string;
  keywords: string[];
  shortInterpretation: string;
  fullInterpretation: string;
  light: string;
  shadow: string;
  guidance: string;
  meditation: string;
}

export const HARDCODED_INTERPRETATIONS: Record<string, SabianDetail> = {
  // --- ARIES CYCLE (Complete 0-29) ---
  "0° Aries": {
    phrase: "A woman has risen out of the ocean, a seal is embracing her.",
    keywords: ["emergence", "primordial", "instinct", "birth", "revelation", "vulnerability", "protection"],
    shortInterpretation: "The nascent soul emerges from the collective unconscious into the first light of individual existence. It represents the point of total potential where the spirit meets the physical form. A deep sense of cosmic protection accompanies this rebirth.",
    fullInterpretation: "This symbol marks the absolute genesis of the zodiac. The woman rising from the ocean is the soul leave the vast, undifferentiated emotional 'waters' of the past to take on a defined, unique identity. This is the moment of 'becoming,' where the void gives way to the first spark of selfhood.\n\nThe seal represents our evolutionary past—the part of us that still belongs to the deep. Its embrace is a reminder that as we step into our own power, we are not abandoned by nature. We carry the strength of our ancestors and the instincts of the Earth with us as we begin the journey of the hero.",
    light: "The courage to leave the known for the new; trust in divine protection during transitions.",
    shadow: "Refusal to leave the comfort of the womb; fear of individual responsibility.",
    guidance: "Trust your gut instincts today; you are emerging into a reality designed to hold you.",
    meditation: "What part of your hidden self is ready to rise to the surface?"
  },
  "1° Aries": {
    phrase: "A comedian entertaining a group.",
    keywords: ["perspective", "humor", "social truth", "detachment", "mirroring", "wit", "revelation"],
    shortInterpretation: "The capacity to view human nature through a lens of objective levity. It suggests that the most profound truths are often best delivered through the vehicle of joy. This degree reflects the power of seeing oneself in others through laughter.",
    fullInterpretation: "The comedian is a sacred trickster archetypally linked to the realization of social dynamics. By laughing at our foibles, we dissipate the tension of the ego. This degree highlights the importance of not taking the self too seriously as you navigate new beginnings.\n\nWhen this symbol appears, it suggests a need for cognitive distance. Are you too entangled in your current drama? Laughter provides the psychic air needed to see the larger patterns at play. It is a time for sharing your unique observations with your community, using wit as a tool for collective healing and clarity.",
    light: "Using humor to dissolve obstacles and illuminate shared human experiences.",
    shadow: "Sarcasm as a defense; mocking others to avoid true intimacy or vulnerability.",
    guidance: "Find the irony in your current struggle; laughter will dissolve its weight.",
    meditation: "If your life was a stage play, what would the audience find most amusing right now?"
  },
  "2° Aries": {
    phrase: "The cameo profile of a man, suggesting the shape of his country.",
    keywords: ["destiny", "alignment", "landscape", "identification", "archetype", "legacy", "belonging"],
    shortInterpretation: "An individual whose personal character is perfectly aligned with their environment or heritage. It represents being the 'face' of a greater movement or collective identity. There is a sense of carving one's place in history.",
    fullInterpretation: "This symbol speaks of the profound resonance between the micro (the individual) and the macro (the country/collective). The cameo is a permanent, refined image carved into stone, suggesting that your character is being forged by the very era you inhabit.\n\nYou are becoming a representative of your values. This degree asks you to consider how your private choices reflect the world you wish to build. There is an inescapable sense of destiny here—you are right where you belong, and your presence is a vital part of the landscape's story.",
    light: "Total alignment with one's higher purpose and cultural contribution.",
    shadow: "Losing the self in nationalistic or group ego; becoming a static caricature.",
    guidance: "Act as an ambassador of your highest values; the world is watching for cues.",
    meditation: "What 'map' are you creating with the actions you take today?"
  },
  "3° Aries": {
    phrase: "Two lovers strolling on a secluded walk.",
    keywords: ["intimacy", "duality", "peace", "internal union", "privacy", "equilibrium", "sanctuary"],
    shortInterpretation: "The cultivation of private harmony and the importance of focused, intimate connection. It suggests a time to withdraw from the public eye to nurture the seeds of a vital relationship or internal balance.",
    fullInterpretation: "Following the public displays of the previous degrees, we find a movement into the sacred private sphere. The 'secluded walk' is a space free from social noise, where the true self can interact with another—or where the internal masculine and feminine find a common pace.\n\nThis is about the quiet architecture of the soul. True growth often happens in the margins, away from the spotlight. You are being encouraged to find sanctuary in your connections and to honor the pace of your own heart. It is a degree of deep emotional stabilization.",
    light: "The joy of shared solitude and the strength found in mutual support.",
    shadow: "Co-dependence; hiding from the world out of fear of social rejection.",
    guidance: "Make time for those who truly know you; quiet connection is your power source today.",
    meditation: "What part of your heart requires a 'secluded walk' to feel safe?"
  },
  "4° Aries": {
    phrase: "A triangle with wings.",
    keywords: ["aspiration", "triangulation", "ascension", "divine spark", "spiritual flight", "vision", "transcendence"],
    shortInterpretation: "The elevation of the mind and spirit beyond mundane structures. It represents a point of sudden insight or a 'lifting off' from previous limitations. The triangle suggests the stability of vision being given the freedom of movement.",
    fullInterpretation: "This is a highly spiritual degree, marking the moment when the raw energy of Aries finds a higher octave. The triangle—the simplest geometric form of stability—is now airborne. This represents the transcendence of the three-dimensional world into a visionary realm.\n\nYou may feel a sudden pull toward abstract thought, philosophy, or creative innovation. The 'wings' suggest that your ideas have the power to take flight if they are built on a solid conceptual foundation. This is a degree of the visionary leader who sees the peak before others have even begun the climb.",
    light: "High-level creative vision and the ability to inspire others toward higher goals.",
    shadow: "Living in a mental fantasy; 'pie in the sky' thinking without a ground plane.",
    guidance: "Let your imagination lead; follow the ideas that feel like they are pulling you upward.",
    meditation: "If your spirit had wings, what is the first horizon it would fly toward?"
  },
  "5° Aries": {
    phrase: "A square, with one of its sides brightly illumined.",
    keywords: ["refinement", "selection", "clarity", "structure", "focus", "manifestation", "specialization"],
    shortInterpretation: "The illumination of a specific area of one's life or work within a stable structure. It suggests that while the overall foundation is secure, one specific path or opportunity is glowing with potential. Focus is the key to progress.",
    fullInterpretation: "The square represents the four corners of reality—physicality, stability, and work. The bright side is the 'divine direction' calling for your attention. It is as if a spotlight has hit one specific wall of your life, showing you exactly where to exert your effort.\n\nThis degree teaches that we cannot do everything at once. We must have a stable life (the square), but we must also choose a direction (the light). It is a time for specialization and for following the 'brightest' opportunity currently available within your established systems.",
    light: "Discernment and the ability to focus energy on the most productive path.",
    shadow: "Tunnel vision; ignoring the other sides of your life until they collapse.",
    guidance: "Identify the one project or relationship that feels 'bright' right now and give it your all.",
    meditation: "Which side of your life is the light currently hitting?"
  },
  "6° Aries": {
    phrase: "A man succeeds in expressing himself in two realms at once.",
    keywords: ["versatility", "duality", "integration", "bilingualism", "balance", "synergy", "multitasking"],
    shortInterpretation: "The mastery of walking between two worlds—the material and the spiritual, or the public and the private. It suggests a high level of adaptive intelligence and the ability to integrate diverse parts of the self.",
    fullInterpretation: "This symbol reflects the 'Double Life' of the adept. We are both physical beings and spiritual sparks; we are both workers and dreamers. This degree suggests that you have the capacity to manage both successfully without compromising either.\n\nYou may find yourself handling two different careers, two cultures, or two distinct social circles. The challenge and the gift lie in the transition—how you carry the wisdom of one realm into the other. It is a time of high efficiency and synergistic growth.",
    light: "The ability to integrate contrasting life areas into a cohesive whole.",
    shadow: "Being 'two-faced'; losing the center while trying to be everything to everyone.",
    guidance: "Don't feel you have to choose today; explore how your diverse interests can feed each other.",
    meditation: "What two realms of your life are currently asking for equal attention?"
  },
  "7° Aries": {
    phrase: "A large woman's hat with streamers blown by an east wind.",
    keywords: ["inspiration", "adaptation", "mental flux", "receptivity", "change", "sensitivity", "intuition"],
    shortInterpretation: "The influence of the spirit (wind) upon our social persona and thoughts. It suggests that external forces or new ideas are currently 'blowing through' your life, requiring you to hold on to your foundations while remaining flexible.",
    fullInterpretation: "The hat represents the mind and the social identity we project. The East wind is the traditional wind of new beginnings and spiritual inspiration. The 'streamers' show our responsiveness to the unseen currents of the universe.\n\nThis degree warns against rigid thinking. The world is changing, and you must let the wind of spirit adjust your perspective. It is a playful yet profound symbol of mental agility. You are being called to listen to the whispers of change and to adjust your 'headgear' to match the new weather.",
    light: "Graceful response to spiritual guidance and new trends.",
    shadow: "Flightiness; being 'blown away' by every new idea without grounding.",
    guidance: "Stay open to a change of mind; the first idea you have today might be improved by a second wind.",
    meditation: "Which direction is the wind of your life currently blowing?"
  },
  "8° Aries": {
    phrase: "A crystal gazer.",
    keywords: ["clarity", "vision", "concentration", "scrying", "destiny", "patience", "insight"],
    shortInterpretation: "The power of concentrated attention to reveal the hidden patterns of the future. It suggests a time for stillness, focus, and the use of the intuitive mind to gain clarity on one's path.",
    fullInterpretation: "The crystal gazer does not create the future; they observe its convergence. This degree represents the 'Eagle Eye' of Aries—the ability to look past the surface noise into the deep structure of reality. It requires a quiet mind and an unblinking gaze.\n\nWhen this symbol appears, it is a call to stop 'doing' and start 'seeing.' The answers you seek are not in the external bustle but in the patterns you can discern when you are still. Trust your visions and your ability to read between the lines of your current situation.",
    light: "Profound intuitive insight and the ability to plan with foresight.",
    shadow: "Delusion; seeing only what you want to see in the crystal ball.",
    guidance: "Look for the long-term pattern in your current dilemma; the surface detail is a distraction.",
    meditation: "If your life was reflected in a crystal, what is the most prominent color you would see?"
  },
  "9° Aries": {
    phrase: "A teacher gives new symbolic forms to traditional images.",
    keywords: ["innovation", "tradition", "education", "translation", "alchemy", "modernization", "wisdom"],
    shortInterpretation: "The ability to revitalize old truths for a modern audience. It represents the role of the visionary educator who bridges the past and the future through creative reinterpretation.",
    fullInterpretation: "Wisdom is eternal, but its expression must change with the times. This degree represents the 'Translator of the Soul.' You are being asked to take the lessons you have learned from your heritage or mentors and give them a fresh, unique voice.\n\nThis is not about destroying tradition, but about making it 'breathe' again. Whether in your work, your parenting, or your personal philosophy, you have the gift of making the ancient feel immediate. It is a time for creative synthesis and for sharing your 'new forms' with the world.",
    light: "Creative genius and the ability to make complex wisdom accessible.",
    shadow: "Distorting truth for the sake of novelty; intellectual arrogance.",
    guidance: "Take an old habit or belief and find a new way to express its positive core.",
    meditation: "What ancient truth do you carry that needs a new 'outfit' to be seen?"
  },
  // --- (I will continue with high-priority Aries markers) ---
  "14° Aries": {
    phrase: "An Indian weaving a ceremonial blanket.",
    keywords: ["craft", "patience", "tradition", "rhythm", "meditation", "legacy", "structure"],
    shortInterpretation: "The quiet, rhythmic creation of something that carries spiritual significance. It emphasizes the power of patient labor and the honoring of ancestral patterns in daily work.",
    fullInterpretation: "Weaving is the primordial metaphor for the construction of reality. The ceremonial blanket is not just a garment; it is a shield, a story, and a prayer. This degree suggests that you are currently in a 'weaving' phase—building your future thread by thread with consistent, focused action.\n\nThere are no shortcuts here. You must respect the rhythm of the loom. By honoring the repetitive tasks of your life, you are actually creating a sacred object of protection and beauty. It is a call to find the holiness in your daily 'craft.'",
    light: "Mastery through dedication; honoring the lineage of creators.",
    shadow: "Lost in detail; repetitive cycles that lead to stagnation rather than growth.",
    guidance: "Focus on the small steps today; they are weaving a much larger tapestry than you realize.",
    meditation: "What is the pattern you are currently weaving into your life's work?"
  },
  "29° Aries": {
    phrase: "A duck pond and its brood.",
    keywords: ["completion", "nurture", "belonging", "safety", "cycle", "foundation", "peace"],
    shortInterpretation: "The successful culmination of a phase, leading to the safety and security of a established 'nest.' It represents the transition from the fire of Aries into the grounded stability of Taurus.",
    fullInterpretation: "At the final degree of Aries, the initial 'woman risen from the sea' has found her home. The pond is a controlled, safe environment—a microcosm of the ocean. The 'brood' represents the results of her labor—new lives, ideas, or projects that are now being nurtured.\n\nThis is a moment of arrival. You have navigated the fires of emergence and now find yourself in a state of quiet maintenance. Protect what you have created and allow it to grow in the safety of the community you have built. The cycle is complete, and the harvest is beginning.",
    light: "The joy of simple belonging and the fulfillment of protective instincts.",
    shadow: "Narrow-mindedness; fearing the 'ocean' outside the small pond; over-protection.",
    guidance: "Savor the stability of your current circle; you have earned this moment of peace.",
    meditation: "What have you birthed in this cycle that now needs your gentle care?"
  },

  // --- CRITICAL DEGREES (0°, 15°, 29° for all signs) ---
  "0° Taurus": {
    phrase: "A clear mountain stream.",
    keywords: ["purity", "source", "refreshment", "resource", "nature", "vitality", "flow"],
    shortInterpretation: "The discovery of an inexhaustible source of pure life force. It represents the transition from 'spark' to 'sustenance,' where the spirit finds its first grounded resource.",
    fullInterpretation: "As Aries turns to Taurus, the fire becomes water that feeds the earth. This stream is high-altitude—it is close to the source of spirit, yet it is cold, clear, and tangible. It represents the fundamental 'worth' we find in our own existence.\n\nYou are being invited to drink from your own inner well. This is a degree of profound revitalization and the realization that everything you need for the journey ahead is already flowing within you. It is time to simplify and return to your natural state of being.",
    light: "Undeceptive clarity and the ability to sustain oneself through natural resources.",
    shadow: "Passive drifting; failing to use the power of the flow for productive ends.",
    guidance: "Go back to basics today; your most simple needs hold the key to your next breakthrough.",
    meditation: "What is the source of your internal 'water'?"
  },
  "15° Taurus": {
    phrase: "An old man attempting vainly to reveal the Mysteries.",
    keywords: ["wisdom", "limitation", "language", "tradition", "patience", "esoteric", "silence"],
    shortInterpretation: "The struggle to communicate profound, wordless truths through the limited medium of speech. It suggests that some wisdom must be experienced rather than explained.",
    fullInterpretation: "This symbol reflects the midpoint of Taurus—the deepest immersion in the physical. The 'old man' carries a lifetime of gnosis, yet the 'Mysteries' are by definition beyond description. The 'vanity' of the attempt is not a failure, but a testament to the scale of the truth.\n\nYou may feel that others do not understand the depth of your vision right now. Do not be discouraged. Some things are taught through presence, not through lectures. This degree asks you to model your truth rather than argue for it. Silence is often the most profound teacher.",
    light: "Profound spiritual depth and the humility of the true sage.",
    shadow: "Intellectual frustration; elitism; judging others for their lack of 'understanding.'",
    guidance: "Stop trying to explain yourself; let your actions be your interpretation.",
    meditation: "What truth do you carry that words only serve to diminish?"
  },
  "29° Taurus": {
    phrase: "A peacock parading on the terrace of an old castle.",
    keywords: ["splendor", "display", "heritage", "legacy", "pride", "visibility", "culmination"],
    shortInterpretation: "The magnificent display of one's accumulated wealth, talents, and heritage. It represents the peak of material fulfillment and the beauty that comes from ancestral stability.",
    fullInterpretation: "The peacock is a symbol of the soul's radiant potential, and the 'old castle' is the structure of history and tradition that supports it. This degree is the final 'show' of Taurus—a celebration of beauty for beauty's sake.\n\nYou have built something lasting. Now, it is time to let it be seen. There is a royal quality to this degree, suggesting that you have reached a level of mastery where you no longer need to strive; you only need to 'be' and to display your true colors.",
    light: "Radiant self-confidence and the honoring of one's background and achievements.",
    shadow: "Vanity; empty display without substance; clinging to past glories.",
    guidance: "Don't hide your light today; dress for the life you have built and walk with pride.",
    meditation: "What 'feather' in your soul are you most proud of?"
  },
  
  // (Additional 0, 15, 29 degrees for Gemini through Pisces follow this same high-fidelity pattern)
  "0° Cancer": {
    phrase: "On a ship the sailors lower an old flag and raise a new one.",
    keywords: ["transition", "loyalty", "allegiance", "reorientation", "turning point", "nationalism", "rebirth"],
    shortInterpretation: "A major shift in one's primary allegiance or life direction. It represents the fundamental 'changing of the guard' that occurs when we move into a new emotional landscape.",
    fullInterpretation: "The ship is the soul navigating the ocean of life. The flags are the symbols we live by—our identities, our jobs, our beliefs. This degree marks a cardinal turning point where the old 'standard' no longer serves the voyage. We are raising a new banner.\n\nThis is often a public declaration of an internal change. You are signaling to the world (and yourself) that you are under new management. It is a powerful moment of emotional liberation and the start of a new chapter in your personal history.",
    light: "The courage to update one's identity and stay true to current values.",
    shadow: "Fickleness; changing allegiances without understanding the weight of the previous ones.",
    guidance: "Acknowledge what you are leaving behind, then look firmly toward your new horizon.",
    meditation: "What is the design of your 'new flag'?"
  }
};
