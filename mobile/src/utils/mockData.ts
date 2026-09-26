import { Conversation, Memory } from "../types/chat";
import { StudyTask, Reminder, DocumentSummary, LectureNote } from "../types/study";
import { User } from "../types/auth";

export const MOCK_USER: User = {
  id: "usr-01",
  name: "Shivam",
  email: "shivam@alignsoul.co",
  preferredTone: "concise",
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-01",
    title: "Thermodynamics revision plan",
    createdAt: Date.now() - 2 * 3600 * 1000,
    updatedAt: Date.now() - 2 * 3600 * 1000,
    isPinned: true,
    messages: [
      {
        id: "m-01",
        conversationId: "conv-01",
        sender: "user",
        text: "Pull up my notes on thermodynamics from last week and quiz me on entropy.",
        timestamp: Date.now() - 7200000,
      },
      {
        id: "m-02",
        conversationId: "conv-01",
        sender: "aura",
        text: "Found it — you covered entropy and the second law on Tuesday. Quick one to start: Why does entropy of an isolated system never decrease?",
        timestamp: Date.now() - 7100000,
        memoryReferences: ["Referenced 3 memories", "Thermo_Ch4.pdf"],
      },
      {
        id: "m-03",
        conversationId: "conv-01",
        sender: "user",
        text: "Because natural processes move toward the most probable macrostate.",
        timestamp: Date.now() - 7000000,
      },
      {
        id: "m-04",
        conversationId: "conv-01",
        sender: "aura",
        text: "Exactly right — that's the statistical view. For your exam formulation, remember: ΔS_universe ≥ 0.",
        timestamp: Date.now() - 6900000,
      },
    ],
  },
  {
    id: "conv-02",
    title: "Debugging the Expo build",
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    messages: [
      {
        id: "m-05",
        conversationId: "conv-02",
        sender: "user",
        text: "How do I configure Android permissions for Bluetooth LE in React Native?",
        timestamp: Date.now() - 86400000,
      },
      {
        id: "m-06",
        conversationId: "conv-02",
        sender: "aura",
        text: "On Android 12+ (API 31+), declare BLUETOOTH_SCAN with android:usesPermissionFlags=\"neverForLocation\" and BLUETOOTH_CONNECT in your AndroidManifest.xml.",
        timestamp: Date.now() - 86350000,
      },
    ],
  },
  {
    id: "conv-03",
    title: "Cover letter draft",
    createdAt: Date.now() - 90000000,
    updatedAt: Date.now() - 90000000,
    messages: [
      {
        id: "m-07",
        conversationId: "conv-03",
        sender: "user",
        text: "Review the intro to my AI systems engineer cover letter.",
        timestamp: Date.now() - 90000000,
      },
      {
        id: "m-08",
        conversationId: "conv-03",
        sender: "aura",
        text: "Strong opening. Highlight your hands-on experience building the AURA wearable BLE pipeline and real-time voice integration.",
        timestamp: Date.now() - 89900000,
      },
    ],
  },
];

export const MOCK_MEMORIES: Memory[] = [
  {
    id: "mem-01",
    content: "Prefers concise, bulleted answers over long prose",
    timestamp: Date.now() - 3600000,
    importance: "high",
    tags: ["Preferences"],
  },
  {
    id: "mem-02",
    content: "Mid-terms start November 4th — exam on cryptography and thermodynamics",
    timestamp: Date.now() - 86400000,
    importance: "high",
    tags: ["Academics", "Pinned"],
  },
  {
    id: "mem-03",
    content: "Works late, mornings are slow (peak focus 9:00 PM - 2:00 AM)",
    timestamp: Date.now() - 172800000,
    importance: "medium",
    tags: ["Routine"],
  },
  {
    id: "mem-04",
    content: "Building AURA wearable assistant in React Native with Android BLE",
    timestamp: Date.now() - 250000000,
    importance: "high",
    tags: ["Academics", "Work"],
  },
];

export const MOCK_TASKS: StudyTask[] = [
  {
    id: "task-01",
    subjectName: "Thermodynamics",
    title: "Review Carnot efficiency & entropy derivations",
    deadline: "Tomorrow, 5:00 PM",
    priority: "high",
    completed: false,
    createdAt: Date.now() - 10000000,
  },
  {
    id: "task-02",
    subjectName: "Computer Networks",
    title: "Solve 10 TCP vs UDP packet handshake questions",
    deadline: "Friday, 11:59 PM",
    priority: "medium",
    completed: true,
    createdAt: Date.now() - 20000000,
  },
  {
    id: "task-03",
    subjectName: "Cryptography",
    title: "Read Chapter 4: RSA key exchange & elliptic curves",
    deadline: "Nov 3, 2:00 PM",
    priority: "high",
    completed: false,
    createdAt: Date.now() - 30000000,
  },
];

export const MOCK_REMINDERS: Reminder[] = [
  {
    id: "rem-01",
    title: "Quiz prep session with AURA on entropy",
    dueTime: "Today, 8:00 PM",
    completed: false,
    tag: "Academics",
  },
  {
    id: "rem-02",
    title: "Charge AURA wearable device",
    dueTime: "Today, 10:30 PM",
    completed: false,
    tag: "Device",
  },
  {
    id: "rem-03",
    title: "Submit draft research methodology",
    dueTime: "Completed yesterday",
    completed: true,
    tag: "Thesis",
  },
];

export const MOCK_DOCUMENTS: DocumentSummary[] = [
  {
    id: "doc-01",
    fileName: "Thermo_Ch4.pdf",
    fileSizeMb: 4.2,
    totalPages: 42,
    status: "ready",
    summary:
      "Comprehensive chapter on the Second Law of Thermodynamics, entropy definitions, Clausius inequality, and Carnot heat engine efficiency.",
    keySections: [
      {
        title: "Carnot Engine & Efficiency",
        pages: "p.14–17",
        snippet: "Maximum theoretical efficiency is given by η = 1 - (Tc / Th).",
      },
      {
        title: "Entropy & Macrostate Probability",
        pages: "p.22–29",
        snippet: "Statistical definition S = k ln Ω where Ω is the number of microstates.",
      },
    ],
    uploadedAt: Date.now() - 86400000 * 2,
  },
  {
    id: "doc-02",
    fileName: "Networking_Protocols.pdf",
    fileSizeMb: 2.1,
    totalPages: 18,
    status: "ready",
    summary:
      "Transport layer fundamentals covering TCP reliable stream-oriented transmission and UDP low-latency datagram transmission.",
    keySections: [
      {
        title: "TCP 3-Way Handshake",
        pages: "p.4–6",
        snippet: "SYN -> SYN-ACK -> ACK establishes sequence synchronized duplex connection.",
      },
    ],
    uploadedAt: Date.now() - 86400000 * 5,
  },
];

export const MOCK_LECTURES: LectureNote[] = [
  {
    id: "lec-01",
    title: "Lecture 14: Transport Protocols & Congestion Control",
    subject: "Computer Networks",
    durationSeconds: 2450,
    transcript:
      "Welcome everyone. Today we are contrasting TCP and UDP. TCP provides reliable ordered delivery with congestion control, while UDP offers minimal latency without acknowledgements...",
    summary:
      "The professor contrasted TCP's connection-oriented 3-way handshake and retransmission mechanism with UDP's stateless datagram approach. Emphasized use cases: TCP for web and file transfers; UDP for live voice, video, and gaming.",
    keyTakeaways: [
      "TCP guarantees ordering via sequence numbers.",
      "UDP header is only 8 bytes vs 20+ bytes in TCP.",
      "Congestion control algorithms (e.g. Reno, Cubic) prevent network collapse.",
    ],
    createdAt: Date.now() - 86400000 * 3,
  },
];

/**
 * Deterministic AI Answers for Mock Mode
 */
export const MOCK_AI_RESPONSES: Record<string, string> = {
  tcp_udp:
    "TCP is a connection-oriented, reliable protocol that guarantees in-order packet delivery using acknowledgments and a 3-way handshake. UDP is connectionless and lightweight, sending packets without delivery guarantees, making it ideal for real-time voice, video streaming, and wearable sensor streams.",
  entropy:
    "Entropy measures the degree of disorder or randomness in a physical system. The Second Law of Thermodynamics states that the total entropy of an isolated system never decreases over time (ΔS ≥ 0).",
  binary_search:
    "Binary search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, giving it a logarithmic time complexity of O(log n).",
  machine_learning:
    "Machine learning is a subset of artificial intelligence where algorithms learn patterns and statistical relationships directly from data to make predictions or decisions without being explicitly programmed for every rule.",
  default:
    "I understand your query. Based on your study plan and recent notes, this concept connects directly to your exam topics. Would you like a detailed breakdown, key formulas, or 3 practice quiz questions?",
};
